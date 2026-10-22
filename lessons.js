/* Taiwan Mandarin: traditional characters and Hanyu Pinyin. */
window.LESSONS = [
  { id: 'greetings', title: 'Your first hello', subtitle: 'Make a connection, one word at a time.', icon: '👋', color: 'peach', category: 'THE BASICS', tip: '你好 (nǐ hǎo) is written with two third tones. In natural speech, the first sounds like a rising second tone: ní hǎo. Pinyin here keeps the dictionary tones.', phrases: [
    ['你好', 'nǐ hǎo', 'Hello', 'Kumusta / Hello'],
    ['謝謝', 'xiè xie', 'Thank you', 'Salamat'],
    ['不客氣', 'bú kè qì', 'You’re welcome', 'Walang anuman'],
    ['不好意思', 'bù hǎo yì si', 'Excuse me / Sorry', 'Makikiraan / Pasensya na'],
    ['再見', 'zài jiàn', 'Goodbye', 'Paalam / Kita ulit']
  ] },
  { id: 'introductions', title: 'A little about you', subtitle: 'Names, home, and new friendships.', icon: '💬', color: 'lilac', category: 'MEET & GREET', tip: 'A friendly way to introduce yourself is 我叫… followed by your name. Filipino names don’t need to be translated into Chinese.', phrases: [
    ['我叫…', 'wǒ jiào…', 'My name is…', 'Ang pangalan ko ay…'],
    ['我是菲律賓人', 'wǒ shì Fēi lǜ bīn rén', 'I am Filipino', 'Pilipino ako'],
    ['你叫什麼名字？', 'nǐ jiào shén me míng zi?', 'What is your name?', 'Ano ang pangalan mo?'],
    ['很高興認識你', 'hěn gāo xìng rèn shì nǐ', 'Nice to meet you', 'Ikinagagalak kitang makilala'],
    ['我在學中文', 'wǒ zài xué Zhōng wén', 'I am learning Chinese', 'Nag-aaral ako ng Chinese']
  ] },
  { id: 'food', title: 'Something delicious', subtitle: 'Order with confidence at a night market.', icon: '🍜', color: 'yellow', category: 'FOOD & DRINK', tip: 'In Taiwan, you’ll often hear 外帶 (wài dài, takeaway) and 內用 (nèi yòng, dine in). At drink shops, you can ask for less sugar: 少糖 (shǎo táng).', phrases: [
    ['我要這個', 'wǒ yào zhè ge', 'I would like this', 'Ito ang gusto ko'],
    ['一杯珍珠奶茶', 'yì bēi zhēn zhū nǎi chá', 'One bubble milk tea', 'Isang bubble milk tea'],
    ['不要辣', 'bú yào là', 'No chili / Not spicy', 'Huwag lagyan ng maanghang'],
    ['外帶', 'wài dài', 'Takeaway', 'Pabalot / Takeout'],
    ['很好吃', 'hěn hǎo chī', 'Very delicious', 'Napakasarap']
  ] },
  { id: 'shopping', title: 'A little market adventure', subtitle: 'Prices, numbers, and everyday shopping.', icon: '🛍️', color: 'pink', category: 'SHOPPING', tip: 'Taiwan uses New Taiwan dollars (NT$). In everyday speech, 塊 (kuài) commonly means dollars. 一百塊 (yì bǎi kuài) is NT$100.', phrases: [
    ['多少錢？', 'duō shǎo qián?', 'How much is it?', 'Magkano ito?'],
    ['太貴了', 'tài guì le', 'It is too expensive', 'Masyadong mahal'],
    ['可以刷卡嗎？', 'kě yǐ shuā kǎ ma?', 'Can I pay by card?', 'Puwede bang magbayad gamit ang card?'],
    ['我要一個', 'wǒ yào yí ge', 'I would like one', 'Gusto ko ng isa'],
    ['不用袋子', 'bú yòng dài zi', 'No bag needed', 'Hindi na kailangan ng bag']
  ] },
  { id: 'transport', title: 'Find your way', subtitle: 'Explore Taiwan, one stop at a time.', icon: '🚆', color: 'blue', category: 'GETTING AROUND', tip: 'Taiwan’s metro is called 捷運 (jié yùn). An 悠遊卡 (Yōu yóu kǎ, EasyCard) can be used on many public transport services.', phrases: [
    ['捷運站在哪裡？', 'jié yùn zhàn zài nǎ lǐ?', 'Where is the metro station?', 'Nasaan ang istasyon ng MRT?'],
    ['我要去台北車站', 'wǒ yào qù Tái běi chē zhàn', 'I want to go to Taipei Main Station', 'Gusto kong pumunta sa Taipei Main Station'],
    ['請問，廁所在哪裡？', 'qǐng wèn, cè suǒ zài nǎ lǐ?', 'Excuse me, where is the restroom?', 'Mawalang-galang, nasaan ang banyo?'],
    ['左轉', 'zuǒ zhuǎn', 'Turn left', 'Kumaliwa'],
    ['右轉', 'yòu zhuǎn', 'Turn right', 'Kumanan']
  ] },
  { id: 'everyday', title: 'Everyday confidence', subtitle: 'Ask for help and keep the conversation going.', icon: '🌱', color: 'mint', category: 'DAILY LIFE', tip: '請 (qǐng) makes requests polite. It works a little like “please”; the Filipino habit of showing respect with “po” has no exact one-word equivalent in Mandarin.', phrases: [
    ['請說慢一點', 'qǐng shuō màn yì diǎn', 'Please speak a little slower', 'Pakibagalan po ang pagsasalita'],
    ['我聽不懂', 'wǒ tīng bù dǒng', 'I do not understand what I hear', 'Hindi ko maintindihan ang sinasabi'],
    ['請再說一次', 'qǐng zài shuō yí cì', 'Please say it again', 'Pakiulit po'],
    ['可以幫我嗎？', 'kě yǐ bāng wǒ ma?', 'Can you help me?', 'Maaari mo ba akong tulungan?'],
    ['沒關係', 'méi guān xì', 'It is okay / No problem', 'Ayos lang / Walang problema']
  ] }
];
window.DIALOGUE = [
  { speaker: 'Tea shop staff', text: '你好！你要喝什麼？', pinyin: 'nǐ hǎo! nǐ yào hē shén me?', meaning: 'Hello! What would you like to drink?', options: ['一杯珍珠奶茶', '右轉', '再見'], correct: 0, explanation: '一杯珍珠奶茶 — One bubble milk tea. Isang bubble milk tea.' },
  { speaker: 'Tea shop staff', text: '要內用還是外帶？', pinyin: 'yào nèi yòng hái shì wài dài?', meaning: 'For here or to go?', options: ['我叫…', '外帶', '左轉'], correct: 1, explanation: '外帶 — Takeaway. Pabalot / Takeout.' },
  { speaker: 'Tea shop staff', text: '好了，這是你的奶茶。', pinyin: 'hǎo le, zhè shì nǐ de nǎi chá.', meaning: 'Ready! Here is your milk tea.', options: ['太貴了', '我聽不懂', '謝謝'], correct: 2, explanation: '謝謝 — Thank you. Salamat! A friendly way to finish your order.' }
];