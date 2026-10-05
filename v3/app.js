import { sections, monthNames } from "./data.mjs?v=v3-data-1";
import * as calculations from "./calculations.mjs?v=v3-data-1";
import { createStore } from "./state.mjs?v=v3-data-1";

const store = createStore(() => window.localStorage);
const state = store.state;
let lastStorageError = "";
const expenseKind = calculations.expenseKind;
const pendingPayments = (...args) => calculations.pendingPayments(state, ...args);
const expenseKindTotals = (...args) => calculations.expenseKindTotals(state, ...args);
const expenseSections = (...args) => calculations.expenseSections(state, ...args);
const monthlyValue = (...args) => calculations.monthlyValue(state, ...args);
const entriesMonthlyValue = (...args) => calculations.entriesMonthlyValue(state, ...args);
const debtStats = (...args) => calculations.debtStats(state, ...args);
const expenseItemLog = (...args) => calculations.expenseItemLog(state, ...args);
const itemLabel = (...args) => calculations.itemLabel(state, ...args);
const isChecked = (...args) => calculations.isChecked(state, ...args);
const sectionItems = (...args) => calculations.sectionItems(state, ...args);
const allCurrentItems = (...args) => calculations.allCurrentItems(state, ...args);

const elements = {
  appRoot: document.querySelector("#appRoot"),
  splash: document.querySelector("#splashScreen"),
  manifest: document.querySelector("#manifestOverlay"),
  manifestClose: document.querySelector("#manifestClose"),
  nav: document.querySelector(".bottom-nav")
};

render();
hideSplash();

elements.manifestClose?.addEventListener("click", () => {
  elements.manifest?.classList.remove("is-visible");
});

elements.appRoot.addEventListener("input", (event) => {
  const input = event.target.closest("[data-field]");
  const entryInput = event.target.closest("[data-entry-key]");
  const labelInput = event.target.closest("[data-label-key]");

  if (input || entryInput || labelInput) prepareMonth(event.target);

  if (input) {
    state.values[input.dataset.field] = parseMoney(input.value);
    saveState();
    updateLiveDetail();
  }

  if (entryInput) {
    updateEntryValue(entryInput);
    saveState();
    updateLiveDetail();
  }

  if (labelInput) {
    state.itemLabels[labelInput.dataset.labelKey] = labelInput.value;
    saveState();
    updateLiveDetail();
  }
});

elements.appRoot.addEventListener("blur", (event) => {
  if (event.target.matches("[data-field], [data-entry-key], [data-label-key]")) {
    render({ updateInputs: true });
  }
}, true);

elements.appRoot.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-check]");
  if (!checkbox || checkbox.disabled) return;
  const checked = checkbox.checked;
  prepareMonth(checkbox);
  state.checked[checkbox.dataset.check] = checked;
  saveState();
  updateLiveDetail();
});

elements.appRoot.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-add-form]");
  if (!form) return;

  event.preventDefault();
  createCustomExpense(form);
});

elements.appRoot.addEventListener("click", (event) => {
  const category = event.target.closest("[data-open-section]");
  const back = event.target.closest("[data-back]");
  const add = event.target.closest("[data-add-expense]");
  const removeDebt = event.target.closest("[data-remove-debt]");
  const monthLog = event.target.closest("[data-open-log]");
  const profileView = event.target.closest("[data-profile-view]");

  if (removeDebt) {
    removeDebtItem(removeDebt.dataset.removeDebt);
    return;
  }

  if (monthLog) {
    state.selectedLogKey = monthLog.dataset.openLog;
    state.view = "monthLog";
    saveAndRender();
    scrollToTop();
    return;
  }

  if (profileView) {
    state.view = profileView.dataset.profileView;
    saveAndRender();
    scrollToTop();
    return;
  }

  if (category) {
    state.selectedSectionId = category.dataset.openSection;
    state.view = "detail";
    saveAndRender();
    scrollToTop();
  }

  if (back) {
    state.view = back.dataset.back;
    saveAndRender();
    scrollToTop();
  }

  if (add) {
    state.view = "add";
    saveAndRender();
    scrollToTop();
  }
});

