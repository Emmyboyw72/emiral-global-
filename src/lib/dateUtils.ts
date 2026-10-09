export function formatDate(val: any, fallback = '—'): string {
  if (!val) return fallback;
  try {
    if (typeof val.toDate === 'function') {
      return val.toDate().toLocaleDateString('en-GB');
    }
    if (typeof val.seconds === 'number') {
      return new Date(val.seconds * 1000).toLocaleDateString('en-GB');
    }
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB');
    }
  } catch (e) {}
  return fallback;
}

export function formatDateTime(val: any, fallback = '—'): string {
  if (!val) return fallback;
  try {
    if (typeof val.toDate === 'function') {
      return val.toDate().toLocaleString('en-GB');
    }
    if (typeof val.seconds === 'number') {
      return new Date(val.seconds * 1000).toLocaleString('en-GB');
    }
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString('en-GB');
    }
  } catch (e) {}
  return fallback;
}

export function getDateMillis(val: any): number {
  if (!val) return 0;
  try {
    if (typeof val.toDate === 'function') return val.toDate().getTime();
    if (typeof val.getTime === 'function') return val.getTime();
    if (typeof val.seconds === 'number') return val.seconds * 1000;
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.getTime();
  } catch (e) {}
  return 0;
}
