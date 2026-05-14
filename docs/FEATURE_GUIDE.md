# Gym Flow — feature guide

This document describes what each part of the dashboard does and how everyday workflows fit together. For developer setup (MongoDB, env, seed users), see the project [README](../README.md).

### Public pages (before login)

- **Landing** (`/`) — marketing / entry.
- **Login** (`/login`), **Register** (`/register`), **Forgot password** (`/forgot-password`) — auth flows; the staff app lives under **`/app`** after login.

---

## Roles and access

The API uses **JWT** login; each user has a **role** that limits what they can see or change.

| Role | Typical use |
|------|-------------|
| **SuperAdmin / GymOwner / Manager** | Full staff dashboard, reports, most configuration, **Advanced ops** (sidebar link). |
| **Trainer / Staff** | Day-to-day operational screens your gym enables (no Advanced ops link). |
| **Member** | Limited API access by design; not the primary admin experience. |

**Advanced ops** appears in the sidebar only for **SuperAdmin**, **GymOwner**, and **Manager**.

---

## Navigation and layout

- **Sidebar** (large screens): grouped links under Overview, Plans & billing, Team & floor, Growth, System — plus **Advanced ops** when allowed.
- **Mobile drawer**: same destinations on small screens.
- **Global search**: command-style lookup across **members**, **leads**, and **invoice numbers** (staff API; type at least two characters).
- **Create / Add** (red button under the logo): **Add member**, **Add enquiry / lead**, **Schedule class / appointment**, **Record expense**, **New gym content**.

---

## Overview

### Dashboard (`/app`)

High-level stats and charts for your gym (traffic, revenue summaries, etc., as wired on the page). Use it as the morning snapshot before drilling into Members or Payments.

**Overdue collections** on the home dashboard lists each late pending due as **From** (the member who owes) **→ To** (your gym, where you collect). Personal training dues also show **PT credit: trainer name** so you see which trainer that row is attributed to. Stat tiles summarize overdue **count** and **total amount**. Use **Open in Payments** for the full list and **Mark paid**.

### Enquiry — Leads (`/app/leads`)

Capture and track **prospects**: status, source, follow-up notes. Convert interested leads into members when they join.

### Members (`/app/members`)

List and manage **member profiles** linked to user accounts. Open a member for detail:

### Member profile (`/app/members/:id`)

Single-member view: plan context, history, and actions your build exposes (photos, notes, etc.).

### Follow up (`/app/follow-up`)

Task-style **follow-ups** for staff (calls, visits, renewals). Keeps pipeline work visible.

### Appointment — Classes (`/app/classes`)

**Class / appointment** scheduling: sessions members can book or attend, trainer linkage where applicable.

---

## Plans & billing

### Membership plans (`/app/plans`)

Define **plan templates** (duration, price, rules). These are referenced when selling memberships.

### Memberships (`/app/memberships`)

Assign **active membership rows** to members (start/end, plan reference). Bridges “what we sell” and “who is on what.”

### Payments (`/app/payments`)

Central place for **money in**:

| Concept | How to use it |
|--------|----------------|
| **Categories** | **Membership / renewal** — normal fees. **Advance / hold booking** — deposits to reserve a name or slot. **Personal training** — PT fees (separate from membership). **Other** — miscellaneous. |
| **Personal training** | Choose category **Personal training** and select the **trainer** so PT revenue is attributed correctly in lists and exports. |
| **Received now** | Records **completed** payment (money collected today). |
| **Pending — due on date** | Records an amount **still owed**; **due date** is required. Appears in filters for **overdue** and **due within N days**. |
| **Notes** | Free text (e.g. “Hold for Ravi”, “Installment 2/3”, “10 PT sessions”). |
| **Mark paid** | On pending rows, marks the due as **completed** (default method cash; adjustable via API if you extend the UI). |
| **Filters & quick actions** | Filter by method, status, date range, member, category, trainer, overdue / due-soon. Export **revenue CSV** from the button in the header (includes category, trainer, due date, notes when present). |
| **Invoices** | **Download** PDF per row where supported; PDFs use your logged-in session. |

