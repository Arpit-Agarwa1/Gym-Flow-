/** Dashboard metric tile */
export default function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-charcoal to-ink p-5 shadow-lg shadow-black/30">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
