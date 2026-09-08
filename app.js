const storageKey = "blue-bird-expenses-v1";

const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre"
];

const sections = [
  {
    id: "housing",
    title: "Vivienda",
    subtitle: "Arriendo",
    asset: { src: "assets/icons/casita.png", alt: "Vivienda" },
    color: "#0057d9",
    metaphor: "casita de pájaros",
    completeCopy: "El refugio quedo tranquilo.",
    items: [
      { key: "rent", label: "Arriendo", icon: "🏡", value: 1093000 }
    ]
  },
  {
    id: "services",
    title: "Servicios",
    subtitle: "Servicios y hogar",
    asset: "🪹",
    color: "#00a6ff",
    metaphor: "ramitas",
    completeCopy: "Las ramitas ya sostienen el mes.",
    items: [
      { key: "water", label: "Agua", icon: "💧", value: 190000, monthlyFactor: 0.5, hint: "Bimestral se suma 50%" },
      { key: "power", label: "Luz", icon: "⚡", value: 96000 },
      { key: "gas", label: "Gas", icon: "🔥", value: 48000 },
      { key: "internet", label: "Internet", icon: "🌐", value: 112000 },
      { key: "phone", label: "Celular", icon: "📱", value: 60000 }
    ]
  },
  {
    id: "transport",
    title: "Transporte",
    subtitle: "Movilidad",
    asset: "🪶",
    color: "#ff8a00",
    metaphor: "plumas",
    completeCopy: "Las plumas estan listas para moverse.",
    items: [
      { key: "parking", label: "Parqueadero", icon: "🅿️", value: 193000 },
      { key: "soat", label: "SOAT", icon: "🛡️", value: 800000, annual: true, paidMonth: 3, autoChecked: true, hint: "Pagado en abril" },
      { key: "techInspection", label: "Tecnomecánica", icon: "📄", value: 250000, annual: true, paidMonth: 3, autoChecked: true, hint: "Pagado en abril" },
      { key: "gasoline", label: "Gasolina", icon: "⛽", value: 0, entries: 5, entryMode: "sum", noCheck: true, hint: "5 registros" },
      { key: "maintenance", label: "Mantenimiento", icon: "🔧", value: 0, entries: 2, entryMode: "sum", noCheck: true, hint: "2 slots · puede ser cero" }
    ]
  },
  {
    id: "homeLife",
    title: "Alimentación",
    subtitle: "Mercado",
    asset: "🐛",
    color: "#ff3b30",
    metaphor: "gusanos",
    autoSectionChecked: true,
    completeCopy: "Los gusanos del mes estan en su lugar.",
    items: [
      { key: "goingOut", label: "Bares, restaurantes y salidas", icon: "🍽️", value: 0, entries: 5, entryMode: "sum", noCheck: true, hint: "5 registros" },
      { key: "marketHome", label: "Mercado, aseo y hogar", icon: "🛒", value: 0, entries: 5, entryMode: "sum", noCheck: true, hint: "5 registros" },
      { key: "pet", label: "Mascota", icon: "🐱", value: 0, entries: 3, entryMode: "sum", noCheck: true, hint: "3 registros" }
    ]
  },
  {
    id: "health",
    title: "Salud",
    subtitle: "Bienestar",
    asset: "🍃",
    color: "#34c759",
    metaphor: "hojas",
    completeCopy: "Las hojas ya respiran suave.",
    items: [
      { key: "gym", label: "Gym", icon: "💪", value: 130000 },
      { key: "medicine", label: "Medicinas / suplementos", icon: "💊", value: 0, entries: 3, entryMode: "sum", noCheck: true, hint: "3 registros variables" },
      { key: "wellbeing", label: "Bienestar", icon: "🧠", value: 0, entries: 3, entryMode: "sum", noCheck: true, hint: "3 registros variables" }
    ]
  },
  {
    id: "subscriptions",
    title: "Ocio",
    subtitle: "Tiempo para ti",
    asset: "🌰",
    color: "#af52de",
    metaphor: "bellotas",
    autoSectionChecked: true,
    completeCopy: "Cobros automaticos, sin ruido.",
    items: [
      { key: "spotify", label: "Spotify", icon: "🎵", value: 16000, noCheck: true, hint: "Cobro automático" },
      { key: "icloud", label: "iCloud", icon: "☁️", value: 15000, noCheck: true, hint: "Cobro automático" },
      { key: "chatgpt", label: "ChatGPT", icon: "🤖", value: 100000, noCheck: true, hint: "Cobro automático" },
      { key: "adobe", label: "Adobe", icon: "🎨", value: 40000, noCheck: true, hint: "Cobro automático" }
    ]
  },
  {
    id: "entrepreneurship",
    title: "Negocio",
    subtitle: "Mi emprendimiento",
    asset: "🚀",
    color: "#ffcc00",
    metaphor: "libro pequeño",
    completeCopy: "El taller sigue caminando.",
    items: [
      { key: "officeOne", label: "Oficina 1", icon: "🏢", value: 300000 },
      { key: "officeTwo", label: "Oficina 2", icon: "🏢", value: 160000 }
    ]
  },
  {
    id: "debt",
    title: "Deudas",
    subtitle: "Nubes por despejar",
    asset: "☁️",
    color: "#0a2540",
    metaphor: "nubes",
    completeCopy: "Las nubes estan bajo vigilancia.",
    items: [
      { key: "mastercardBancolombiaMin", debtTotalKey: "mastercardBancolombiaDebt", label: "MasterCard Bancolombia", icon: "💳", value: 0, debtTotal: 0, group: "Tarjetas", debt: true },
      { key: "visaDaviviendaMin", debtTotalKey: "visaDaviviendaDebt", label: "Visa Davivienda", icon: "💳", value: 0, debtTotal: 0, group: "Tarjetas", debt: true },
      { key: "visaRappiMin", debtTotalKey: "visaRappiDebt", label: "Visa Rappi", icon: "💳", value: 0, debtTotal: 0, group: "Tarjetas", debt: true },
      { key: "freeInvestmentMin", debtTotalKey: "freeInvestmentDebt", label: "Libre inversión", icon: "🏦", value: 0, debtTotal: 17000000, group: "Créditos", debt: true },
      { key: "crediagilMin", debtTotalKey: "crediagilDebt", label: "Crediágil", icon: "🏦", value: 0, debtTotal: 3000000, group: "Créditos", debt: true }
    ]
  }
];

