export function formatDate(timestampMillis: string | number) {
  let ts =
    typeof timestampMillis === 'string'
      ? parseInt(timestampMillis)
      : timestampMillis;

  // Convert seconds to milliseconds if the value is too small (likely Unix seconds)
  // 10^12 is approx Jan 1 2001. All blockchain data is after this.
  if (ts < 10000000000) {
    ts *= 1000;
  }

  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatFullDate(timestampMillis: string | number) {
  let ts =
    typeof timestampMillis === 'string'
      ? parseInt(timestampMillis)
      : timestampMillis;

  if (ts < 10000000000) {
    ts *= 1000;
  }

  const date = new Date(ts);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
