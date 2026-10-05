import { categories, monthNames } from "./data.js?v=lite-6";
import { monthlyTotal, pendingItems, activeItems, itemAmount, itemName, itemIcon, slotValues } from "./calculations.js?v=lite-6";

export const storageKey = "mini-gastos-lite-v3";
const schemaVersion = 4;
const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const safeKey = (key) => /^[a-zA-Z0-9_-]+(?::debt)?$/.test(key) && !["__proto__", "constructor", "prototype"].includes(key);
const amount = (value) => Number.isFinite(Number(value)) ? Math.min(1e12, Math.max(0, Number(value))) : 0;
const period = (value) => typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
export const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
const copy = (value) => JSON.parse(JSON.stringify(value));

function normalize(raw, now) {
  const source = record(raw) ? raw : {};
  const state = { schemaVersion, activeMonth: monthKey(now), view: "home", selectedCategory: "food", values: {}, slots: {}, labels: {}, icons: {}, checked: {}, removed: {}, custom: {}, history: {} };
  if (["home", "expenses", "detail", "history", "add"].includes(source.view)) state.view = source.view;
  if (categories.some((c) => c.id === source.selectedCategory)) state.selectedCategory = source.selectedCategory;
  for (const field of ["values", "slots", "labels", "icons", "checked", "removed"]) {
    if (!record(source[field])) continue;
    for (const [key, value] of Object.entries(source[field])) {
      if (!safeKey(key)) continue;
      if (field === "values") state[field][key] = amount(value);
      if (field === "slots" && Array.isArray(value)) state[field][key] = value.map(amount);
      if (["labels", "icons"].includes(field) && typeof value === "string") state[field][key] = value;
      if (["checked", "removed"].includes(field)) state[field][key] = value === true;
    }
  }
  const used = new Set(categories.flatMap((c) => c.items.map((item) => item.key)));
  for (const category of categories) {
    const items = source.custom?.[category.id];
    state.custom[category.id] = [];
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (!record(item) || typeof item.key !== "string" || !safeKey(item.key) || used.has(item.key)) continue;
      used.add(item.key);
      state.custom[category.id].push({ key: item.key, name: typeof item.name === "string" ? item.name : "Gasto", icon: typeof item.icon === "string" ? item.icon : "💸", type: ["fixed", "variable", "debt"].includes(item.type) ? item.type : "fixed", value: amount(item.value), minimum: amount(item.minimum ?? item.value), debt: amount(item.debt), slots: Math.min(100, Math.max(1, Math.trunc(amount(item.slots)) || 5)), custom: true, automatic: item.automatic === true });
    }
  }
  if (record(source.history)) {
    for (const [key, log] of Object.entries(source.history)) {
      if (!period(key) || !record(log)) continue;
      state.history[key] = { key, year: key.slice(0, 4), month: monthNames[Number(key.slice(5)) - 1], total: amount(log.total), pending: Math.trunc(amount(log.pending)), updatedAt: typeof log.updatedAt === "string" && Number.isFinite(Date.parse(log.updatedAt)) ? log.updatedAt : now.toISOString(), ...(record(log.originalSnapshot) ? { originalSnapshot: copy(log.originalSnapshot) } : {}), ...(record(log.snapshot) ? { snapshot: copy(log.snapshot) } : {}) };
    }
  }
  // Legacy data has no explicit period: its latest history entry is the best evidence.
  state.activeMonth = period(source.activeMonth) ? source.activeMonth : Object.keys(state.history).sort().at(-1) || monthKey(now);
  return state;
}

export function snapshot(state, now) {
  const key = state.activeMonth;
  return { key, year: key.slice(0, 4), month: monthNames[Number(key.slice(5)) - 1], total: monthlyTotal(state), pending: pendingItems(state).length, updatedAt: now.toISOString(), snapshot: { categories: categories.map((category) => ({ id: category.id, name: category.name, items: activeItems(state, category).map((item) => ({ ...item, name: itemName(state, item), icon: itemIcon(state, item), value: state.values[item.key] ?? item.minimum ?? item.value ?? 0, debt: state.values[`${item.key}:debt`] ?? item.debt ?? 0, checked: Boolean(state.checked[item.key]), automatic: Boolean(category.automatic || item.automatic), monthlyAmount: itemAmount(state, item), ...(item.type === "variable" ? { entries: slotValues(state, item) } : {}) })) })) } };
}

export function createStore(storageProvider, clock = () => new Date()) {
  let storage, raw, parsed;
  const store = { key: storageKey, state: null, error: "", notice: "", blocked: false, ensureMonth, save };
  try {
    storage = typeof storageProvider === "function" ? storageProvider() : storageProvider;
    raw = storage.getItem(storageKey);
    parsed = raw === null ? null : JSON.parse(raw);
  } catch {
    store.notice = "No se pudieron leer los datos guardados. Se conservará una copia si el almacenamiento está disponible.";
    if (raw === undefined) {
      store.blocked = true;
      store.error = "No se pudo acceder al almacenamiento. Los datos existentes no se sobrescribirán. Revisa el permiso y recarga.";
    }
  }
  const seed = raw === null ? globalThis.BlueBirdStock?.lite : null;
  store.state = normalize(seed ? { ...copy(seed), activeMonth: monthKey(clock()) } : parsed, clock());
  if (parsed?.schemaVersion > schemaVersion) {
    store.blocked = true;
    store.error = "Estos datos pertenecen a una versión más reciente. Actualiza la aplicación para guardarlos.";
  } else if (raw != null && (parsed?.schemaVersion !== schemaVersion || JSON.stringify(parsed) !== JSON.stringify(store.state))) {
    try {
      // Never overwrite a prior recovery copy.
      let backupKey = `${storageKey}-backup-${clock().getTime()}`;
      while (storage.getItem(backupKey) !== null) backupKey += "-copy";
      storage.setItem(backupKey, raw);
      store.notice = parsed?.schemaVersion === schemaVersion ? "Se repararon datos inválidos. El original quedó respaldado en este navegador." : "Datos actualizados. Se conservó una copia de respaldo en este navegador.";
    } catch {
      store.blocked = true;
      store.error = "No se pudo crear el respaldo. Los datos originales no se sobrescribirán. Libera espacio y recarga.";
    }
  }
  ensureMonth();
  return store;

  function ensureMonth() {
    const state = store.state;
    const now = clock();
    const next = monthKey(now);
    // A clock moving backwards must not overwrite an already closed month.
    if (next <= state.activeMonth) return false;
    state.history[state.activeMonth] = snapshot(state, now);
    state.checked = {};
    state.slots = {};
    state.activeMonth = next;
    return true;
  }

  function save() {
    if (store.blocked) return false;
    ensureMonth();
    store.state.history[store.state.activeMonth] = snapshot(store.state, clock());
    try {
      storage.setItem(storageKey, JSON.stringify(store.state));
      store.error = "";
      return true;
    } catch {
      store.error = "No se pudieron guardar los cambios. Siguen en esta pestaña; no la cierres. Revisa el espacio y el permiso de almacenamiento.";
      return false;
    }
  }
}
