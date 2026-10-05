import { sections } from "./data.mjs?v=v3-data-1";

export function pendingPayments(state) {
  return sections
    .filter((section) => !section.autoSectionChecked)
    .flatMap((section) => sectionItems(state, section).map((item) => ({ ...item, section: section.title, sectionId: section.id })))
    .filter((item) => !item.noCheck && !item.autoChecked && !isChecked(state, item))
    .map((item) => ({
      icon: item.icon,
      label: itemLabel(state, item),
      section: item.section,
      sectionId: item.sectionId,
      monthly: monthlyValue(state, item)
    }));
}

export function expenseKindTotals(state) {
  return allCurrentItems(state).reduce((totals, item) => {
    const kind = expenseKind(item);
    totals[kind] += monthlyValue(state, item);
    return totals;
  }, { fixed: 0, variable: 0 });
}

export function expenseKind(item) {
  if (item.type === "variable") return "variable";
  if (item.entries || item.debt || item.noCheck) return "variable";
  return "fixed";
}

export function expenseSections(state) {
  return sections.map((section) => {
    const monthly = sectionItems(state, section).reduce((sum, item) => sum + monthlyValue(state, item), 0);
    return {
      id: section.id,
      label: section.title,
      color: section.color,
      monthly,
      annual: monthly * 12
    };
  });
}

export function monthlyValue(state, item) {
  if (item.entries) return entriesMonthlyValue(state, item);
  const value = state.values[item.key] || 0;
  if (item.annual) return value / 12;
  return value * (item.monthlyFactor || 1);
}

export function entriesMonthlyValue(state, item) {
  const entries = state.entries[item.key] || [];
  if (item.entryMode === "average") {
    const filled = entries.filter((value) => value > 0);
    if (!filled.length) return 0;
    return filled.reduce((sum, value) => sum + value, 0) / filled.length;
  }
  return entries.reduce((sum, value) => sum + value, 0);
}

export function debtStats(state) {
  const debtSection = sections.find((section) => section.id === "debt");
  const debts = sectionItems(state, debtSection).filter((item) => item.debt);
  const total = debts.reduce((sum, item) => sum + (state.values[item.debtTotalKey] || 0), 0);
  const minimums = debts.reduce((sum, item) => sum + (state.values[item.key] || 0), 0);
  const remaining = Math.max(total - minimums, 0);
  const lifePercent = total ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0;
  return { total, minimums, remaining, lifePercent };
}

export function expenseItemLog(state) {
  return sections.flatMap((section) => sectionItems(state, section)
    .map((item) => ({
      icon: item.icon,
      label: itemLabel(state, item),
      section: section.title,
      monthly: monthlyValue(state, item)
    }))
    .filter((item) => item.monthly > 0)
  );
}

export function itemLabel(state, item) {
  return String(state.itemLabels?.[item.key] || item.label || "").trim();
}

export function isChecked(state, item) {
  if (!item) return false;
  if (item.autoChecked) return true;
  return Boolean(state.checked[item.key]);
}

export function sectionItems(state, section) {
  if (!section) return [];
  return [...section.items, ...(state.customItems[section.id] || [])]
    .filter((item) => !state.removedItems?.[item.key]);
}

export function allCurrentItems(state) {
  return sections.flatMap((section) => sectionItems(state, section));
}
