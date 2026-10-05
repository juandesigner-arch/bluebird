import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, storageKey } from '../state.js';
import { sections, defaultState } from '../data.js';
import { monthlyValue, expenseSections, pendingPayments, debtStats } from '../calculations.js';
const at = (year, month, day = 1) => new Date(year, month - 1, day, 12);
const memory = (raw = null) => {
  const entries = new Map(raw === null ? [] : [[storageKey, raw]]);
  return { entries, getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) };
};
const total = (s) => expenseSections(s).reduce((sum, section) => sum + section.monthly, 0);
const item = (key) => sections.flatMap((section) => section.items).find((i) => i.key === key);

test('calculations retain original water, annual, automatic and debt rules', () => {
  const s = createStore(memory(), () => at(2026, 10)).state;
  assert.equal(total(s), 0);
  Object.assign(s.values, { water: 100000, soat: 120000, techInspection: 240000, spotify: 10000, freeInvestmentMin: 30000, freeInvestmentDebt: 5000000 });
  s.entries.gasoline = [10000, 20000];
  assert.equal(monthlyValue(s, item('water')), 50000);
  assert.equal(monthlyValue(s, item('soat')), 10000);
  assert.equal(monthlyValue(s, item('techInspection')), 20000);
  assert.equal(total(s), 150000);
  assert.equal(debtStats(s).total, 5000000);
  assert.equal(pendingPayments(s).some((i) => ['Spotify', 'SOAT', 'Gasolina'].includes(i.label)), false);
});

test('migration backs up exact source and never resets existing debt balances', () => {
  const legacy = structuredClone(defaultState);
  legacy.values.freeInvestmentDebt = 123456;
  legacy.values.crediagilDebt = 900;
  legacy.removedItems.visaRappiMin = true;
  legacy.itemLabels.rent = 'Mi casa'; legacy.checked.rent = true;
  legacy.entries.marketHome = [1, 2, 3, 4, 5, 6];
  legacy.customItems.housing = [{key:'custom_test',label:'Seguro',icon:'🧾',type:'fixed',value:123,custom:true}];
  const raw = JSON.stringify(legacy), db = memory(raw), store = createStore(db, () => at(2026, 10));
  assert.equal([...db.entries.values()].filter((value) => value === raw).length, 2);
  assert.equal(store.state.values.freeInvestmentDebt, 123456);
  assert.equal(store.state.values.crediagilDebt, 900);
  assert.equal(store.state.removedItems.visaRappiMin, true);
  assert.equal(store.state.entries.marketHome.length, 6);
  assert.equal(store.state.customItems.housing[0].icon, '🧾');
  store.save();
  const next = createStore(db, () => at(2026, 10)); next.save();
  assert.equal(next.state.itemLabels.rent, 'Mi casa');
  assert.equal(next.state.checked.rent, true);
  assert.equal(db.entries.size, 2, 'no spurious repeat backups');
});

test('December closes once before reset; fixed values, custom items and debt persist across skipped months', () => {
  let now = at(2026, 12, 31);
  const db = memory(), store = createStore(db, () => now), s = store.state;
  s.values.rent = 100; s.values.freeInvestmentMin = 50; s.values.freeInvestmentDebt = 800;
  s.entries.gasoline = [10, 20]; s.checked.rent = true; s.itemLabels.rent = 'Casa';
  s.customItems.housing.push({key:'custom_var',label:'Variable',icon:'✨',value:0,type:'variable',entries:5,noCheck:true,entryMode:'sum',custom:true});
  s.entries.custom_var = [7, 0, 0, 0, 0];
  store.save(); now = at(2027, 1); assert.equal(store.ensureMonth(), true);
  const closed = s.yearLogs['2026']['12'];
  assert.equal(closed.month, 'Diciembre'); assert.equal(closed.monthlyTotal, 187);
  assert.equal(closed.snapshot.sections[0].items[0].label, 'Casa');
  assert.equal(closed.snapshot.sections[0].items[0].checked, true);
  assert.equal(closed.snapshot.sections[0].items[1].entryValues[0], 7);
  assert.equal(s.values.freeInvestmentDebt, 800); assert.equal(total(s), 150);
  assert.deepEqual(s.checked, {}); assert.deepEqual(s.entries.custom_var, []);
  const frozen = JSON.stringify(closed);
  s.itemLabels.rent = 'Otra casa'; s.values.rent = 200; store.save();
  assert.equal(JSON.stringify(s.yearLogs['2026']['12']), frozen);
  now = at(2027, 4); store.save(); assert.equal(s.yearLogs['2027']['02'], undefined);
  now = at(2027, 2); assert.equal(store.ensureMonth(), false);
  const reloaded = createStore(db, () => now); assert.equal(reloaded.state.activeMonth, '2027-04');
  assert.equal(JSON.stringify(reloaded.state.yearLogs['2026']['12']), frozen);
});

