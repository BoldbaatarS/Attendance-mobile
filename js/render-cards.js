// js/render-cards.js


/**
 * =========================
 * ӨДРИЙН ИРЦ (ИРСЭН + ИРЭЭГҮЙ)
 * rows: [{ name, group, times:[], present:boolean }]
 * =========================
 */
export function renderDayCards(rows, isAdmin = false) {
  const result = document.getElementById("result");
  result.innerHTML = "";

  if (!rows || rows.length === 0) {
    result.innerHTML =
      "<p class='text-center text-gray-500'>Мэдээлэл олдсонгүй</p>";
    return;
  }

  rows.forEach(r => {
    const times = Array.isArray(r.times) ? r.times : [];
    const present = times.length > 0;
    //console.log("R:", r);
    const right = present
      ? `<div class="text-xl font-bold text-blue-600">${times.length}</div>`
      : `<div class="text-sm font-semibold text-red-500">Оролцоогүй</div>`;

    const badges = times
      .map(t => `
        <span class="px-2 py-1 rounded-lg text-sm bg-blue-100 text-blue-700">
          ${t}
        </span>
      `)
      .join("");

    const adminActions = isAdmin

      ? `
        <div class="flex gap-2">
          <button
            onclick="openEditPerson(${r.id})"
            class="px-2 py-1 rounded-lg bg-yellow-500 text-white text-sm">
            ✏️
          </button>
          <button
            onclick="deletePerson(${r.id}, '${r.alias}')"
            class="px-2 py-1 rounded-lg bg-red-600 text-white text-sm">
            🗑
          </button>
        </div>
      `
      : "";

    result.innerHTML += `
      <div class="bg-white p-4 rounded-2xl shadow">
        <div class="flex justify-between items-center">
          <div>
            <p class="font-medium">${r.alias}</p>
            <p class="text-sm text-gray-500">Аравт: ${r.group}</p>
            <p class="text-sm text-gray-500">Код: ${r.code}</p>
          </div>
          <div class="flex items-center gap-3">
            ${right}
            ${adminActions}
          </div>
        </div>

        <div class="mt-2 flex gap-2 flex-wrap">
          ${badges}
        </div>
      </div>
    `;
  });
}


/**
 * =========================
 * 7 ХОНОГ / САР — НИЙТ ДҮН
 * rows: [{ name, group, count }]
 * =========================
 */
export function renderSummarySorted(rows) {
  const result = document.getElementById("result");
  if (!result) return;

  result.innerHTML = "";

  if (!rows || rows.length === 0) {
    result.innerHTML =
      `<p class="text-center text-gray-500 dark:text-gray-400">
        Мэдээлэл олдсонгүй
      </p>`;
    return;
  }

  // Аравтаар → нэрээр эрэмбэлэх
  rows
    .slice()
    .sort(
      (a, b) =>
        Number(a.group) - Number(b.group) ||
        String(a.name).localeCompare(String(b.name))
    )
    .forEach(r => {

      result.innerHTML += `
        <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow
                    flex justify-between items-center">
          <div>
            <p class="font-medium">${r.alias}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Аравт: ${r.group}
            </p>
          </div>
          <div class="text-xl font-bold text-blue-600 dark:text-gray-400">
            ${Number(r.count || 0)}
          </div>
        </div>
      `;
    });
}
