import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, storageKey } from '../state.js';
import { monthlyTotal, pendingItems, itemAmount, findItem, activeItems, getCategory } from '../calculations.js';
const memory = (raw = null) => {
  const entries = new Map(raw === null ? [] : [[storageKey, raw]]);
  return { entries, getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) };
};
const october = () => new Date(2026, 9, 5, 12);

test('empty data is zero; monthly factors, automatic payments and debt are correct', () => {
  const store = createStore(memory(), october), s = store.state;
  assert.equal(monthlyTotal(s), 0);
  assert.equal(pendingItems(s).length, 0);
  Object.assign(s.values, { rent: 100000, water: 100000, soat: 120001, tech: 240000, spotify: 10000, visa: 30000, 'visa:debt': 9000000 });
  s.slots.gasoline = [10000, 20000];
  assert.equal(monthlyTotal(s), 250000 + 1 / 12);
  assert.equal(pendingItems(s).length, 5);
  s.checked.rent = true;
  assert.equal(pendingItems(s).length, 4);
});

test('rollover closes the real previous month, resets variables/checks, keeps fixed and debt', () => {
  let now = new Date(2026, 11, 31, 23, 59);
  const db = memory(), store = createStore(db, () => now), s = store.state;
  s.values.rent = 500; s.values.visa = 100; s.values['visa:debt'] = 10000;
  s.checked.rent = true; s.slots.market = [20, 30];
  s.labels.rent = 'Casa'; s.icons.rent = '🏠'; s.removed.mastercard = true;
  store.save();
  now = new Date(2027, 0, 1);
  assert.equal(store.ensureMonth(), true);
  assert.equal(monthlyTotal(s), 600);
  assert.deepEqual(s.checked, {}); assert.deepEqual(s.slots, {});
  assert.equal(s.history['2026-12'].total, 650);
  assert.equal(s.history['2026-12'].snapshot.categories[0].items[0].name, 'Casa');
  const previous = JSON.stringify(s.history['2026-12']);
  s.values.rent = 900; s.labels.rent = 'Otro'; store.save();
  assert.equal(JSON.stringify(s.history['2026-12']), previous);
  const reloaded = createStore(db, () => now).state;
  assert.equal(reloaded.values['visa:debt'], 10000);
  assert.equal(activeItems(reloaded, getCategory('debt')).some((i) => i.key === 'mastercard'), false);
  now = new Date(2027, 3, 1); store.save();
  assert.equal(s.history['2027-02'], undefined);
  now = new Date(2027, 1, 1); assert.equal(store.ensureMonth(), false);
});

test('legacy migration backs up exactly, infers period, keeps custom fields and removed items', () => {
  const legacy = { values: { rent: 42, 'custom-1': 17 }, labels: { 'custom-1': 'Seguro' }, icons: { 'custom-1': '🧾' }, checked: { rent: true }, slots: { market: [20] }, removed: { visa: true }, custom: { housing: [{ key: 'custom-1', name: 'Nuevo', icon: '💸', type: 'fixed', value: 17, custom: true }] }, history: { '2026-09': { total: 79, pending: 1, updatedAt: '2026-09-30T12:00:00Z' } } };
  const raw = JSON.stringify(legacy), db = memory(raw), store = createStore(db, october);
  assert.equal([...db.entries.values()].filter((v) => v === raw).length, 2);
  assert.equal(store.state.history['2026-09'].total, 79);
  assert.equal(monthlyTotal(store.state), 59);
  store.save();
  const next = createStore(db, october);
  assert.equal(next.state.labels['custom-1'], 'Seguro');
  assert.equal(next.state.icons['custom-1'], '🧾');
  assert.equal(findItem(next.state, 'custom-1').type, 'fixed');
  assert.equal(next.state.removed.visa, true);
  assert.equal(db.entries.size, 2, 'unchanged data does not create another backup');
});

test('corrupt structures and JSON recover without destroying the original', () => {
  for (const raw of ['{bad', 'null', '[]', JSON.stringify({ values: { rent: 'invalid' }, slots: { market: 'bad' }, custom: { housing: {} }, history: { x: null }, view: 'broken' })]) {
    const db = memory(raw), store = createStore(db, october);
    assert.equal(monthlyTotal(store.state), 0);
    assert.equal(store.state.view, 'home');
    assert.equal([...db.entries.keys()].some((k) => k.includes('backup')), true);
    assert.equal(store.save(), true);
  }
});

test('storage denied, quota failure and future schema do not overwrite existing data', () => {
  const denied = createStore(() => { throw Error('denied'); }, october);
  assert.equal(denied.save(), false); assert.ok(denied.error);
  const raw = JSON.stringify({ values: { rent: 123 } });
  const db = memory(raw); db.setItem = () => { throw Error('quota'); };
  const failed = createStore(db, october);
  assert.equal(failed.blocked, true); assert.equal(failed.save(), false);
  assert.equal(db.getItem(storageKey), raw);
  const futureDB = memory('{"schemaVersion":999}');
  assert.equal(createStore(futureDB, october).save(), false);
  assert.equal(futureDB.getItem(storageKey), '{"schemaVersion":999}');
});
