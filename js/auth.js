import { initApp } from "./app.js";
import { API_URL } from "./config.js";
import { state } from "./state.js";

export function setLoginLoading(on) {
    loginBtn.disabled = on;
    loginBtnText.innerText = on ? "Нэвтэрч байна" : "Нэвтрэх";
    loginSpinner.classList.toggle("hidden", !on);
}

export async function login() {
    const phone = phoneInput.value.trim();
    if (!phone) return;

    loginError.classList.add("hidden");
    setLoginLoading(true);

    try {
        const r = await fetch(`${API_URL}?action=login&phone=${encodeURIComponent(phone)}`);
        const d = await r.json();

        if (!d?.success) {
            loginError.classList.remove("hidden");
            return;
        }

        localStorage.setItem("user", JSON.stringify(d));
        state.user = d;
        initApp();
    } finally {
        setLoginLoading(false);
    }
}

export function logout() {
    localStorage.clear();
    location.reload();
}
