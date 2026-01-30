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
    state.token = localStorage.getItem("token");
    if (!state.user || !state.token) return;

    loginPage.classList.add("hidden");
    appPage.classList.remove("hidden");

    userName.innerText = state.user.name;
    userGroup.innerText = "Аравт: " + state.user.group; // ✅ одоо group байна

    dateDay.value ||= todayISO();
    dateMonth.value ||= monthISO();

    groupInput.value = state.user.group;
    if (Number(state.user.group) !== 0) {
        groupInput.readOnly = true;
        groupInput.classList.add("bg-gray-100");
    }
}
function authHeaders() {
    return {
        "Authorization": `Bearer ${state.token}`,
    };
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
    if (!state.user || !state.token) return;

    const classID = state.user.class_id; // ✅ response дээр class_id байгаа
    const group = groupInput?.value
        ? Number(groupInput.value)
        : Number(state.user.group);

    let date, path;

    if (state.viewMode === "day") {
        date = dateDay.value;
        if (!date) return alert("Өдөр сонгоно уу");
        path = `/att-api/classes/${classID}/attendance/day`;
    }

    if (state.viewMode === "week") {
        if (!dateWeek.value) return alert("7 хоног сонгоно уу");
        date = weekToMonday(dateWeek.value);
        path = `/att-api/classes/${classID}/attendance/week`;
    }

    if (state.viewMode === "month") {
        if (!dateMonth.value) return alert("Сар сонгоно уу");
        date = dateMonth.value
        path = `/att-api/classes/${classID}/attendance/month`;
    }

    loading.classList.remove("hidden");
    result.innerHTML = "";
    destroyChart();

    try {
        const url = `${API_URL}${path}?date=${encodeURIComponent(date)}&group=${encodeURIComponent(group)}`;
        const res = await fetch(url, { headers: authHeaders() });

        const data = await res.json();
        //console.log("RAW DATA:", data);

        if (state.viewMode === "day") {
            const merged = await mergeDayWithAbsent(data, classID, group);
            renderDayCards(merged);
            drawCharts(merged, state);

        } else {
            renderSummarySorted(data);
            drawCharts(data, state);

        }

        notify("Ирц шинэчлэгдлээ", date);
    } catch (e) {
        console.error(e);
        result.innerHTML = "<p class='text-center text-red-500'>Алдаа гарлаа</p>";
    } finally {
        loading.classList.add("hidden");
    }
}
async function mergeDayWithAbsent(attendedRows, classID, group) {
    const res = await fetch(
        `${API_URL}/att-api/classes/${classID}/people?group=${group}`,
        { headers: authHeaders() }
    );

    const people = await res.json();
    // console.log("ATTENDED:", classID);
    // console.log("PEOPLE:", people);

    const attendedMap = {};
    (attendedRows || []).forEach(r => {
        attendedMap[r.name] = r;
    });

    const merged = people.map(p => {
        const a = attendedMap[p.name];
        return a
            ? {
                name: p.name,
                group: p.group_no,
                times: a.times || [],
                present: true
            }
            : {
                name: p.name,
                group: p.group_no,
                times: [],
                present: false
            };
    });

    return merged;
}

