export function getTodayKey() {
  return dateToKey(new Date());
}

export function formatDateLong(date = new Date()) {
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatDateShort(dateOrKey) {
  const date = typeof dateOrKey === 'string' ? keyToDate(dateOrKey) : dateOrKey;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function dateToKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function keyToDate(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function monthInputValue(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function parseMonthInput(value) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }
  const [year, month] = value.split('-').map(Number);
  return { year, month: month - 1 };
}

export function monthRangeKeys(year, month) {
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth(year, month)).padStart(2, '0')}`;
  return { start, end };
}

export function daysBetween(startKey, endKey) {
  const start = keyToDate(startKey);
  const end = keyToDate(endKey);
  return Math.max(0, Math.round((end - start) / 86400000));
}

export function isoNow() {
  return new Date().toISOString();
}

export function formatTimeFromISO(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}
