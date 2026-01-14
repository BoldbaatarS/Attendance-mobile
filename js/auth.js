// js/auth.js
import { API_URL } from "./config.js";
import { state } from "./state.js";

/* ================= UI helper ================= */
function setLoginLoading(on) {
    loginBtn.disabled = on;
    loginBtnText.innerText = on ? "Нэвтэрч байна..." : "Нэвтрэх";
    loginSpinner.classList.toggle("hidden", !on);
}

/* ================= AUTH ================= */
export async function login() {
    const phone = phoneInput.value.trim();
    if (!phone) return;

    loginError.classList.add("hidden");
    setLoginLoading(true);

    try {
        const res = await fetch(
            `${API_URL}?action=login&phone=${encodeURIComponent(phone)}`
        );
        const data = await res.json();

        if (!data || data.success !== true) {
            loginError.classList.remove("hidden");
            return;
        }

        state.user = data;
        localStorage.setItem("user", JSON.stringify(data));

        // app.js-ийн initApp-ийг main.js дуудна
        location.reload(); // ✔️ энгийн, найдвартай
    } catch (e) {
        console.error(e);
        loginError.classList.remove("hidden");
    } finally {
        setLoginLoading(false);
    }
}

export function logout() {
    localStorage.clear();
    location.reload();
}