test('legacy history supplies the active period and old summaries survive', () => {
  const raw = JSON.stringify({ values: {rent:100}, entries:{gasoline:[20]}, checked:{rent:true}, yearLogs:{'2026':{'08':{monthlyTotal:55},'09':{monthlyTotal:120}}} });
  const store = createStore(memory(raw), () => at(2026, 10));
  assert.equal(store.state.yearLogs['2026']['08'].monthlyTotal, 55);
  assert.equal(store.state.yearLogs['2026']['09'].monthlyTotal, 120);
  assert.equal(total(store.state), 100);
  assert.deepEqual(store.state.checked, {});
});

test('malformed JSON and nested data recover while preserving their raw backup', () => {
  for (const raw of ['broken', 'null', '[]', JSON.stringify({values:{rent:'no'},entries:{gasoline:{}},yearLogs:{'2026':{'09':{pending:[null],items:'bad',sections:[null],debt:1}}},customItems:{housing:[null,{key:'__proto__'}]},view:'invalid'})]) {
    const db = memory(raw), store = createStore(db, () => at(2026, 10));
    assert.equal(total(store.state), 0); assert.equal(store.state.view, 'home');
    assert.ok([...db.entries.keys()].some((k) => k.includes('backup')));
    assert.equal(store.save(), true);
  }
});

test('read denial, failed backup, full storage and future schemas never destroy stored data', () => {
  const denied = createStore(() => {throw Error('denied');}); assert.equal(denied.save(), false);
  const raw = JSON.stringify({values:{rent:123}}), db = memory(raw);
  db.setItem = () => {throw Error('quota');};
  const failed = createStore(db); assert.equal(failed.save(), false); assert.equal(db.getItem(storageKey), raw);
  const fullDB = memory(), full = createStore(fullDB); full.save();
  const original = fullDB.getItem(storageKey); fullDB.setItem = () => {throw Error('quota');};
  full.state.values.rent = 200; assert.equal(full.save(), false); assert.equal(full.state.values.rent, 200); assert.equal(fullDB.getItem(storageKey), original);
  const futureDB = memory('{"schemaVersion":999}'); assert.equal(createStore(futureDB).save(), false); assert.equal(futureDB.getItem(storageKey), '{"schemaVersion":999}');
});

test('stale tabs cannot overwrite a newer save, even before the storage event arrives', () => {
  const db = memory(), first = createStore(db); first.save();
  const second = createStore(db); second.state.values.rent = 500; second.save();
  first.state.values.rent = 900;
  assert.equal(first.save(), false); assert.equal(first.blocked, true);
  assert.equal(JSON.parse(db.getItem(storageKey)).values.rent, 500);
});

test('shared stock seeds new releases only, preserving original values, checks and legacy history', async () => {
  const fs = await import('node:fs');
  const vm = await import('node:vm');
  const sandbox = {};
  vm.runInNewContext(fs.readFileSync(new URL('../../test-data/stock.js', import.meta.url), 'utf8'), sandbox);
  globalThis.BlueBirdStock = sandbox.BlueBirdStock;
  try {
    const original = sandbox.BlueBirdStock.original;
    const seeded = createStore(memory(), () => at(2026, 10));
    assert.deepEqual(seeded.state.values, JSON.parse(JSON.stringify(original.values)));
    assert.deepEqual(seeded.state.checked, JSON.parse(JSON.stringify(original.checked)));
    assert.ok(seeded.state.yearLogs['2026']['09']);
    const existing = createStore(memory(JSON.stringify({...defaultState, values:{rent:321}})), () => at(2026, 10));
    assert.equal(existing.state.values.rent, 321);
    const { createStore: createLite } = await import('../../lite/state.js');
    const { monthlyTotal } = await import('../../lite/calculations.js');
    const lite = createLite(memory(), () => at(2026, 10));
    assert.equal(monthlyTotal(lite.state), total(seeded.state));
  } finally { delete globalThis.BlueBirdStock; }
});

