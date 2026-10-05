export function parseDecimal(value) {
  let raw = String(value ?? '').trim().replace(/[^\d.,-]/g, '');
  if (raw.includes('-')) return 0;
  const comma = raw.lastIndexOf(','), dot = raw.lastIndexOf('.');
  if (comma >= 0 && dot >= 0) {
    const decimal = comma > dot ? ',' : '.';
    raw = raw.replace(decimal === ',' ? /\./g : /,/g, '').replace(decimal, '.');
  } else raw = raw.replace(',', '.');
  const number = Number(raw);
  return Number.isFinite(number) && number >= 0 ? Math.round(number * 100) / 100 : 0;
}
export function parseAmount(value, currency = 'COP') {
  if (currency === 'USD') return parseDecimal(value);
  const raw = String(value).trim().toLowerCase();
  if (raw.includes('-')) return 0;
  const compact = raw.match(/^(\d+(?:[.,]\d+)?)\s*m$/);
  const result = compact ? Number(compact[1].replace(',', '.')) * 1000000 : Number(raw.replace(/[^\d]/g, ''));
  return Number.isFinite(result) ? Math.max(0, Math.round(result)) : 0;
}
export function nativeMoney(value, currency = 'COP') {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency, currencyDisplay: 'code', minimumFractionDigits: currency === 'USD' ? 2 : 0, maximumFractionDigits: currency === 'USD' ? 2 : 0 }).format(value || 0);
}
