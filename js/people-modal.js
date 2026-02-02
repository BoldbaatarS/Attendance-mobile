import { loadAttendance } from "./app.js";
import { API_URL } from "./config.js";
import { notify } from "./notifications.js";
import { state } from "./state.js";

const modal = document.getElementById("peopleModal");

export function openAddPerson() {
    document.getElementById("peopleModalTitle").innerText = "Хүн нэмэх";
    clearForm();
    modal.classList.remove("hidden");
}

export function openEditPerson(p) {
    document.getElementById("peopleModalTitle").innerText = "Хүн засах";
    document.getElementById("personId").value = p.id;
    pCode.value = p.code;
    pName.value = p.name;
    pAlias.value = p.alias || "";
    pPhone.value = p.phone || "";
    pGroup.value = p.group;
    modal.classList.remove("hidden");
}

window.closePeopleModal = function () {
    modal.classList.add("hidden");
};

function clearForm() {
    personId.value = "";
    pCode.value = "";
    pName.value = "";
    pAlias.value = "";
    pPhone.value = "";
    pGroup.value = "";
}

window.savePerson = async function () {
    const id = personId.value;
    const classID = state.user.class_id;

    const payload = {
        Code: pCode.value,
        Name: pName.value,
        Alias: pAlias.value,
        Phone: pPhone.value,
        GroupNo: Number(pGroup.value),
    };

    const method = id ? "PUT" : "POST";
    const url = id
        ? `${API_URL}/api/classes/${classID}/people/${id}`
        : `${API_URL}/api/classes/${classID}/people`;

    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        alert("Алдаа гарлаа");
        return;
    }

    notify("Амжилттай хадгаллаа");
    closePeopleModal();
    loadAttendance(); // refresh
};

window.deletePerson = async function (id) {
    if (!confirm("Устгах уу?")) return;

    const classID = state.user.class_id;

    await fetch(`${API_URL}/api/classes/${classID}/people/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${state.token}` },
    });

    notify("Устгалаа");
    loadAttendance();
};
