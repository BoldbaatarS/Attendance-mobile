import { monthISO, todayISO } from "./date-utils.js";
import { initNotificationsUI } from "./notifications.js";
import { state } from "./state.js";
import { initTheme } from "./theme.js";

export function initApp() {
    initTheme();
    initNotificationsUI();

    state.user = JSON.parse(localStorage.getItem("user"));
    if (!state.user) return;

    loginPage.classList.add("hidden");
    appPage.classList.remove("hidden");

    userName.innerText = state.user.name;
    userGroup.innerText = "Аравт: " + state.user.group;

    dateDay.value ||= todayISO();
    dateMonth.value ||= monthISO();
}
