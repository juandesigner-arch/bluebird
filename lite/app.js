import { categories, monthNames } from "./data.js?v=lite-5";
import * as calculations from "./calculations.js?v=lite-5";
import { createStore } from "./state.js?v=lite-5";

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

function asset(category, className = "asset-card") {
  return `<span class="${className}" aria-hidden="true">${category.id === "housing" ? '<img src="assets/casita.png" alt="">' : category.icon}</span>`;
}

function progressBar(progress, label, live = false) {
  return `<div class="branch-progress" ${live ? "data-progress-track" : ""} role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress.percent)}"><span ${live ? "data-detail-progress-fill" : ""} style="width:${progress.percent}%"></span></div>`;
}

function renderHome() {
  const total = monthlyTotal();
  const pending = pendingItems();
  const progress = calculations.paymentProgress(state);
  const summaries = categorySummaries();
  app.innerHTML = `
    <header class="page-header home-header"><div><h1>Mini Gastos</h1><p>${currentMonthLabel()}</p></div><span class="month-label">LITE</span></header>
    <section class="nest-home">
      <div class="nest-art"><img class="home-bird" src="assets/birdhome.png" alt="" fetchpriority="high">
        <span class="home-super-check soft-check ${progress.complete ? "checked" : ""}" role="img" aria-label="${progress.complete ? "Pagos del mes completados" : "Pagos por completar"}">✓</span>
      </div>
      <p>Pagos del mes</p><strong>${progress.done} / ${progress.total}</strong>
      ${progressBar(progress, "Pagos del mes")}
      <p class="progress-caption">${progress.complete ? "Todos los pagos marcados" : progress.total ? `${pending.length} pagos pendientes` : "Agrega valores para comenzar"}</p>
      <img class="branch-divider" src="assets/rama.png" alt="">
    </section>
    <section class="total-block"><span>Gasto mensual</span><strong>${money(total)}</strong><small>COP</small></section>
    <section class="section">
      <div class="section-title"><h2>Pendiente por pagar</h2><strong>${money(pending.reduce((sum, item) => sum + item.amount, 0))}</strong></div>
      <div class="list">${pending.length ? pending.map((item) => `
        <button class="row" data-category="${item.categoryId}" type="button"><span class="row-icon">${escapeHtml(item.icon)}</span><span class="row-copy"><strong>${escapeHtml(item.name)}</strong><span>${item.category}</span></span><em class="row-value">${money(item.amount)}</em></button>
      `).join("") : '<p class="empty">Sin pagos pendientes</p>'}</div>
    </section>
    ${renderChart(summaries, total)}
    <section class="section"><div class="section-title"><h2>Categorías</h2><strong>${summaries.length}</strong></div><div class="category-list">${summaries.map(categoryRow).join("")}</div></section>
  `;
}

function renderChart(summaries, total) {
  let cursor = 0;
  const expenses = summaries.filter((category) => category.total > 0);
  const slices = expenses.map((category) => {
    const start = cursor;
    cursor += category.total / total * 100;
    return `${category.color} ${start}% ${cursor}%`;
  });
  const fixed = categories.flatMap(activeItems).filter((item) => item.type !== "variable").reduce((sum, item) => sum + itemAmount(item), 0);
  return `<section class="section"><div class="section-title"><h2>Distribución del mes</h2></div>
    <div class="donut-section"><div class="donut-chart" style="background:conic-gradient(${slices.length ? slices.join(",") : "#d9e5f2 0% 100%"})" role="img" aria-label="Distribución del gasto mensual: ${money(total)} COP"><div><span>Mes</span><strong>${total >= 1000000 ? `${(total / 1000000).toFixed(1)} M` : money(total)}</strong><small>COP</small></div></div>
    <div class="chart-legend">${expenses.length ? expenses.map((category) => `<button class="chart-row" data-category="${category.id}" type="button"><span class="chart-dot" style="background:${category.color}"></span><span>${category.name}</span><strong>${Math.round(category.total / total * 100)}%</strong></button>`).join("") : '<p class="empty">Los gastos aparecerán aquí al agregar valores.</p>'}</div></div>
    <div class="kind-summary"><div><span>Fijos y cuotas</span><strong>${money(fixed)}</strong></div><div><span>Variables</span><strong>${money(total - fixed)}</strong></div></div>
  </section>`;
}

function renderExpenses() {
  app.innerHTML = `<header class="page-header centered"><div><h1>Mis gastos</h1><p>${currentMonthLabel()}</p></div></header><section class="section"><div class="category-list">${categorySummaries().map(categoryRow).join("")}</div></section>`;
}

