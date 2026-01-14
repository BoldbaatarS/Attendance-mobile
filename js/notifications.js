// js/notifications.js
// 🔔 Notifications + ⏰ Reminders (05:00 / 20:00)

// ================= STORAGE KEYS =================
const KEY_NOTIF = "notifEnabled";        // "1" | "0"
const KEY_REMINDER = "reminderEnabled"; // "1" | "0"

// ================= STATE =================
let reminderTimers = [];

// ================= PUBLIC API =================

/**
 * Checkbox-уудын анхны төлөвийг localStorage-оос уншина
 * index.html дээрх:
 *   <input id="notifToggle">
 *   <input id="reminderToggle">
 */
export function initNotificationsUI() {
    const notifToggle = document.getElementById("notifToggle");
    const reminderToggle = document.getElementById("reminderToggle");

    if (!notifToggle || !reminderToggle) return;

    notifToggle.checked = localStorage.getItem(KEY_NOTIF) === "1";
    reminderToggle.checked = localStorage.getItem(KEY_REMINDER) === "1";

    notifToggle.addEventListener("change", async () => {
        localStorage.setItem(KEY_NOTIF, notifToggle.checked ? "1" : "0");
        if (notifToggle.checked) {
            await ensurePermission();
        }
    });

    reminderToggle.addEventListener("change", async () => {
        localStorage.setItem(KEY_REMINDER, reminderToggle.checked ? "1" : "0");

        if (reminderToggle.checked) {
            const ok = await ensurePermission();
            if (ok) scheduleReminders();
        } else {
            clearReminders();
        }
    });

    // app load үед reminder асаалттай бол дахин schedule хийнэ
    if (reminderToggle.checked) {
        ensurePermission().then(ok => {
            if (ok) scheduleReminders();
        });
    }
}

/**
 * App дотор гараар дуудах notification
 */
export function notify(title, body) {
    if (!isNotifEnabled()) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    try {
        new Notification(title, { body });
    } catch (_) { }
}

// ================= INTERNAL HELPERS =================

function isNotifEnabled() {
    return localStorage.getItem(KEY_NOTIF) === "1";
}

async function ensurePermission() {
    if (!("Notification" in window)) return false;

    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;

    const p = await Notification.requestPermission();
    return p === "granted";
}

// ================= REMINDER LOGIC =================

function clearReminders() {
    reminderTimers.forEach(id => clearTimeout(id));
    reminderTimers = [];
}

/**
 * 05:00 болон 20:00 дээр notification илгээнэ
 * Дараагийн өдөр автоматаар дахин schedule хийнэ
 */
function scheduleReminders() {
    clearReminders();

    if (localStorage.getItem(KEY_REMINDER) !== "1") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const now = new Date();

    const targets = ["05:00", "20:00"].map(hm => {
        const [h, m] = hm.split(":").map(Number);
        const t = new Date(now);
        t.setHours(h, m, 0, 0);

        // хэрвээ өнөөдөр өнгөрсөн бол → маргааш
        if (t.getTime() <= now.getTime()) {
            t.setDate(t.getDate() + 1);
        }
        return { hm, time: t };
    });

    targets.forEach(({ hm, time }) => {
        const delay = time.getTime() - Date.now();

        const id = setTimeout(() => {
            notify("⏰ Ирц шалгах цаг", `${hm} – Ирцээ шалгаарай`);
            // дараагийн өдрийн reminder-уудыг дахин тавина
            scheduleReminders();
        }, delay);

        reminderTimers.push(id);
    });
}