elements.nav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-view]");
  if (!button) return;

  const next = button.dataset.view;
  if (next === "add") {
    state.view = "add";
    state.selectedSectionId ||= "homeLife";
  } else {
    state.view = next;
  }

  saveAndRender();
  scrollToTop();
});

function render(options = { updateInputs: true }) {
  store.ensureMonth();
  const view = state.view || "home";

  if (view === "home") renderHome();
  if (view === "explore") renderExplore();
  if (view === "detail") renderDetail();
  if (view === "add") renderAddExpense();
  if (view === "goals") renderGoals();
  if (view === "monthLog") renderMonthLog();
  if (view === "profile") renderProfile();

  updateNav();
  updateDynamicValues(options);
}

function hideSplash() {
  if (!elements.splash) return;

  window.setTimeout(() => {
    elements.splash.classList.add("is-hidden");
  }, 900);
}

function renderHome() {
  const progress = appProgress();
  const complete = progress.total > 0 && progress.done === progress.total;
  const pending = pendingPayments();

  elements.appRoot.innerHTML = `
    <header class="home-top">
      <span></span>
      <p class="month-pill">${currentMonth().toUpperCase()}</p>
      <span></span>
    </header>

    <section class="home-copy" aria-label="Estado del nido">
      <h1>El nido se esta armando</h1>
      <p>Acomoda lo importante, sin perseguir migajas.</p>
    </section>

    <section class="nest-home">
      <div class="nest-art" aria-hidden="true">
        <img class="home-bird" src="assets/birds/birdhome.png" alt="">
      </div>
      <p>Progreso del mes</p>
      <strong>${progress.done} / ${progress.total}</strong>
      <div class="branch-progress"><span style="width:${progress.percent}%"></span></div>
      ${complete ? `
        <h1>¡Mes completado!</h1>
        <p class="poem">No controlas el viento.<br>Si el rumbo.</p>
        <span class="twig">✅</span>
      ` : `
        <p class="poem">Paso a paso, sin ruido.</p>
        <img class="branch-divider" src="assets/decor/rama.png" alt="">
      `}
    </section>

    ${renderHomePending(pending)}
  `;
}

function renderHomePending(pending) {
  const total = pending.reduce((sum, item) => sum + item.monthly, 0);

  return `
    <section class="home-pending" aria-label="Pendiente por pagar">
      <div class="home-pending-head">
        <div>
          <h2>Pendiente por pagar</h2>
          <p>${pending.length ? `${pending.length} pagos por chulear` : "Todo lo manual esta chuleado"}</p>
        </div>
        <strong>${money(total)}</strong>
      </div>

      <div class="home-pending-list">
        ${pending.length ? pending.slice(0, 5).map((item) => `
          <button class="home-pending-row" data-open-section="${item.sectionId}" type="button">
            <span>${escapeHtml(item.icon)}</span>
            <div>
              <strong>${escapeHtml(item.label)}</strong>
              <small>${escapeHtml(item.section)}</small>
            </div>
            <em>${money(item.monthly)}</em>
          </button>
        `).join("") : `<p class="empty-summary">El nido esta al dia.</p>`}
      </div>
    </section>
  `;
}

