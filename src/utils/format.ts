/**
 * Formats a numeric percentage value with 2 decimal places and a trailing '%' sign.
 *
 * @param value - The percentage value (e.g. 75.25)
 * @returns Formatted percentage string (e.g. "75.25%")
 */
export function formatPercentage(value: number): string {
  if (isNaN(value) || !Number.isFinite(value)) return '0.00%';
  return value.toFixed(2) + '%';
}

/**
 * Formats a numeric percentage value compactly.
 * If the value is a whole number, omits decimals; otherwise displays 1 decimal place.
 *
 * @param value - The percentage value (e.g. 75 or 75.4)
 * @returns Formatted percentage string (e.g. "75%" or "75.4%")
 */
export function formatPercentageShort(value: number): string {
  if (isNaN(value) || !Number.isFinite(value)) return '0%';
  if (value === Math.floor(value)) return value.toFixed(0) + '%';
  return value.toFixed(1) + '%';
}

/**
 * Returns a time-appropriate greeting based on the current hour of the day.
 *
 * @returns Greeting string ("Good morning", "Good afternoon", or "Good evening")
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Formats a date string into a readable format including day of the week.
 *
 * @param dateStr - Date string in format like "Aug 17, 2026"
 * @returns Formatted date string like "Mon, Aug 17"
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

/**
 * Determines whether a given date string represents today.
 *
 * @param dateStr - Date string in format like "Aug 17, 2026"
 * @returns True if the date represents today's date, false otherwise.
 */
export function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;

  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Determines whether a given date string represents tomorrow.
 *
 * @param dateStr - Date string in format like "Aug 17, 2026"
 * @returns True if the date represents tomorrow's date, false otherwise.
 */
export function isTomorrow(dateStr: string): boolean {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate()
  );
}

/**
 * Returns a human-friendly label for a date ("Today", "Tomorrow", or "Mon, Aug 17").
 *
 * @param dateStr - Date string in format like "Aug 17, 2026"
 * @returns Date label string
 */
export function getDateLabel(dateStr: string): string {
  if (isToday(dateStr)) return 'Today';
  if (isTomorrow(dateStr)) return 'Tomorrow';
  return formatDate(dateStr);
}

/**
 * Truncates a string to the specified maximum length, appending an ellipsis ('…') if truncated.
 *
 * @param str - The string to truncate
 * @param maxLen - Maximum allowed length including the ellipsis
 * @returns The original string if length <= maxLen, otherwise truncated with ellipsis
 */
export function truncate(str: string, maxLen: number): string {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  if (maxLen <= 1) return str.substring(0, maxLen);
  return str.substring(0, maxLen - 1) + '…';
}