**Razorpay**: optional test/live checkout when keys are configured; without keys you may see mock behaviour.

### Reports (`/app/reports`)

- **CSV downloads**: **Revenue** (paid invoice rows), **Attendance** (check-ins), **Membership** (roster-style export).
- **Analytics JSON**: raw `/reports/analytics` payload on screen for debugging or future charts.

Use together with **Payments → Export revenue CSV** when you want the richer payment fields (category, trainer, due date, notes) from the Payments page header.

---

## Team & floor

### Employees — Trainers (`/app/trainers`)

**Trainer / staff** records: expertise, assignments, schedules. Required for attributing **personal training** payments.

### Planners (`/app/planners`)

Planning views for programmes or schedules (depends on how your gym uses the module).

### Attendance (`/app/attendance`)

Check-ins / attendance tracking (manual or QR-related flows where implemented).

### Workouts (`/app/workouts`)

Workout templates or logs for programming member training.

### Nutrition — Diets (`/app/diets`)

Diet plans assigned or stored per your workflow.

### Equipment (`/app/equipment`)

Equipment inventory and maintenance-style tracking for the floor.

---

## Growth

### Contents (`/app/contents`)

Gym-facing **content** (tips, notices, media references) managed from the dashboard.

### Expense (`/app/expense`)

Record **operating expenses** to contrast with revenue from Payments/reports.

### Advertisements (`/app/ads`)

Track or schedule **promotional / ad** activity your build supports.

---

## System

### Configurations — Settings (`/app/settings`)

**Gym profile**, branding, integrations (where exposed), and preferences. Multi-gym / franchise hints may appear here depending on data model.

### Tutorial (`/app/tutorial`)

In-app orientation; links to **Advanced ops** where relevant.

---

## Advanced ops (`/app/admin`)

**Manager-only** operations centre. Each tab has an in-app **guide panel** (expandable narration). Summary:

| Tab | Purpose |
|-----|---------|
| **Audit log** | Read-only trail of sensitive actions. |
| **Referrals** | Referral codes and stats (GF-style codes). |
| **Trials / drop-ins** | Time-bound passes without full membership. |
| **Subscriptions** | Recurring billing records (gateway IDs when connected). |
| **Waivers** | Templates and recorded signatures / versions. |
| **POS & stock** | Products and sales; stock decreases on sale. |
| **Shifts** | Staff shifts (payroll hints). |
| **Checklists** | Opening/closing templates and completion runs. |
| **Campaigns** | Email campaigns (SMTP when configured). |
| **Webhooks** | Outbound HTTP notifications with HMAC. |
| **API keys** | Read-only integration search (`X-Api-Key`). |
| **Renewal reminders** | Batch reminders before memberships lapse. |
| **Backup JSON** | Portable export snapshot (not a full DB replacement). |
| **GDPR export / erase** | Member data export and anonymize (use with legal care). |
| **Franchise rollup** | Aggregate view when child gyms link to a parent. |

---

## Notifications and real-time behaviour

When enabled, **Socket.io** can push **notifications** to the dashboard (new alerts from the API). Behaviour depends on server configuration.

---

## Tips for daily operations

1. **Morning**: Dashboard → **Follow up** → **Payments** (overdue quick filter).
2. **New joiner**: **Leads** → convert → **Members** → **Memberships** + **Payments** (membership category).
3. **PT sale**: **Payments** → category **Personal training** → pick **trainer** → record amount.
4. **Deposit / hold**: **Payments** → **Advance / hold booking** → notes with name/slot → **Received now** or **Pending** with due date for the balance.
5. **Month-end**: **Reports** + **Export revenue CSV** + **Expense** page.

---

## Where to get help in the product

- **Tutorial** (`/app/tutorial`) for guided overview.
- **Advanced ops**: use the **guide panel** on each tab for plain-language bullets.
- **README** for local run, env vars, demo logins, and deployment notes.

If something is missing from this guide, it may be a newer screen; check the sidebar labels and this file’s route table for the source of truth.
