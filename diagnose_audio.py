"""Inspect real browser voices and speech events; does not change system settings."""
import json
import time
from test_browser import LearningSiteTests
from selenium.webdriver.common.by import By


LearningSiteTests.setUpClass()
try:
    driver = LearningSiteTests.driver
    driver.get(LearningSiteTests.url)
    time.sleep(3)
    voices = driver.execute_script('return speechSynthesis.getVoices().map(v => ({name:v.name, lang:v.lang, uri:v.voiceURI, local:v.localService}))')
    print('BROWSER VOICES:', json.dumps(voices, ensure_ascii=True), flush=True)
    driver.execute_script('''
        window.audioEvents = [];
        const original = speechSynthesis.speak.bind(speechSynthesis);
        speechSynthesis.speak = function(u) {
            window.audioEvents.push({type:'request',text:u.text,lang:u.lang,voice:u.voice && u.voice.name});
            for (const type of ['start','end','error']) u.addEventListener(type, e => window.audioEvents.push({type,error:e.error || ''}));
            original(u);
        };
    ''')
    driver.find_element(By.ID, 'sound-settings').click()
    driver.find_element(By.ID, 'test-audio').click()
    time.sleep(14)
    print('PLAYBACK:', json.dumps(driver.execute_script("return {events:audioEvents,status:document.querySelector('#playback-status').textContent,voiceStatus:document.querySelector('#voice-status').textContent}"), ensure_ascii=True), flush=True)
finally:
    LearningSiteTests.tearDownClass()