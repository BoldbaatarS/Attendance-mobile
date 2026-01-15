// js/theme.js
import { updateChartTheme } from "./charts.js";

export function initTheme() {
    const mode = localStorage.getItem("themeMode") || "auto";
    applyTheme(mode);

    // 🧠 Auto mode үед system theme өөрчлөгдвөл дагана
    if (mode === "auto") {
        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", () => {
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

    // reset
    html.classList.remove("dark");

    if (mode === "dark") {
        html.classList.add("dark");
    } else if (mode === "light") {
        // light → dark class хэрэггүй
    } else if (mode === "auto") {
        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;
        if (prefersDark) {
            html.classList.add("dark");
        }
    }

    // 🎨 CHART THEME UPDATE (ЧУХАЛ)
    // Chart байвал өнгийг нь шууд шинэчилнэ
    updateChartTheme();
}
