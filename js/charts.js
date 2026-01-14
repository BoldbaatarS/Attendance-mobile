/* ================= CHART RULES =================
           - Group 0 is NEVER shown in charts
           - Admin (group=0): chart by group (excluding 0)
           - User (group!=0): chart by person (excluding group 0 anyway)
        */
function drawDayCharts(merged, date, effectiveGroup) {
    destroyChart();
    const ctx = document.getElementById("chartCanvas");
    const isAdmin = Number(effectiveGroup) === 0;

    // never show group 0 in charts
    const filtered = (merged || []).filter(x => Number(x.group) !== 0);

    if (isAdmin) {
        const byGroup = {};
        filtered.forEach(x => {
            const g = Number(x.group);
            byGroup[g] = byGroup[g] || { present: 0, absent: 0 };
            if (x.present) byGroup[g].present++;
            else byGroup[g].absent++;
        });

        const groups = Object.keys(byGroup).map(Number).sort((a, b) => a - b);

        chartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: groups.map(g => `Аравт ${g}`),
                datasets: [
                    { label: "Ирсэн", data: groups.map(g => byGroup[g].present) },
                    { label: "Ирээгүй", data: groups.map(g => byGroup[g].absent) }
                ]
            },
            options: {
                responsive: true,
                plugins: { title: { display: true, text: `Өдөр (${date}) – Аравтаар` } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }
        });
        return;
    }

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: filtered.map(x => x.name),
            datasets: [
                { label: "Ирсэн тоо", data: filtered.map(x => x.present ? (x.times || []).length : 0) }
            ]
        },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: `Өдөр (${date}) – Хүн тус бүр` } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
    });
}

function drawSummaryCharts(rows, mode, date, effectiveGroup) {
    destroyChart();
    const ctx = document.getElementById("chartCanvas");
    const isAdmin = Number(effectiveGroup) === 0;

    // never show group 0
    const filtered = (rows || []).filter(r => Number(r.group) !== 0);

    if (isAdmin) {
        const byGroup = {};
        filtered.forEach(r => {
            const g = Number(r.group);
            byGroup[g] = (byGroup[g] || 0) + Number(r.count || 0);
        });

        const groups = Object.keys(byGroup).map(Number).sort((a, b) => a - b);

        chartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: groups.map(g => `Аравт ${g}`),
                datasets: [{ label: "Нийт ирц", data: groups.map(g => byGroup[g]) }]
            },
            options: {
                responsive: true,
                plugins: { title: { display: true, text: `${mode === "week" ? "7 хоног" : "Сар"} (${date}) – Аравтаар` } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }
        });
        return;
    }

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: filtered.map(r => r.name),
            datasets: [{ label: "Нийт ирц", data: filtered.map(r => Number(r.count || 0)) }]
        },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: `${mode === "week" ? "7 хоног" : "Сар"} (${date}) – Хүн тус бүр` } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
    });
}