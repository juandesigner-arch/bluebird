const storageKey = "mini-gastos-lite-v3";

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const categories = [
  {
    id: "housing", name: "Vivienda", icon: "🏠", color: "#2563eb",
    items: [{ key: "rent", name: "Arriendo", icon: "🏡", type: "fixed", value: 0 }]
  },
  {
    id: "services", name: "Servicios", icon: "💡", color: "#0891b2",
    items: [
      { key: "water", name: "Agua", icon: "💧", type: "fixed", value: 0, factor: 0.5, note: "Se suma 50%" },
      { key: "power", name: "Luz", icon: "⚡", type: "fixed", value: 0 },
      { key: "gas", name: "Gas", icon: "🔥", type: "fixed", value: 0 },
      { key: "internet", name: "Internet", icon: "🌐", type: "fixed", value: 0 },
      { key: "phone", name: "Celular", icon: "📱", type: "fixed", value: 0 }
    ]
  },
  {
    id: "transport", name: "Transporte", icon: "🏍️", color: "#ea580c",
    items: [
      { key: "parking", name: "Parqueadero", icon: "🅿️", type: "fixed", value: 0 },
      { key: "soat", name: "SOAT", icon: "🛡️", type: "fixed", value: 0, factor: 1 / 12, note: "Valor anual / 12" },
      { key: "tech", name: "Tecnomecánica", icon: "📄", type: "fixed", value: 0, factor: 1 / 12, note: "Valor anual / 12" },
      { key: "gasoline", name: "Gasolina", icon: "⛽", type: "variable", slots: 5 },
      { key: "maintenance", name: "Mantenimiento", icon: "🔧", type: "variable", slots: 2 }
    ]
  },
  {
    id: "food", name: "Alimentación", icon: "🛒", color: "#dc2626",
    items: [
      { key: "restaurants", name: "Bares, restaurantes y salidas", icon: "🍽️", type: "variable", slots: 5 },
      { key: "market", name: "Mercado, aseo y hogar", icon: "🛒", type: "variable", slots: 5 },
      { key: "pet", name: "Mascota", icon: "🐱", type: "variable", slots: 3 }
    ]
  },
  {
    id: "health", name: "Salud", icon: "❤️", color: "#16a34a",
    items: [
      { key: "gym", name: "Gym", icon: "💪", type: "fixed", value: 0 },
      { key: "medicine", name: "Medicinas / suplementos", icon: "💊", type: "variable", slots: 3 },
      { key: "wellbeing", name: "Bienestar", icon: "🧠", type: "variable", slots: 3 }
    ]
  },
  {
    id: "subscriptions", name: "Suscripciones", icon: "📦", color: "#7c3aed",
    automatic: true,
    items: [
      { key: "spotify", name: "Spotify", icon: "🎵", type: "fixed", value: 0, automatic: true },
      { key: "icloud", name: "iCloud", icon: "☁️", type: "fixed", value: 0, automatic: true },
      { key: "chatgpt", name: "ChatGPT", icon: "🤖", type: "fixed", value: 0, automatic: true },
      { key: "adobe", name: "Adobe", icon: "🎨", type: "fixed", value: 0, automatic: true }
    ]
  },
  {
    id: "business", name: "Negocio", icon: "🚀", color: "#ca8a04",
    items: [
      { key: "officeOne", name: "Oficina 1", icon: "🏢", type: "fixed", value: 0 },
      { key: "officeTwo", name: "Oficina 2", icon: "🏢", type: "fixed", value: 0 }
    ]
  },
  {
    id: "debt", name: "Deudas", icon: "💳", color: "#334155",
    items: [
      { key: "mastercard", name: "MasterCard", icon: "💳", type: "debt", minimum: 0, debt: 0 },
      { key: "visa", name: "Visa", icon: "💳", type: "debt", minimum: 0, debt: 0 },
      { key: "credit", name: "Crédito", icon: "🏦", type: "debt", minimum: 0, debt: 0 }
    ]
  }
];

const defaultState = {
  view: "home",
  selectedCategory: "food",
  values: {},
  slots: {},
  labels: {},
  icons: {},
  checked: {},
  removed: {},
  custom: {},
  history: {}
};

