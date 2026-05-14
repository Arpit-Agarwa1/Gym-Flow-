import { useTheme } from '../contexts/ThemeContext.jsx';

/**
 * Accessible day / night switch — toggles `dark` class on `<html>`.
 * @param {{ className?: string; compact?: boolean }} props
 */
export default function ThemeToggle({ className = '', compact = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={[
        'inline-flex items-center justify-center rounded-xl border transition',
        'border-slate-300/90 bg-white text-slate-700 shadow-sm hover:bg-slate-50',
        'dark:border-white/15 dark:bg-white/[0.04] dark:text-amber-100 dark:shadow-none dark:hover:bg-white/[0.08]',
        compact ? 'h-9 w-9' : 'gap-2 px-3 py-2 text-xs font-medium sm:text-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={isDark ? 'Switch to day mode' : 'Switch to night mode'}
      aria-pressed={isDark}
      title={isDark ? 'Day mode' : 'Night mode'}
    >
      {isDark ? (
        <>
          <svg
            className="h-4 w-4 shrink-0 text-amber-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
          {!compact ? <span className="hidden sm:inline">Day</span> : null}
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4 shrink-0 text-slate-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          {!compact ? <span className="hidden sm:inline">Night</span> : null}
        </>
      )}
    </button>
  );
}