function categoryRow(category) {
  const progress = calculations.categoryProgress(state, category);
  return `<button class="category-row" data-category="${category.id}" type="button">
    ${asset(category)}
    <span class="category-copy"><strong>${category.name}</strong><small>${money(category.total)}</small><span>${progress.complete ? (category.automatic ? "Automático" : "Completado") : progress.total ? `${progress.done} / ${progress.total} · pagos y registros` : "Sin valores"}</span></span>
    <span class="soft-check ${progress.complete ? "checked" : ""}" aria-hidden="true">✓</span>
  </button>`;
}

function renderDetail() {
  const category = getCategory(state.selectedCategory);
  if (!category) { state.view = "expenses"; render(); return; }
  const items = activeItems(category);
  const total = items.reduce((sum, item) => sum + itemAmount(item), 0);
  const progress = calculations.categoryProgress(state, category);
  app.innerHTML = `<header class="page-header detail-header"><button class="back-button" data-back="expenses" type="button" aria-label="Volver">‹</button><h1>${category.name}</h1><button class="back-button" data-add-category="${category.id}" type="button" aria-label="Agregar gasto en ${category.name}">＋</button></header>
    <section class="detail-overview">
      <div class="detail-hero">${asset(category, "detail-asset")}<span class="detail-super-check ${progress.complete ? "checked" : ""}" data-detail-super-check role="img" aria-label="${progress.complete ? "Categoría completada" : "Categoría por completar"}">✓</span></div>
      <h2>${category.name}</h2><p class="detail-subtitle">${category.automatic ? "Cobros automáticos" : "Pagos y registros del mes"}</p>
      <strong class="detail-progress-label" data-detail-progress>${progress.done} / ${progress.total}</strong>
      ${progressBar(progress, "Avance de la categoría", true)}
      <p class="category-complete" data-detail-complete role="status">${progressText(category, progress)}</p>
    </section>
    <div class="detail-total"><span>Total mensual · COP</span><strong data-live-total>${money(total)}</strong><small data-live-annual>${money(total * 12)} al año · proyección</small></div>
    ${category.id === "debt" ? renderDebtSummary() : ""}
    <section class="section"><div class="section-title"><h2>Gastos</h2><strong>${items.length}</strong></div><div class="list">${items.length ? items.map((item) => renderExpenseItem(category, item)).join("") : '<p class="empty">Sin gastos</p>'}</div><button class="cozy-button" data-add-category="${category.id}" type="button">＋ Agregar gasto</button></section>`;
}

function progressText(category, progress) {
  if (category.automatic) return progress.total ? "Automático · no requiere checks" : "Agrega el valor de tus suscripciones";
  if (progress.complete) return "✓ Categoría completada";
  if (!progress.total) return "Agrega un valor para iniciar";
  return activeItems(category).some((item) => item.type === "variable") ? "Cada registro con valor suma al avance" : "Marca cada pago al realizarlo";
}