let state = loadState();
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
            <span class="row-icon">${item.icon}</span>
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
    <div class="detail-total"><span>Total mensual</span><strong data-live-total>${money(total)}</strong><small>${money(total * 12)} al año</small></div>
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
          ${canCheck ? `<input class="check" data-check="${key}" type="checkbox" ${state.checked[key] ? "checked" : ""} aria-label="Marcar pagado">` : ""}
          <input class="emoji-input" data-icon="${key}" value="${escapeAttr(icon)}" aria-label="Emoji">
          <input class="name-input" data-label="${key}" value="${escapeAttr(name)}" aria-label="Nombre del gasto">
          ${(isDebt || item.custom) ? `<button class="delete-button" data-delete="${key}" type="button" aria-label="Eliminar">Eliminar</button>` : ""}
        </div>
        ${variable ? renderSlots(item) : isDebt ? renderDebtFields(item) : `
          <input class="money-input" data-value="${key}" inputmode="numeric" value="${plainNumber(state.values[key] ?? item.value ?? 0)}" aria-label="Valor">
        `}
        <div class="item-meta">
          <span>${variable ? "Variable" : automatic ? "Automático" : isDebt ? "Cuota mínima" : "Fijo"}</span>
          <strong data-item-total="${key}">${money(amount)}</strong>
        </div>
      </div>
    </div>
  `;
}

function renderSlots(item) {
  const values = slotValues(item);
  return `<div class="slots">${values.map((value, index) => `
    <input class="slot-input" data-slot-key="${item.key}" data-slot-index="${index}" inputmode="numeric" value="${plainNumber(value)}" placeholder="0" aria-label="Registro ${index + 1}">
  `).join("")}</div>`;
}

function renderDebtFields(item) {
  return `
    <input class="money-input" data-value="${item.key}" inputmode="numeric" value="${plainNumber(state.values[item.key] ?? item.minimum ?? 0)}" placeholder="Cuota mínima" aria-label="Cuota mínima">
    <input class="money-input" data-debt="${item.key}" inputmode="numeric" value="${plainNumber(state.values[`${item.key}:debt`] ?? item.debt ?? 0)}" placeholder="Deuda total" aria-label="Deuda total">
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
      ${Object.keys(grouped).length ? Object.entries(grouped).map(([year, logs]) => `
        <div class="history-year">
          <h2>${year}</h2>
          <div class="list">${logs.map((log) => `
            <div class="row">
              <span class="row-icon">🗓️</span>
              <span class="row-copy"><strong>${log.month}</strong><span>${log.pending} pendientes</span></span>
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
      <label class="field"><span>Nombre</span><input name="name" required placeholder="Ej. Seguro"></label>
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
  state.checked[check.dataset.check] = check.checked;
  saveState();
  render();
}

function handleInput(event) {
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
  const key = `custom-${Date.now()}`;
  const item = {
    key,
    name: String(data.get("name") || "Nuevo gasto").trim(),
    icon: String(data.get("icon") || "💸").trim() || "💸",
    type,
    value: parseMoney(data.get("value")),
    slots: type === "variable" ? 5 : undefined,
    custom: true
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
  activeItems(category).forEach((item) => {
    const itemTotal = document.querySelector(`[data-item-total="${item.key}"]`);
    if (itemTotal) itemTotal.textContent = money(itemAmount(item));
  });
}

function categorySummaries() {
  return categories.map((category) => {
    const items = activeItems(category);
    return {
      ...category,
      count: items.length,
      total: items.reduce((sum, item) => sum + itemAmount(item), 0),
      pending: items.filter((item) => requiresCheck(category, item) && !state.checked[item.key]).length
    };
  });
}

function pendingItems() {
  return categories.flatMap((category) => activeItems(category)
    .filter((item) => requiresCheck(category, item) && !state.checked[item.key])
    .map((item) => ({
      categoryId: category.id,
      category: category.name,
      name: itemName(item),
      icon: itemIcon(item),
      amount: itemAmount(item)
    })));
}

function requiresCheck(category, item) {
  return item.type !== "variable" && !item.automatic && !category.automatic && itemAmount(item) > 0;
}

function activeItems(category) {
  return [...category.items, ...(state.custom[category.id] || [])].filter((item) => !state.removed[item.key]);
}

function getCategory(id) { return categories.find((category) => category.id === id); }

function findItem(key) {
  for (const category of categories) {
    const item = activeItems(category).find((candidate) => candidate.key === key);
    if (item) return item;
  }
  return null;
}

function itemAmount(item) {
  if (item.type === "variable") return slotValues(item).reduce((sum, value) => sum + Number(value || 0), 0);
  const value = Number(state.values[item.key] ?? item.minimum ?? item.value ?? 0);
  return Math.round(value * (item.factor || 1));
}

function slotValues(item) {
  const count = Number(item.slots || 5);
  const saved = state.slots[item.key] || [];
  return Array.from({ length: count }, (_, index) => Number(saved[index] || 0));
}

function itemName(item) { return state.labels[item.key] ?? item.name; }
function itemIcon(item) { return state.icons[item.key] ?? item.icon; }
function monthlyTotal() {
  return categories
    .flatMap((category) => activeItems(category))
    .reduce((sum, item) => sum + itemAmount(item), 0);
}

function syncCurrentMonth() {
  const now = new Date();
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  state.history[key] = {
    key,
    year: String(now.getFullYear()),
    month: monthNames[now.getMonth()],
    total: monthlyTotal(),
    pending: pendingItems().length,
    updatedAt: now.toISOString()
  };
  saveState();
}

function currentMonthLabel() {
  const now = new Date();
  return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
}

function updateNavigation() {
  document.querySelectorAll(".nav-button").forEach((button) => {
    const activeView = state.view === "detail" ? "expenses" : state.view;
    button.classList.toggle("active", button.dataset.view === activeView);
  });
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey));
    return parsed ? {
      ...structuredClone(defaultState),
      ...parsed,
      values: { ...defaultState.values, ...(parsed.values || {}) },
      slots: { ...defaultState.slots, ...(parsed.slots || {}) },
      labels: { ...defaultState.labels, ...(parsed.labels || {}) },
      icons: { ...defaultState.icons, ...(parsed.icons || {}) },
      checked: { ...defaultState.checked, ...(parsed.checked || {}) },
      removed: { ...defaultState.removed, ...(parsed.removed || {}) },
      custom: { ...defaultState.custom, ...(parsed.custom || {}) },
      history: { ...defaultState.history, ...(parsed.history || {}) }
    } : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() { localStorage.setItem(storageKey, JSON.stringify(state)); }

function parseMoney(value) {
  const digits = String(value ?? "").replace(/[^0-9-]/g, "");
  return Math.max(0, Number.parseInt(digits, 10) || 0);
}

function plainNumber(value) { return String(Math.max(0, Number(value || 0))); }

function money(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(value || 0));
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
