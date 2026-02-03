// js/app.js
import { destroyChart, drawCharts } from "./charts.js";
import { API_URL } from "./config.js";
import { monthISO, todayISO, weekToMonday } from "./date-utils.js";
import { notify } from "./notifications.js";
import { renderDayCards, renderSummarySorted } from "./render-cards.js";
import { state } from "./state.js";


export let lastRows = [];
/* ================= ELEMENTS ================= */


/* ================= INIT ================= */
export function initApp() {
    state.user = JSON.parse(localStorage.getItem("user"));

    state.token = localStorage.getItem("token");
    if (!state.user || !state.token) return;

    loginPage.classList.add("hidden");
    appPage.classList.remove("hidden");

    userName.innerText = state.user.alias;
    userGroup.innerText = "Аравт: " + state.user.group; // ✅ одоо group байна

    dateDay.value ||= todayISO();
    dateMonth.value ||= monthISO();

    groupInput.value = state.user.group;
    if (Number(state.user.group) !== 0) {
        groupInput.readOnly = true;
        groupInput.classList.add("bg-gray-100");
    }


    const btnAdd = document.getElementById("btnAddPerson");

    if (Number(state.user.group) === 0) {
        btnAdd.classList.remove("hidden");
        btnAdd.onclick = () => openCreatePerson();
    } else {
        btnAdd.classList.add("hidden");
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

function openCreatePerson() {
    openPersonModal({
        id: null,
        name: "",
        alias: "",
        group: 1,
    });
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
            renderDayCards(merged, Number(state.user.group) === 0);
            drawCharts(merged, state);

        } else {
            const merged = await mergeDayWithAbsent(data, classID, group);
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
                id: p.id,
                alias: p.alias,
                phone: p.phone,
                name: p.name,
                group: p.group_no,
                times: a.times || [],
                present: true
            }
            : {
                id: p.id,
                alias: p.alias,
                phone: p.phone,
                name: p.name,
                group: p.group_no,
                times: a.times || [],
                present: false
            };
    });

    return merged;
}

window.openCreatePerson = function () {
    openPersonModal({
        id: null,
        name: "",
        alias: "",
        group: 1,
    });
};

window.openEditPerson = function (id) {
    const person = lastRows.find(r => r.id === id);
    if (!person) return;

    openPersonModal(person);
};

function openPersonModal(person) {
    document.getElementById("personModal").classList.remove("hidden");
    document.getElementById("personModalTitle").innerText =
        person.id ? "Гишүүний мэдээлэл засах" : "Гишүүн нэмэх";
    // console.log("EDIT PERSON:", person.group);

    document.getElementById("personId").value = person.id ?? "";
    document.getElementById("personName").value = person.name ?? "";
    document.getElementById("personAlias").value = person.alias ?? "";
    document.getElementById("phone").value = person.phone ?? "";
    document.getElementById("personGroup").value = person.group ?? 1;
}

window.closePersonModal = function () {
    document.getElementById("personModal").classList.add("hidden");
};


window.savePerson = async function () {
    const id = document.getElementById("personId").value;
    const name = document.getElementById("personName").value.trim();
    const alias = document.getElementById("personAlias").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const group = Number(document.getElementById("personGroup").value);

    if (!name) {
        alert("Нэр заавал");
        return;
    }

    const classID = state.user.class_id;

    const payload = {
        Name: name,
        Alias: alias,
        Phone: phone,
        group_no: group,
    };
    //console.log("PAYLOAD:", payload);
    const url = id
        ? `${API_URL}/att-api/classes/${classID}/people/${id}`
        : `${API_URL}/att-api/classes/${classID}/people`;

    const method = id ? "PUT" : "POST";

    await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify(payload),
    });

    closePersonModal();
    notify(id ? "Засагдлаа" : "Нэмэгдлээ", name);
    loadAttendance();
};

window.deletePerson = async function (id, name) {
    if (!confirm(`"${name}"-г устгах уу?`)) return;

    const classID = state.user.class_id;

    await fetch(
        `${API_URL}/att-api/classes/${classID}/people/${id}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${state.token}`,
            },
        }
    );

    notify("Устгагдлаа", name);
    loadAttendance();
};