const allItems = sections.flatMap((section) => section.items);
const defaultValues = Object.fromEntries(
  allItems.flatMap((item) => [
    [item.key, item.value],
    ...(item.debtTotalKey ? [[item.debtTotalKey, item.debtTotal || 0]] : [])
  ])
);
const defaultEntries = Object.fromEntries(
  allItems
    .filter((item) => item.entries)
    .map((item) => [item.key, Array.from({ length: item.entries }, () => 0)])
);
const defaultState = {
  view: "home",
  selectedSectionId: "homeLife",
  selectedLogKey: "",
  values: defaultValues,
  entries: defaultEntries,
  customItems: {},
  itemLabels: {},
  removedItems: { crediagilMin: true },
  yearLogs: {},
  checked: {},
  migrations: {}
};

const debtDefaultMigration = "debt-defaults-2026-07-02";
const debtRemovalMigration = "debt-remove-crediagil-2026-09-02";
const debtDefaultValues = {
  freeInvestmentDebt: 17000000,
  crediagilDebt: 3000000
};

let state = loadState();

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
  state.checked[checkbox.dataset.check] = checkbox.checked;
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
            <span>${item.icon}</span>
            <div>
              <strong>${escapeHtml(item.label)}</strong>
              <small>${item.section}</small>
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
              <span>${section.label}</span>
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
          ${group !== "default" ? `<p class="subhead">${group}</p>` : ""}
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
        <span>${item.icon}</span>
        <input class="title-input" data-label-key="${item.key}" aria-label="Nombre de ${label}" type="text" value="${escapeHtml(label)}">
        <em class="kind-chip ${kind}">${kind === "variable" ? "Variable" : "Fijo"}</em>
        ${item.debt ? `<button class="remove-debt-button" data-remove-debt="${item.key}" type="button" aria-label="Eliminar ${label}">Eliminar</button>` : ""}
      </div>
      ${item.entries ? renderEntryInputs(item) : renderMoneyInputs(item)}
      <small data-summary="${item.key}"></small>
      ${item.annual ? `<small>Anual / 12${item.paidMonth !== undefined ? ` · chuleado hasta ${monthNames[item.paidMonth]}` : ""}</small>` : ""}
      ${item.hint ? `<small>${item.hint}</small>` : ""}
    </article>
  `;
}

function renderProfile() {
  elements.appRoot.innerHTML = `
    <section class="profile-screen">
      <header class="screen-header centered profile-header">
        <span class="profile-avatar">👤</span>
        <h1>JUAN DAVID JIEMENEZ</h1>
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
              <span>${section.label}</span>
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
            <span>${item.icon}</span>
            <div>
              <strong>${escapeHtml(item.label)}</strong>
              <small>${item.section}</small>
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
                  <span>${log.month}</span>
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
        <h1>${log.month}</h1>
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
                <span>${section.label}</span>
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
              <span>${item.icon}</span>
              <div>
                <strong>${escapeHtml(item.label)}</strong>
                <small>${item.section}</small>
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
              <span>${item.icon}</span>
              <div>
                <strong>${escapeHtml(item.label)}</strong>
                <small>${item.section}</small>
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

