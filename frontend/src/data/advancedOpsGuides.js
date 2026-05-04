/**
 * Plain-language narration for each Advanced operations tab (manager UI).
 */
export const ADVANCED_OPS_GUIDES = {
  audit: {
    title: 'Audit log',
    subtitle: 'Who did what, and when',
    intro:
      'Every sensitive action in Advanced ops is recorded here in order. Think of it as a tamper-friendly diary for owners and auditors.',
    bullets: [
      'Rows appear newest first; use them to trace payments, GDPR actions, API keys, and more.',
      'If something looks wrong, match the timestamp with staff shifts or camera logs outside GymFlow.',
      'This list is read-only — it reflects what the server stored at the time of the action.',
    ],
  },
  referrals: {
    title: 'Referrals',
    subtitle: 'Reward word-of-mouth in a structured way',
    intro:
      'Generate a unique code for a member so new joiners can enter it when they sign up. The system links the new profile back to the referrer for reporting.',
    bullets: [
      'Tap Generate next to a member to create a fresh GF- style code.',
      'When adding a member elsewhere in the app, use the optional referral code field.',
      'Use “Show referral stats” for a quick count of how many members arrived via referrals.',
    ],
  },
  trials: {
    title: 'Trials & drop-ins',
    subtitle: 'Time-bound visits without a full membership',
    intro:
      'Use this when someone gets a short gym trial or a paid single-day drop-in. You define the window; staff can honour it at the desk.',
    bullets: [
      'Choose Trial for onboarding visits or Drop-in for one-off guests.',
      'Set valid From / To carefully — they drive whether the pass is still “active”.',
      'You can extend this later to tie passes into automatic gate or QR rules.',
    ],
  },
  subscriptions: {
    title: 'Subscriptions',
    subtitle: 'Recurring billing records',
    intro:
      'Here you store subscription rows that mirror plans in the real world. Gateway IDs (Razorpay / Stripe) can be filled when you connect live billing.',
    bullets: [
      'Pick a member and paste the Membership plan ID from your Plans screen.',
      'Statuses like active or past_due help finance follow up before access issues.',
      'Automated charging still depends on your payment provider setup outside this form.',
    ],
  },
  waivers: {
    title: 'Waivers & signatures',
    subtitle: 'Proof that policies were accepted',
    intro:
      'Create a template once (title + legal text + version). When a member signs, GymFlow stores who, when, and from which IP — alongside the template version.',
    bullets: [
      'Update the version string whenever you change wording so old signatures stay interpretable.',
      'Recording a signature is a manager action; members don’t need to log in here.',
      'Keep PDF URLs empty unless you upload signed PDFs elsewhere and paste links.',
    ],
  },
  inventory: {
    title: 'POS & stock',
    subtitle: 'Merch and supplements at the front desk',
    intro:
      'Products hold price and stock. When you record a sale, stock decreases automatically so counts stay honest.',
    bullets: [
      'Add products before selling — SKU is optional but helps scanning later.',
      'Walk-in sales work without a member; attach a member if the purchase should stay on their profile.',
      'Price override on sale is optional; leave blank to use the product’s default price.',
    ],
  },
  shifts: {
    title: 'Shifts',
    subtitle: 'Who was on duty, and payroll hints',
    intro:
      'Log staff shifts with start and end times. You can snapshot an hourly rate for exports to payroll spreadsheets.',
    bullets: [
      'Paste the staff user’s MongoDB ID from user settings or database exports until a picker exists.',
      'Commission notes are free text for PT bonuses or promo payouts.',
      'Use this together with Attendance reports to reconcile busy hours.',
    ],
  },
  tasks: {
    title: 'Opening & closing checklists',
    subtitle: 'Repeatable routines for reliability',
    intro:
      'Templates are lists of plain-text steps. Staff complete a run when the checklist is finished — great for hygiene, cash drawer, or equipment rounds.',
    bullets: [
      'Put one step per line when saving a template.',
      'Recent completions show below so managers know routines happened.',
      'Swap paper checklists gradually — same habits, better traceability.',
    ],
  },
  campaigns: {
    title: 'Campaigns',
    subtitle: 'Email today; SMS / WhatsApp stubs',
    intro:
      'Build a message, pick an audience segment, save as draft, then Send. Email uses SMTP when configured; other channels log to the console until you plug a provider.',
    bullets: [
      'Segments like “Expiring 7d” focus on renewals without spamming everyone.',
      'Always proofread — sends go to real member emails when SMTP is live.',
      'For WhatsApp/SMS you’ll later add API keys from vendors like Twilio or MSG91.',
    ],
  },
  webhooks: {
    title: 'Webhooks',
    subtitle: 'Notify your other systems instantly',
    intro:
      'Register a URL and event names (or * for all). GymFlow POSTs JSON with an HMAC signature your server can verify.',
    bullets: [
      'Copy the secret immediately — it is only shown once when you create the webhook.',
      'Try sale.created, trial.created, subscription.created, renewal.reminder_batch, or *.',
      'Failed deliveries increment a counter you can monitor in your logs.',
    ],
  },
  apikeys: {
    title: 'API keys',
    subtitle: 'Safe access for integrations',
    intro:
      'Keys unlock read-only search over HTTP for scripts or partner tools. The raw key is shown once; store it in a password manager.',
    bullets: [
      'Call GET /api/integration/search?q=… with header X-Api-Key: your_key.',
      'Rotate keys by deleting old ones and generating a new key.',
      'Never commit keys to Git or paste them into public chat.',
    ],
  },
  reminders: {
    title: 'Renewal reminders',
    subtitle: 'Friendly nudge before memberships lapse',
    intro:
      'This job finds members whose plans expire soon and emails them (or logs a stub). Configure SMTP in the backend .env for real delivery.',
    bullets: [
      'Default window is 14 days — adjust in the API later if you need tighter timing.',
      'Members won’t get duplicate emails within a few days — the server debounces lightly.',
      'Pair this with Campaigns for richer renewals messaging.',
    ],
  },
  backup: {
    title: 'Backup JSON',
    subtitle: 'Portable snapshot, not a full database clone',
    intro:
      'Downloads members, payments, leads, and products as one JSON file — handy before migrations or accountant hand-offs.',
    bullets: [
      'This is not a replacement for MongoDB backups — schedule those at the infrastructure level too.',
      'Sensitive fields may still be inside; encrypt files at rest if you email them.',
      'Restoring means writing custom import scripts — treat exports as archives.',
    ],
  },
  gdpr: {
    title: 'GDPR-style export & anonymize',
    subtitle: 'Respect privacy requests carefully',
    intro:
      'Export bundles a member’s payments, attendance, and waiver signatures for portability. Anonymize scrubs personal identifiers from the linked user account.',
    bullets: [
      'Only run anonymize after legal review — it is intended for legitimate erasure requests.',
      'Exported JSON may still contain historical transaction amounts.',
      'Always log who performed the action — your audit trail captures it.',
    ],
  },
  franchise: {
    title: 'Franchise rollup',
    subtitle: 'See branches under one parent gym',
    intro:
      'When child gyms point their parentGymId field at a headquarters record, this summary adds revenue and member counts across the family.',
    bullets: [
      'Leave parent ID empty to default to your own gym as the parent anchor.',
      'Use Mongo IDs from Settings or your database tool until a visual picker ships.',
      'Perfect for regional owners comparing locations fairly.',
    ],
  },
};
