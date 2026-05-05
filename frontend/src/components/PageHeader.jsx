/**
 * Consistent page title block for dashboard routes.
 * @param {{ title: string; subtitle?: string; actions?: import('react').ReactNode }} props
 */
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-white/[0.07] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neon/70">
          GymFlow
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white md:text-[1.75rem] md:leading-snug">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