function pendingPayments() {
  return sections
    .filter((section) => !section.autoSectionChecked)
    .flatMap((section) => sectionItems(section).map((item) => ({ ...item, section: section.title, sectionId: section.id })))
    .filter((item) => !item.noCheck && !item.autoChecked && !isChecked(item))
    .map((item) => ({
      icon: item.icon,
      label: itemLabel(item),
      section: item.section,
      sectionId: item.sectionId,
      monthly: monthlyValue(item)
    }));
}

function expenseKindTotals() {
  return allCurrentItems().reduce((totals, item) => {
    const kind = expenseKind(item);
    totals[kind] += monthlyValue(item);
    return totals;
  }, { fixed: 0, variable: 0 });
}

function expenseKind(item) {
  if (item.type === "variable") return "variable";
  if (item.entries || item.debt || item.noCheck) return "variable";
  return "fixed";
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

function expenseSections() {
  return sections.map((section) => {
    const monthly = sectionItems(section).reduce((sum, item) => sum + monthlyValue(item), 0);
    return {
      id: section.id,
      label: section.title,
      color: section.color,
      monthly,
      annual: monthly * 12
    };
  });
}

function annualSectionCopy(section) {
  const annual = sectionItems(section).reduce((sum, item) => sum + monthlyValue(item), 0) * 12;
  return `Conciencia anual:<br>esto son ${money(annual)} al año`;
}

function monthlyValue(item) {
  if (item.entries) return entriesMonthlyValue(item);
  const value = state.values[item.key] || 0;
  if (item.annual) return value / 12;
  return value * (item.monthlyFactor || 1);
}

function entriesMonthlyValue(item) {
  const entries = state.entries[item.key] || [];
  if (item.entryMode === "average") {
    const filled = entries.filter((value) => value > 0);
    if (!filled.length) return 0;
    return filled.reduce((sum, value) => sum + value, 0) / filled.length;
  }
  return entries.reduce((sum, value) => sum + value, 0);
}

function saveAndRender(options = { updateInputs: true }) {
  saveState();
  render(options);
}

function saveState() {
  syncCurrentMonthLog();
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function createCustomExpense(form) {
  const data = new FormData(form);
  const sectionId = data.get("sectionId") || state.selectedSectionId || "homeLife";
  const type = data.get("expenseType") || "fixed";
  const key = `custom_${Date.now()}`;
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

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return structuredClone(defaultState);

  try {
    const parsed = JSON.parse(saved);
    const migrations = { ...defaultState.migrations, ...parsed.migrations };
    const values = { ...defaultState.values, ...parsed.values };
    const removedItems = { ...defaultState.removedItems, ...parsed.removedItems };

    if (!migrations[debtDefaultMigration]) {
      Object.assign(values, debtDefaultValues);
      migrations[debtDefaultMigration] = true;
    }

    if (!migrations[debtRemovalMigration]) {
      removedItems.crediagilMin = true;
      values.crediagilMin = 0;
      values.crediagilDebt = 0;
      migrations[debtRemovalMigration] = true;
    }

    return {
      view: parsed.view || defaultState.view,
      selectedSectionId: parsed.selectedSectionId || defaultState.selectedSectionId,
      selectedLogKey: parsed.selectedLogKey || defaultState.selectedLogKey,
      values,
      entries: mergeEntries(parsed.entries),
      customItems: mergeCustomItems(parsed.customItems),
      itemLabels: { ...defaultState.itemLabels, ...parsed.itemLabels },
      removedItems,
      yearLogs: mergeYearLogs(parsed.yearLogs, parsed.monthLogs),
      checked: { ...defaultState.checked, ...parsed.checked },
      migrations
    };
  } catch {
    localStorage.removeItem(storageKey);
    return structuredClone(defaultState);
  }
}

function mergeCustomItems(savedCustomItems = {}) {
  return Object.fromEntries(
    sections.map((section) => {
      const saved = Array.isArray(savedCustomItems[section.id]) ? savedCustomItems[section.id] : [];
      return [section.id, saved];
    })
  );
}

function renderEntryInputs(item) {
  const label = itemLabel(item);
  return `
    <div class="entry-grid">
      ${Array.from({ length: item.entries }, (_, index) => `
        <input data-entry-key="${item.key}" data-entry-index="${index}" aria-label="${label} registro ${index + 1}" type="text" inputmode="numeric" placeholder="${index + 1}">
      `).join("")}
    </div>
  `;
}

function renderMoneyInputs(item) {
  const label = itemLabel(item);
  if (!item.debt) {
    return `<input data-field="${item.key}" aria-label="${label}" type="text" inputmode="numeric">`;
  }

  return `
    <div class="debt-fields">
      <label>
        <small>Cuota mínima</small>
        <input data-field="${item.key}" aria-label="${label} cuota mínima" type="text" inputmode="numeric">
      </label>
      <label>
        <small>Deuda total</small>
        <input data-field="${item.debtTotalKey}" aria-label="${label} deuda total" type="text" inputmode="numeric">
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
    return `${label}: ${money(monthlyValue(item))}`;
  }
  if (item.annual) return `Mensual: ${money(monthlyValue(item))}`;
  if (item.debt) return "Solo cuota mínima entra al nido";
  return money(monthlyValue(item));
}

function debtStats() {
  const debtSection = sections.find((section) => section.id === "debt");
  const debts = sectionItems(debtSection).filter((item) => item.debt);
  const total = debts.reduce((sum, item) => sum + (state.values[item.debtTotalKey] || 0), 0);
  const minimums = debts.reduce((sum, item) => sum + (state.values[item.key] || 0), 0);
  const remaining = Math.max(total - minimums, 0);
  const lifePercent = total ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0;
  return { total, minimums, remaining, lifePercent };
}

function syncCurrentMonthLog() {
  state.yearLogs ||= {};
  const { key, year, month } = currentMonthMeta();
  state.yearLogs[year] ||= {};
  state.yearLogs[year][month] = monthSnapshot(key);
  state.selectedLogKey ||= key;
}

function monthSnapshot(key) {
  const { year, month } = splitMonthKey(key);
  const expenses = expenseSections().filter((section) => section.monthly > 0);
  const monthlyTotal = expenses.reduce((sum, section) => sum + section.monthly, 0);
  return {
    key,
    year,
    monthNumber: month,
    month: currentMonth(),
    savedAt: new Date().toISOString(),
    monthlyTotal,
    kindTotals: expenseKindTotals(),
    debt: debtStats(),
    pending: pendingPayments(),
    items: expenseItemLog(),
    sections: expenses.map((section) => ({
      id: section.id,
      label: section.label,
      color: section.color,
      monthly: section.monthly,
      annual: section.annual
    }))
  };
}

function expenseItemLog() {
  return sections.flatMap((section) => sectionItems(section)
    .map((item) => ({
      icon: item.icon,
      label: itemLabel(item),
      section: section.title,
      monthly: monthlyValue(item)
    }))
    .filter((item) => item.monthly > 0)
  );
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

function itemLabel(item) {
  return String(state.itemLabels?.[item.key] || item.label || "").trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function mergeYearLogs(savedYearLogs = {}, legacyMonthLogs = {}) {
  const merged = { ...defaultState.yearLogs };

  Object.entries(savedYearLogs || {}).forEach(([year, months]) => {
    if (!months || typeof months !== "object") return;
    merged[year] ||= {};
    Object.entries(months).forEach(([month, log]) => {
      if (!log || typeof log !== "object") return;
      const key = log.key || `${year}-${month}`;
      merged[year][month] = normalizeMonthLog(log, key);
    });
  });

  Object.entries(legacyMonthLogs || {}).forEach(([key, log]) => {
    if (!log || typeof log !== "object") return;
    const { year, month } = splitMonthKey(key);
    merged[year] ||= {};
    merged[year][month] ||= normalizeMonthLog(log, key);
  });

  return merged;
}

function normalizeMonthLog(log, key) {
  const { year, month } = splitMonthKey(key);
  return {
    ...log,
    key,
    year,
    monthNumber: month,
    kindTotals: log.kindTotals || { fixed: 0, variable: 0 },
    debt: log.debt || { total: 0, minimums: 0, remaining: 0, lifePercent: 0 },
    pending: Array.isArray(log.pending) ? log.pending : [],
    items: Array.isArray(log.items) ? log.items : [],
    sections: Array.isArray(log.sections) ? log.sections : []
  };
}

function isChecked(item) {
  if (!item) return false;
  if (item.autoChecked) return true;
  return Boolean(state.checked[item.key]);
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

function mergeEntries(savedEntries = {}) {
  const merged = Object.fromEntries(
    Object.entries(defaultEntries).map(([key, defaults]) => {
      const saved = Array.isArray(savedEntries[key]) ? savedEntries[key] : [];
      return [key, defaults.map((value, index) => Number(saved[index] || value || 0))];
    })
  );

  Object.entries(savedEntries || {}).forEach(([key, entries]) => {
    if (!merged[key] && Array.isArray(entries)) {
      merged[key] = entries.map((value) => Number(value || 0));
    }
  });

  return merged;
}

function sectionItems(section) {
  if (!section) return [];
  return [...section.items, ...(state.customItems[section.id] || [])]
    .filter((item) => !state.removedItems?.[item.key]);
}

function allCurrentItems() {
  return sections.flatMap((section) => sectionItems(section));
}

function removeDebtItem(key) {
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
  return monthNames[new Date().getMonth()].replace(/^./, (letter) => letter.toUpperCase());
}

function currentMonthKey() {
  return currentMonthMeta().key;
}

function currentMonthMeta() {
  const date = new Date();
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return { key: `${year}-${month}`, year, month };
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