test('USD debts retain cents, use the per-debt rate, and freeze native currency at month close', async () => {
  const { parseAmount } = await import('../money.js');
  assert.equal(parseAmount('12,50', 'USD'), 12.5);
  assert.equal(parseAmount('1,250.75', 'USD'), 1250.75);
  assert.equal(parseAmount('1.250,75', 'USD'), 1250.75);
  assert.equal(parseAmount('120.000', 'COP'), 120000);
  assert.equal(parseAmount('-12', 'USD'), 0);
  let now = at(2026, 10);
  const db = memory(), store = createStore(db, () => now);
  const debt = {key:'custom_usd',label:'USD',custom:true,type:'fixed',debt:true,currency:'USD',debtTotalKey:'custom_usd_total'};
  store.state.customItems.debt.push(debt);
  Object.assign(store.state.values, {custom_usd:12.5,custom_usd_total:250.75});
  store.state.currencyRates.custom_usd = 4000;
  assert.equal(monthlyValue(store.state,debt),50000);
  assert.equal(debtStats(store.state).total,1003000);
  assert.equal(debtStats(store.state).minimums,50000);
  assert.equal(debtStats(store.state).remaining,953000);
  store.save();const reloaded = createStore(db,()=>now);
  assert.equal(reloaded.state.customItems.debt[0].currency,'USD');
  assert.equal(monthlyValue(reloaded.state,reloaded.state.customItems.debt[0]),50000);
  now=at(2026,11);reloaded.ensureMonth();
  const closed=reloaded.state.yearLogs['2026']['10'];
  reloaded.state.currencyRates.custom_usd=5000;
  const item=closed.snapshot.sections.find(s=>s.id==='debt').items.find(i=>i.key==='custom_usd');
  assert.equal(item.currency,'USD');assert.equal(item.exchangeRate,4000);assert.equal(item.debtTotal,250.75);assert.equal(item.monthly,50000);
});

test('account storage namespaces never mutate the guest or another user', () => {
  const db=memory(), clock=()=>at(2026,10);
  const guest=createStore(db,clock);guest.state.values.rent=123;guest.save();
  const a=createStore(db,clock,{key:storageKey+':user-a'});a.state.values.rent=456;a.save();
  const b=createStore(db,clock,{key:storageKey+':user-b'});b.state.values.rent=789;b.save();
  assert.equal(createStore(db,clock).state.values.rent,123);
  assert.equal(createStore(db,clock,{key:storageKey+':user-a'}).state.values.rent,456);
  assert.equal(createStore(db,clock,{key:storageKey+':user-b'}).state.values.rent,789);
});

test('variable record names migrate with amounts and survive reload and month history', () => {
  let now=at(2026,10);
  const db=memory(JSON.stringify({activeMonth:'2026-10',entries:{gasoline:[0,100,200]},entryNames:{gasoline:['Unused','Gasolina lunes','Viaje']}}));
  const store=createStore(db,()=>now);
  assert.deepEqual(store.state.entries.gasoline,[100,200]);
  assert.deepEqual(store.state.entryNames.gasoline,['Gasolina lunes','Viaje']);
  store.state.entries.gasoline.splice(0,1);store.state.entryNames.gasoline.splice(0,1);store.save();
  const reloaded=createStore(db,()=>now);
  assert.deepEqual(reloaded.state.entryNames.gasoline,['Viaje']);
  now=at(2026,11);reloaded.ensureMonth();
  const row=reloaded.state.yearLogs['2026']['10'].snapshot.sections.find(s=>s.id==='transport').items.find(i=>i.key==='gasoline');
  assert.deepEqual(row.entryNames,['Viaje']);assert.deepEqual(row.entryValues,[200]);
  assert.deepEqual(reloaded.state.entryNames,{});
});
