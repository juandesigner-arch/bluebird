import { categories } from "./data.js?v=lite-6";

export function categorySummaries(state) {
  return categories.map((category) => {
    const items = activeItems(state, category);
    return {
      ...category,
      count: items.length,
      total: items.reduce((sum, item) => sum + itemAmount(state, item), 0),
      pending: items.filter((item) => requiresCheck(state, category, item) && !state.checked[item.key]).length
    };
  });
}

export function pendingItems(state) {
  return categories.flatMap((category) => activeItems(state, category)
    .filter((item) => requiresCheck(state, category, item) && !state.checked[item.key])
    .map((item) => ({
      categoryId: category.id,
      category: category.name,
      name: itemName(state, item),
      icon: itemIcon(state, item),
      amount: itemAmount(state, item)
    })));
}

export function requiresCheck(state, category, item) {
  return item.type !== "variable" && !item.automatic && !category.automatic && itemAmount(state, item) > 0;
}

export function activeItems(state, category) {
  return [...category.items, ...(state.custom[category.id] || [])].filter((item) => !state.removed[item.key]);
}

export function getCategory(id) { return categories.find((category) => category.id === id); }

export function findItem(state, key) {
  for (const category of categories) {
    const item = activeItems(state, category).find((candidate) => candidate.key === key);
    if (item) return item;
  }
  return null;
}

export function itemAmount(state, item) {
  if (item.type === "variable") return slotValues(state, item).reduce((sum, value) => sum + Number(value || 0), 0);
  const value = Number(state.values[item.key] ?? (item.type === "debt" ? item.minimum : item.value) ?? 0);
  return value * (item.factor ?? 1);
}

export function slotValues(state, item) {
  const count = Math.max(Number(item.slots || 5), (state.slots[item.key] || []).length);
  const saved = state.slots[item.key] || [];
  return Array.from({ length: count }, (_, index) => Number(saved[index] || 0));
}

export function itemName(state, item) { return state.labels[item.key] ?? item.name; }
export function itemIcon(state, item) { return state.icons[item.key] ?? item.icon; }
export function monthlyTotal(state) {
  return categories
    .flatMap((category) => activeItems(state, category))
    .reduce((sum, item) => sum + itemAmount(state, item), 0);
}


// Payment checks and variable entry slots match the original visual progress.
// Zero-valued fixed expenses are not pending; automatic charges need no check.
export function categoryProgress(state, category) {
  let done = 0, total = 0;
  for (const item of activeItems(state, category)) {
    if (item.type === "variable") {
      const entries = slotValues(state, item);
      total += entries.length;
      done += entries.filter((value) => value > 0).length;
    } else if (itemAmount(state, item) > 0) {
      total += 1;
      if (item.automatic || category.automatic || state.checked[item.key]) done += 1;
    }
  }
  return { done, total, percent: total ? done / total * 100 : 0, complete: total > 0 && done === total };
}

export function paymentProgress(state) {
  const items = categories.flatMap((category) => activeItems(state, category)
    .filter((item) => requiresCheck(state, category, item)));
  const done = items.filter((item) => state.checked[item.key]).length;
  return { done, total: items.length, percent: items.length ? done / items.length * 100 : 0, complete: items.length > 0 && done === items.length };
}

export function debtSummary(state) {
  const debts = categories.flatMap((category) => activeItems(state, category)).filter((item) => item.type === "debt");
  const total = debts.reduce((sum, item) => sum + Number(state.values[`${item.key}:debt`] ?? item.debt ?? 0), 0);
  const minimums = debts.reduce((sum, item) => sum + itemAmount(state, item), 0);
  const paid = debts.filter((item) => state.checked[item.key]).reduce((sum, item) => sum + itemAmount(state, item), 0);
  return { total, minimums, paid, percent: minimums ? Math.min(100, paid / minimums * 100) : 0 };
}
