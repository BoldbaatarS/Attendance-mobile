// js/charts.js
let chartInstance = null;

// Сүүлд зурсан дата-г хадгална
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

function getChartTheme() {
    const dark = isDarkMode();
    return dark
        ? { text: "#e5e7eb", grid: "#374151" }
        : { text: "#1d4ed8", grid: "rgba(37, 99, 235, 0.25)" };
}

function buildOptions(isPercent = false) {
    const { text, grid } = getChartTheme();

    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: text } },
            tooltip: {
                callbacks: isPercent
                    ? {
                        label: ctx => `${ctx.parsed.y}%`,
                    }
                    : undefined,
            },
        },
        scales: {
            x: {
                ticks: { color: text },
                grid: { color: grid },
            },
            y: {
                beginAtZero: true,
                max: isPercent ? 100 : undefined,
                ticks: {
                    color: text,
                    callback: isPercent ? v => `${v}%` : undefined,
                },
                grid: { color: grid },
            },
        },
    };
}

/**
 * rows:
 * - day: [{name, group, present, times:[]}]
 * - summary: [{group, count}]
 */
export function drawCharts(rows, state) {
    lastRows = rows || [];
    lastState = state || {};

    destroyChart();

    const canvas = document.getElementById("chartCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // group 0-г хасна
    const filtered = (rows || []).filter(r => Number(r.group) !== 0);
    if (filtered.length === 0) return;

    const groupInput = document.getElementById("groupInput");
    const raw = (groupInput?.value ?? "").trim();
    const groupValue = raw === "" ? null : Number(raw);

    const isAdmin = groupValue === null || groupValue === 0;

    // =========================
    // 👑 ADMIN MODE → АРАВТ БҮРЭЭР %
    // =========================

    if (isAdmin) {
        const byGroup = {};
        const options = buildOptions();
        filtered.forEach(r => {
            const g = Number(r.group);
            const val = Number(r.count ?? r.times?.length ?? 0);
            byGroup[g] = (byGroup[g] || 0) + val;
        });

        const groups = Object.keys(byGroup)
            .map(Number)
            .sort((a, b) => a - b);

        // ✅ хамгийн их оролцсон тоо
        const maxValue = Math.max(...Object.values(byGroup), 1);

        const percents = groups.map(g =>
            Math.round((byGroup[g] / maxValue) * 100)
        );

        chartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: groups.map(g => `Аравт ${g}`),
                datasets: [
                    {
                        label: "Идэвх (%)",
                        data: percents,
                        backgroundColor: "#16a34a",
                    },
                ],
            },
            options: {
                ...options,
                scales: {
                    ...options.scales,
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: v => v + "%",
                            color: getChartTheme().text,
                        },
                    },
                },
            },
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
                    data: scoped.map(r =>
                        Number(r.count ?? r.times?.length ?? 0)
                    ),
                    backgroundColor: "#2563eb",
                },
            ],
        },
        options: buildOptions(false),
    });
}

// 🌙 Theme update
export function updateChartTheme() {
    if (!chartInstance) return;

    const { text, grid } = getChartTheme();
    const opts = chartInstance.options;

    opts.plugins.legend.labels.color = text;
    opts.scales.x.ticks.color = text;
    opts.scales.x.grid.color = grid;
    opts.scales.y.ticks.color = text;
    opts.scales.y.grid.color = grid;

    chartInstance.update();
}

export function redrawCharts() {
    if (!lastRows) return;
    drawCharts(lastRows, lastState);
}

/**
 * 🧮 Аравт бүрийн percent тооцоолол
 */
function buildGroupPercentData(rows) {
    const groups = {};
    rows.forEach(r => {
        const g = Number(r.group);

        if (!groups[g]) {
            groups[g] = {
                total: 0,
                present: 0,
            };
        }

        groups[g].total++;

        if (r.present === true) {
            groups[g].present++;
        }
    });

    return Object.keys(groups)
        .map(Number)
        .sort((a, b) => a - b)
        .map(g => ({
            group: g,
            percent: groups[g].total === 0
                ? 0
                : Math.round(
                    (groups[g].present / groups[g].total) * 100
                ),
            present: groups[g].present,
            total: groups[g].total,
        }));
}
