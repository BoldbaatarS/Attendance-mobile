export function pad2(n) {
    return String(n).padStart(2, "0");
}

export function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function monthISO() {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

export function weekToMonday(weekStr) {
    const [y, w] = weekStr.split("-W").map(Number);
    const jan4 = new Date(y, 0, 4);
    const monday = new Date(jan4);
    monday.setDate(jan4.getDate() - ((jan4.getDay() || 7) - 1) + (w - 1) * 7);
    return `${monday.getFullYear()}-${pad2(monday.getMonth() + 1)}-${pad2(monday.getDate())}`;
}
