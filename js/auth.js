// js/auth.js
import { API_URL } from "./config.js";
import { state } from "./state.js";

function setLoginLoading(on) {
    loginBtn.disabled = on;
    loginBtnText.innerText = on ? "Нэвтэрч байна..." : "Нэвтрэх";
    loginSpinner.classList.toggle("hidden", !on);
}

export async function login() {
    const phone = phoneInput.value.trim();
    if (!phone) return;

    loginError.classList.add("hidden");

    try {
        const res = await fetch(`${API_URL}/att-api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone }),
        });

        const data = await res.json();
        if (!data || data.success !== true) {
            loginError.classList.remove("hidden");
            return;
        }

        // ✅ normalize
        const user = data.user;
        const normalizedUser = {
            ...user,
            group: user.group_no,  // ✅ фронтын хуучин кодтой нийцүүлж өгч байна
        };

        state.user = normalizedUser;
        state.token = data.token;
        state.isAdmin = data.is_admin;

        localStorage.setItem("user", JSON.stringify(normalizedUser));
        localStorage.setItem("token", data.token);

        location.reload();
    } catch (e) {
        console.error(e);
        loginError.classList.remove("hidden");
    }
}

export function logout() {
    localStorage.clear();
    location.reload();
}
