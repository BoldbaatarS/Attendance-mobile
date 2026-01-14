// js/charts.js
let chartInstance = null;

export function destroyChart() {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
}

export function drawCharts(rows, state) {
    destroyChart();

    const ctx = document.getElementById("chartCanvas");
    if (!ctx) return;

    // group 0-г хэзээ ч харуулахгүй
    const filtered = (rows || []).filter(r => Number(r.group) !== 0);
    if (filtered.length === 0) return;

    const isAdmin = Number(state.user.group) === 0;

    // 👤 Хэрэглэгч → хүн тус бүр
    if (!isAdmin) {
        chartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: filtered.map(r => r.name),
                datasets: [{
                    label: "Ирц",
                    data: filtered.map(r => Number(r.count || r.times?.length || 0)),
                    backgroundColor: "#2563eb"
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } }
                }
            }
        });
        return;
    }

    // 👑 Админ → аравтаар
    const byGroup = {};
    filtered.forEach(r => {
        const g = r.group;
        byGroup[g] = (byGroup[g] || 0) + Number(r.count || r.times?.length || 0);
    });

    const groups = Object.keys(byGroup).sort((a, b) => a - b);

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: groups.map(g => `Аравт ${g}`),
            datasets: [{
                label: "Нийт ирц",
                data: groups.map(g => byGroup[g]),
                backgroundColor: "#16a34a"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 } }
            }
        }
    });
}
