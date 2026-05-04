/**
 * Escape CSV cell values.
 */
export function toCsvRow(row) {
  return row
    .map((cell) => {
      const s = cell == null ? '' : String(cell);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    })
    .join(',');
}
