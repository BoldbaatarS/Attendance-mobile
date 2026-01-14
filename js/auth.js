// js/auth.js
import { initApp } from "./app.js";
import { API_URL } from "./config.js";

export async function login() {
    const phone = phoneInput.value.trim();
    if (!phone) return;

    loginError.classList.add("hidden");
    setLoginLoading(true);

    try {
        const res = await fetch(`${API_URL}?action=login&phone=${encodeURIComponent(phone)}`);
        const data = await res.json();

        if (!data || data.success !== true) {
            loginError.classList.remove("hidden");
            return;
        }

        localStorage.setItem("user", JSON.stringify(data));
        initApp();
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
