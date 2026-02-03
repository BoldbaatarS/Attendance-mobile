// js/charts.js
let chartInstance = null;

// Сүүлд зурсан дата-г хадгална (theme солиход дахин зурахад хэрэгтэй)
let lastRows = null;
let lastState = null;

export function destroyChart() {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
}

function isDarkMode() {
    return document.documentElement.classList.contains("dark");
}

// ✅ Light/Dark theme palette (хоёул зөв харагдана)
function getChartTheme() {
    const dark = isDarkMode();

    if (dark) {
        return {
            text: "#e5e7eb",  // gray-200
            grid: "#374151",  // gray-700
            // canvas дээрх background-ыг Chart.js шууд тавихгүй, card нь тавина
        };
    }

    // ☀️ LIGHT — ЦЭНХЭР THEME
    return {
        text: "#1d4ed8",     // blue-700
        grid: "rgba(37, 99, 235, 0.25)", // blue-600 @ 25%
    };
}

function buildOptions() {
    const { text, grid } = getChartTheme();
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: text },
            },
            tooltip: {
                titleColor: text,
                bodyColor: text,
            },
        },
        scales: {
            x: {
                ticks: { color: text },
                grid: { color: grid },
            },
            y: {
                beginAtZero: true,
                ticks: { precision: 0, color: text },
                grid: { color: grid },
            },
        },
    };
}

/**
 * rows:
 * - өдөр: [{name, group, times:[]}]
 * - 7 хоног/сар: [{name, group, count}]
 *
 * state: ямар mode гэдгээ мэдэхэд ашиглаж болно (заавал биш)
 */
export function drawCharts(rows, state) {
    // хадгалж авна (theme солиход redraw хийхэд)
    lastRows = rows || [];
    lastState = state || {};

    destroyChart();

    const canvas = document.getElementById("chartCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // group 0-г rows-оос хэзээ ч харуулахгүй
    const filtered = (rows || []).filter(r => Number(r.group) !== 0);
    if (filtered.length === 0) return;

    // ✅ ЗӨВХӨН groupInput-оос уншина (state.user.group ашиглахгүй)
    const groupInput = document.getElementById("groupInput");
    const raw = (groupInput?.value ?? "").trim();  // "" эсвэл "1" гэх мэт
    const groupValue = raw === "" ? null : Number(raw); // "" -> null

    // ✅ ADMIN MODE: groupInput хоосон эсвэл 0
    const isAdmin = groupValue === null || groupValue === 0;

    //console.log("groupValue:", groupValue, "isAdmin:", isAdmin);

    const options = buildOptions();

    // =========================
    // 👑 ADMIN → аравтаар нийлбэр
    // =========================
    if (isAdmin) {
        const byGroup = {};

        filtered.forEach(r => {
            const g = Number(r.group);
            const val = Number(r.count ?? r.times?.length ?? 0);
            byGroup[g] = (byGroup[g] || 0) + val;
        });

        const groups = Object.keys(byGroup)
            .map(Number)
            .sort((a, b) => a - b);

        chartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: groups.map(g => `Аравт ${g}`),
                datasets: [
                    {
                        label: "Нийт ирц",
                        data: groups.map(g => byGroup[g]),
                        backgroundColor: "#16a34a", // green-600
                    },
                ],
            },
            options,
        });

        return;
    }

    // =========================
    // 👤 USER MODE → тухайн аравтын хүмүүс
    // =========================
    const scoped = filtered.filter(r => Number(r.group) === groupValue);

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: scoped.map(r => r.alias),
            datasets: [
                {
                    label: "Ирц",
                    data: scoped.map(r => Number(r.count ?? r.times?.length ?? 0)),
                    backgroundColor: "#2563eb", // blue-600
                },
            ],
        },
        options,
    });
}

/**
 * 🌙 Theme солих үед chart устгалгүйгээр өнгийг нь update хийх (хурдан)
 * Хэрвээ chart байхгүй бол юу ч хийхгүй.
 */
export function updateChartTheme() {
    if (!chartInstance) return;

    const { text, grid } = getChartTheme();

    // legend
    if (chartInstance.options?.plugins?.legend?.labels) {
        chartInstance.options.plugins.legend.labels.color = text;
    }

    // scales
    const scales = chartInstance.options?.scales;
    if (scales?.x) {
        scales.x.ticks.color = text;
        scales.x.grid.color = grid;
    }
    if (scales?.y) {
        scales.y.ticks.color = text;
        scales.y.grid.color = grid;
    }

    chartInstance.update();
}

/**
 * Theme солигдоход redraw хийхийг хүсвэл:
 * updateChartTheme() хангалттай, гэхдээ та хүсвэл redraw ч хийж болно
 */
export function redrawCharts() {
    if (!lastRows) return;
    drawCharts(lastRows, lastState);
}
