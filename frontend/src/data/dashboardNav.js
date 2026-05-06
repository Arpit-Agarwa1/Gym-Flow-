/** Roles that see Advanced ops in navigation */
export const MANAGER_UI_ROLES = ['SuperAdmin', 'GymOwner', 'Manager'];

/** @typedef {{ to: string; label: string; end?: boolean }} NavItem */
/** @typedef {{ title: string; items: NavItem[] }} NavGroup */

/** @type {NavGroup[]} Grouped sidebar / mobile drawer links */
export const dashboardNavGroups = [
  {
    title: 'Overview',
    items: [
      { to: '/app', label: 'Dashboard', end: true },
      { to: '/app/leads', label: 'Enquiry' },
      { to: '/app/members', label: 'Members' },
      { to: '/app/follow-up', label: 'Follow up' },
      { to: '/app/classes', label: 'Appointment' },
    ],
  },
  {
    title: 'Plans & billing',
    items: [
      { to: '/app/plans', label: 'Membership plans' },
      { to: '/app/memberships', label: 'Memberships' },
      { to: '/app/payments', label: 'Payments' },
      { to: '/app/reports', label: 'Reports' },
    ],
  },
  {
    title: 'Team & floor',
    items: [
      { to: '/app/trainers', label: 'Employees' },
      { to: '/app/planners', label: 'Planners' },
      { to: '/app/attendance', label: 'Attendance' },
      { to: '/app/workouts', label: 'Workouts' },
      { to: '/app/diets', label: 'Nutrition' },
      { to: '/app/equipment', label: 'Equipment' },
    ],
  },
  {
    title: 'Growth',
    items: [
      { to: '/app/contents', label: 'Contents' },
      { to: '/app/expense', label: 'Expense' },
      { to: '/app/ads', label: 'Advertisements' },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/app/settings', label: 'Configurations' },
      { to: '/app/tutorial', label: 'Tutorial' },
    ],
  },
];
