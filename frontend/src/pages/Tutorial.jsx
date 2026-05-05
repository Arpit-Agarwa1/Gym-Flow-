import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Getting started',
    body: 'Sign in with an Owner or Manager account after seeding demo data. Configure MongoDB and JWT in backend `.env`, then run `npm run dev` from the Gym Flow folder.',
  },
  {
    title: 'Create / Add menu',
    body: 'Use the red Create / Add button in the sidebar for shortcuts: new member, lead, class, expense, or content.',
  },
  {
    title: 'Enquiries & follow-up',
    body: 'Capture leads under Leads. Set next follow-up dates and notes on the Follow up screen so callbacks stay visible.',
  },
  {
    title: 'Memberships & billing',
    body: 'Memberships lists plan and expiry for everyone. Record payments under Payments; optional Razorpay keys unlock live checkout.',
  },
  {
    title: 'Attendance & planners',
    body: 'Check members in from Attendance. Planners links workouts, diets, and classes; managers may attach recurring subscriptions.',
  },
  {
    title: 'Reports & exports',
    body: 'Download CSV exports from Reports for accounting. Expenses tracks outbound cash separately from revenue.',
  },
];

/**
 * In-app orientation — static tips (Gymshim-style tutorial entry).
 */
export default function Tutorial() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Tutorial</h1>
        <p className="text-sm text-gray-400">
          Quick orientation for Gym Flow operators — no external link required.
        </p>
      </div>

      <ol className="space-y-6">
        {sections.map((s, i) => (
          <li
            key={s.title}
            className="rounded-2xl border border-white/10 bg-charcoal p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-neon">
              Step {i + 1}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">{s.body}</p>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-neon/20 bg-neon/5 p-5 text-sm text-gray-300">
        <p className="font-medium text-white">Shortcuts</p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          <li>
            <Link className="text-neon hover:underline" to="/app">
              Dashboard
            </Link>
          </li>
          <li>
            <Link className="text-neon hover:underline" to="/app/leads">
              Leads
            </Link>
          </li>
          <li>
            <Link className="text-neon hover:underline" to="/app/follow-up">
              Follow up
            </Link>
          </li>
          <li>
            <Link className="text-neon hover:underline" to="/app/memberships">
              Memberships
            </Link>
          </li>
          <li>
            <Link className="text-neon hover:underline" to="/app/settings">
              Settings
            </Link>
          </li>
          <li>
            <Link className="text-neon hover:underline" to="/app/admin">
              Advanced ops
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
