// js/app.js
import { destroyChart, drawCharts } from "./charts.js";
import { API_URL } from "./config.js";
import { monthISO, todayISO, weekToMonday } from "./date-utils.js";
import { notify } from "./notifications.js";
import { renderDayCards, renderSummarySorted } from "./render-cards.js";

import { state } from "./state.js";

/* ================= INIT ================= */
export function initApp() {
    state.user = JSON.parse(localStorage.getItem("user"));
    if (!state.user) return;

    loginPage.classList.add("hidden");
    appPage.classList.remove("hidden");

    userName.innerText = state.user.name;
    userGroup.innerText = "Аравт: " + state.user.group;

    dateDay.value ||= todayISO();
    dateMonth.value ||= monthISO();

    groupInput.value = state.user.group;
    if (Number(state.user.group) !== 0) {
        groupInput.readOnly = true;
        groupInput.classList.add("bg-gray-100");
    }
}

/* ================= MODE ================= */
export function setMode(mode) {
    state.viewMode = mode;

    btnDay.classList.toggle("bg-blue-600", mode === "day");
    btnWeek.classList.toggle("bg-blue-600", mode === "week");
    btnMonth.classList.toggle("bg-blue-600", mode === "month");

    dateDay.classList.toggle("hidden", mode !== "day");
    dateWeek.classList.toggle("hidden", mode !== "week");
    dateMonth.classList.toggle("hidden", mode !== "month");
}

/* ================= CHART ================= */
export function toggleChart() {
    chartWrap.classList.toggle("hidden");
}

/* ================= LOAD ATTENDANCE ================= */
export async function loadAttendance() {
    if (!state.user) return;

    const groupInput = document.getElementById("groupInput");
    const group = groupInput?.value
        ? Number(groupInput.value)
        : Number(state.user.group); // fallback

    // if (!group) {
    //     alert("Бүлэг сонгоно уу");
    //     return;
    // }

    let date, action;
    // let group = Number(state.user.group);

    if (state.viewMode === "day") {
        date = dateDay.value;
        action = "attendanceByDay";
        if (!date) return alert("Өдөр сонгоно уу");
    }

    if (state.viewMode === "week") {
        if (!dateWeek.value) return alert("7 хоног сонгоно уу");
        date = weekToMonday(dateWeek.value);
        action = "attendanceByWeek";
    }

    if (state.viewMode === "month") {
        if (!dateMonth.value) return alert("Сар сонгоно уу");
        date = dateMonth.value + "-01";
        action = "attendanceByMonth";
    }

    loading.classList.remove("hidden");
    result.innerHTML = "";
    destroyChart();

    try {
        const res = await fetch(
            `${API_URL}?action=${action}&date=${date}&group=${group}`
        );
        const data = await res.json();

        if (state.viewMode === "day") {
            const merged = await mergeDayWithAbsent(data, group);
            renderDayCards(merged);
            drawCharts(merged, state);
        } else {
            renderSummarySorted(data); // ✅ ЗӨВ
            drawCharts(data, state);
        }

        drawCharts(data, state);
        notify("Ирц шинэчлэгдлээ", date);

    } catch (e) {
        console.error(e);
        result.innerHTML =
            "<p class='text-center text-red-500'>Алдаа гарлаа</p>";
    } finally {
        loading.classList.add("hidden");
    }
}
async function mergeDayWithAbsent(attendedRows, group) {
    // 1. тухайн аравтын бүх хүмүүс
    const res = await fetch(
        `${API_URL}?action=people&group=${group}`
    );
    const people = await res.json();

    // 2. ирсэн хүмүүс map
    const attendedMap = {};
    (attendedRows || []).forEach(r => {
        attendedMap[r.name] = r;
    });

    // 3. merge
    const merged = people.map(p => {
        const a = attendedMap[p.name];
        return a
            ? {
                name: p.name,
                group: p.group,
                times: a.times || [],
                present: true
            }
            : {
                name: p.name,
                group: p.group,
                times: [],
                present: false
            };
    });

    // 4. аравт + нэрээр эрэмбэлэх
    merged.sort(
        (a, b) =>
            Number(a.group) - Number(b.group) ||
            a.name.localeCompare(b.name)
    );

    return merged;
}