function renderNestChart() {
  const expenses = expenseSections().filter((section) => section.monthly > 0);
  const monthlyTotal = expenses.reduce((sum, section) => sum + section.monthly, 0);
  const slices = donutSlices(expenses, monthlyTotal);

  return `
    <section class="donut-section nest-chart" aria-label="Porcentajes de gastos">
      <div class="donut-chart" style="background:${slices}">
        <div>
          <span>Mes</span>
          <strong>${compactCurrency(monthlyTotal)}</strong>
        </div>
      </div>

      <div class="chart-legend">
        ${expenses.map((section) => {
          const percent = monthlyTotal ? Math.round((section.monthly / monthlyTotal) * 100) : 0;
          return `
            <div class="chart-row">
              <span class="chart-dot" style="background:${section.color}"></span>
              <span>${escapeHtml(section.label)}</span>
              <strong>${percent}%</strong>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function donutSlices(expenses, total) {
  if (!total || expenses.length === 0) {
    return "conic-gradient(rgba(111, 127, 79, 0.18) 0 100%)";
  }

  let cursor = 0;
  const slices = expenses.map((section) => {
    const start = cursor;
    const end = cursor + ((section.monthly / total) * 100);
    cursor = end;
    return `${section.color} ${start}% ${end}%`;
  });

  return `conic-gradient(${slices.join(", ")})`;
}

function renderExplore() {
  elements.appRoot.innerHTML = `
    <header class="screen-header centered">
      <h1>Mis gastos</h1>
      <p>Categorías</p>
    </header>
    <section class="category-list">
      ${sections.map((section) => renderCategoryRow(section)).join("")}
    </section>
  `;
}

function renderCategoryRow(section) {
  const complete = sectionIsComplete(section.id);
  return `
    <button class="category-row" data-open-section="${section.id}" type="button">
      ${renderAsset(section, "asset-card")}
      <span class="category-copy">
        <strong>${section.title}</strong>
        <small>${section.subtitle}</small>
      </span>
      <span class="soft-check ${complete ? "checked" : ""}" aria-hidden="true">${complete ? "✓" : ""}</span>
    </button>
  `;
}

function renderAsset(section, className) {
  if (typeof section.asset === "object") {
    return `
      <span class="${className}">
        <img class="asset-image" src="${section.asset.src}" alt="${section.asset.alt}" style="display:block;max-width:74%;max-height:74%;width:auto;height:auto;object-fit:contain;">
      </span>
    `;
  }

  return `<span class="${className}">${section.asset}</span>`;
}

function assetText(section) {
  return typeof section.asset === "object" ? "" : section.asset;
}

function renderDetail() {
  const section = selectedSection();
  const progress = sectionProgress(section);
  const complete = sectionIsComplete(section.id);

  elements.appRoot.innerHTML = `
    <section class="detail-screen">
      <header class="detail-top">
        <button data-back="explore" type="button" aria-label="Volver">‹</button>
        <h1>${section.title}</h1>
        <button type="button" aria-label="Mas">•••</button>
      </header>

      <div class="detail-hero">
        ${renderAsset(section, "detail-asset")}
        <span class="detail-super-check ${complete ? "checked" : ""}" data-detail-super-check aria-hidden="true">${complete ? "✓" : ""}</span>
      </div>

      <h2>${section.subtitle}</h2>
      <p class="detail-subtitle">Tus ${section.metaphor} del mes ${assetText(section)}</p>
      <div class="detail-progress-label" data-detail-progress>${progress.done} / ${progress.total}</div>
      <div class="branch-progress"><span data-detail-progress-fill style="width:${progress.percent}%"></span></div>
      <p class="category-complete" data-detail-complete>${annualSectionCopy(section)}</p>

      ${section.id === "debt" ? renderDebtBar() : ""}

      <div class="detail-list">
        <p class="list-title">Gastos</p>
        ${Object.entries(groupItems(sectionItems(section))).map(([group, items]) => `
          ${group !== "default" ? `<p class="subhead">${escapeHtml(group)}</p>` : ""}
          ${items.map((item) => renderExpenseLine(item)).join("")}
        `).join("")}
      </div>

      <button class="cozy-button" data-add-expense type="button">+ Agregar gasto</button>
    </section>
  `;
}

function renderAddExpense() {
  const selected = selectedSection();

  elements.appRoot.innerHTML = `
    <section class="add-screen">
      <header class="detail-top">
        <button data-back="explore" type="button" aria-label="Volver">‹</button>
        <h1>Nuevo gasto</h1>
        <span></span>
      </header>

      <form class="add-form" data-add-form>
        <label>
          <span>Categoría</span>
          <select name="sectionId">
            ${sections.map((section) => `
              <option value="${section.id}" ${section.id === selected.id ? "selected" : ""}>${section.title}</option>
            `).join("")}
          </select>
        </label>

        <label>
          <span>Emoji</span>
          <input name="icon" type="text" maxlength="4" value="✨" aria-label="Emoji del gasto">
        </label>

        <label>
          <span>Nombre</span>
          <input name="label" type="text" placeholder="Ej: Veterinario, Curso, Repuesto" required>
        </label>

        <fieldset>
          <legend>Tipo de gasto</legend>
          <label class="radio-row">
            <input type="radio" name="expenseType" value="fixed" checked>
            <span>Fijo: valor mensual y chulo de pago</span>
          </label>
          <label class="radio-row">
            <input type="radio" name="expenseType" value="variable">
            <span>Variable: slots para registrar varios valores</span>
          </label>
        </fieldset>

        <label>
          <span>Valor inicial</span>
          <input name="initialValue" type="text" inputmode="numeric" placeholder="0">
        </label>

        <button class="cozy-button" type="submit">Crear gasto</button>
      </form>
    </section>
  `;
}

function renderExpenseLine(item) {
  const kind = expenseKind(item);
  const label = itemLabel(item);

  return `
    <article class="expense-line ${item.entries ? "has-entries" : ""}">
      <div class="expense-title">
        ${item.noCheck ? "" : `<input class="check-input" data-check="${item.key}" type="checkbox" ${item.autoChecked ? "disabled" : ""}>`}
        <span>${escapeHtml(item.icon)}</span>
        <input class="title-input" data-label-key="${item.key}" aria-label="Nombre de ${escapeHtml(label)}" type="text" value="${escapeHtml(label)}">
        <em class="kind-chip ${kind}">${kind === "variable" ? "Variable" : "Fijo"}</em>
        ${item.debt ? `<button class="remove-debt-button" data-remove-debt="${item.key}" type="button" aria-label="Eliminar ${escapeHtml(label)}">Eliminar</button>` : ""}
      </div>
      ${item.entries ? renderEntryInputs(item) : renderMoneyInputs(item)}
      <small data-summary="${item.key}"></small>
      ${item.annual ? `<small>Anual / 12${item.paidMonth !== undefined ? ` · chuleado hasta ${monthNames[item.paidMonth]}` : ""}</small>` : ""}
      ${item.hint ? `<small>${escapeHtml(item.hint)}</small>` : ""}
    </article>
  `;
}

function renderProfile() {
  elements.appRoot.innerHTML = `
    <section class="profile-screen">
      <header class="screen-header centered profile-header">
        <span class="profile-avatar">👤</span>
        <h1>MI PERFIL</h1>
        <p>Cuenta local</p>
      </header>

      <section class="login-card">
        <div>
          <span>Login</span>
          <strong>Inicia sesión para guardar tu nido en todos tus dispositivos.</strong>
        </div>
        <button type="button">Entrar</button>
      </section>

      <section class="profile-menu" aria-label="Opciones de usuario">
        <button class="profile-menu-row" type="button">
          <span>🤝</span>
          <div>
            <strong>Amigos</strong>
            <small>En desarrollo</small>
          </div>
        </button>

        <button class="profile-menu-row" data-profile-view="goals" type="button">
          <span>📊</span>
          <div>
            <strong>Resumen</strong>
            <small>Historial y gasto mensual</small>
          </div>
        </button>

        <button class="profile-menu-row" type="button">
          <span>🏅</span>
          <div>
            <strong>Medallas</strong>
            <small>Logros del mes</small>
          </div>
        </button>
      </section>
    </section>
  `;
}

function renderGoals() {
  syncCurrentMonthLog();
  const expenses = expenseSections().filter((section) => section.monthly > 0);
  const monthlyTotal = expenses.reduce((sum, section) => sum + section.monthly, 0);
  const kindTotals = expenseKindTotals();
  const pending = pendingPayments();
  const yearLogs = sortedYearLogs();

  elements.appRoot.innerHTML = `
    <header class="screen-header centered summary-header">
      <h1>Resumen</h1>
      <p>Datos claros del gasto mensual</p>
    </header>

    <section class="summary-total">
      <span>Gasto mensual</span>
      <strong>${money(monthlyTotal)}</strong>
    </section>

    ${renderNestChart()}

    <section class="kind-summary" aria-label="Gastos fijos y variables">
      <div>
        <span>Fijos</span>
        <strong>${money(kindTotals.fixed)}</strong>
      </div>
      <div>
        <span>Variables</span>
        <strong>${money(kindTotals.variable)}</strong>
      </div>
    </section>

    <section class="summary-block">
      <h2>Por categoría</h2>
      <div class="summary-list">
        ${expenses.map((section) => {
          const percent = monthlyTotal ? Math.round((section.monthly / monthlyTotal) * 100) : 0;
          return `
            <div class="summary-row">
              <span class="chart-dot" style="background:${section.color}"></span>
              <span>${escapeHtml(section.label)}</span>
              <strong>${money(section.monthly)}</strong>
              <small>${percent}%</small>
            </div>
          `;
        }).join("")}
      </div>
    </section>

    <section class="summary-block">
      <h2>Falta por pagar</h2>
      <div class="pending-list">
        ${pending.length ? pending.map((item) => `
          <div class="pending-row">
            <span>${escapeHtml(item.icon)}</span>
            <div>
              <strong>${escapeHtml(item.label)}</strong>
              <small>${escapeHtml(item.section)}</small>
            </div>
            <em>${money(item.monthly)}</em>
          </div>
        `).join("") : `<p class="empty-summary">Todo lo manual esta chuleado.</p>`}
      </div>
    </section>

    <section class="summary-block">
      <h2>Historial mensual</h2>
      <div class="year-log-list">
        ${yearLogs.map((group) => `
          <div class="year-log-group">
            <h3>${group.year}</h3>
            <div class="month-log-list">
              ${group.logs.map((log) => `
                <button class="month-log-row" data-open-log="${log.key}" type="button">
                  <span>${escapeHtml(log.month)}</span>
                  <strong>${money(log.monthlyTotal)}</strong>
                  <small>${log.pending.length ? `${log.pending.length} pendientes` : "Mes al dia"}</small>
                </button>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderMonthLog() {
  syncCurrentMonthLog();
  const log = findMonthLog(state.selectedLogKey) || sortedMonthLogs()[0];

  if (!log) {
    state.view = "goals";
    renderGoals();
    return;
  }

  elements.appRoot.innerHTML = `
    <section class="month-log-screen">
      <header class="detail-top">
        <button data-back="goals" type="button" aria-label="Volver">‹</button>
        <h1>${escapeHtml(log.month)}</h1>
        <span></span>
      </header>

      <section class="summary-total">
        <span>Memoria del gasto</span>
        <strong>${money(log.monthlyTotal)}</strong>
      </section>

      <section class="kind-summary" aria-label="Gastos fijos y variables guardados">
        <div>
          <span>Fijos</span>
          <strong>${money(log.kindTotals.fixed)}</strong>
        </div>
        <div>
          <span>Variables</span>
          <strong>${money(log.kindTotals.variable)}</strong>
        </div>
      </section>

      <section class="summary-block">
        <h2>Lo que se gasto</h2>
        <div class="summary-list">
          ${log.sections.map((section) => {
            const percent = log.monthlyTotal ? Math.round((section.monthly / log.monthlyTotal) * 100) : 0;
            return `
              <div class="summary-row">
                <span class="chart-dot" style="background:${section.color}"></span>
                <span>${escapeHtml(section.label)}</span>
                <strong>${money(section.monthly)}</strong>
                <small>${percent}%</small>
              </div>
            `;
          }).join("")}
        </div>
      </section>

      <section class="summary-block">
        <h2>Log guardado</h2>
        <div class="pending-list">
          ${log.items.length ? log.items.map((item) => `
            <div class="pending-row">
              <span>${escapeHtml(item.icon)}</span>
              <div>
                <strong>${escapeHtml(item.label)}</strong>
                <small>${escapeHtml(item.section)}</small>
              </div>
              <em>${money(item.monthly)}</em>
            </div>
          `).join("") : `<p class="empty-summary">No hay gastos registrados en este corte.</p>`}
        </div>
      </section>

      <section class="summary-block">
        <h2>Pendiente de ese corte</h2>
        <div class="pending-list">
          ${log.pending.length ? log.pending.map((item) => `
            <div class="pending-row">
              <span>${escapeHtml(item.icon)}</span>
              <div>
                <strong>${escapeHtml(item.label)}</strong>
                <small>${escapeHtml(item.section)}</small>
              </div>
              <em>${money(item.monthly)}</em>
            </div>
          `).join("") : `<p class="empty-summary">Ese corte quedo sin pendientes manuales.</p>`}
        </div>
      </section>

      <section class="debt-life log-debt-life">
        <div class="debt-life-head">
          <span>Deuda viva</span>
          <strong>${money(log.debt.remaining)}</strong>
        </div>
        <div class="debt-life-track">
          <span style="width:${log.debt.lifePercent}%"></span>
        </div>
        <p>Total deuda ${money(log.debt.total)} · cuotas mínimas ${money(log.debt.minimums)}</p>
      </section>
    </section>
  `;
}




function updateDynamicValues(options = { updateInputs: true }) {
  const debt = debtStats();

  if (options.updateInputs) {
    document.querySelectorAll("[data-field]").forEach((input) => {
      input.value = plainMoney(state.values[input.dataset.field] || 0);
    });
    document.querySelectorAll("[data-entry-key]").forEach((input) => {
      const entries = state.entries[input.dataset.entryKey] || [];
      input.value = entries[Number(input.dataset.entryIndex)] ? plainMoney(entries[Number(input.dataset.entryIndex)]) : "";
    });
    document.querySelectorAll("[data-check]").forEach((checkbox) => {
      const item = findItem(checkbox.dataset.check);
      checkbox.checked = isChecked(item);
    });
  }

  document.querySelectorAll("[data-summary]").forEach((summary) => {
    const item = findItem(summary.dataset.summary);
    summary.textContent = item ? summaryText(item) : "";
  });

  renderDebtStats(debt);
}

function updateLiveDetail() {
  updateDynamicValues({ updateInputs: false });

  if (state.view !== "detail") return;

  const section = selectedSection();
  const progress = sectionProgress(section);
  const complete = sectionIsComplete(section.id);
  const progressLabel = document.querySelector("[data-detail-progress]");
  const progressFill = document.querySelector("[data-detail-progress-fill]");
  const completeText = document.querySelector("[data-detail-complete]");
  const superCheck = document.querySelector("[data-detail-super-check]");

  if (progressLabel) progressLabel.textContent = `${progress.done} / ${progress.total}`;
  if (progressFill) progressFill.style.width = `${progress.percent}%`;
  if (completeText) completeText.innerHTML = annualSectionCopy(section);
  if (superCheck) {
    superCheck.classList.toggle("checked", complete);
    superCheck.textContent = complete ? "✓" : "";
  }
}

function updateNav() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    const view = button.dataset.view;
    const active =
      (view === "home" && state.view === "home") ||
      (view === "explore" && state.view === "explore") ||
      (view === "goals" && (state.view === "goals" || state.view === "monthLog")) ||
      (view === "profile" && state.view === "profile");
    button.classList.toggle("active", active);
  });
}

function appProgress() {
  const checkable = manualCheckItems();
  const done = checkable.filter((item) => isChecked(item)).length;
  const total = checkable.length;
  return {
    done,
    total,
    percent: total ? Math.round((done / total) * 100) : 0
  };
}

function sectionProgress(section) {
  if (section.autoSectionChecked) return { done: 1, total: 1, percent: 100 };

  const items = sectionItems(section);
  const manualItems = items.filter((item) => !item.noCheck && !item.autoChecked);
  const entryItems = items.filter((item) => item.entries);
  const manualDone = manualItems.filter((item) => isChecked(item)).length;
  const entryTotal = entryItems.reduce((sum, item) => sum + item.entries, 0);
  const entryDone = entryItems.reduce((sum, item) => {
    const entries = state.entries[item.key] || [];
    return sum + entries.filter((value) => value > 0).length;
  }, 0);
  const done = manualDone + entryDone;
  const total = manualItems.length + entryTotal;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return { done, total, percent };
}

function manualCheckItems() {
  return sections
    .filter((section) => !section.autoSectionChecked)
    .flatMap((section) => sectionItems(section))
    .filter((item) => !item.noCheck && !item.autoChecked);
}


function annualSectionCopy(section) {
  const annual = sectionItems(section).reduce((sum, item) => sum + monthlyValue(item), 0) * 12;
  return `Conciencia anual:<br>esto son ${money(annual)} al año`;
}



function saveAndRender(options = { updateInputs: true }) {
  saveState();
  render(options);
}

function saveState() {
  const saved = store.save();
  reportStorageError();
  return saved;
}

function reportStorageError() {
  if (!store.error) { lastStorageError = ""; return; }
  if (lastStorageError === store.error) return;
  lastStorageError = store.error;
  const message = store.error;
  window.setTimeout(() => window.alert(message), 0);
}

function createCustomExpense(form) {
  prepareMonth();
  const data = new FormData(form);
  const sectionId = data.get("sectionId") || state.selectedSectionId || "homeLife";
  const type = data.get("expenseType") || "fixed";
  const key = `custom_${crypto.randomUUID()}`;
  const icon = String(data.get("icon") || "✨").trim() || "✨";
  const label = String(data.get("label") || "").trim();
  const initialValue = parseMoney(data.get("initialValue") || "0");

  if (!label) return;

  const item = {
    key,
    label,
    icon,
    value: type === "fixed" ? initialValue : 0,
    custom: true,
    type
  };

  if (type === "variable") {
    item.entries = 5;
    item.entryMode = "sum";
    item.noCheck = true;
    item.hint = "Variable · 5 registros";
    state.entries[key] = [initialValue, 0, 0, 0, 0];
  } else {
    state.values[key] = initialValue;
    state.checked[key] = false;
  }

  state.customItems[sectionId] ||= [];
  state.customItems[sectionId].push(item);
  state.selectedSectionId = sectionId;
  state.view = "detail";
  saveAndRender();
  scrollToTop();
}



function renderEntryInputs(item) {
  const label = itemLabel(item);
  return `
    <div class="entry-grid">
      ${Array.from({ length: item.entries }, (_, index) => `
        <input data-entry-key="${item.key}" data-entry-index="${index}" aria-label="${escapeHtml(label)} registro ${index + 1}" type="text" inputmode="numeric" placeholder="${index + 1}">
      `).join("")}
    </div>
  `;
}

function renderMoneyInputs(item) {
  const label = itemLabel(item);
  if (!item.debt) {
    return `<input data-field="${item.key}" aria-label="${escapeHtml(label)}" type="text" inputmode="numeric">`;
  }

  return `
    <div class="debt-fields">
      <label>
        <small>Cuota mínima</small>
        <input data-field="${item.key}" aria-label="${escapeHtml(label)} cuota mínima" type="text" inputmode="numeric">
      </label>
      <label>
        <small>Deuda total</small>
        <input data-field="${item.debtTotalKey}" aria-label="${escapeHtml(label)} deuda total" type="text" inputmode="numeric">
      </label>
    </div>
  `;
}

function renderDebtBar() {
  return `
    <div class="debt-life">
      <div class="debt-life-head">
        <span>Vida deuda</span>
        <strong id="debtRemaining">$0 COP</strong>
      </div>
      <div class="debt-life-track">
        <span id="debtLifeFill"></span>
      </div>
      <p id="debtLifeText">Total deuda $0 COP · cuotas $0 COP</p>
    </div>
  `;
}

function renderDebtStats(debt) {
  const remaining = document.querySelector("#debtRemaining");
  const fill = document.querySelector("#debtLifeFill");
  const text = document.querySelector("#debtLifeText");

  if (!remaining || !fill || !text) return;

  remaining.textContent = money(debt.remaining);
  fill.style.width = `${debt.lifePercent}%`;
  text.textContent = `Total deuda ${money(debt.total)} · cuotas mínimas ${money(debt.minimums)}`;
}

function updateEntryValue(input) {
  const key = input.dataset.entryKey;
  const index = Number(input.dataset.entryIndex);
  const current = state.entries[key] || [];
  state.entries[key] = [...current];
  state.entries[key][index] = parseMoney(input.value);
}

function summaryText(item) {
  if (item.entries) {
    const label = item.entryMode === "average" ? "Promedio" : "Total";
    return `${escapeHtml(label)}: ${money(monthlyValue(item))}`;
  }
  if (item.annual) return `Mensual: ${money(monthlyValue(item))}`;
  if (item.debt) return "Solo cuota mínima entra al nido";
  return money(monthlyValue(item));
}


function syncCurrentMonthLog() {
  store.syncCurrentMonth();
}

function sortedMonthLogs() {
  return Object.values(state.yearLogs || {})
    .flatMap((months) => Object.values(months || {}))
    .sort((first, second) => second.key.localeCompare(first.key));
}

function sortedYearLogs() {
  return Object.entries(state.yearLogs || {})
    .sort(([firstYear], [secondYear]) => secondYear.localeCompare(firstYear))
    .map(([year, months]) => ({
      year,
      logs: Object.values(months || {})
        .sort((first, second) => second.key.localeCompare(first.key))
    }))
    .filter((group) => group.logs.length > 0);
}

function findMonthLog(key) {
  const { year, month } = splitMonthKey(key || currentMonthKey());
  return state.yearLogs?.[year]?.[month];
}


function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}



function sectionIsComplete(sectionId) {
  const section = sections.find((item) => item.id === sectionId);
  if (!section) return false;
  if (section.autoSectionChecked) return true;

  const checklist = sectionItems(section).filter((item) => !item.noCheck && !item.autoChecked);
  if (checklist.length > 0) {
    return checklist.every((item) => isChecked(item));
  }

  const progress = sectionProgress(section);
  return progress.total > 0 && progress.done === progress.total;
}

function selectedSection() {
  return sections.find((section) => section.id === state.selectedSectionId) || sections[0];
}

function findItem(key) {
  return allCurrentItems().find((item) => item.key === key);
}


function removeDebtItem(key) {
  prepareMonth();
  const item = allCurrentItems().find((currentItem) => currentItem.key === key);
  if (!item || !item.debt) return;

  state.removedItems ||= {};
  state.removedItems[key] = true;
  state.checked[key] = false;
  state.values[key] = 0;

  if (item.debtTotalKey) {
    state.values[item.debtTotalKey] = 0;
  }

  saveAndRender();
}

function groupItems(items) {
  return items.reduce((groups, item) => {
    const group = item.group || "default";
    groups[group] ||= [];
    groups[group].push(item);
    return groups;
  }, {});
}

function currentMonth() {
  return monthNames[Number(state.activeMonth.slice(5)) - 1].replace(/^./, (letter) => letter.toUpperCase());
}

function currentMonthKey() {
  return currentMonthMeta().key;
}

function currentMonthMeta() {
  const [year, month] = state.activeMonth.split("-");
  return { key: state.activeMonth, year, month };
}

function splitMonthKey(key) {
  const [year = String(new Date().getFullYear()), month = "01"] = String(key).split("-");
  return { year, month: month.padStart(2, "0") };
}

function parseMoney(value) {
  const raw = String(value).trim().toLowerCase().replace(",", ".");
  const compactMatch = raw.match(/(\d+(?:\.\d+)?)\s*m/);
  if (compactMatch) return Math.round(Number(compactMatch[1]) * 1000000);
  return Number(raw.replace(/[^\d]/g, "")) || 0;
}

function plainMoney(value) {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0
  }).format(Math.round(value || 0));
}

function money(value) {
  return `$${plainMoney(value)} COP`;
}

function compactMoney(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)} M`;
  }

  return plainMoney(value);
}

function compactCurrency(value) {
  return value >= 1000000 ? `$${compactMoney(value).replace(" ", "")} COP` : money(value);
}

function scrollToTop() {
  document.querySelector(".phone-shell").scrollIntoView({ block: "start" });
}

// Data synchronization does not replace the active input or change view.
function prepareMonth(except = null) {
  if (!store.ensureMonth()) return false;
  document.querySelectorAll("[data-entry-key]").forEach((input) => {
    if (input !== except) input.value = "";
  });
  document.querySelectorAll("[data-check]").forEach((input) => {
    if (input !== except) input.checked = isChecked(findItem(input.dataset.check));
  });
  return true;
}

function checkMonth() {
  if (document.hidden || !prepareMonth()) return;
  saveState();
  if (state.view === "detail" && elements.appRoot.contains(document.activeElement)) updateLiveDetail();
  else if (state.view !== "add") render();
}

window.addEventListener("focus", checkMonth);
document.addEventListener("visibilitychange", checkMonth);
window.setInterval(checkMonth, 30000);
window.addEventListener("pagehide", () => store.save());
window.addEventListener("storage", (event) => {
  if (event.key === store.key || event.key === null) {
    store.checkExternalChange();
    reportStorageError();
  }
});
saveState();
