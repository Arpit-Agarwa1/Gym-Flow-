/** @typedef {{ content: string }} FollowUpEntryDraft */

const MIN_SLOTS = 2;

/**
 * Ordinal label for follow-up slot (1-based index).
 * @param {number} indexZero
 */
export function followUpSlotLabel(indexZero) {
  const n = indexZero + 1;
  const suf =
    n % 10 === 1 && n % 100 !== 11
      ? 'st'
      : n % 10 === 2 && n % 100 !== 12
        ? 'nd'
        : n % 10 === 3 && n % 100 !== 13
          ? 'rd'
          : 'th';
  return `${n}${suf} follow-up`;
}

/**
 * Ensures at least two slots and maps legacy `remarks` into the first slot when empty.
 * @param {Record<string, unknown>} lead
 * @returns {FollowUpEntryDraft[]}
 */
export function normalizeFollowUpEntries(lead) {
  const raw = lead.followUpEntries;
  const arr = Array.isArray(raw)
    ? raw.map((e) => ({
        content: typeof e?.content === 'string' ? e.content : '',
      }))
    : [];
  while (arr.length < MIN_SLOTS) {
    arr.push({ content: '' });
  }
  const legacy =
    typeof lead.remarks === 'string' &&
    lead.remarks.trim() &&
    !String(arr[0]?.content || '').trim();
  if (legacy) {
    arr[0] = { content: String(lead.remarks) };
  }
  return arr;
}

/**
 * Trims entries, drops trailing empty rows beyond the first two, pads to two slots.
 * @param {FollowUpEntryDraft[]} entries
 * @returns {FollowUpEntryDraft[]}
 */
export function prepareFollowUpEntriesForSave(entries) {
  const mapped = entries.map((e) => ({
    content: (e.content || '').trim(),
  }));
  while (mapped.length > MIN_SLOTS && !mapped[mapped.length - 1].content) {
    mapped.pop();
  }
  while (mapped.length < MIN_SLOTS) {
    mapped.push({ content: '' });
  }
  return mapped;
}

/**
 * Compact preview for tables (1) … · (2) …
 * @param {Record<string, unknown>} lead
 * @param {number} [maxLen]
 */
export function followUpEntriesPreview(lead, maxLen = 140) {
  const parts = normalizeFollowUpEntries(lead)
    .map((e) => e.content.trim())
    .filter(Boolean);
  if (!parts.length) return '—';
  const text = parts.map((p, i) => `${i + 1}) ${p}`).join(' · ');
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}…`;
}
