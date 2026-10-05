import { categories, monthNames } from "./data.js?v=lite-4";
import * as calculations from "./calculations.js?v=lite-4";
import { createStore } from "./state.js?v=lite-4";

const moneyFormatter = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const store = createStore(() => window.localStorage);
const state = store.state;
const saveState = () => { store.save(); showStorageStatus(); };
const syncCurrentMonth = saveState;
const getCategory = calculations.getCategory;
const categorySummaries = (...args) => calculations.categorySummaries(state, ...args);
const pendingItems = (...args) => calculations.pendingItems(state, ...args);
const activeItems = (...args) => calculations.activeItems(state, ...args);
const findItem = (...args) => calculations.findItem(state, ...args);
const itemAmount = (...args) => calculations.itemAmount(state, ...args);
const slotValues = (...args) => calculations.slotValues(state, ...args);
const itemName = (...args) => calculations.itemName(state, ...args);
const itemIcon = (...args) => calculations.itemIcon(state, ...args);
const monthlyTotal = (...args) => calculations.monthlyTotal(state, ...args);
const app = document.querySelector("#app");
const nav = document.querySelector(".bottom-nav");

app.addEventListener("click", handleClick);
app.addEventListener("change", handleChange);
app.addEventListener("input", handleInput);
app.addEventListener("focusout", handleFocusOut);
app.addEventListener("submit", handleSubmit);
nav.addEventListener("click", handleNavigation);

render();

function render() {
  syncCurrentMonth();
  if (state.view === "home") renderHome();
  if (state.view === "expenses") renderExpenses();
  if (state.view === "detail") renderDetail();
  if (state.view === "history") renderHistory();
  if (state.view === "add") renderAdd();
  updateNavigation();
}

function renderHome() {
  const total = monthlyTotal();
  const pending = pendingItems();
  const summaries = categorySummaries();

  app.innerHTML = `
    <header class="page-header">
      <div><h1>Mini Gastos</h1><p>${currentMonthLabel()}</p></div>
      <span class="month-label">LITE</span>
    </header>

    <section class="total-block">
      <span>Gasto mensual</span>
      <strong>${money(total)}</strong>
      <small>COP</small>
    </section>

    <section class="section">
      <div class="section-title"><h2>Pendiente</h2><strong>${pending.length}</strong></div>
      <div class="list">
        ${pending.length ? pending.slice(0, 6).map((item) => `
          <button class="row" data-category="${item.categoryId}" type="button">
            <span class="row-icon">${escapeHtml(item.icon)}</span>
            <span class="row-copy"><strong>${escapeHtml(item.name)}</strong><span>${item.category}</span></span>
            <em class="row-value">${money(item.amount)}</em>
          </button>
        `).join("") : `<p class="empty">Sin pagos pendientes</p>`}
      </div>
    </section>

    <section class="section">
      <div class="section-title"><h2>Categorías</h2><strong>${money(total)}</strong></div>
      <div class="list">
        ${summaries.map((category) => categoryRow(category)).join("")}
      </div>
    </section>
  `;
}

function renderExpenses() {
  app.innerHTML = `
    <header class="page-header"><div><h1>Mis gastos</h1><p>${currentMonthLabel()}</p></div></header>
    <section class="section">
      <div class="list">${categorySummaries().map((category) => categoryRow(category, true)).join("")}</div>
    </section>
  `;
}

function categoryRow(category, showStatus = false) {
  return `
    <button class="row category-row" style="--accent:${category.color}" data-category="${category.id}" type="button">
      <span class="row-icon">${category.icon}</span>
      <span class="row-copy"><strong>${category.name}</strong><span>${category.count} gastos${showStatus ? ` · ${category.pending} pendientes` : ""}</span></span>
      ${showStatus ? `<span class="status-dot ${category.pending === 0 ? "done" : ""}"></span>` : ""}
      <em class="row-value">${money(category.total)}</em>
    </button>
  `;
}

