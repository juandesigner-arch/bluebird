// Rebuild only when the owner supplies a new original Blue Bird test snapshot.
import fs from 'node:fs';
import vm from 'node:vm';
const original = JSON.parse(fs.readFileSync(new URL('./bluebird-stock-2026-10-05.json', import.meta.url), 'utf8'));
const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const catalog = JSON.parse(vm.runInNewContext(source.slice(0, source.indexOf('const allItems')) + '\nJSON.stringify(sections)'));
const categoryMap = { homeLife: 'food', entrepreneurship: 'business' };
const keyMap = { techInspection: 'tech', goingOut: 'restaurants', marketHome: 'market', mastercardBancolombiaMin: 'mastercard', visaDaviviendaMin: 'visa', freeInvestmentMin: 'credit', visaRappiMin: 'custom-stock-visaRappi', crediagilMin: 'custom-stock-crediagil' };
const lite = { view: 'home', selectedCategory: 'food', values: {}, slots: {}, labels: {}, icons: {}, checked: {}, removed: {}, custom: {}, history: {} };
for (const section of catalog) {
  const category = categoryMap[section.id] || section.id;
  lite.custom[category] = [];
  for (const item of [...section.items, ...(original.customItems[section.id] || [])]) {
    const key = keyMap[item.key] || item.key;
    lite.values[key] = original.values[item.key] ?? item.value ?? 0;
    if (item.debtTotalKey) lite.values[`${key}:debt`] = original.values[item.debtTotalKey] ?? item.debtTotal ?? 0;
    if (original.entries[item.key]) lite.slots[key] = [...original.entries[item.key]];
    lite.labels[key] = original.itemLabels[item.key] ?? item.label;
    lite.icons[key] = item.icon;
    lite.checked[key] = Boolean(original.checked[item.key] || item.autoChecked);
    if (original.removedItems[item.key]) lite.removed[key] = true;
    if (item.custom || key.startsWith('custom-stock-')) lite.custom[category].push({ key, name: lite.labels[key], icon: item.icon, type: item.debt ? 'debt' : item.entries ? 'variable' : 'fixed', value: lite.values[key], minimum: lite.values[key], debt: item.debtTotalKey ? lite.values[`${key}:debt`] : 0, slots: item.entries || 5, custom: true, automatic: Boolean(item.autoChecked || section.autoSectionChecked) });
  }
}
for (const months of Object.values(original.yearLogs || {})) for (const log of Object.values(months)) {
  lite.history[log.key] = { key: log.key, year: log.year, month: log.month, total: log.monthlyTotal, pending: log.pending.length, updatedAt: log.savedAt, originalSnapshot: log };
}
// New installations open at Home. All original values, checks and history are kept.
const stock = { id: 'bluebird-original-2026-10-05', capturedAt: '2026-10-05', original: { ...original, view: 'home' }, lite };
fs.writeFileSync(new URL('./stock.js', import.meta.url), '// User-designated test data. Loaded only when this release has no saved state.\nglobalThis.BlueBirdStock = ' + JSON.stringify(stock) + ';\n');
console.log('Stock generated from the original browser export; original JSON preserved unchanged.');
