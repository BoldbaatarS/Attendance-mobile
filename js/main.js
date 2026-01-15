import { initApp, loadAttendance, setMode, toggleChart } from "./app.js";
import { login, logout } from "./auth.js";
import { initTheme, setTheme } from "./theme.js";

// 🌍 HTML-д холбох
window.login = login;
window.logout = logout;
window.loadAttendance = loadAttendance;
window.setMode = setMode;
window.toggleChart = toggleChart;


window.addEventListener("DOMContentLoaded", () => {
    initTheme();
    const select = document.getElementById("themeModeSelect");
    const saved = localStorage.getItem("themeMode") || "auto";
    select.value = saved;

    select.addEventListener("change", e => {
        setTheme(e.target.value);
    });
    initApp();
});
