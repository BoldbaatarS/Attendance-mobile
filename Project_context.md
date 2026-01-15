# Project Context / Төслийн товч танилцуулга

English
-------
Project: Attendance (mobile web PWA)
- Small frontend single-page app that loads attendance data from a Google Apps Script backend (API_URL in js/config.js).
- Uses Tailwind CSS (via CDN), Chart.js, and minimal vanilla ES modules under /js.
- Supports light/dark theme (class-based), local user login (stored in localStorage), simple notifications, and charts.

Монгол
-----
Төслийн нэр: Attendance (гар утсанд чиглэсэн вэб PWA)
- Google Apps Script-аар өгөдөл авах frontend нэг хуудсан апп.
- Tailwind CSS (CDN), Chart.js ашигласан, /js дотор ES модулиуд.
- Хар/цагаан сэдэв (class ашиглан), хэрэглэгчийн нэвтрэх мэдээлэл localStorage-д хадгалагдана, мэдэгдэл, график зэргийг дэмжинэ.

Key files / Гол файлууд
----------------------
- index.html — UI, Tailwind CDN, chart canvas, select for theme mode.
- js/theme.js — theme initialization, setTheme/applyTheme logic.
- js/main.js — entry point; calls initTheme(), wires UI handlers.
- js/app.js — app lifecycle, loadAttendance, setMode, initApp.
- js/charts.js — chart draw/destroy logic (Chart.js).
- js/render-cards.js — result rendering.
- js/notifications.js — notification & reminder logic.
- js/auth.js — login/logout and storing user in localStorage.
- js/config.js — API_URL constant.

How the theme is intended to work / Сэдв хэрхэн ажиллах ёстой вэ
---------------------------------------------------------------
English:
- The app stores user preference in localStorage key "themeMode": auto | light | dark.
- initTheme() reads that value and calls applyTheme(mode).
- applyTheme() adds/removes the `dark` class on the <html> element; Tailwind is configured to use class-based dark mode.
- When mode === "auto", initTheme also listens to system preference changes (prefers-color-scheme) and reapplies.

Монгол:
- themeMode-г localStorage-д хадгална: auto | light | dark.
- initTheme() үүнийг уншиж applyTheme() дуудаж, html-д `dark` класс нэмж/арилгана.
- Auto сонголтод системийн өнгө (prefers-color-scheme) өөрчлөгдөхийг сонсож дахин тохируулна.

Known issue and recommended fix / Мэдэгдсэн асуудал ба засварлах сан:
--------------------------------------------------------------------
English:
- Root cause likely: Tailwind CDN configuration (darkMode: "class") is set after the Tailwind script is loaded in index.html. The Tailwind CDN reads window.tailwind configuration at load time; setting it after loading has no effect, causing Tailwind to fallback to its default (usually media) and the class-based dark styles may not be generated.
- Symptom: toggling html.classList.add('dark') in JS doesn't change component styles as expected.
- Fix: move the small config snippet so that window.tailwind = { darkMode: 'class' } is defined before the <script src="https://cdn.tailwindcss.com"></script> tag. Example: place the config <script> block above the CDN <script>.
- Alternate: keep current order but use Tailwind build step (npm) and proper config file so styles are generated during build instead of relying on CDN runtime config.

Монгол:
- Үндсэн шалтгаан: index.html-д Tailwind CDN-ийг эхлээд ачааллаж, түүний дараа window.tailwind.config-ыг тохируулж байгаа. Tailwind CDN нь ачааллах үедээ window.tailwind-ыг уншина — тиймээс дараа нэмсэн тохиргоо нөлөөгүй байж болно. Үүнээс болж `dark` класс хэрэглэгдэж байхад стилүүд үүсээгүй эсвэл ажиллахгүй байж болно.
- Шинж тэмдэг: JS-ээр html.classList.add('dark') хийж байгаа мөртлөө интерфэйс хар/цагаан болж өөрчлөгдөхгүй.
- Шийдэл: window.tailwind.config-ыг Tailwind CDN-ээс өмнө байрлуулж, дараа CDN-ийг ачааллах. Эсвэл Tailwind-ийг npm-ээр барьж, Tailwind конфиг файл ашигла.

Quick steps to test / Түргэн шалгах
-----------------------------------
1. Open index.html in browser, toggle the select (Auto/Light/Dark) — expected: UI switches immediately.
2. If it doesn't: open DevTools → Elements and check <html> element for `class="dark"` when Dark selected.
3. If `dark` class is present but UI unchanged → Tailwind config not applied at load time (see fix above).

Running / Development
---------------------
- This is a static site; serve with a simple static server (e.g., live-server, python -m http.server, or VSCode Live Server).
- No build scripts in package.json currently (Tailwind is used via CDN).

Notes / Тэмдэглэл
-----------------
- When editing index.html to move the window.tailwind config, make sure to remove the duplicated script or order it correctly.
- theme.js already toggles html.class correctly; after fixing Tailwind config ordering the theme switch should work.

Contact / Холбоо
-----------------
- For further debugging, inspect localStorage key "themeMode" and verify initTheme() is called on DOMContentLoaded (main.js).

