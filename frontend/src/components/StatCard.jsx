/**
 * Dashboard metric tile with subtle lift on hover.
 */
export default function StatCard({ label, value, hint }) {
  return (
    <div className="group rounded-2xl border border-slate-300/70 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm ring-1 ring-slate-900/[0.06] transition duration-200 hover:border-emerald-300/60 hover:shadow-md dark:border-white/12 dark:bg-gradient-to-br dark:from-elevated dark:to-charcoal dark:shadow-panel-sm dark:ring-white/[0.08] dark:hover:border-neon/30 dark:hover:shadow-glow">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-white">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-xs leading-snug text-slate-600 dark:text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}
