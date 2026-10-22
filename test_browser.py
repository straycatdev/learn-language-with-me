"""Run real-browser smoke tests without adding website dependencies."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
import unittest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.edge.options import Options


ROOT = Path(__file__).resolve().parent


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def handle(self):
        try:
            super().handle()
        except (ConnectionResetError, BrokenPipeError):
            pass  # A browser can close an idle connection during navigation.


class LearningSiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
        Thread(target=cls.server.serve_forever, daemon=True).start()
        options = Options()
        options.add_argument('--headless=new')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1440,1000')
        try:
            cls.driver = webdriver.Edge(options=options)
        except Exception:
            cls.server.shutdown()
            cls.server.server_close()
            raise
        cls.driver.implicitly_wait(3)
        cls.url = f'http://127.0.0.1:{cls.server.server_port}'

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        self.driver.get(self.url)
        self.driver.execute_script('localStorage.clear()')
        self.driver.refresh()

    def click(self, selector):
        self.driver.find_element(By.CSS_SELECTOR, selector).click()

    def navigate(self, view):
        toggle = self.driver.find_element(By.ID, 'menu-toggle')
        if toggle.is_displayed() and toggle.get_attribute('aria-expanded') == 'false':
            toggle.click()
        self.click(f'.nav-item[data-view="{view}"]')

    def stored(self):
        return json.loads(self.driver.execute_script("return localStorage.getItem('formosa-learning-v1')"))

    def emulate_width(self, width, height=900):
        self.driver.execute_cdp_cmd('Emulation.setDeviceMetricsOverride', {
            'width': width, 'height': height, 'deviceScaleFactor': 1, 'mobile': False,
        })
        self.assertEqual(self.driver.execute_script('return innerWidth'), width)

    def test_lesson_content_and_persistence(self):
        self.assertIn('Kumusta', self.driver.find_element(By.TAG_NAME, 'h1').text)
        self.navigate('lessons')
        self.assertEqual(len(self.driver.find_elements(By.CSS_SELECTOR, '.lesson-card')), 6)
        self.click('[data-lesson="greetings"]')
        self.assertEqual(len(self.driver.find_elements(By.CSS_SELECTOR, '.phrase-row')), 5)
        self.assertIn('Salamat', self.driver.find_element(By.TAG_NAME, 'main').text)
        for checkbox in self.driver.find_elements(By.CSS_SELECTOR, '[data-learn]'):
            checkbox.click()
        self.assertEqual(len(self.stored()['learned']), 5)
        self.driver.refresh()
        self.assertEqual(len(self.stored()['learned']), 5)
        self.assertIn('1 / 6', self.driver.find_elements(By.CSS_SELECTOR, '.stat')[0].text)
        self.assertIn('1 day', self.driver.find_element(By.CSS_SELECTOR, '.streak').text)

    def test_flashcard_keyboard_filter_and_progress(self):
        self.navigate('lessons')
        self.click('[data-lesson="food"]')
        self.click('[data-lesson-cards]')
        self.assertIn('OF 5', self.driver.find_element(By.CSS_SELECTOR, '.counter').text)
        self.driver.find_element(By.ID, 'flip-card').send_keys(Keys.ENTER)
        self.assertIn('I would like this', self.driver.find_element(By.ID, 'flip-card').text)
        self.click('#know-card')
        self.assertIn('food:0', self.stored()['learned'])
        self.assertIn('CARD 2', self.driver.find_element(By.CSS_SELECTOR, '.counter').text)
        self.click('#previous-card')
        self.click('#previous-card')
        self.assertIn('CARD 5', self.driver.find_element(By.CSS_SELECTOR, '.counter').text)

    def test_quiz_all_correct_and_saved(self):
        self.navigate('quiz')
        self.click('#start-quiz')
        for _ in range(5):
            correct = self.driver.execute_script('''
                const text = document.querySelector('.quiz-question').textContent;
                const phrase = LESSONS.flatMap(l => l.phrases).find(p => p[0] === text);
                return [...document.querySelectorAll('[data-answer]')].findIndex(b => b.textContent === phrase[2]);
            ''')
            self.click(f'[data-answer="{correct}"]')
            self.assertIn('Tama!', self.driver.find_element(By.CSS_SELECTOR, '.feedback').text)
            self.click('#next-question')
        self.assertEqual(self.driver.find_element(By.CSS_SELECTOR, '.score').text, '5 / 5')
        self.assertEqual(self.stored()['bestScore'], 100)
        self.assertEqual(self.stored()['quizCount'], 1)
        self.click('#retry-quiz')
        self.assertIn('QUESTION 1 OF 5', self.driver.find_element(By.CSS_SELECTOR, '.counter').text)

    def test_wrong_quiz_answer_and_lesson_filter(self):
        self.navigate('lessons')
        self.click('[data-lesson="transport"]')
        self.click('[data-lesson-quiz]')
        self.assertTrue(self.driver.execute_script('''
            return LESSONS.find(l => l.id === 'transport').phrases.some(p => p[0] === document.querySelector('.quiz-question').textContent);
        '''))
        wrong = self.driver.execute_script('''
            const text = document.querySelector('.quiz-question').textContent;
            const meaning = LESSONS.flatMap(l => l.phrases).find(p => p[0] === text)[2];
            return [...document.querySelectorAll('[data-answer]')].findIndex(b => b.textContent !== meaning);
        ''')
        self.click(f'[data-answer="{wrong}"]')
        self.assertIn('Not quite', self.driver.find_element(By.CSS_SELECTOR, '.feedback').text)
        self.assertEqual(len(self.driver.find_elements(By.CSS_SELECTOR, '.option.correct')), 1)
        self.assertEqual(len(self.driver.find_elements(By.CSS_SELECTOR, '.option.wrong')), 1)

    def test_conversation_retry_and_completion(self):
        self.navigate('conversation')
        self.click('[data-dialogue-answer="1"]')
        self.assertIn('Not quite', self.driver.find_element(By.ID, 'dialogue-hint').text)
        for answer in [0, 1, 2]:
            self.click(f'[data-dialogue-answer="{answer}"]')
            self.click('#next-dialogue')
        self.assertIn('You ordered your first milk tea!', self.driver.find_element(By.TAG_NAME, 'h1').text)
        self.click('#restart-dialogue')
        self.assertIn('1 / 3', self.driver.find_element(By.CSS_SELECTOR, '.counter').text)

    def test_audio_settings_and_mobile_layout(self):
        self.click('#sound-settings')
        self.assertTrue(self.driver.find_element(By.ID, 'audio-dialog').is_displayed())
        self.click('#slow-audio')
        self.assertFalse(self.stored()['slow'])
        self.click('.dialog-close')
        self.driver.set_window_size(390, 844)
        try:
            for view in ['home', 'lessons', 'flashcards', 'quiz', 'conversation']:
                self.navigate(view)
                self.assertTrue(self.driver.execute_script('return document.documentElement.scrollWidth <= innerWidth'), view)
            self.driver.save_screenshot(str(ROOT / 'mobile-preview.png'))
        finally:
            self.driver.set_window_size(1440, 1000)
        self.navigate('home')
        self.driver.save_screenshot(str(ROOT / 'desktop-preview.png'))

    def test_content_integrity(self):
        result = self.driver.execute_script('''
            return { lessons: LESSONS.length, phrases: LESSONS.flatMap(l => l.phrases).length,
              valid: LESSONS.every(l => l.phrases.length === 5 && l.phrases.every(p => p.length === 4 && p.every(s => typeof s === 'string' && s.length))),
              unique: new Set(LESSONS.map(l => l.id)).size === LESSONS.length };
        ''')
        self.assertEqual(result, dict(lessons=6, phrases=30, valid=True, unique=True))

    def test_responsive_sizes_menu_and_dialog(self):
        try:
            for width in [320, 375, 430, 620, 768, 1024, 1440]:
                self.emulate_width(width)
                for view in ['home', 'lessons', 'flashcards', 'quiz', 'conversation']:
                    self.navigate(view)
                    self.assertTrue(self.driver.execute_script('return document.documentElement.scrollWidth <= innerWidth'), (width, view))
                self.navigate('lessons')
                self.click('[data-lesson="transport"]')
                self.assertTrue(self.driver.execute_script('return document.documentElement.scrollWidth <= innerWidth'), (width, 'lesson'))
                self.click('#sound-settings')
                self.assertTrue(self.driver.execute_script('''
                    const d = document.querySelector('#audio-dialog');
                    return d.scrollWidth <= d.clientWidth && d.getBoundingClientRect().width <= innerWidth;
                '''), (width, 'audio dialog'))
                self.click('.dialog-close')
            self.emulate_width(375, 812)
            self.click('#menu-toggle')
            self.assertEqual(self.driver.find_element(By.ID, 'menu-toggle').get_attribute('aria-expanded'), 'true')
            self.driver.find_element(By.ID, 'menu-toggle').send_keys(Keys.ESCAPE)
            self.assertEqual(self.driver.find_element(By.ID, 'menu-toggle').get_attribute('aria-expanded'), 'false')
            self.navigate('home')
            self.driver.save_screenshot(str(ROOT / 'mobile-preview.png'))
        finally:
            self.driver.execute_cdp_cmd('Emulation.clearDeviceMetricsOverride', {})
            self.driver.set_window_size(1440, 1000)

    def mock_voices(self, voices):
        self.driver.execute_script('''
            window.testVoices = arguments[0]; window.spoken = [];
            Object.defineProperty(speechSynthesis, 'getVoices', {configurable:true, value:() => window.testVoices});
            Object.defineProperty(speechSynthesis, 'cancel', {configurable:true, value:() => {}});
            Object.defineProperty(speechSynthesis, 'speak', {configurable:true, value:u => {
                window.spoken.push({text:u.text, lang:u.lang, rate:u.rate});
                if (u.onstart) u.onstart(); if (u.onend) u.onend();
            }});
            window.SpeechSynthesisUtterance = function(text) { this.text = text; };
            speechSynthesis.dispatchEvent(new Event('voiceschanged'));
        ''', voices)

    def test_voice_guidance_missing_and_device_switch(self):
        self.mock_voices([])
        self.navigate('lessons')
        self.click('[data-lesson="greetings"]')
        self.click('[data-speak]')
        self.assertTrue(self.driver.find_element(By.ID, 'audio-dialog').is_displayed())
        self.assertIn('No Mandarin voice', self.driver.find_element(By.ID, 'voice-status').text)
        self.assertTrue(self.driver.find_element(By.ID, 'install-guide').get_attribute('open'))
        self.driver.execute_script("const s=document.querySelector('#guide-device'); s.value='android'; s.dispatchEvent(new Event('change',{bubbles:true}));")
        self.assertTrue(self.driver.find_element(By.CSS_SELECTOR, '[data-guide="android"]').is_displayed())
        self.assertFalse(self.driver.find_element(By.CSS_SELECTOR, '[data-guide="windows"]').is_displayed())
        self.click('#refresh-voices')
        self.assertIn('Voice list refreshed', self.driver.find_element(By.ID, 'playback-status').text)

    def test_voice_preference_playback_and_cantonese_exclusion(self):
        self.mock_voices([
            dict(name='Mainland Mandarin', lang='zh-CN', voiceURI='cn', localService=True),
            dict(name='Cantonese', lang='zh-HK', voiceURI='hk', localService=True),
            dict(name='Taiwan Mandarin', lang='zh-TW', voiceURI='tw', localService=True),
            dict(name='English', lang='en-US', voiceURI='en', localService=True),
        ])
        self.click('#sound-settings')
        self.assertIn('Taiwan Mandarin ready', self.driver.find_element(By.ID, 'voice-status').text)
        self.assertNotIn('Cantonese', self.driver.find_element(By.ID, 'voice-select').text)
        self.click('#test-audio')
        played = self.driver.execute_script('return window.spoken')
        self.assertEqual(played[0]['lang'], 'zh-TW')
        self.assertEqual(played[0]['rate'], 0.72)
        self.assertIn('Your turn!', self.driver.find_element(By.ID, 'playback-status').text)
        self.assertEqual(len(self.stored()['days']), 1)
        self.driver.execute_script("const s=document.querySelector('#voice-select'); s.value='cn'; s.dispatchEvent(new Event('change',{bubbles:true}));")
        self.assertIn('Other Mandarin accent', self.driver.find_element(By.ID, 'voice-status').text)
        self.click('#test-audio')
        self.assertEqual(self.driver.execute_script('return window.spoken[1].lang'), 'zh-CN')
        self.click('#stop-audio')
        self.assertIn('stopped', self.driver.find_element(By.ID, 'playback-status').text)

    def select_language(self, language):
        from selenium.webdriver.support.ui import Select
        Select(self.driver.find_element(By.ID, 'language-select')).select_by_value(language)

    def test_language_switch_preserves_progress_and_selection(self):
        self.navigate('lessons')
        self.click('[data-lesson="greetings"]')
        self.click('[data-learn]')
        self.select_language('ja-JP')
        self.assertIn('Japanese speaker', self.driver.find_element(By.TAG_NAME, 'h1').text)
        self.assertIn('こんにちは', self.driver.find_element(By.TAG_NAME, 'main').text)
        self.navigate('lessons')
        self.assertEqual(len(self.driver.find_elements(By.CSS_SELECTOR, '.lesson-card')), 6)
        self.assertNotIn('Mandarin has tones', self.driver.find_element(By.TAG_NAME, 'main').text)
        self.click('[data-lesson="greetings"]')
        self.assertEqual(self.driver.find_element(By.CSS_SELECTOR, '.hanzi').get_attribute('lang'), 'ja-JP')
        self.assertFalse(self.driver.find_element(By.CSS_SELECTOR, '[data-learn]').is_selected())
        self.click('[data-learn]')
        self.select_language('ko-KR')
        self.assertIn('Korean speaker', self.driver.find_element(By.TAG_NAME, 'h1').text)
        self.driver.refresh()
        self.assertEqual(self.driver.find_element(By.ID, 'language-select').get_attribute('value'), 'ko-KR')
        self.select_language('zh-TW')
        self.assertEqual(self.stored()['learned'], ['greetings:0'])
        self.select_language('ja-JP')
        saved = self.driver.execute_script("return JSON.parse(localStorage.getItem('formosa-learning-v1-ja-JP'))")
        self.assertEqual(saved['learned'], ['greetings:0'])

    def test_new_language_content_flashcards_quiz_and_dialogue(self):
        for language, greeting in [('ja-JP', 'こんにちは'), ('ko-KR', '안녕하세요')]:
            self.select_language(language)
            self.navigate('flashcards')
            self.assertIn(greeting, self.driver.find_element(By.ID, 'flip-card').text)
            self.click('#flip-card')
            self.assertIn('Kumusta', self.driver.find_element(By.ID, 'flip-card').text)
            self.navigate('quiz')
            self.click('#start-quiz')
            self.assertEqual(len(self.driver.find_elements(By.CSS_SELECTOR, '[data-answer]')), 4)
            self.navigate('conversation')
            for answer in [0, 1, 2]:
                self.click(f'[data-dialogue-answer="{answer}"]')
                self.click('#next-dialogue')
            self.assertIn('Well done!', self.driver.find_element(By.TAG_NAME, 'main').text)

    def test_language_audio_filters_and_missing_voice_guides(self):
        self.mock_voices([
            dict(name='Taiwan', lang='zh-TW', voiceURI='tw', localService=True),
            dict(name='Japanese voice', lang='ja-JP', voiceURI='ja', localService=True),
            dict(name='Korean voice', lang='ko-KR', voiceURI='ko', localService=True),
        ])
        for language, name, greeting in [('ja-JP', 'Japanese', 'こんにちは'), ('ko-KR', 'Korean', '안녕하세요')]:
            self.select_language(language)
            self.click('#sound-settings')
            self.assertIn(name + ' ready', self.driver.find_element(By.ID, 'voice-status').text)
            self.assertNotIn('Taiwan', self.driver.find_element(By.ID, 'voice-select').text)
            self.click('#test-audio')
            spoken = self.driver.execute_script('return window.spoken.at(-1)')
            self.assertEqual(spoken['lang'], language)
            self.assertEqual(spoken['text'], greeting)
            self.click('.dialog-close')
        self.mock_voices([dict(name='Taiwan', lang='zh-TW', voiceURI='tw', localService=True)])
        self.click('#sound-settings')
        self.assertIn('No Korean voice', self.driver.find_element(By.ID, 'voice-status').text)
        self.assertIn('Korean', self.driver.find_element(By.CSS_SELECTOR, '[data-guide="windows"]').text)

    def test_language_selector_mobile_layout(self):
        for width in [320, 375, 768, 1440]:
            self.emulate_width(width)
            for language in ['ja-JP', 'ko-KR', 'zh-TW']:
                self.select_language(language)
                self.assertTrue(self.driver.find_element(By.ID, 'language-select').is_displayed())
                self.assertLessEqual(self.driver.execute_script('return document.documentElement.scrollWidth'), width)
        self.driver.execute_cdp_cmd('Emulation.clearDeviceMetricsOverride', {})

    def test_voice_reset_and_blocked_playback(self):
        self.mock_voices([dict(name='Taiwan Mandarin', lang='zh-TW', voiceURI='tw', localService=True)])
        self.click('#sound-settings')
        self.driver.execute_script("const s=document.querySelector('#voice-select'); s.value='tw'; s.dispatchEvent(new Event('change',{bubbles:true}));")
        self.click('#slow-audio')
        self.click('#reset-audio')
        self.assertEqual(self.stored()['voice'], '')
        self.assertTrue(self.stored()['slow'])
        self.driver.execute_script("Object.defineProperty(speechSynthesis, 'speak', {configurable:true, value:u => u.onerror({error:'not-allowed'})});")
        self.click('#test-audio')
        self.assertIn('not-allowed', self.driver.find_element(By.ID, 'playback-status').text)
        self.assertIn('browser blocked speech', self.driver.find_element(By.ID, 'playback-status').text)


if __name__ == '__main__':
    unittest.main(verbosity=2)