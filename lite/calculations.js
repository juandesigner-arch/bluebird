import { categories } from "./data.js?v=lite-4";

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

