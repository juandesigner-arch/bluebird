import { sections, monthNames, defaultState } from "./data.js?v=v3-app-5";
import { expenseSections, expenseKindTotals, debtStats, pendingPayments, expenseItemLog, sectionItems, monthlyValue, itemLabel, isChecked, debtCurrency, currencyRate } from "./calculations.js?v=v3-app-5";

export const storageKey = "blue-bird-v3-expenses-v1";
const schemaVersion = 4;
const clone = (value) => JSON.parse(JSON.stringify(value));
const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const safeKey = (key) => /^[a-zA-Z0-9_-]+$/.test(key) && !["__proto__", "prototype", "constructor"].includes(key);
const text = (value, fallback = "") => typeof value === "string" ? value : fallback;
const amount = (value) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
const validPeriod = (key) => typeof key === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(key);
export const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
const monthLabel = (key) => monthNames[Number(key.slice(5)) - 1].replace(/^./, (letter) => letter.toUpperCase());

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!record(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
}

function normalizeLog(log, key, now) {
  const rows = (value) => Array.isArray(value) ? value.filter(record).map((item) => ({
    ...item, icon: text(item.icon), label: text(item.label), section: text(item.section), monthly: amount(item.monthly)
  })) : [];
  const debt = record(log.debt) ? log.debt : {};
  const kind = record(log.kindTotals) ? log.kindTotals : {};
  return {
    ...log, key, year: key.slice(0, 4), monthNumber: key.slice(5), month: monthLabel(key),
    savedAt: typeof log.savedAt === "string" && Number.isFinite(Date.parse(log.savedAt)) ? log.savedAt : now.toISOString(),
    monthlyTotal: amount(log.monthlyTotal),
    kindTotals: { fixed: amount(kind.fixed), variable: amount(kind.variable) },
    debt: { total: amount(debt.total), minimums: amount(debt.minimums), remaining: amount(debt.remaining), lifePercent: Math.min(100, amount(debt.lifePercent)) },
    pending: rows(log.pending), items: rows(log.items),
    sections: (Array.isArray(log.sections) ? log.sections : []).filter(record).map((section) => ({
      ...section, label: text(section.label), monthly: amount(section.monthly), annual: amount(section.annual),
      color: /^#[0-9a-f]{3,8}$/i.test(section.color) ? section.color : "#1f4480"
    }))
  };
}

export function normalizeState(raw, now) {
  const source = record(raw) ? raw : {};
  const state = { ...clone(source), ...clone(defaultState), schemaVersion, activeMonth: monthKey(now) };
  if (["home", "explore", "detail", "goals", "monthLog", "profile", "add"].includes(source.view)) state.view = source.view;
  if (sections.some((section) => section.id === source.selectedSectionId)) state.selectedSectionId = source.selectedSectionId;
  state.selectedLogKey = validPeriod(source.selectedLogKey) ? source.selectedLogKey : "";
  for (const field of ["values", "entries", "checked", "removedItems", "itemLabels", "migrations", "currencyRates"]) {
    if (!record(source[field])) continue;
    for (const [key, value] of Object.entries(source[field])) {
      if (!safeKey(key)) continue;
      if (field === "values") state.values[key] = amount(value);
      if (field === "currencyRates") state.currencyRates[key] = amount(value);
      if (field === "entries" && Array.isArray(value)) state.entries[key] = value.map(amount).filter((entry) => entry > 0);
      if (["checked", "removedItems", "migrations"].includes(field)) state[field][key] = value === true;
      if (field === "itemLabels" && typeof value === "string") state.itemLabels[key] = value;
    }
  }
  for (const key of Object.keys(state.entries)) {
    const originalEntries = Array.isArray(source.entries?.[key]) ? source.entries[key] : state.entries[key];
    const names = Array.isArray(source.entryNames?.[key]) ? source.entryNames[key] : [];
    state.entryNames[key] = originalEntries.flatMap((value, index) => amount(value) > 0 ? [text(names[index]).trim().slice(0, 60)] : []);
    state.entries[key] = state.entries[key].filter((entry) => entry > 0);
  }
  const used = new Set(sections.flatMap((section) => section.items.map((item) => item.key)));
  for (const section of sections) {
    const items = source.customItems?.[section.id];
    state.customItems[section.id] = [];
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (!record(item) || typeof item.key !== "string" || !safeKey(item.key) || used.has(item.key)) continue;
      used.add(item.key);
      const cleaned = { ...item, label: text(item.label, "Gasto"), icon: text(item.icon, "✨"), value: amount(item.value), custom: true, type: item.type === "variable" || item.entries ? "variable" : "fixed" };
      if (item.entries || cleaned.type === "variable") {
        cleaned.entries = Math.max(1, Math.min(100, Math.trunc(amount(item.entries)) || 5));
        cleaned.entryMode = item.entryMode === "average" ? "average" : "sum";
        cleaned.noCheck = true;
      }
      if (item.debtTotalKey && !safeKey(item.debtTotalKey)) delete cleaned.debtTotalKey;
      if (item.debt === true && cleaned.debtTotalKey) {
        cleaned.debt = true;
        cleaned.currency = item.currency === "USD" ? "USD" : "COP";
        if (item.exchangeRate != null) cleaned.exchangeRate = amount(item.exchangeRate);
      }
      if (item.group && (typeof item.group !== "string" || ["__proto__", "constructor", "prototype"].includes(item.group))) delete cleaned.group;
      if (item.monthlyFactor != null) cleaned.monthlyFactor = amount(item.monthlyFactor);
      if (item.hint != null) cleaned.hint = text(item.hint);
      state.customItems[section.id].push(cleaned);
      if (!(item.key in state.values)) state.values[item.key] = cleaned.value;
    }
  }
  const addLog = (log, key) => {
    if (!record(log) || !validPeriod(key)) return;
    const year = key.slice(0, 4), month = key.slice(5);
    (state.yearLogs[year] ||= {})[month] = normalizeLog(log, key, now);
  };
  if (record(source.monthLogs)) for (const [key, log] of Object.entries(source.monthLogs)) addLog(log, key);
  if (record(source.yearLogs)) for (const [year, months] of Object.entries(source.yearLogs)) {
    if (!record(months)) continue;
    for (const [month, log] of Object.entries(months)) addLog(log, `${year}-${month.padStart(2, "0")}`);
  }
  const latest = Object.values(state.yearLogs).flatMap((months) => Object.values(months)).map((log) => log.key).sort().at(-1);
  state.activeMonth = validPeriod(source.activeMonth) ? source.activeMonth : latest || monthKey(now);
  return state;
}