function renderDetail() {
  const category = getCategory(state.selectedCategory);
  if (!category) {
    state.view = "expenses";
    render();
    return;
  }

  const items = activeItems(category);
  const total = items.reduce((sum, item) => sum + itemAmount(item), 0);

  app.innerHTML = `
    <header class="page-header">
      <button class="back-button" data-back="expenses" type="button" aria-label="Volver">‹</button>
      <div><h1>${category.icon} ${category.name}</h1><p>${items.length} gastos</p></div>
      <span></span>
    </header>
    <div class="detail-total"><span>Total mensual</span><strong data-live-total>${money(total)}</strong><small data-live-annual>${money(total * 12)} al año · proyección</small></div>
    <section class="section">
      <div class="list">
        ${items.length ? items.map((item) => renderExpenseItem(category, item)).join("") : `<p class="empty">Sin gastos</p>`}
      </div>
    </section>
  `;
}

function renderExpenseItem(category, item) {
  const key = item.key;
  const name = itemName(item);
  const icon = itemIcon(item);
  const amount = itemAmount(item);
  const variable = item.type === "variable";
  const automatic = item.automatic || category.automatic;
  const isDebt = item.type === "debt";
  const canCheck = !variable && !automatic;

  return `
    <div class="expense-item row" data-expense-key="${key}">
      <div class="row-copy">
        <div class="expense-top">
          ${canCheck ? `<label class="check-target"><input class="check" data-check="${key}" type="checkbox" ${state.checked[key] ? "checked" : ""} aria-label="Marcar ${escapeAttr(name)} como pagado"></label>` : ""}
          <input class="emoji-input" data-icon="${key}" value="${escapeAttr(icon)}" aria-label="Emoji">
          <input class="name-input" data-label="${key}" value="${escapeAttr(name)}" aria-label="Nombre del gasto">
          ${(isDebt || item.custom) ? `<button class="delete-button" data-delete="${key}" type="button" aria-label="Eliminar">Eliminar</button>` : ""}
        </div>
        ${variable ? renderSlots(item) : isDebt ? renderDebtFields(item) : `
          <input class="money-input" data-value="${key}" inputmode="numeric" value="${plainNumber(state.values[key] ?? item.value ?? 0)}" aria-label="${escapeAttr(name)}: ${item.note || "valor mensual"} en COP">
        `}
        <div class="item-meta">
          <span data-item-status="${key}">${itemStatus(category, item)}</span>
          <strong data-item-total="${key}">${money(amount)}</strong>
        </div>
      </div>
    </div>
  `;
}

function renderSlots(item) {
  const values = slotValues(item);
  return `<div class="slots">${values.map((value, index) => `
    <input class="slot-input" data-slot-key="${item.key}" data-slot-index="${index}" inputmode="numeric" value="${plainNumber(value)}" placeholder="0" aria-label="${escapeAttr(itemName(item))}: registro ${index + 1} en COP">
  `).join("")}</div>`;
}

function renderDebtFields(item) {
  return `
    <label class="debt-field">Cuota mínima (COP)<input class="money-input" data-value="${item.key}" inputmode="numeric" value="${plainNumber(state.values[item.key] ?? item.minimum ?? 0)}" placeholder="Cuota mínima" aria-label="Cuota mínima"></label>
    <label class="debt-field">Deuda total (COP)<input class="money-input" data-debt="${item.key}" inputmode="numeric" value="${plainNumber(state.values[`${item.key}:debt`] ?? item.debt ?? 0)}" placeholder="Deuda total" aria-label="Deuda total"></label>
  `;
}

function renderHistory() {
  const grouped = Object.values(state.history).sort((a, b) => b.key.localeCompare(a.key)).reduce((years, log) => {
    (years[log.year] ||= []).push(log);
    return years;
  }, {});

  app.innerHTML = `
    <header class="page-header"><div><h1>Historial</h1><p>Guardado en este dispositivo</p></div></header>
    <section class="section">
      ${Object.keys(grouped).length ? Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([year, logs]) => `
        <div class="history-year">
          <h2>${year}</h2>
          <div class="list">${logs.map((log) => `
            <div class="row">
              <span class="row-icon">🗓️</span>
              <span class="row-copy"><strong>${escapeHtml(log.month)}</strong><span>${log.pending} pendientes · ${log.snapshot ? "Detalle conservado" : "Resumen anterior"}</span><span>Actualizado: ${escapeHtml(new Date(log.updatedAt).toLocaleDateString("es-CO"))}</span></span>
              <em class="row-value">${money(log.total)}</em>
            </div>
          `).join("")}</div>
        </div>
      `).join("") : `<div class="list"><p class="empty">Sin historial</p></div>`}
    </section>
  `;
}

