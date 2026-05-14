import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import FeatureNarrationBar from '../components/FeatureNarrationBar.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

/**
 * Public marketing — factual positioning: GymFlow is self-hosted gym operations
 * software (MERN). Claims match shipped modules only.
 */
export default function Landing() {
  const token = useSelector((s) => s.auth.token);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (token) {
    return <Navigate to="/app" replace />;
  }

  const nav = (
    <>
      <a href="#capabilities" className="transition hover:text-slate-900 dark:hover:text-white">
        Capabilities
      </a>
      <a href="#approach" className="transition hover:text-slate-900 dark:hover:text-white">
        Approach
      </a>
      <a href="#comparison" className="transition hover:text-slate-900 dark:hover:text-white">
        Positioning
      </a>
      <Link to="/login" className="transition hover:text-neon">
        Sign in
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-36 text-slate-600 dark:bg-[#070708] dark:text-gray-300">
      <header className="sticky top-0 z-50 border-b border-slate-300/70 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-[#070708]/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-neon/30 to-neon/5 ring-1 ring-neon/40" />
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              GymFlow
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 dark:text-gray-300 md:flex">
            {nav}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/register"
              className="hidden rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-black shadow-[0_0_24px_-4px_rgba(57,255,20,0.45)] transition hover:bg-neonDim sm:inline-block"
            >
              Register
            </Link>
            <button
              type="button"
              className="rounded-lg border border-slate-300 p-2 dark:border-white/15 md:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span className="block h-0.5 w-5 bg-slate-800 dark:bg-white" />
              <span className="mt-1 block h-0.5 w-5 bg-slate-800 dark:bg-white" />
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-4 text-sm dark:border-white/10 dark:bg-charcoal md:hidden">
            {nav}
            <Link
              to="/register"
              className="rounded-lg bg-neon py-2 text-center font-semibold text-black"
              onClick={() => setMobileOpen(false)}
            >
              Register
            </Link>
          </div>
        )}
      </header>

      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-25 dark:opacity-35"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(57,255,20,0.22), transparent)',
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-4 inline-flex rounded-full border border-emerald-300/60 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:border-neon/25 dark:bg-neon/10 dark:text-neon">
            Gym management · Self-hosted MERN stack
          </p>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl md:text-[3.25rem] dark:text-white">
            Operational visibility for{' '}
            <span className="bg-gradient-to-r from-neon to-emerald-300 bg-clip-text text-transparent">
              fitness businesses
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-gray-400">
            GymFlow consolidates member records, billing, attendance, scheduling,
            and reporting behind role-based access. Designed for owners and
            managers who prefer structured data over fragmented spreadsheets.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-neon px-8 py-3.5 text-base font-semibold text-black shadow-[0_0_28px_-8px_rgba(57,255,20,0.5)] transition hover:bg-neonDim"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-slate-300 px-8 py-3.5 text-base font-semibold text-slate-800 transition hover:border-emerald-500/50 hover:text-emerald-800 dark:border-white/20 dark:text-white dark:hover:border-neon/40 dark:hover:text-neon"
            >
              Sign in to dashboard
            </Link>
          </div>
          <p className="mx-auto mt-8 max-w-xl text-xs leading-relaxed text-slate-500 dark:text-gray-400">
            Deploy on infrastructure you control. MongoDB for persistence;
            JWT authentication and role-based authorization; optional Razorpay,
            Cloudinary, and Firebase integrations where configured.
          </p>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-100/80 px-4 py-12 sm:px-6 dark:border-white/10 dark:bg-charcoal/40">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-10 md:grid-cols-4">
          {[
            ['Unified records', 'Members linked to plans and payments'],
            ['Event-driven alerts', 'Socket.io for in-app notifications'],
            ['Reporting', 'CSV exports and dashboard charts'],
            ['Governance', 'Hierarchical roles from owner to member'],
          ].map(([t, d]) => (
            <div key={t}>
              <p className="font-semibold text-slate-900 dark:text-white">{t}</p>
              <p className="mt-1.5 text-sm leading-snug text-slate-600 dark:text-gray-400">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="capabilities" className="scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
            Current product capabilities
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-slate-600 dark:text-gray-400">
            The following modules are implemented in this codebase. Scope may
            evolve with your roadmap.
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Membership & CRM',
                desc: 'Member profiles, membership plans, freeze status, trainer assignment, health notes.',
              },
              {
                title: 'Billing & documents',
                desc: 'Payment recording, history, Razorpay order helpers when keys are supplied, PDF invoices.',
              },
              {
                title: 'Attendance',
                desc: 'Manual check-in/out and QR-assisted visits with retained history.',
              },
              {
                title: 'Sales pipeline',
                desc: 'Lead capture, status workflow, conversion into member accounts.',
              },
              {
                title: 'Programs & assets',
                desc: 'Class scheduling and bookings; equipment inventory and maintenance tracking.',
              },
              {
                title: 'Insights',
                desc: 'Dashboard KPIs and Chart.js visualizations; analytics and CSV exports for finance and ops.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 p-6 shadow-sm transition hover:border-emerald-300/60 dark:border-white/10 dark:from-charcoal/80 dark:to-ink dark:hover:border-neon/20"
              >
                <div className="mb-3 h-1 w-10 rounded-full bg-emerald-500/80 dark:bg-neon/70" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-gray-400">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="approach"
        className="scroll-mt-20 border-t border-slate-200 bg-white/60 px-4 py-20 sm:px-6 dark:border-white/10 dark:bg-charcoal/90"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
              Operations-first, not promotion-first
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-gray-400">
              Some vendors lead with member incentives and partner ecosystems.
              GymFlow focuses on{' '}
              <strong className="font-medium text-slate-800 dark:text-gray-200">
                day-to-day administration
              </strong>
              : renewals, cash flow visibility, attendance discipline, and staff
              coordination—areas where accuracy matters as much as acquisition.
            </p>
            <ul className="mt-8 space-y-4 text-sm leading-relaxed">
              {[
                'Data resides in MongoDB under your deployment—not a black box you cannot inspect.',
                'Role-based access control aligned to gym hierarchy (e.g. owner, manager, trainer, staff, member).',
                'Interface optimized for extended administrative use.',
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500 dark:bg-neon" />
                  <span className="text-slate-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-900/10 dark:border-white/10 dark:bg-ink dark:shadow-2xl dark:shadow-black/40">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-800 dark:text-neon">
              Executive summary
            </p>
            <p className="mt-4 text-xl font-semibold leading-snug text-slate-900 md:text-2xl dark:text-white">
              Revenue clarity, utilisation patterns, and renewal risk—in one
              controlled environment.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-gray-400">
              The objective is to reduce reconciliation effort and manual
              follow-up by keeping authoritative records in a single system of
              record for the gym.
            </p>
          </div>
        </div>
      </section>

      <section id="comparison" className="scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
            How GymFlow differs in positioning
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-slate-600 dark:text-gray-400">
            Illustrative contrast only—not a statement about any specific
            competitor. Many reputable vendors combine marketing programs with
            software; GymFlow is scoped narrowly to{' '}
            <span className="text-slate-500 dark:text-gray-400">internal operations tooling</span>.
          </p>
          <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200/90 dark:border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-charcoal">
                <tr>
                  <th className="px-4 py-4 font-semibold text-slate-500 dark:text-gray-400">
                    Dimension
                  </th>
                  <th className="px-4 py-4 font-semibold text-slate-500 dark:text-gray-400">
                    Marketing / incentive-led programs
                  </th>
                  <th className="px-4 py-4 font-semibold text-emerald-700 dark:text-neon">
                    GymFlow (this product)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {[
                  [
                    'Primary value',
                    'Member perks, partnerships, promotional bundles',
                    'Administrative control: CRM, billing, attendance, reporting',
                  ],
                  [
                    'Deployment',
                    'Typically vendor-hosted SaaS',
                    'Self-hosted; you operate the Node API and database',
                  ],
                  [
                    'Success metric (typical)',
                    'Acquisition and engagement campaigns',
                    'Operational accuracy, renewal visibility, exportable records',
                  ],
                ].map(([a, b, c]) => (
                  <tr key={a} className="bg-slate-50/80 dark:bg-ink/40">
                    <td className="px-4 py-4 align-top font-medium text-slate-900 dark:text-white">
                      {a}
                    </td>
                    <td className="px-4 py-4 align-top text-slate-600 dark:text-gray-400">{b}</td>
                    <td className="px-4 py-4 align-top text-slate-800 dark:text-gray-200">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-xs leading-relaxed text-slate-500 dark:text-gray-400">
            Organizations may use both strategic marketing initiatives and
            internal systems; GymFlow addresses only the latter category.
          </p>
        </div>
      </section>

      <section className="px-4 pb-24 pt-4 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-slate-50 px-8 py-14 text-center shadow-sm dark:border-neon/15 dark:from-neon/10 dark:via-charcoal dark:to-ink dark:shadow-none">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            Evaluate GymFlow on your stack
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-gray-400">
            Install locally or on your server, configure environment variables,
            run database migrations via seed scripts if desired, and onboard
            users through the registration and role workflow.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-neon px-8 py-3 text-sm font-semibold text-black hover:bg-neonDim"
            >
              Create account
            </Link>
            <a
              href="#capabilities"
              className="rounded-xl border border-slate-300 px-8 py-3 text-sm font-semibold text-slate-800 hover:border-emerald-500/50 dark:border-white/20 dark:text-white dark:hover:border-neon/35"
            >
              Review capabilities
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-4 py-10 text-center text-xs text-slate-600 sm:px-6 dark:border-white/10 dark:text-gray-400">
        <p className="font-semibold text-slate-700 dark:text-gray-300">GymFlow</p>
        <p className="mx-auto mt-2 max-w-lg leading-relaxed text-slate-600 dark:text-gray-400">
          Gym operations software. Independent product; not endorsed by or
          affiliated with third-party gym marketing or booster programs.
        </p>
        <div className="mt-4 flex justify-center gap-6">
          <Link to="/login" className="text-slate-700 transition hover:text-emerald-700 dark:text-gray-300 dark:hover:text-neon">
            Sign in
          </Link>
          <Link to="/register" className="text-slate-700 transition hover:text-emerald-700 dark:text-gray-300 dark:hover:text-neon">
            Register
          </Link>
        </div>
      </footer>

      <FeatureNarrationBar variant="marketing" />
    </div>
  );
}
