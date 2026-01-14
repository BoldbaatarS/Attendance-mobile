// js/main.js
import { initApp, loadAttendance, setMode, toggleChart } from "./app.js";
import { login, logout } from "./auth.js";
import { initTheme, toggleTheme } from "./theme.js";

// ⬇⬇⬇ ЭНЭ БОЛ ЧУХАЛ ⬇⬇⬇
window.login = login;
window.logout = logout;
window.loadAttendance = loadAttendance;
window.setMode = setMode;
window.toggleChart = toggleChart;
window.toggleTheme = toggleTheme;

window.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initApp();
});
