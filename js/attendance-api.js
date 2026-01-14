import { API_URL } from "./config.js";

export async function fetchAttendance(action, date, group) {
    const r = await fetch(
        `${API_URL}?action=${action}&date=${date}&group=${group}`
    );
    return r.json();
}

export async function fetchPeople(group) {
    const r = await fetch(`${API_URL}?action=people&group=${group}`);
    return r.json();
}
