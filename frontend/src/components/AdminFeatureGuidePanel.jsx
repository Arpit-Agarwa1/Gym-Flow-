import { useEffect, useState } from 'react';
import { ADVANCED_OPS_GUIDES } from '../data/advancedOpsGuides.js';

const STORAGE_PREFIX = 'gymflow_admin_guide_visible_';

/**
 * Per-tab narration with Hide / View guide toggle (remembered in localStorage).
 */
export default function AdminFeatureGuidePanel({ tabId }) {
  const guide = ADVANCED_OPS_GUIDES[tabId];

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + tabId);
      if (stored === null) setVisible(true);
      else setVisible(stored === '1');
    } catch {
      setVisible(true);
    }
  }, [tabId]);

  function toggle() {
    const next = !visible;
    setVisible(next);
    try {
      localStorage.setItem(STORAGE_PREFIX + tabId, next ? '1' : '0');
    } catch {
      /* ignore quota */
    }
  }

  if (!guide) return null;

  return (
    <section
      className="rounded-xl border border-neon/25 bg-gradient-to-br from-charcoal/90 to-ink/90 px-4 py-4 shadow-lg shadow-black/20 md:px-5"
      aria-labelledby={`guide-title-${tabId}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2
            id={`guide-title-${tabId}`}
            className="text-base font-semibold text-white"
          >
            {guide.title}
          </h2>
          <p className="mt-0.5 text-xs font-medium text-neon/90">
            {guide.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          className="shrink-0 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-200 transition hover:border-neon/35 hover:text-neon focus:outline-none focus-visible:ring-2 focus-visible:ring-neon"
          aria-expanded={visible}
          aria-controls={`guide-body-${tabId}`}
        >
          {visible ? 'Hide guide' : 'View guide'}
        </button>
      </div>

      {visible && (
        <div
          id={`guide-body-${tabId}`}
          className="mt-4 border-t border-white/10 pt-4"
        >
          <p className="text-sm leading-relaxed text-gray-400">{guide.intro}</p>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-gray-500">
            {guide.bullets.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neon/80" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