function renderAdd() {
  app.innerHTML = `
    <header class="page-header"><div><h1>Agregar gasto</h1><p>Nuevo registro</p></div></header>
    <form class="form" data-add-form>
      <label class="field"><span>Categoría</span><select name="category">${categories.map((category) => `<option value="${category.id}">${category.icon} ${category.name}</option>`).join("")}</select></label>
      <label class="field"><span>Emoji</span><input name="icon" value="💸" maxlength="8"></label>
      <label class="field"><span>Nombre</span><input name="name" maxlength="160" required placeholder="Ej. Seguro"></label>
      <div class="field"><span>Tipo</span><div class="type-control">
        <label><input name="type" value="fixed" type="radio" checked>Fijo</label>
        <label><input name="type" value="variable" type="radio">Variable</label>
      </div></div>
      <label class="field"><span>Valor inicial</span><input name="value" inputmode="numeric" value="0"></label>
      <button class="primary-button" type="submit">Agregar</button>
    </form>
  `;
}

function handleNavigation(event) {
  const button = event.target.closest("[data-view]");
  if (!button) return;
  state.view = button.dataset.view;
  saveState();
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function handleClick(event) {
  const categoryButton = event.target.closest("[data-category]");
  const backButton = event.target.closest("[data-back]");
  const deleteButton = event.target.closest("[data-delete]");

  if (categoryButton || backButton || deleteButton) store.ensureMonth();

  if (categoryButton) {
    state.selectedCategory = categoryButton.dataset.category;
    state.view = "detail";
    saveState();
    render();
  }

  if (backButton) {
    state.view = backButton.dataset.back;
    saveState();
    render();
  }

  if (deleteButton) {
    state.removed[deleteButton.dataset.delete] = true;
    saveState();
    render();
  }
}

function handleChange(event) {
  const check = event.target.closest("[data-check]");
  if (!check) return;
  const checked = check.checked;
  if (store.ensureMonth()) refreshMonthlyInputs();
  state.checked[check.dataset.check] = checked;
  saveState();
  updateLiveDetail();
}

function handleInput(event) {
  if (event.target.matches('[name="name"]')) event.target.setCustomValidity("");
  if (!event.target.matches("[data-value], [data-debt], [data-slot-key], [data-label], [data-icon]")) return;
  if (store.ensureMonth()) refreshMonthlyInputs(event.target);
  const value = event.target.closest("[data-value]");
  const debt = event.target.closest("[data-debt]");
  const slot = event.target.closest("[data-slot-key]");
  const label = event.target.closest("[data-label]");
  const icon = event.target.closest("[data-icon]");

  if (value) state.values[value.dataset.value] = parseMoney(value.value);
  if (debt) state.values[`${debt.dataset.debt}:debt`] = parseMoney(debt.value);
  if (slot) {
    const values = [...(state.slots[slot.dataset.slotKey] || [])];
    values[Number(slot.dataset.slotIndex)] = parseMoney(slot.value);
    state.slots[slot.dataset.slotKey] = values;
  }
  if (label) state.labels[label.dataset.label] = label.value;
  if (icon) state.icons[icon.dataset.icon] = icon.value;

  saveState();
  updateLiveDetail();
}

function handleFocusOut(event) {
  if (!event.target.matches("[data-value], [data-debt], [data-slot-key], [data-label], [data-icon]")) return;
  const key = event.target.dataset.value || event.target.dataset.debt || event.target.dataset.slotKey;
  const item = findItem(key);
  if (item && event.target.matches("[data-value], [data-debt], [data-slot-key]")) {
    event.target.value = plainNumber(event.target.matches("[data-debt]") ? state.values[`${key}:debt`] : event.target.matches("[data-slot-key]") ? slotValues(item)[Number(event.target.dataset.slotIndex)] : state.values[key]);
  }
}

function handleSubmit(event) {
  const form = event.target.closest("[data-add-form]");
  if (!form) return;
  event.preventDefault();
  const data = new FormData(form);
  const categoryId = String(data.get("category"));
  const type = String(data.get("type"));
  if (!String(data.get("name") || "").trim()) { form.elements.name.setCustomValidity("Escribe un nombre."); form.elements.name.reportValidity(); return; }
  store.ensureMonth();
  const key = `custom-${crypto.randomUUID()}`;
  const item = {
    key,
    name: String(data.get("name") || "Nuevo gasto").trim(),
    icon: String(data.get("icon") || "💸").trim() || "💸",
    type,
    value: parseMoney(data.get("value")),
    minimum: parseMoney(data.get("value")),
    debt: 0,
    slots: 5,
    custom: true,
    automatic: false
  };
  (state.custom[categoryId] ||= []).push(item);
  state.values[key] = item.value;
  if (type === "variable") state.slots[key] = [item.value, 0, 0, 0, 0];
  state.selectedCategory = categoryId;
  state.view = "detail";
  saveState();
  render();
  showToast("Gasto agregado");
}

function updateLiveDetail() {
  const category = getCategory(state.selectedCategory);
  if (!category) return;
  const total = activeItems(category).reduce((sum, item) => sum + itemAmount(item), 0);
  const liveTotal = document.querySelector("[data-live-total]");
  if (liveTotal) liveTotal.textContent = money(total);
  const annual = app.querySelector("[data-live-annual]");
  if (annual) annual.textContent = `${money(total * 12)} al año · proyección`;
  activeItems(category).forEach((item) => {
    const itemTotal = document.querySelector(`[data-item-total="${item.key}"]`);
    if (itemTotal) itemTotal.textContent = money(itemAmount(item));
    const status = app.querySelector(`[data-item-status="${item.key}"]`);
    if (status) status.textContent = itemStatus(category, item);
    const check = app.querySelector(`[data-check="${item.key}"]`);
    if (check) check.checked = Boolean(state.checked[item.key]);
  });
}

function currentMonthLabel() {
  const [year, month] = state.activeMonth.split("-");
  return `${monthNames[Number(month) - 1]} ${year}`;
}

function updateNavigation() {
  document.querySelectorAll(".nav-button").forEach((button) => {
    const activeView = state.view === "detail" ? "expenses" : state.view;
    button.classList.toggle("active", button.dataset.view === activeView);
    if (button.dataset.view === activeView) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}

function parseMoney(value) {
  const digits = String(value ?? "").replace(/[^0-9-]/g, "");
  return Math.min(1e12, Math.max(0, Number.parseInt(digits, 10) || 0));
}

function plainNumber(value) { return String(Math.max(0, Number(value || 0))); }

function money(value) {
  return moneyFormatter.format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function escapeAttr(value) { return escapeHtml(value); }

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 1400);
}

function itemStatus(category, item) {
  if (item.type === "variable") return "Variable";
  if (item.automatic || category.automatic) return "Automático";
  const status = itemAmount(item) === 0 ? "Sin valor" : state.checked[item.key] ? "Pagado" : "Pendiente";
  return `${status}${item.note ? ` · ${item.note}` : ""}`;
}

function showStorageStatus() {
  const banner = document.querySelector("#storage-status");
  banner.textContent = store.error || store.notice;
  banner.hidden = !banner.textContent;
}

function checkMonth() {
  if (document.hidden) return;
  if (store.ensureMonth()) {
    saveState();
    refreshMonthlyInputs();
    if (state.view === "detail" && app.contains(document.activeElement)) updateLiveDetail();
    else if (state.view !== "add") render();
    showToast("Nuevo mes: pagos y registros reiniciados");
  }
}
window.addEventListener("focus", checkMonth);
document.addEventListener("visibilitychange", checkMonth);
window.setInterval(checkMonth, 30000);
window.addEventListener("pagehide", () => store.save());
window.addEventListener("storage", (event) => {
  if (event.key === store.key) {
    store.error = "Los datos cambiaron en otra pestaña. Recarga esta página antes de continuar.";
    store.blocked = true;
    showStorageStatus();
  }
});

function refreshMonthlyInputs(except = null) {
  app.querySelectorAll("[data-slot-key]").forEach((input) => {
    if (input !== except) input.value = "0";
  });
  app.querySelectorAll("[data-check]").forEach((input) => { input.checked = false; });
}
