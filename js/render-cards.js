// js/render-card.js
// Нэг card үүсгэж HTML string буцаана (Day болон Summary хоёуланд ашиглана)

function escapeHtml(str) {
    return String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/**
 * @param {{
 *  name: string,
 *  group: number|string,
 *  present?: boolean,        // day mode
 *  times?: string[],         // day mode
 *  count?: number            // week/month summary
 * }} r
 * @param {{ mode: "day"|"summary" }} opt
 */
export function renderCard(r, opt = { mode: "day" }) {
    const name = escapeHtml(r?.name);
    const group = escapeHtml(r?.group ?? "");

    const base = `
      <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
        <div class="flex justify-between items-center">
          <div>
            <p class="font-medium">${name}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Аравт: ${group}</p>
          </div>
          __RIGHT__
        </div>
        __BOTTOM__
      </div>
    `;

    if (opt.mode === "summary") {
        const count = Number(r?.count ?? 0);
        const right = `<div class="text-xl font-bold text-blue-600">${count}</div>`;
        return base.replace("__RIGHT__", right).replace("__BOTTOM__", "");
    }

    // day
    const present = !!r?.present;
    const times = Array.isArray(r?.times) ? r.times : [];
    const right = present
        ? `<div class="text-xl font-bold text-blue-600">${times.length}</div>`
        : `<div class="text-sm font-semibold text-red-500">Ирээгүй</div>`;

    const badges = times
        .map(t => `<span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-sm">${escapeHtml(t)}</span>`)
        .join("");

    const bottom = badges ? `<div class="mt-2 flex gap-2 flex-wrap">${badges}</div>` : "";

    return base.replace("__RIGHT__", right).replace("__BOTTOM__", bottom);
}
