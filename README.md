# Formosa — Mandarin, Japanese & Korean for Filipino learners

## Publish on GitHub Pages

Repository: https://github.com/straycatdev/learn-language-with-me

This is a static website with no build step. To publish using the GitHub website:

1. Extract the prepared `github-upload.zip`, if using the upload package. Upload the **files inside it**, not the ZIP or its containing folder, to the repository root. `index.html` must be at the root alongside the JavaScript and CSS files. On an empty repository, use **uploading an existing file**; otherwise use **Add file → Upload files**.
2. Commit the upload to `main` (or the branch GitHub offers for the initial commit).
3. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select the branch containing the files and **/ (root)**, then **Save**.
4. Wait for GitHub's deployment to finish. The expected address is https://straycatdev.github.io/learn-language-with-me/ — it will not work until publication succeeds. Check **Actions** and **Settings → Pages** for deployment status.

The required website files are `index.html`, `styles.css`, `responsive.css`, `lessons.js`, `languages.js`, and `app.js`. The package also includes documentation, development tests, the optional voice installer, `.gitignore`, and `.nojekyll`. Do not upload local diagnostics, screenshots, test outputs, credentials, or Python caches. ZIP archives are not extracted automatically by GitHub Pages.

Learning progress remains in each browser's local storage. Progress from a local file or localhost will not automatically transfer to the GitHub Pages address. Each visitor still needs compatible system/browser voices; GitHub Pages does not provide text-to-speech voices or install them.

## Choose your language

Use **I want to learn** in the header to select Taiwan Mandarin, Japanese, or Korean. Each course includes six lessons, 30 phrases with English and Filipino meanings, pronunciation guides (Pinyin, Romaji, or Korean romanization), flashcards, quizzes, and a three-step tea-shop conversation. Progress, scores, streaks, voice preferences, and playback speed are saved separately by language. Your original Mandarin storage is retained; the last selected language returns after reopening.

Audio settings and installation instructions follow your selected language. Japanese requires a browser-accessible Japanese voice (preferably ja-JP); Korean requires a Korean voice (preferably ko-KR). Installing Chinese voices alone will not provide Japanese or Korean audio. On Windows, add Japanese or Korean through Speech → Manage voices, or install the language’s Text-to-speech feature. Restart the browser afterward. No automatic system installation is performed.

Romanization is introductory support, not an exact pronunciation system. Learn kana for Japanese and Hangul for Korean alongside the phrases. These are beginner courses, not full fluency curricula; native-speaker review is recommended for formal teaching.

A beginner-friendly, responsive learning website using plain HTML, CSS, and JavaScript. No npm packages, account, backend, API keys, or build step required.

## Open the website

Double-click `C:\Users\top1\.cline\data\workspaces\chat\Taiwan-mandarin\index.html` to open it in a modern browser.

For a consistent local origin and browser storage, the recommended option is to run:

```powershell
Set-Location 'C:\Users\top1\.cline\data\workspaces\chat\Taiwan-mandarin'
python -m http.server 8000 --bind 127.0.0.1
```

Then visit **http://127.0.0.1:8000**. Stop the server with Ctrl+C. Keep the same address and port to retain the same browser progress.

## Included

- Six lessons and 30 phrases: greetings, introductions, food, shopping, transport, and daily life.
- Traditional characters, Hanyu Pinyin, English meanings, and Filipino/Tagalog translations.
- Device text-to-speech with Taiwan Mandarin voice preference, voice selection, and slower playback.
- Flashcards with lesson filters and learned-phrase tracking.
- Randomized five-question quizzes with immediate explanations and saved best scores.
- A guided milk-tea-shop conversation with retry feedback.
- Local progress, completed lessons, practice-day streaks, and a daily activity indicator.
- Mobile layouts, keyboard controls, visible focus, live feedback, and reduced-motion support.

## Important limitations

This teaches **Taiwan Mandarin (國語)**, not Taiwanese Hokkien (台語). It is an introductory practice tool, not a complete fluency curriculum. Real conversations, consistent listening, and feedback from a teacher or native speaker are important for fluency.

Audio is synthesized by your browser/device, not prerecorded speech. Chinese voice availability varies. Install a zh-TW voice in your operating system if possible. A non-Taiwan Chinese fallback can sound different; the audio settings show available voice locales. Some device voices require an internet connection. No microphone recording or pronunciation grading is performed.

