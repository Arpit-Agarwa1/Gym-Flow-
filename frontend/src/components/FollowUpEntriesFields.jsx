import { followUpSlotLabel } from '../utils/leadFollowUps.js';

/**
 * Multi-slot follow-up notes: 1st, 2nd, then optional rows with Add / Remove.
 * @param {{ entries: Array<{ content?: string }>; onChange: (next: Array<{ content: string }>) => void; variant?: 'form' | 'card' | 'pipeline' }} props
 */
export default function FollowUpEntriesFields({
  entries,
  onChange,
  variant = 'form',
}) {
  const isCard = variant === 'card';
  const isPipeline = variant === 'pipeline';
  const labelCls = isPipeline
    ? 'text-[10px] font-medium uppercase tracking-wide text-gray-500'
    : isCard
      ? 'text-[10px] font-medium uppercase tracking-wide text-gray-500'
      : 'mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-500';
  const taCls = isPipeline
    ? 'input-dark mt-0.5 min-h-[44px] w-full resize-y text-[12px] leading-snug'
    : isCard
      ? 'input-dark mt-0.5 min-h-[48px] w-full resize-y text-[11px]'
      : 'input-dark min-h-[64px] w-full resize-y text-sm';

  function setContent(index, content) {
    const next = entries.map((e, i) =>
      i === index ? { ...e, content } : { ...e }
    );
    onChange(next);
  }

  function addRow() {
    onChange([...entries, { content: '' }]);
  }

  function removeRow(index) {
    if (entries.length <= 2 || index < 2) return;
    onChange(entries.filter((_, i) => i !== index));
  }

  return (
    <div className={isPipeline ? 'space-y-2.5' : 'space-y-3'}>
      {entries.map((entry, index) => (
        <div key={index} className="relative">
          <div className="flex items-start justify-between gap-2">
            <label htmlFor={`follow-up-${variant}-${index}`} className={labelCls}>
              {followUpSlotLabel(index)}
            </label>
            {index >= 2 && entries.length > 2 ? (
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="shrink-0 rounded px-1.5 py-0.5 text-[10px] text-red-300/90 hover:bg-red-500/15"
              >
                Remove
              </button>
            ) : null}
          </div>
          <textarea
            id={`follow-up-${variant}-${index}`}
            className={taCls}
            value={entry.content}
            onChange={(e) => setContent(index, e.target.value)}
            rows={isPipeline ? 2 : isCard ? 2 : 3}
            placeholder="Call outcome, next step, member interest…"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className={
          isPipeline
            ? 'w-full rounded-lg border border-dashed border-white/[0.14] py-1.5 text-[10px] font-medium text-gray-500 transition hover:border-neon/40 hover:text-neon'
            : isCard
              ? 'w-full rounded border border-dashed border-white/20 py-1.5 text-[10px] font-medium text-gray-400 transition hover:border-neon/35 hover:text-neon'
              : 'rounded-lg border border-dashed border-white/20 px-3 py-2 text-xs font-medium text-gray-400 transition hover:border-neon/35 hover:text-neon'
        }
      >
        + Add follow-up
      </button>
    </div>
  );
}