export function monthSnapshot(state, key, now) {
  const expenses = expenseSections(state).filter((section) => section.monthly > 0);
  return {
    key, year: key.slice(0, 4), monthNumber: key.slice(5), month: monthLabel(key), savedAt: now.toISOString(),
    monthlyTotal: expenses.reduce((sum, section) => sum + section.monthly, 0),
    kindTotals: expenseKindTotals(state), debt: debtStats(state), pending: pendingPayments(state), items: expenseItemLog(state), sections: expenses,
    // Full independent records coexist with the legacy summary consumed by the UI.
    snapshot: { sections: sections.map((section) => ({ id: section.id, title: section.title, autoSectionChecked: Boolean(section.autoSectionChecked), items: sectionItems(state, section).map((item) => ({
      ...clone(item), label: itemLabel(state, item), value: amount(state.values[item.key]), currency: debtCurrency(item), exchangeRate: currencyRate(state, item),
      ...(item.debtTotalKey ? { debtTotal: amount(state.values[item.debtTotalKey]) } : {}),
      ...(item.entries ? { entryValues: [...(state.entries[item.key] || [])], entryNames: [...(state.entryNames[item.key] || [])] } : {}),
      checked: isChecked(state, item), monthly: monthlyValue(state, item)
    })) })) }
  };
}

export function createStore(storageProvider, clock = () => new Date(), options = {}) {
  const activeStorageKey = options.key || storageKey;
  let storage, lastRaw, parsed;
  const store = { key: activeStorageKey, state: null, error: "", blocked: false, ensureMonth, syncCurrentMonth, save, checkExternalChange };
  try {
    storage = typeof storageProvider === "function" ? storageProvider() : storageProvider;
    lastRaw = storage.getItem(activeStorageKey);
    parsed = lastRaw === null ? null : JSON.parse(lastRaw);
  } catch {
    if (lastRaw === undefined) {
      store.blocked = true;
      store.error = "No se pudo leer el almacenamiento. No se sobrescribirán tus datos. Revisa los permisos y recarga.";
    }
  }
  const seed = lastRaw === null ? globalThis.BlueBirdStock?.original : null;
  store.state = normalizeState(seed ? { ...clone(seed), activeMonth: monthKey(clock()) } : parsed, clock());
  if (parsed?.schemaVersion > schemaVersion) {
    store.blocked = true;
    store.error = "Estos datos pertenecen a una versión más reciente. Actualiza la página antes de guardar.";
  } else if (lastRaw != null && JSON.stringify(canonical(parsed)) !== JSON.stringify(canonical(store.state))) {
    try {
      let backupKey = `${activeStorageKey}-backup-${clock().getTime()}`;
      while (storage.getItem(backupKey) !== null) backupKey += "-copy";
      storage.setItem(backupKey, lastRaw);
    } catch {
      store.blocked = true;
      store.error = "No se pudo crear el respaldo. Tus datos originales se conservarán sin cambios. Libera espacio y recarga.";
    }
  }
  ensureMonth();
  return store;

  function writeSnapshot(key, now) {
    const [year, month] = key.split("-");
    (store.state.yearLogs[year] ||= {})[month] = monthSnapshot(store.state, key, now);
  }
  function ensureMonth() {
    const state = store.state, now = clock(), next = monthKey(now);
    if (next <= state.activeMonth) return false;
    writeSnapshot(state.activeMonth, now);
    state.checked = {};
    state.entryNames = {};
    state.entries = Object.fromEntries(Object.keys(state.entries).map((key) => [key, []]));
    state.activeMonth = next;
    return true;
  }
  function syncCurrentMonth() {
    ensureMonth();
    writeSnapshot(store.state.activeMonth, clock());
    store.state.selectedLogKey ||= store.state.activeMonth;
  }
  function checkExternalChange() {
    if (store.blocked) return false;
    try {
      if (storage.getItem(activeStorageKey) === lastRaw) return true;
      store.blocked = true;
      store.error = "Los datos cambiaron en otra pestaña. Esta pestaña dejó de guardar para no sobrescribirlos. Recarga antes de continuar.";
    } catch {
      store.error = "No se pudo comprobar el almacenamiento. Tus cambios siguen en esta pestaña; no la cierres.";
    }
    return false;
  }
  function save() {
    if (store.blocked || !checkExternalChange()) return false;
    syncCurrentMonth();
    try {
      const encoded = JSON.stringify(store.state);
      storage.setItem(activeStorageKey, encoded);
      lastRaw = encoded;
      store.error = "";
      return true;
    } catch {
      store.error = "No se pudieron guardar los cambios. Siguen en esta pestaña; no la cierres. Revisa el espacio y los permisos del navegador.";
      return false;
    }
  }
}