Pinyin mostly shows lexical tones, with common contextual changes for 一 and 不. Third-tone sandhi is explained in the first lesson. Audio may not exactly match every transcription due to device synthesis. The beginner Filipino translations are meaning guides, not literal word-by-word equivalents. A native-speaking instructor should review material before using it as a formal course.

Progress is saved only in the current browser's local storage. It is not synced or backed up; clearing browser data removes it. Private browsing or restricted storage may prevent persistence. There is no login, analytics, or application server collecting progress. Google Fonts is requested for typography; system fonts are used if unavailable. The main learning UI works without that font request.

## Browser smoke tests

The optional test script uses Python's Selenium package and Microsoft Edge. It runs a temporary local server on a free port, tests the real UI in headless Edge, and shuts both down. Selenium needs an available compatible Edge driver (Selenium Manager can obtain one when network access is allowed).

```powershell
python 'C:\Users\top1\.cline\data\workspaces\chat\Taiwan-mandarin\test_browser.py'
```

Audio quality requires manual listening on the target device; automated tests cannot validate pronunciation quality.

## Guided voice installation

Choose **Set up Chinese audio** in the header. The audio panel detects Mandarin voices, recommends Taiwan Mandarin, provides slow playback and stop controls, and opens installation guidance when no voice is found. Cantonese voices are excluded from the Mandarin picker. Select your device to see Windows, Android, iPhone/iPad, or Mac instructions. Website visitors must enable voices on their own devices; this website cannot install them remotely.

### Windows: recommended installation

1. Open **Settings → Time & Language → Speech → Manage voices → Add voices**.
2. Add **Chinese (Traditional, Taiwan)**. Voice names can include Hanhan, Yating, or Zhiwei, depending on Windows version.
3. If necessary, add the Taiwan Chinese language in Language / Language & region, then install its **Text-to-speech / Speech** optional feature. Your Windows display language does not need to change.
4. Wait for downloads to finish, fully close and reopen your browser, and choose **Check voices again** in Formosa.
5. Select a zh-TW voice and try the greeting. Check device volume and the browser tab's mute setting if you hear nothing.

Official instructions: https://support.microsoft.com/en-us/windows/appendix-a-supported-languages-and-voices-4486e345-7730-53da-fcfe-55cc64300f01

### Optional administrator installer

The included script installs the official Windows Taiwan Chinese Basic and TextToSpeech capabilities from Windows Update. It requires administrator privileges and an internet connection, respects existing installations, and reports whether Windows requests a restart. It does not change your display language. Run it from **PowerShell opened as administrator**:

```powershell
& 'C:\Users\top1\.cline\data\workspaces\chat\Taiwan-mandarin\install-taiwan-voice.ps1'
```

If execution policy blocks the script, use the Settings method rather than disabling system security policy. Managed devices may require IT approval. A Windows installation does not guarantee every browser exposes the voice; verify with Formosa's voice list. Narrator-specific natural voices are not necessarily available to browser speech APIs.

## Responsive behavior

At phone and small-tablet widths, the Menu button reveals all navigation options without horizontal scrolling. It closes after selecting a section and supports Escape. Lesson cards stack on narrow screens, touch controls are at least 44px high, and the audio guide scrolls within the viewport. Browser tests cover 320, 375, 430, 620, 768, 1024, and 1440px widths; physical iOS/Android testing is still recommended.

## Voice installed but not recognized

Restart the entire browser after installing a Windows voice, then use Ctrl+F5 to reload the app. A voice selected in Windows Narrator does not select this website's voice. In the audio panel, use **Reset voice selection**, **Check voices again**, and choose Hanhan, Yating, or Zhiwei (zh-TW). The app rechecks the browser's voice list for five seconds at startup and when returning to the window. It cannot force an old browser speech process to reload newly installed Windows voices.

Playback errors show their browser error code and specific recovery suggestions. For `not-allowed`, click the test button directly in a regular browser tab rather than a VS Code preview or programmatically triggering speech. For silent playback, check tab muting, Windows Volume Mixer, and output device. Test another Taiwan voice or test the installed voice in Windows settings.

The optional `C:\Users\top1\.cline\data\workspaces\chat\Taiwan-mandarin\diagnose_audio.py` script lists real Edge voices and captures playback start/end/error events using Selenium. It cannot verify what a human actually hears.