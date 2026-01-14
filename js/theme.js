export function isNightTime() {
    const h = new Date().getHours();
    return h >= 20 || h < 6;
}

export function applyTheme(theme, save = true) {
    document.documentElement.classList.toggle("dark", theme === "dark");
    themeToggle.innerText = theme === "dark" ? "🌞" : "🌙";
    if (save) localStorage.setItem("themeMode", theme);
}

export function initTheme() {
    if (localStorage.getItem("themeAuto") === null)
        localStorage.setItem("themeAuto", "1");

    if (localStorage.getItem("themeAuto") === "1") {
        applyTheme(isNightTime() ? "dark" : "light", false);
    } else {
        applyTheme(localStorage.getItem("themeMode") || "light", false);
    }
}

export function toggleTheme() {
    localStorage.setItem("themeAuto", "0");
    const dark = document.documentElement.classList.contains("dark");
    applyTheme(dark ? "light" : "dark");
}
