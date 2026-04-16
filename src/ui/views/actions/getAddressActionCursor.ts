export function getAddressActionsCursor(date: string | Date) {
  // Zerion's logic: next day start as ISO string in a base64 encoded array
  const d = typeof date === 'string' ? new Date(date) : date;
  const nextDay = new Date(d);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(0, 0, 0, 0);
  return btoa(JSON.stringify([nextDay.toISOString()]));
}
