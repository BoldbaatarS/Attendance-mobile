// js/theme.js
export function initTheme() {
    const mode = localStorage.getItem("themeMode") || "auto";
    applyTheme(mode);

    // Add a listener for system theme changes if in auto mode
    if (mode === "auto") {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            applyTheme("auto");
        });
    }
}

export function setTheme(mode) {
    localStorage.setItem("themeMode", mode);
    applyTheme(mode);
}

function applyTheme(mode) {
    const html = document.documentElement;
    html.classList.remove("dark");

    if (mode === "dark") {
        html.classList.add("dark");
    } else if (mode === "light") {
        html.classList.remove("dark");
    } else if (mode === "auto") {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            html.classList.add("dark");
        }
    }
}
