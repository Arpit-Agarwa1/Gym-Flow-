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
      className="rounded-2xl border border-gf-sage/40 bg-gradient-to-br from-white via-gf-paper to-gf-sageSoft/50 px-5 py-5 shadow-sm ring-1 ring-slate-900/[0.06] md:px-6 dark:border-neon/25 dark:from-charcoal dark:via-elevated dark:to-charcoal dark:shadow-panel dark:ring-neon/15"
      aria-labelledby={`guide-title-${tabId}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-neon/60">
            How to use this tab
          </p>
          <h2
            id={`guide-title-${tabId}`}
            className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
          >
            {guide.title}
          </h2>
          <p className="mt-1 text-sm font-medium text-emerald-800 dark:text-neon/85">{guide.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={toggle}
          className="shrink-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-gf-sage hover:bg-gf-sageSoft hover:text-gf-sageFg focus:outline-none focus-visible:ring-2 focus-visible:ring-gf-sage/50 dark:border-white/12 dark:bg-white/[0.06] dark:text-gray-200 dark:hover:border-neon/40 dark:hover:bg-neon/10 dark:hover:text-neon dark:focus-visible:ring-neon/50"
          aria-expanded={visible}
          aria-controls={`guide-body-${tabId}`}
        >
          {visible ? 'Hide guide' : 'View guide'}
        </button>
      </div>

      {visible && (
        <div
          id={`guide-body-${tabId}`}
          className="mt-5 border-t border-slate-200 pt-5 dark:border-white/12"
        >
          <p className="text-sm leading-relaxed text-slate-600 dark:text-gray-300">{guide.intro}</p>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-1">
            {guide.bullets.map((line) => (
              <li
                key={line}
                className="flex gap-3 rounded-xl border border-slate-300/80 bg-gf-canvas/90 px-3 py-2.5 text-xs leading-relaxed text-slate-600 dark:border-white/12 dark:bg-white/[0.05] dark:text-gray-300"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neon shadow-[0_0_10px_rgba(57,255,20,0.45)]"
                  aria-hidden
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