function renderDebtSummary() {
  const debt = calculations.debtSummary(state);
  return `<section class="debt-life"><div class="debt-life-head"><span>Deuda total</span><strong data-debt-total>${money(debt.total)}</strong></div><p data-debt-caption>Cuotas pagadas: ${money(debt.paid)} de ${money(debt.minimums)}</p><div class="branch-progress" data-debt-track role="progressbar" aria-label="Cuotas del mes pagadas" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(debt.percent)}"><span data-debt-fill style="width:${debt.percent}%"></span></div><small>Marcar una cuota no modifica la deuda total.</small></section>`;
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
    <div class="expense-item row ${state.checked[key] && canCheck ? "is-paid" : ""}" data-expense-key="${key}">
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
          <span class="kind-chip ${variable ? "variable" : "fixed"}" data-item-status="${key}">${itemStatus(category, item)}</span>
          <strong data-item-total="${key}">${money(amount)}</strong>
        </div>
      </div>
    </div>
  `;
}

function renderSlots(item) {
  const values = slotValues(item);
  return `<div class="slots">${values.map((value, index) => `
    <label class="slot-field ${value > 0 ? "is-filled" : ""}"><span>Registro ${index + 1}<b aria-hidden="true">✓</b></span><input class="slot-input" data-slot-key="${item.key}" data-slot-index="${index}" inputmode="numeric" value="${plainNumber(value)}" placeholder="0" aria-label="${escapeAttr(itemName(item))}: registro ${index + 1} en COP"></label>
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
            <details class="month-record"><summary class="row">
              <span class="row-icon">🗓️</span>
              <span class="row-copy"><strong>${escapeHtml(log.month)}</strong><span>${log.pending} pendientes · ${log.snapshot ? "Detalle conservado" : "Resumen anterior"}</span><span>Actualizado: ${escapeHtml(new Date(log.updatedAt).toLocaleDateString("es-CO"))}</span></span>
              <em class="row-value">${money(log.total)} <span aria-hidden="true">⌄</span></em>
            </summary>${renderMonthDetails(log)}</details>
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
      <label class="field"><span>Categoría</span><select name="category">${categories.map((category) => `<option value="${category.id}" ${state.selectedCategory === category.id ? "selected" : ""}>${category.icon} ${category.name}</option>`).join("")}</select></label>
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
  const addButton = event.target.closest("[data-add-category]");
  if (addButton) {
    state.selectedCategory = addButton.dataset.addCategory;
    state.view = "add";
    saveState(); render(); window.scrollTo({ top: 0 }); return;
  }
  const categoryButton = event.target.closest("[data-category]");
  const backButton = event.target.closest("[data-back]");
  const deleteButton = event.target.closest("[data-delete]");

  if (categoryButton || backButton || deleteButton) store.ensureMonth();

  if (categoryButton) {
    state.selectedCategory = categoryButton.dataset.category;
    state.view = "detail";
    saveState();
    render();
    window.scrollTo({ top: 0 });
  }

  if (backButton) {
    state.view = backButton.dataset.back;
    saveState();
    render();
    window.scrollTo({ top: 0 });
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
    slot.closest(".slot-field").classList.toggle("is-filled", parseMoney(slot.value) > 0);
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
  const progress = calculations.categoryProgress(state, category);
  const progressLabel = app.querySelector("[data-detail-progress]");
  if (progressLabel) progressLabel.textContent = `${progress.done} / ${progress.total}`;
  const fill = app.querySelector("[data-detail-progress-fill]");
  if (fill) fill.style.width = `${progress.percent}%`;
  app.querySelector("[data-progress-track]")?.setAttribute("aria-valuenow", Math.round(progress.percent));
  const complete = app.querySelector("[data-detail-complete]");
  if (complete) complete.textContent = progressText(category, progress);
  const superCheck = app.querySelector("[data-detail-super-check]");
  if (superCheck) {
    superCheck.classList.toggle("checked", progress.complete);
    superCheck.setAttribute("aria-label", progress.complete ? "Categoría completada" : "Categoría por completar");
  }
  if (category.id === "debt") {
    const debt = calculations.debtSummary(state);
    app.querySelector("[data-debt-total]").textContent = money(debt.total);
    app.querySelector("[data-debt-caption]").textContent = `Cuotas pagadas: ${money(debt.paid)} de ${money(debt.minimums)}`;
    app.querySelector("[data-debt-fill]").style.width = `${debt.percent}%`;
    app.querySelector("[data-debt-track]").setAttribute("aria-valuenow", Math.round(debt.percent));
  }
  const annual = app.querySelector("[data-live-annual]");
  if (annual) annual.textContent = `${money(total * 12)} al año · proyección`;
  activeItems(category).forEach((item) => {
    const itemTotal = document.querySelector(`[data-item-total="${item.key}"]`);
    if (itemTotal) itemTotal.textContent = money(itemAmount(item));
    const status = app.querySelector(`[data-item-status="${item.key}"]`);
    if (status) status.textContent = itemStatus(category, item);
    const check = app.querySelector(`[data-check="${item.key}"]`);
    if (check) {
      check.checked = Boolean(state.checked[item.key]);
      check.closest(".expense-item").classList.toggle("is-paid", check.checked);
    }
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
    input.closest(".slot-field")?.classList.toggle("is-filled", parseMoney(input.value) > 0);
  });
  app.querySelectorAll("[data-check]").forEach((input) => { input.checked = false; });
}

function renderMonthDetails(log) {
  if (!Array.isArray(log.snapshot?.categories)) return '<p class="empty">Este mes conserva únicamente el resumen.</p>';
  return `<div class="month-details">${log.snapshot.categories.map((category) => {
    const items = Array.isArray(category.items) ? category.items : [];
    return `<h3>${escapeHtml(category.name)}</h3>${items.map((item) => `<div class="history-expense"><span>${escapeHtml(item.icon || "")} ${escapeHtml(item.name || "Gasto")}<small>${item.type === "variable" ? "Variable" : item.automatic ? "Automático" : item.checked ? "Pagado" : Number(item.monthlyAmount) > 0 ? "Pendiente" : "Sin valor"}</small></span><strong>${money(Number(item.monthlyAmount) || 0)}</strong></div>`).join("")}`;
  }).join("")}</div>`;
}
