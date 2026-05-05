import { useEffect, useState } from 'react';

/** Friendly one-line tips — dashboard (staff) */
const APP_TIPS = [
  'Use the search bar at the top to quickly open a member profile or spot an invoice number.',
  'Members → Add member lets you attach a referral code if they were introduced by someone.',
  'Attendance supports both front-desk check-in and QR codes — great for busy mornings.',
  'Payments → Download saves a PDF invoice using the data already in your system.',
  'Under Reports you can export CSV files for accounting or deeper analysis in Excel.',
  'Advanced ops (sidebar) holds reminders, campaigns, inventory, webhooks, and GDPR tools — managers only.',
  'Renewal reminders email members before their plan ends when SMTP is configured in your server settings.',
  'Your role controls what you see: owners and managers get the full gym toolkit; other roles see a narrower view.',
  'Live alerts appear as small toasts when staff send notifications — stay signed in to receive them.',
  'Franchise rollup summarizes revenue across branches when gyms are linked with a parent gym ID.',
];

/** Friendly lines — public landing page */
const MARKETING_TIPS = [
  'GymFlow keeps members, billing, and attendance in one place — fewer spreadsheets, fewer mistakes.',
  'You stay in control: deploy on your servers and keep data in your own MongoDB database.',
  'Role-based access means front desk, trainers, and owners each see what they need — nothing extra.',
  'From QR check-ins to renewal reminders, the product is built for real daily gym operations.',
  'Exports and dashboards help you answer “who paid?” and “who’s active?” without digging through files.',
];

/**
 * Fixed bottom strip with rotating tips.
 * @param {{ variant?: 'app' | 'marketing' }} props
 */
export default function FeatureNarrationBar({ variant = 'app' }) {
  const tips = variant === 'marketing' ? MARKETING_TIPS : APP_TIPS;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % tips.length);
    }, 10000);
    return () => clearInterval(id);
  }, [tips.length]);

  const label = variant === 'marketing' ? 'Quick note' : 'Tip';

  /** Matches DashboardLayout `lg:pl-[calc(16rem+2rem)]` (w-64 sidebar + gap) */
  const shellInset =
    variant === 'app' ? 'left-0 lg:left-[calc(16rem+2rem)]' : 'left-0';

  return (
    <div
      className={`pointer-events-none fixed bottom-0 right-0 z-30 border-t border-white/[0.07] bg-[#070809]/92 px-4 py-3 shadow-[0_-12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl ${shellInset}`}
      role="region"
      aria-label="Feature tips"
    >
      <div className="pointer-events-auto mx-auto flex max-w-5xl flex-col items-center gap-1 text-center sm:flex-row sm:justify-center sm:gap-3 sm:text-left">
        <span className="shrink-0 rounded-full border border-neon/25 bg-neon/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neon">
          {label}
        </span>
        <p
          className="text-xs leading-relaxed text-gray-400 sm:text-sm"
          aria-live="polite"
          aria-atomic="true"
        >
          {tips[index]}
        </p>
      </div>
      <div
        className="pointer-events-auto mx-auto mt-2 flex max-w-[200px] justify-center gap-1"
        aria-hidden="true"
      >
        {tips.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all ${
              i === index ? 'w-4 bg-neon' : 'w-1 bg-white/15'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
