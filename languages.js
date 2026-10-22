/* Beginner phrase courses: [native script, pronunciation, English, Filipino]. */
(() => {
  const mandarinLessons = window.LESSONS;
  const mandarinDialogue = window.DIALOGUE;
  const categories = ['THE BASICS', 'MEET & GREET', 'FOOD & DRINK', 'SHOPPING', 'GETTING AROUND', 'DAILY LIFE'];
  const ids = ['greetings', 'introductions', 'food', 'shopping', 'transport', 'everyday'];
  const titles = ['Your first hello', 'A little about you', 'Something delicious', 'A little market adventure', 'Find your way', 'Everyday confidence'];
  const icons = ['👋', '💬', '🍜', '🛍️', '🚆', '🌱'];
  const colors = ['peach', 'lilac', 'yellow', 'pink', 'blue', 'mint'];
  const buildLessons = (groups, tips) => groups.map((phrases, i) => ({
    id: ids[i], title: titles[i], subtitle: ['Make a connection, one word at a time.', 'Names, home, and new friendships.', 'Order a drink and enjoy local food.', 'Prices and everyday shopping.', 'Explore with confidence, one stop at a time.', 'Ask for help and keep learning.'][i],
    icon: icons[i], color: colors[i], category: categories[i], tip: tips[i], phrases
  }));
  const japanese = buildLessons([
    [
      ['こんにちは', 'konnichiwa', 'Hello', 'Kumusta / Hello'],
      ['ありがとうございます', 'arigatō gozaimasu', 'Thank you', 'Salamat po'],
      ['どういたしまして', 'dō itashimashite', 'You’re welcome', 'Walang anuman'],
      ['すみません', 'sumimasen', 'Excuse me / Sorry', 'Makikiraan / Pasensya na'],
      ['またね', 'mata ne', 'See you (casual)', 'Kita ulit']
    ], [
      ['私の名前は…です', 'watashi no namae wa… desu', 'My name is…', 'Ang pangalan ko ay…'],
      ['フィリピン人です', 'Firipin-jin desu', 'I am Filipino', 'Pilipino ako'],
      ['お名前は何ですか？', 'onamae wa nan desu ka?', 'What is your name?', 'Ano po ang pangalan ninyo?'],
      ['はじめまして', 'hajimemashite', 'Nice to meet you (first meeting)', 'Ikinagagalak kitang makilala'],
      ['日本語を勉強しています', 'Nihongo o benkyō shite imasu', 'I am studying Japanese', 'Nag-aaral ako ng Japanese']
    ], [
      ['これをください', 'kore o kudasai', 'This, please', 'Ito po ang gusto ko'],
      ['ミルクティーを一つください', 'miruku tī o hitotsu kudasai', 'One milk tea, please', 'Isang milk tea po'],
      ['辛くしないでください', 'karaku shinaide kudasai', 'Please do not make it spicy', 'Huwag pong gawing maanghang'],
      ['持ち帰りでお願いします', 'mochikaeri de onegai shimasu', 'Takeaway, please', 'Pabalot po / Takeout po'],
      ['おいしいです', 'oishii desu', 'It is delicious', 'Masarap po']
    ], [
      ['いくらですか？', 'ikura desu ka?', 'How much is it?', 'Magkano po ito?'],
      ['ちょっと高いです', 'chotto takai desu', 'It is a little expensive', 'Medyo mahal po'],
      ['カードは使えますか？', 'kādo wa tsukaemasu ka?', 'Can I pay by card?', 'Puwede po bang magbayad gamit ang card?'],
      ['一つください', 'hitotsu kudasai', 'One, please', 'Isa po'],
      ['袋は要りません', 'fukuro wa irimasen', 'No bag needed', 'Hindi na po kailangan ng bag']
    ], [
      ['駅はどこですか？', 'eki wa doko desu ka?', 'Where is the station?', 'Nasaan po ang istasyon?'],
      ['東京駅に行きたいです', 'Tōkyō-eki ni ikitai desu', 'I want to go to Tokyo Station', 'Gusto kong pumunta sa Tokyo Station'],
      ['トイレはどこですか？', 'toire wa doko desu ka?', 'Where is the restroom?', 'Nasaan po ang banyo?'],
      ['左に曲がってください', 'hidari ni magatte kudasai', 'Please turn left', 'Kumaliwa po'],
      ['右に曲がってください', 'migi ni magatte kudasai', 'Please turn right', 'Kumanan po']
    ], [
      ['ゆっくり話してください', 'yukkuri hanashite kudasai', 'Please speak slowly', 'Pakibagalan po ang pagsasalita'],
      ['わかりません', 'wakarimasen', 'I do not understand', 'Hindi ko po maintindihan'],
      ['もう一度お願いします', 'mō ichido onegai shimasu', 'Once more, please', 'Pakiulit po'],
      ['手伝ってもらえますか？', 'tetsudatte moraemasu ka?', 'Could you help me?', 'Maaari po ba ninyo akong tulungan?'],
      ['大丈夫です', 'daijōbu desu', 'It is okay / I am okay', 'Ayos lang po']
    ]
  ], [
    'こんにちは is mainly a daytime greeting. ありがとうございます is polite; またね is casual and best with friends. Match your level of politeness to the situation.',
    'です (desu) makes many statements polite. は is pronounced wa when it marks the topic. Keep your own name when introducing yourself.',
    'ください (kudasai) is useful when requesting an item. を is pronounced o as a particle. Long vowels matter: tī in milk tea lasts longer than a short ti.',
    'Japan uses yen (円). カード (kādo) means card. A long vowel such as ā should be held for an extra beat.',
    '駅 (eki) means station. Learn place names in the original script too; station signs often also include Roman letters.',
    'Small っ marks a brief consonant pause: yukkuri, not yukuri. Polite requests are useful with people you do not know; Filipino po is a helpful comparison, not an exact translation.'
  ]);
  const korean = buildLessons([
    [
      ['안녕하세요', 'annyeonghaseyo', 'Hello', 'Kumusta po'],
      ['감사합니다', 'gamsahamnida', 'Thank you', 'Salamat po'],
      ['아니에요', 'anieyo', 'You’re welcome / Not at all', 'Walang anuman'],
      ['죄송합니다', 'joesonghamnida', 'I am sorry', 'Pasensya na po'],
      ['안녕히 계세요', 'annyeonghi gyeseyo', 'Goodbye (when you leave)', 'Paalam po (ikaw ang aalis)']
    ], [
      ['제 이름은 …입니다', 'je ireumeun …imnida', 'My name is…', 'Ang pangalan ko ay…'],
      ['저는 필리핀 사람이에요', 'jeoneun pillipin saramieyo', 'I am Filipino', 'Pilipino ako'],
      ['이름이 뭐예요?', 'ireumi mwoyeyo?', 'What is your name?', 'Ano po ang pangalan ninyo?'],
      ['만나서 반가워요', 'mannaseo bangawoyo', 'Nice to meet you', 'Ikinagagalak kitang makilala'],
      ['한국어를 배우고 있어요', 'hangugeoreul baeugo isseoyo', 'I am learning Korean', 'Nag-aaral ako ng Korean']
    ], [
      ['이거 주세요', 'igeo juseyo', 'This, please', 'Ito po ang gusto ko'],
      ['밀크티 한 잔 주세요', 'milkeuti han jan juseyo', 'One milk tea, please', 'Isang milk tea po'],
      ['맵지 않게 해 주세요', 'maepji anke hae juseyo', 'Please do not make it spicy', 'Huwag pong gawing maanghang'],
      ['포장해 주세요', 'pojanghae juseyo', 'Takeaway, please', 'Pabalot po / Takeout po'],
      ['맛있어요', 'masisseoyo', 'It is delicious', 'Masarap po']
    ], [
      ['얼마예요?', 'eolmayeyo?', 'How much is it?', 'Magkano po ito?'],
      ['너무 비싸요', 'neomu bissayo', 'It is too expensive', 'Masyadong mahal po'],
      ['카드 돼요?', 'kadeu dwaeyo?', 'Can I pay by card?', 'Puwede po bang magbayad gamit ang card?'],
      ['하나 주세요', 'hana juseyo', 'One, please', 'Isa po'],
      ['봉투는 필요 없어요', 'bongtuneun piryo eopseoyo', 'No bag needed', 'Hindi na po kailangan ng bag']
    ], [
      ['지하철역이 어디예요?', 'jihacheolyeogi eodiyeyo?', 'Where is the subway station?', 'Nasaan po ang istasyon ng subway?'],
      ['서울역에 가고 싶어요', 'Seoullyeoge gago sipeoyo', 'I want to go to Seoul Station', 'Gusto kong pumunta sa Seoul Station'],
      ['화장실이 어디예요?', 'hwajangsiri eodiyeyo?', 'Where is the restroom?', 'Nasaan po ang banyo?'],
      ['왼쪽으로 가세요', 'oenjjogeuro gaseyo', 'Go to the left', 'Pumunta po sa kaliwa'],
      ['오른쪽으로 가세요', 'oreunjjogeuro gaseyo', 'Go to the right', 'Pumunta po sa kanan']
    ], [
      ['천천히 말해 주세요', 'cheoncheonhi malhae juseyo', 'Please speak slowly', 'Pakibagalan po ang pagsasalita'],
      ['잘 모르겠어요', 'jal moreugesseoyo', 'I do not really understand', 'Hindi ko po gaanong maintindihan'],
      ['다시 말해 주세요', 'dasi malhae juseyo', 'Please say it again', 'Pakiulit po'],
      ['도와주세요', 'dowajuseyo', 'Please help me', 'Tulungan po ninyo ako'],
      ['괜찮아요', 'gwaenchanayo', 'It is okay / No problem', 'Ayos lang po / Walang problema']
    ]
  ], [
    '안녕하세요 is a polite everyday greeting. Say 안녕히 계세요 when you leave and the other person stays. If you stay while they leave, say 안녕히 가세요 (annyeonghi gaseyo).',
    '저 is a polite way to say “I.” Korean has speech levels: these lessons mostly use polite 요 endings and some formal expressions. Filipino po is a useful comparison, but not an exact equivalent.',
    '주세요 (juseyo) means “please give me” in requests. 한 잔 counts one cup or glass. Word endings can change neighboring sounds; listen to the whole phrase.',
    'South Korea uses won (원). 카드 means card. Repeated consonants such as ss in bissayo indicate tense consonants, not simply longer English consonants.',
    '역 (yeok) means station. Sounds can link or change across syllables; 서울역 is pronounced roughly Seoullyeok. Romanization is a guide, not a substitute for listening.',
    'Learn Hangul alongside the phrases. eo (ㅓ) and eu (ㅡ) are single vowels, not two English vowels. Final consonants can link to the following syllable.'
  ]);
  window.COURSES = {
    'zh-TW': { name: 'Taiwan Mandarin', short: 'Mandarin', audioName: 'Chinese', native: '繁體中文', script: 'Traditional Chinese', place: 'Taiwan', greeting: '你好', farewell: '慢慢來', daily: ['慢慢來', 'màn màn lái'], wellDone: '做得好！', reading: 'Pinyin', locale: 'zh-TW', lessons: mandarinLessons, dialogue: mandarinDialogue },
    'ja-JP': { name: 'Japanese', short: 'Japanese', audioName: 'Japanese', native: '日本語', script: 'Kana & Kanji', place: 'Japan', greeting: 'こんにちは', farewell: '一歩ずつ', daily: ['ゆっくりで大丈夫です', 'yukkuri de daijōbu desu'], wellDone: 'よくできました！', reading: 'Romaji', locale: 'ja-JP', lessons: japanese,
      dialogue: [
        { speaker: 'Tea shop staff', text: '何になさいますか？', pinyin: 'nani ni nasaimasu ka?', meaning: 'What would you like?', options: ['ミルクティーを一つください', 'またね', 'わかりません'], correct: 0, explanation: 'ミルクティーを一つください — One milk tea, please. Isang milk tea po.' },
        { speaker: 'Tea shop staff', text: '店内ですか、お持ち帰りですか？', pinyin: 'tennai desu ka, omochikaeri desu ka?', meaning: 'For here or to go?', options: ['はじめまして', '持ち帰りでお願いします', 'いくらですか？'], correct: 1, explanation: '持ち帰りでお願いします — Takeaway, please. Pabalot po.' },
        { speaker: 'Tea shop staff', text: 'ミルクティーです。どうぞ。', pinyin: 'miruku tī desu. dōzo.', meaning: 'Here is your milk tea.', options: ['ちょっと高いです', 'またね', 'ありがとうございます'], correct: 2, explanation: 'ありがとうございます — Thank you. Salamat po!' }
      ] },
    'ko-KR': { name: 'Korean', short: 'Korean', audioName: 'Korean', native: '한국어', script: 'Hangul', place: 'South Korea', greeting: '안녕하세요', farewell: '한 걸음씩', daily: ['천천히 하세요', 'cheoncheonhi haseyo'], wellDone: '잘했어요!', reading: 'Romanization', locale: 'ko-KR', lessons: korean,
      dialogue: [
        { speaker: 'Tea shop staff', text: '무엇을 드릴까요?', pinyin: 'mueoseul deurilkkayo?', meaning: 'What would you like?', options: ['밀크티 한 잔 주세요', '안녕히 계세요', '도와주세요'], correct: 0, explanation: '밀크티 한 잔 주세요 — One milk tea, please. Isang milk tea po.' },
        { speaker: 'Tea shop staff', text: '드시고 가세요, 포장해 드릴까요?', pinyin: 'deusigo gaseyo, pojanghae deurilkkayo?', meaning: 'Will you have it here, or shall I pack it to go?', options: ['만나서 반가워요', '포장해 주세요', '얼마예요?'], correct: 1, explanation: '포장해 주세요 — Takeaway, please. Pabalot po.' },
        { speaker: 'Tea shop staff', text: '밀크티 나왔습니다.', pinyin: 'milkeuti nawatsseumnida.', meaning: 'Your milk tea is ready.', options: ['너무 비싸요', '잘 모르겠어요', '감사합니다'], correct: 2, explanation: '감사합니다 — Thank you. Salamat po!' }
      ] }
  };
})();