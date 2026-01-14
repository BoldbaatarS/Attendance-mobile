// js/main.js (таны төслийн entry)
import { initApp, loadAttendance, setMode, toggleChart } from "./app.js";
import { login, logout } from "./auth.js";
import { toggleTheme } from "./theme.js";

window.login = login;
window.logout = logout;
window.toggleTheme = toggleTheme;
window.setMode = setMode;
window.loadAttendance = loadAttendance;
window.toggleChart = toggleChart;

window.onload = initApp;
