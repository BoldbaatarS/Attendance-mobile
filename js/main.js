// js/main.js

import { initApp, loadAttendance, setMode, toggleChart } from "./app.js";
import { login, logout } from "./auth.js";
import { initTheme, toggleTheme } from "./theme.js";

// ⛳ HTML onclick-д хэрэгтэй бүхнийг window дээр гаргана
window.login = login;
window.logout = logout;
window.loadAttendance = loadAttendance;
window.setMode = setMode;
window.toggleChart = toggleChart;
window.toggleTheme = toggleTheme;

// app эхлэх
window.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initApp();
});
