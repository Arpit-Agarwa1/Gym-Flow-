/**
 * Dashboard metric tile with subtle lift on hover.
 */
export default function StatCard({ label, value, hint }) {
  return (
    <div className="group rounded-2xl border border-white/[0.08] bg-gradient-to-br from-charcoal to-surface/90 p-5 shadow-panel-sm ring-1 ring-white/[0.03] transition duration-200 hover:border-neon/20 hover:shadow-glow">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-xs leading-snug text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}
