(() => {
  'use strict';
  let language = 'zh-TW';
  try { const saved = localStorage.getItem('formosa-language'); if (window.COURSES[saved]) language = saved; } catch { /* Session-only selection. */ }
  let course = window.COURSES[language];
  let lessons = course.lessons;
  let allPhrases = lessons.flatMap(lesson => lesson.phrases.map((phrase, index) => ({ phrase, key: `${lesson.id}:${index}`, lesson })));
  let storageKey = language === 'zh-TW' ? 'formosa-learning-v1' : `formosa-learning-v1-${language}`;
  let storageAvailable = true;
  let state = { learned: [], days: [], quizCount: 0, bestScore: null, voice: '', slow: true };
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (stored && typeof stored === 'object') {
      state.learned = Array.isArray(stored.learned) ? stored.learned.filter(key => allPhrases.some(item => item.key === key)) : [];
      state.days = Array.isArray(stored.days) ? stored.days.filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day)) : [];
      state.quizCount = Number.isInteger(stored.quizCount) && stored.quizCount >= 0 ? stored.quizCount : 0;
      state.bestScore = Number.isFinite(stored.bestScore) ? Math.max(0, Math.min(100, stored.bestScore)) : null;
      state.voice = typeof stored.voice === 'string' ? stored.voice : '';
      state.slow = stored.slow !== false;
    }
  } catch { storageAvailable = false; }
  state.learned = [...new Set(state.learned)];
  state.days = [...new Set(state.days)];
  const main = document.querySelector('#main');
  let currentView = 'home';
  let currentLesson = null;
  let cardFilter = 'all';
  let cardIndex = 0;
  let cardFlipped = false;
  let quiz = null;
  let dialogueStep = 0;
  let dialogueAnswered = false;
  let toastTimer;
  let activeUtterance = null;
  let playbackTimer;
  let voicePollTimer;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  function switchLanguage(value) {
    if (!window.COURSES[value] || value === language) return;
    stopAudio();
    save();
    language = value;
    course = window.COURSES[value];
    lessons = course.lessons;
    allPhrases = lessons.flatMap(lesson => lesson.phrases.map((phrase, index) => ({ phrase, key: `${lesson.id}:${index}`, lesson })));
    storageKey = value === 'zh-TW' ? 'formosa-learning-v1' : `formosa-learning-v1-${value}`;
    state = { learned: [], days: [], quizCount: 0, bestScore: null, voice: '', slow: true };
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (stored && typeof stored === 'object') {
        state.learned = Array.isArray(stored.learned) ? [...new Set(stored.learned.filter(key => allPhrases.some(item => item.key === key)))] : [];
        state.days = Array.isArray(stored.days) ? [...new Set(stored.days.filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day)))] : [];
        state.quizCount = Number.isInteger(stored.quizCount) && stored.quizCount >= 0 ? stored.quizCount : 0;
        state.bestScore = Number.isFinite(stored.bestScore) ? Math.max(0, Math.min(100, stored.bestScore)) : null;
        state.voice = typeof stored.voice === 'string' ? stored.voice : '';
        state.slow = stored.slow !== false;
      }
      localStorage.setItem('formosa-language', language);
    } catch { storageAvailable = false; }
    currentLesson = null; cardFilter = 'all'; cardIndex = 0; cardFlipped = false;
    quiz = null; dialogueStep = 0; dialogueAnswered = false;
    updateCourseUI(); refreshVoices(); navigate('home');
    toast(`Now learning ${course.name}. Your progress is saved separately for each language.`);
  }
  function updateCourseUI() {
    document.querySelector('#language-select').value = language;
    document.querySelector('.brand-caption').textContent = `YOUR ${course.place.toUpperCase()} JOURNEY`;
    document.querySelector('.sidebar-footer small').textContent = `Beginner · ${course.name}`;
    document.querySelector('.page-footer span').textContent = `${course.farewell} · Take it one step at a time.`;
    document.querySelector('#audio-title').textContent = `Let’s set up ${course.audioName} audio`;
    document.querySelector('#audio-title + p').textContent = `Makinig, ulitin, at dahan-dahan lang. Choose a ${course.name} voice, listen slowly, then repeat aloud.`;
    document.querySelector('label[for="voice-select"]').textContent = `1. Choose your ${course.short} voice`;
    document.querySelector('#voice-accent-note').textContent = language === 'zh-TW' ? 'Taiwan Mandarin (zh-TW) is recommended. Other Mandarin voices may have a different accent. Cantonese voices are not used.' : `${course.name} (${course.locale}) voices only. Voices for other languages are not used.`;
    document.querySelector('#test-audio').textContent = `▶ 3. Try ${course.greeting} · Hello`;
    document.querySelector('.audio-privacy').textContent = `This website cannot install system voices for visitors. Audio uses your device’s speech service, not native-speaker recordings. Some voices need internet and may process text through their provider. We do not record your microphone or grade your accent. You can still study with ${course.reading} and translations.`;
    playbackStatus('Tap a phrase’s ▶ button anywhere in a lesson to listen.');
    showDeviceGuide(document.querySelector('#guide-device').value);
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch { storageAvailable = false; toast('Progress cannot be saved in this browser. It will last only for this session.'); }
  }
  function activity() {
    const today = localDate();
    if (!state.days.includes(today)) state.days.push(today);
    save();
  }
  function streak() {
    let count = 0;
    const date = new Date();
    if (!state.days.includes(localDate(date))) date.setDate(date.getDate() - 1);
    while (state.days.includes(localDate(date))) { count++; date.setDate(date.getDate() - 1); }
    return count;
  }
  function toast(message) {
    const element = document.querySelector('#toast');
    clearTimeout(toastTimer);
    element.textContent = message;
    element.hidden = false;
    toastTimer = setTimeout(() => { element.hidden = true; }, 5000);
  }
  const completed = lesson => lesson.phrases.every((_, index) => state.learned.includes(`${lesson.id}:${index}`));
  const playButton = (text, label = 'Listen to pronunciation') => `<button class="round-play" data-speak="${escape(text)}" aria-label="${escape(label)}">▶</button>`;
  function lessonCard(lesson, index) {
    const count = lesson.phrases.filter((_, i) => state.learned.includes(`${lesson.id}:${i}`)).length;
    return `<button class="lesson-card" data-lesson="${lesson.id}"><div class="lesson-top"><span class="lesson-icon ${lesson.color}" aria-hidden="true">${lesson.icon}</span><span class="lesson-number">LESSON ${String(index + 1).padStart(2, '0')}</span></div><div class="eyebrow">${lesson.category}</div><h3>${lesson.title}</h3><p>${lesson.subtitle}</p><div class="lesson-card-footer"><span>5 phrases · ~5 min</span><span>${count === 5 ? '✓ Completed' : count ? `${count}/5 learned →` : 'Start lesson →'}</span></div></button>`;
  }
  function heading(eyebrow, title, description) {
    return `<div class="greeting"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div></div>`;
  }
  function renderHome() {
    const next = lessons.find(lesson => !completed(lesson)) || lessons[0];
    const done = lessons.filter(completed).length;
    const todayPracticed = state.days.includes(localDate());
    main.innerHTML = `${!storageAvailable ? '<p class="storage-warning">Browser storage is unavailable. Your progress will not persist after closing this page.</p>' : ''}
      <div class="greeting"><div><div class="eyebrow">A NEW LANGUAGE. A NEW CONNECTION.</div><h1>Kumusta, future ${course.short} speaker <span aria-hidden="true">☀</span></h1><p>Your little journey to feeling at home in ${course.place} starts here.</p></div><div class="streak"><span aria-hidden="true">🔥</span><div><strong>${streak()} day${streak() === 1 ? '' : 's'}</strong><small>Practice streak</small></div></div></div>
      <section class="hero" aria-label="Continue learning"><div class="hero-content"><div class="eyebrow">${state.learned.length ? 'KEEP YOUR MOMENTUM' : 'LET’S START WITH THE BASICS'}</div><h2>A new world begins<br>with a simple ${course.greeting}.</h2><p>Real-life ${course.short}. Simple explanations.<br>A little Filipino heart in every lesson.</p><button class="button primary" data-lesson="${next.id}">${state.learned.length ? 'Continue learning' : 'Start my first lesson'} <span aria-hidden="true">→</span></button><span class="hero-meta">Just 5 minutes to get started</span></div><div class="landscape" aria-hidden="true"><div class="sun"></div><div class="cloud"></div><div class="mountain back"></div><div class="mountain front"></div><div class="tower"></div><div class="landscape-caption">${course.native}</div></div></section>
      <section class="stats" aria-label="Your progress"><div class="stat"><span class="stat-icon" aria-hidden="true">▤</span><div><strong>${done} <small>/ 6</small></strong><span class="stat-label">Lessons completed</span></div></div><div class="stat"><span class="stat-icon" aria-hidden="true">文</span><div><strong>${state.learned.length}</strong><span class="stat-label">Phrases learned</span></div></div><div class="stat"><span class="stat-icon" aria-hidden="true">✧</span><div><strong>${state.bestScore === null ? '—' : state.bestScore + '%'}</strong><span class="stat-label">Best quiz score</span></div></div></section>
      <div class="dashboard-grid"><section><div class="section-title"><h2>Your everyday ${course.short} toolkit</h2><button class="text-button" data-view="lessons">View all lessons →</button></div><div class="lesson-grid">${lessons.slice(0, 4).map(lessonCard).join('')}</div></section><aside class="dashboard-aside"><section class="side-card phrase-day"><div class="eyebrow">✦ YOUR PHRASE OF THE DAY</div><div class="daily-hanzi" lang="${course.locale}">${course.daily[0]}</div><div class="pinyin">${course.daily[1]}</div><div class="daily-meaning">Take your time.</div><div class="daily-filipino">Dahan-dahan lang. Kaya mo ’yan.</div><button class="listen" data-speak="${course.daily[0]}">▶ &nbsp; Listen & repeat</button></section><section class="side-card"><div class="goal-header"><h3 style="margin:0">Your daily step</h3><span>${todayPracticed ? '1 / 1' : '0 / 1'}</span></div><div class="progress-track"><div style="width:${todayPracticed ? 100 : 0}%"></div></div><p>${todayPracticed ? 'You showed up today. Magaling! Keep exploring.' : 'Listen, review a flashcard, or try a quiz. Every little bit counts.'}</p></section><section class="side-card tip-card"><h3>🌱 &nbsp; Progress, not perfection.</h3><p>You don’t need to sound perfect to connect. Listen, repeat, and try using one phrase today.</p></section></aside></div>`;
  }
  function renderLessons() {
    main.innerHTML = `${heading(`YOUR EVERYDAY ${course.short.toUpperCase()} TOOLKIT`, 'Little lessons. Real-life confidence.', 'Learn in any order. Each lesson includes English, Filipino, and pronunciation practice.')}<div class="lesson-grid">${lessons.map(lessonCard).join('')}</div>${language === 'zh-TW' ? `<section class="callout"><strong>Mandarin has tones — a little like a melody.</strong><br>The marks over Pinyin vowels show pitch, not stress. Listen and imitate; these are not exact Filipino sound equivalents.<div class="tone-grid"><div class="tone"><strong>mā →</strong>1 · high, level</div><div class="tone"><strong>má ↗</strong>2 · rising</div><div class="tone"><strong>mǎ ↘↗</strong>3 · low / dipping</div><div class="tone"><strong>mà ↘</strong>4 · falling</div><div class="tone"><strong>ma ·</strong>neutral · light</div></div><p>Third tones are often low, without a full rise, in connected speech. 一 and 不 also change tones in context; our Pinyin reflects those common changes.</p><button class="button" data-speak="媽，麻，馬，罵，嗎">▶ Hear tone examples</button></section>` : `<section class="callout"><strong>${course.reading} is a bridge, not the destination.</strong><p>${language === 'ja-JP' ? 'Start learning hiragana and katakana alongside these phrases. Long vowels (ā, ī, ū, ē, ō) last an extra beat; doubled consonants mark a short pause. Japanese pitch accent is not Mandarin tone.' : 'Start learning Hangul alongside these phrases. Romanization cannot exactly represent Korean sounds: eo and eu each stand for one vowel, and consonants may change sound across syllables.'} Listen, repeat, and compare with the original script.</p></section>`}`;
  }
  function renderLesson() {
    const lesson = lessons.find(item => item.id === currentLesson);
    main.innerHTML = `<button class="text-button back" data-view="lessons">← All lessons</button><section class="lesson-heading"><div class="eyebrow">${lesson.icon} &nbsp; ${lesson.category}</div><h1>${lesson.title}</h1><p class="muted">${lesson.subtitle} Listen, repeat aloud, then mark phrases you know.</p></section><div class="phrase-list">${lesson.phrases.map((phrase, index) => `<article class="phrase-row"><div class="phrase-text"><div class="hanzi" lang="${course.locale}">${phrase[0]}</div><div class="pinyin">${phrase[1]}</div><div class="meaning">${phrase[2]}</div><div class="filipino" lang="fil">${phrase[3]}</div></div>${playButton(phrase[0], `Listen: ${phrase[2]}`)}<label class="learn-check"><input type="checkbox" data-learn="${lesson.id}:${index}" ${state.learned.includes(`${lesson.id}:${index}`) ? 'checked' : ''}> I know this</label></article>`).join('')}</div><div class="callout"><strong>A little ${course.place} insight</strong><br>${lesson.tip}</div><div class="practice-actions"><button class="button primary" data-lesson-quiz="${lesson.id}">Practice this lesson →</button><button class="button" data-lesson-cards="${lesson.id}">Review flashcards</button></div>`;
  }
  const filteredCards = () => cardFilter === 'all' ? allPhrases : allPhrases.filter(item => item.lesson.id === cardFilter);
  function filterSelect(id, selected) {
    return `<label for="${id}">Choose a lesson</label><select id="${id}"><option value="all">All lessons</option>${lessons.map(lesson => `<option value="${lesson.id}" ${selected === lesson.id ? 'selected' : ''}>${lesson.title}</option>`).join('')}</select>`;
  }
  function renderFlashcards() {
    const cards = filteredCards();
    cardIndex = (cardIndex + cards.length) % cards.length;
    const item = cards[cardIndex];
    const phrase = item.phrase;
    main.innerHTML = `${heading('MAKE IT STICK', 'A little review goes a long way.', `Try saying the meaning before flipping the card. Say the ${course.short} phrase aloud, too.`)}<div class="practice-toolbar">${filterSelect('card-filter', cardFilter)}</div><section class="practice-panel"><div class="counter">CARD ${cardIndex + 1} OF ${cards.length} · ${item.lesson.title}</div><button class="flashcard" id="flip-card" aria-label="${cardFlipped ? `Show ${course.short} side` : 'Reveal English and Filipino meaning'}">${cardFlipped ? `<div class="eyebrow">THE MEANING</div><div class="meaning">${phrase[2]}</div><div class="filipino" lang="fil">${phrase[3]}</div>` : `<div class="eyebrow">CAN YOU REMEMBER THIS?</div><div class="hanzi" lang="${course.locale}">${phrase[0]}</div><div class="pinyin">${phrase[1]}</div>`}<small>Click or press Enter to flip ↻</small></button><div class="practice-actions"><button class="button" id="previous-card">← Previous</button>${playButton(phrase[0])}<button class="button" id="next-card">Next →</button></div><div class="practice-actions"><button class="button primary" id="know-card">${state.learned.includes(item.key) ? '✓ Learned · review again' : '✓ I know this phrase'}</button></div></section>`;
  }
  function shuffled(items) { return items.map(value => ({ value, rank: Math.random() })).sort((a, b) => a.rank - b.rank).map(item => item.value); }
  function startQuiz(filter = 'all') {
    const pool = filter === 'all' ? allPhrases : allPhrases.filter(item => item.lesson.id === filter);
    quiz = { filter, questions: shuffled(pool).slice(0, 5).map(item => ({ ...item, options: shuffled([item.phrase[2], ...shuffled(allPhrases.filter(other => other.phrase[2] !== item.phrase[2])).slice(0, 3).map(other => other.phrase[2])]) })), index: 0, score: 0, answer: null, finished: false };
    navigate('quiz');
  }
  function renderQuiz() {
    if (!quiz) {
      main.innerHTML = `${heading('A LITTLE CHALLENGE', 'Let’s put it into practice.', 'Five questions. No pressure. Mistakes are part of learning.')}<section class="practice-panel"><h2>Ready for a quick quiz?</h2><p class="muted">Match Mandarin phrases to their English meanings.</p><div class="practice-toolbar" style="justify-content:center;margin-top:25px">${filterSelect('quiz-filter', 'all')}</div><button class="button primary" id="start-quiz">Start 5-question quiz →</button></section>`;
      return;
    }
    if (quiz.finished) {
      main.innerHTML = `${heading('YOU SHOWED UP. THAT MATTERS.', 'Practice complete. Magaling!', 'Repeat a little each day, and notice what gets easier.')}<section class="practice-panel"><div class="eyebrow">YOUR QUIZ RESULT</div><div class="score">${quiz.score} / ${quiz.questions.length}</div><p>${quiz.score === quiz.questions.length ? 'Wonderful work! Try using one phrase in a real conversation.' : 'Keep going! Review the phrases and give it another try.'}</p><p class="muted">${state.quizCount} quiz${state.quizCount === 1 ? '' : 'zes'} completed · Best score: ${state.bestScore}%</p><div class="practice-actions"><button class="button primary" id="retry-quiz">Try again</button><button class="button" data-view="flashcards">Review flashcards</button></div></section>`;
      return;
    }
    const question = quiz.questions[quiz.index];
    const answered = quiz.answer !== null;
    main.innerHTML = `${heading('PRACTICE MAKES PROGRESS', 'What does this mean?', 'Read the phrase or listen, then choose the matching meaning.')}<section class="practice-panel"><div class="counter">QUESTION ${quiz.index + 1} OF ${quiz.questions.length}</div><div class="progress-track"><div style="width:${quiz.index / quiz.questions.length * 100}%"></div></div><div class="quiz-question" lang="${course.locale}">${question.phrase[0]}</div><div class="pinyin">${question.phrase[1]}</div><div class="practice-actions">${playButton(question.phrase[0])}</div><div class="options">${question.options.map((option, index) => `<button class="option ${answered && option === question.phrase[2] ? 'correct' : answered && quiz.answer === index ? 'wrong' : ''}" data-answer="${index}" ${answered ? 'disabled' : ''}>${option}</button>`).join('')}</div>${answered ? `<div class="feedback" role="status"><strong>${question.options[quiz.answer] === question.phrase[2] ? '✓ Tama! That’s right.' : 'Not quite — you’re still learning.'}</strong><br>${question.phrase[2]}<br><span lang="fil">${question.phrase[3]}</span></div><div class="practice-actions"><button class="button primary" id="next-question">${quiz.index === quiz.questions.length - 1 ? 'See my results' : 'Next question →'}</button></div>` : ''}</section>`;
  }
  function renderConversation() {
    if (dialogueStep >= course.dialogue.length) {
      main.innerHTML = `${heading('ONE SMALL CONVERSATION. ONE BIG STEP.', 'You ordered your first milk tea!', 'This is a guided role-play, not an AI chat or a speaking assessment.')}<section class="practice-panel"><div style="font-size:65px" aria-hidden="true">🧋</div><h2>${course.wellDone} Well done!</h2><p>You practiced ordering, asking for takeaway, and saying thank you.</p><button class="button primary" id="restart-dialogue">Practice again →</button></section>`;
      return;
    }
    const step = course.dialogue[dialogueStep];
    main.innerHTML = `${heading('LET’S TALK, LITTLE BY LITTLE', `Your first ${course.place} tea-shop visit.`, 'Read the staff’s question, listen, and pick the best reply.')}<section class="practice-panel"><div class="counter">GUIDED CONVERSATION · ${dialogueStep + 1} / ${course.dialogue.length}</div><div class="dialogue-speaker">🧋 ${step.speaker}</div><div class="hanzi" lang="${course.locale}">${step.text}</div><p class="pinyin">${step.pinyin}</p><p class="muted">${step.meaning}</p><div class="practice-actions">${playButton(step.text)}</div><h3 style="font-size:13px;margin-top:25px">How would you reply?</h3><div class="options">${step.options.map((option, index) => `<button class="option ${dialogueAnswered && index === step.correct ? 'correct' : ''}" data-dialogue-answer="${index}" ${dialogueAnswered ? 'disabled' : ''} lang="${course.locale}">${option}</button>`).join('')}</div>${dialogueAnswered ? `<div class="feedback" role="status">✓ ${step.explanation}</div><div class="practice-actions"><button class="button" data-speak="${step.options[step.correct]}">▶ Hear your reply</button><button class="button primary" id="next-dialogue">${dialogueStep === course.dialogue.length - 1 ? 'Finish conversation' : 'Continue →'}</button></div>` : '<p class="muted" style="margin-top:20px" id="dialogue-hint" role="status">Choose a reply above. You can try again if you need to.</p>'}</section>`;
  }
  function render() {
    document.querySelectorAll('.nav-item').forEach(button => {
      const active = button.dataset.view === (currentView === 'lesson' ? 'lessons' : currentView);
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    ({ home: renderHome, lessons: renderLessons, lesson: renderLesson, flashcards: renderFlashcards, quiz: renderQuiz, conversation: renderConversation }[currentView] || renderHome)();
  }
  function navigate(view) {
    document.querySelector('#main-navigation').classList.remove('is-open');
    document.querySelector('#menu-toggle').setAttribute('aria-expanded', 'false');
    currentView = view;
    render();
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function chineseVoices() {
    if (!('speechSynthesis' in window)) return [];
    // zh-HK / zh-MO and yue are typically Cantonese, not this course's Mandarin.
    return speechSynthesis.getVoices().filter(voice => {
      const lang = voice.lang.replace(/_/g, '-');
      if (language !== 'zh-TW') return new RegExp(`^${language.slice(0, 2)}(?:-|$)`, 'i').test(lang);
      return /^(cmn(?:-|$)|zh(?:-|$))/i.test(lang) && !/(?:^|-)(HK|MO)(?:-|$)/i.test(lang) && !/cantonese|廣東|粤语|粵語/i.test(voice.name);
    }).sort((a, b) => Number(isTaiwanVoice(b)) - Number(isTaiwanVoice(a)));
  }
  function isTaiwanVoice(voice) {
    if (language !== 'zh-TW') return voice.lang.replace(/_/g, '-').toLowerCase() === language.toLowerCase();
    return /^(zh|cmn)(?:-Hant)?-TW$/i.test(voice.lang.replace(/_/g, '-'));
  }
  function selectedVoice(voices = chineseVoices()) {
    return voices.find(voice => voice.voiceURI === state.voice) || voices.find(isTaiwanVoice) || voices[0];
  }
  function showDeviceGuide(device) {
    document.querySelectorAll('[data-guide]').forEach(section => { section.hidden = section.dataset.guide !== device; });
    document.querySelectorAll('[data-guide]').forEach(section => {
      if (!section.dataset.original) section.dataset.original = section.innerHTML;
      section.innerHTML = section.dataset.original;
      if (language !== 'zh-TW') {
        const instructions = {
          windows: `Open Settings → Time & Language → Speech → Manage voices → Add voices. Add ${course.name}. If it is missing, add ${course.name} under Language & region and download its Text-to-speech / Speech feature. Do not change your display language.`,
          android: `Search Settings for Text-to-speech output. Open your speech engine’s settings → Install voice data, then download ${course.name}. Availability varies by device and speech engine.`,
          ios: `Open Settings → Accessibility → Spoken Content (or Read & Speak) → Voices. Choose ${course.name} and download a voice. Availability in websites varies by iOS version.`,
          mac: `Open System Settings → Accessibility → Spoken Content (or Read & Speak) → Manage Voices. Download a ${course.name} voice. Availability varies by macOS version.`
        };
        section.innerHTML = `<h3>Set up ${course.name} audio</h3><ol><li>${instructions[section.dataset.guide]}</li><li>Wait for the download, fully close and reopen your browser, then tap Check voices again.</li><li>Select a ${course.name} voice and tap Try ${course.greeting}.</li></ol><p>Accessibility or Narrator-only voices are not always exposed to websites. Each visitor needs a compatible voice on their own device.</p>${section.dataset.guide === 'windows' ? '<a class="button" href="ms-settings:speech">Open Windows Speech settings ↗</a>' : ''}`;
      }
    });
  }
  function openAudioSetup() {
    refreshVoices();
    document.querySelector('#slow-audio').checked = state.slow;
    const dialog = document.querySelector('#audio-dialog');
    if (!dialog.open) dialog.showModal();
  }
  function refreshVoices() {
    clearInterval(voicePollTimer);
    updateVoiceSelect();
    let attempts = 0;
    voicePollTimer = setInterval(() => {
      updateVoiceSelect();
      if (++attempts >= 10) clearInterval(voicePollTimer);
    }, 500);
  }
  function updateVoiceSelect() {
    const voices = chineseVoices();
    const select = document.querySelector('#voice-select');
    const options = voices.length ? `<option value="">Automatic (prefer ${course.name})</option>${voices.map(voice => `<option value="${escape(voice.voiceURI)}">${escape(voice.name)} (${escape(voice.lang)})${isTaiwanVoice(voice) ? ' · Recommended' : language === 'zh-TW' ? ' · Other Mandarin accent' : ''}</option>`).join('')}` : `<option value="">No ${course.short} voice detected yet</option>`;
    // Do not rebuild a native select while the learner is choosing a voice.
    if (select.dataset.options !== options) { select.innerHTML = options; select.dataset.options = options; }
    select.disabled = !voices.length;
    select.value = voices.some(voice => voice.voiceURI === state.voice) ? state.voice : '';
    const voice = selectedVoice(voices);
    const status = document.querySelector('#voice-status');
    status.classList.toggle('needs-setup', !voice || !isTaiwanVoice(voice));
    status.textContent = !('speechSynthesis' in window)
      ? `This browser does not support speech playback. Try a current Edge, Chrome, or Safari browser. You can still study with ${course.reading}.`
      : !voice ? `No ${course.short} voice detected yet. Voices may still be loading. Check again, or follow the installation steps below. Hindi pa handa ang audio.`
      : `${isTaiwanVoice(voice) ? `✓ ${course.name} ready` : language === 'zh-TW' ? 'Other Mandarin accent selected' : `${course.name} voice selected`}: ${voice.name} (${voice.lang}). ${voice.localService === false ? 'This voice may require an internet connection.' : 'Try playback below to check that you can hear it.'}`;
    document.querySelector('#sound-settings span').textContent = voice ? `${course.audioName} audio settings` : `Set up ${course.audioName} audio`;
    if (!voice) document.querySelector('#install-guide').open = true;
    const total = 'speechSynthesis' in window ? speechSynthesis.getVoices().length : 0;
    document.querySelector('#voice-diagnostics').textContent = `Browser reports ${total} voices; ${voices.length} ${course.short}; ${voices.filter(isTaiwanVoice).length} recommended ${course.locale}. ${state.voice && !voices.some(item => item.voiceURI === state.voice) ? 'Your previously selected voice is unavailable; automatic selection is being used. ' : ''}${!voices.length && total ? 'Windows may have new voices that this browser session has not loaded. Fully restart the browser.' : ''}`;
  }
  function playbackStatus(message) {
    document.querySelector('#playback-status').textContent = message;
  }
  function stopAudio() {
    activeUtterance = null;
    clearTimeout(playbackTimer);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    document.querySelectorAll('.playback-active').forEach(button => button.classList.remove('playback-active'));
  }
  function speak(text) {
    if (!('speechSynthesis' in window)) { openAudioSetup(); return; }
    const voice = selectedVoice();
    if (!voice) { openAudioSetup(); playbackStatus(`Install a ${course.short} voice or check again after voices finish loading, then tap Try ${course.greeting}.`); return; }
    stopAudio();
    const utterance = new SpeechSynthesisUtterance(text.replace(/…/g, ''));
    activeUtterance = utterance;
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = state.slow ? 0.72 : 0.95;
    playbackStatus('Preparing audio…');
    utterance.onstart = () => {
      if (activeUtterance !== utterance) return;
      clearTimeout(playbackTimer);
      playbackStatus(`Playing ${text} · Listen first, then repeat aloud. Makinig muna, saka ulitin.`);
      activity();
      if (currentView === 'home') renderHome();
      document.querySelectorAll('[data-speak]').forEach(button => { if (button.dataset.speak === text) button.classList.add('playback-active'); });
    };
    utterance.onend = () => {
      if (activeUtterance !== utterance) return;
      stopAudio(); playbackStatus('Your turn! Repeat the phrase aloud. Tap ▶ to listen again.');
    };
    utterance.onerror = event => {
      if (activeUtterance !== utterance) return;
      stopAudio();
      if (!['interrupted', 'canceled'].includes(event.error)) {
        const reasons = {
          'not-allowed': 'The browser blocked speech. Open the site in a normal Edge/Chrome window and click the test button directly. Avoid embedded previews and check site sound permissions.',
          'voice-unavailable': 'The selected voice is unavailable. Reset voice selection, fully restart your browser, and try another voice for the selected language.',
          'language-unavailable': 'The speech service cannot use this language. Choose a voice for the selected language, or verify the voice in Windows Speech settings.',
          'network': 'This voice needs a working internet connection. Reconnect or choose a local Windows voice.',
          'audio-busy': 'Your audio device is busy. Close other audio applications and try again.',
          'audio-hardware': 'No usable audio output was found. Check your speaker/headphone connection and Windows output device.',
          'synthesis-failed': 'The speech service failed. Try another voice for the selected language or restart your browser.',
          'synthesis-unavailable': 'The speech service is unavailable. Restart your browser or Windows and verify the voice in Windows Speech settings.'
        };
        openAudioSetup(); playbackStatus(`Playback failed (${event.error || 'unknown error'}). ${reasons[event.error] || 'Check your volume, selected voice, and internet connection, then try again.'}`);
      }
    };
    playbackTimer = setTimeout(() => {
      if (activeUtterance !== utterance) return;
      stopAudio(); openAudioSetup(); playbackStatus('Audio did not start. Check your volume and voice installation, or try another voice/browser.');
    }, 12000);
    try { speechSynthesis.speak(utterance); }
    catch { stopAudio(); openAudioSetup(); playbackStatus('Playback could not start. Select another voice or restart your browser.'); }
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button, a.brand');
    if (!button || button.disabled) return;
    const data = button.dataset;
    if (button.matches('a.brand')) { event.preventDefault(); navigate('home'); }
    else if (data.view) navigate(data.view);
    else if (data.lesson) { currentLesson = data.lesson; navigate('lesson'); }
    else if (data.speak) speak(data.speak);
    else if (data.lessonQuiz) startQuiz(data.lessonQuiz);
    else if (data.lessonCards) { cardFilter = data.lessonCards; cardIndex = 0; cardFlipped = false; navigate('flashcards'); }
    else if (data.answer !== undefined && quiz && quiz.answer === null) {
      quiz.answer = Number(data.answer);
      if (quiz.questions[quiz.index].options[quiz.answer] === quiz.questions[quiz.index].phrase[2]) quiz.score++;
      activity(); renderQuiz();
    } else if (data.dialogueAnswer !== undefined && !dialogueAnswered) {
      const step = course.dialogue[dialogueStep];
      activity();
      if (Number(data.dialogueAnswer) === step.correct) { dialogueAnswered = true; renderConversation(); }
      else { button.classList.add('wrong'); document.querySelector('#dialogue-hint').textContent = 'Not quite. Think about the staff’s question and try another reply.'; }
    } else switch (button.id) {
      case 'flip-card': cardFlipped = !cardFlipped; activity(); renderFlashcards(); document.querySelector('#flip-card').focus(); break;
      case 'previous-card': cardIndex--; cardFlipped = false; renderFlashcards(); document.querySelector('#previous-card').focus(); break;
      case 'next-card': cardIndex++; cardFlipped = false; renderFlashcards(); document.querySelector('#next-card').focus(); break;
      case 'know-card': {
        const item = filteredCards()[cardIndex];
        if (!state.learned.includes(item.key)) state.learned.push(item.key);
        activity(); toast('Phrase learned. Ang galing!'); cardIndex++; cardFlipped = false; renderFlashcards(); document.querySelector('#know-card').focus(); break;
      }
      case 'start-quiz': startQuiz(document.querySelector('#quiz-filter').value); break;
      case 'retry-quiz': startQuiz(quiz.filter); break;
      case 'next-question':
        if (!quiz || quiz.answer === null || quiz.finished) break;
        quiz.index++;
        if (quiz.index >= quiz.questions.length) {
          quiz.finished = true;
          const score = Math.round(quiz.score / quiz.questions.length * 100);
          state.bestScore = Math.max(state.bestScore || 0, score);
          state.quizCount++; activity();
        } else quiz.answer = null;
        renderQuiz(); break;
      case 'next-dialogue': if (dialogueAnswered) { dialogueStep++; dialogueAnswered = false; renderConversation(); } break;
      case 'restart-dialogue': dialogueStep = 0; dialogueAnswered = false; renderConversation(); break;
      case 'menu-toggle': {
        const open = document.querySelector('#main-navigation').classList.toggle('is-open');
        button.setAttribute('aria-expanded', String(open)); break;
      }
      case 'sound-settings': openAudioSetup(); break;
      case 'refresh-voices': refreshVoices(); playbackStatus('Voice list refreshed; checking again for 5 seconds. If your new voice is missing, fully close and reopen your browser.'); break;
      case 'reset-audio': stopAudio(); state.voice = ''; state.slow = true; save(); document.querySelector('#slow-audio').checked = true; refreshVoices(); playbackStatus(`Voice selection reset to automatic ${course.name}. Tap Try ${course.greeting} to test it.`); break;
      case 'stop-audio': stopAudio(); playbackStatus('Playback stopped. Tap ▶ whenever you’re ready.'); break;
      case 'test-audio': speak(course.greeting); break;
    }
  });
  document.addEventListener('change', event => {
    const target = event.target;
    if (target.id === 'language-select') { switchLanguage(target.value); return; }
    if (target.dataset.learn) {
      const key = target.dataset.learn;
      state.learned = state.learned.filter(item => item !== key);
      if (target.checked) state.learned.push(key);
      activity();
      if (target.checked) toast('Saved! Keep practicing this phrase aloud.');
    } else if (target.id === 'card-filter') { cardFilter = target.value; cardIndex = 0; cardFlipped = false; renderFlashcards(); }
    else if (target.id === 'voice-select') { stopAudio(); state.voice = target.value; save(); updateVoiceSelect(); }
    else if (target.id === 'slow-audio') { state.slow = target.checked; save(); }
    else if (target.id === 'guide-device') showDeviceGuide(target.value);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.querySelector('#main-navigation').classList.contains('is-open')) {
      document.querySelector('#main-navigation').classList.remove('is-open');
      document.querySelector('#menu-toggle').setAttribute('aria-expanded', 'false');
      document.querySelector('#menu-toggle').focus();
    }
  });
  document.querySelector('#audio-dialog').addEventListener('close', () => { stopAudio(); clearInterval(voicePollTimer); });
  window.addEventListener('pagehide', stopAudio);
  window.addEventListener('focus', refreshVoices);
  const device = /Android/i.test(navigator.userAgent) ? 'android' : /iPhone|iPad|iPod/i.test(navigator.userAgent) || (/Mac/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1) ? 'ios' : /Mac/i.test(navigator.userAgent) ? 'mac' : 'windows';
  document.querySelector('#guide-device').value = device;
  updateCourseUI();
  if ('speechSynthesis' in window) speechSynthesis.addEventListener('voiceschanged', updateVoiceSelect);
  refreshVoices();
  render();
})();