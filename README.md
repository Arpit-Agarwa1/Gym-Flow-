# GymFlow (MERN) — beginner-friendly setup

**GymFlow** is a gym operations dashboard: **MongoDB + Express API** and a **React (Vite) dashboard**.

This project folder on disk is **`Gym Flow`** (matches the product name **Gym Flow** / **GymFlow**).

## What you need installed

1. **Node.js** (LTS version is fine)
2. **MongoDB** running locally  
   - Easiest test: `brew services start mongodb-community` (Mac)  
   - Or Docker: `docker run -d -p 27017:27017 --name mongo mongo:7`

## Quick start (copy–paste)

Always `cd` into the folder using quotes (because of the space in the name):

```bash
cd "Gym Flow"
npm install
```

Create backend env file:

```bash
cp backend/.env.example backend/.env
```

Make sure `backend/.env` has at least:

```env
MONGO_URI=...your connection string...
JWT_SECRET=dev-secret-change-me
CLIENT_URL=http://localhost:5173
```

### Connect **your** MongoDB

The API reads **`MONGO_URI`** from `backend/.env` (see `backend/config/db.js`). You only change that one variable.

| Where Mongo runs | What to put in `MONGO_URI` |
|------------------|----------------------------|
| **This computer** | `mongodb://127.0.0.1:27017/gymflow` (Mongo must be installed & running) |
| **Same computer + login** | `mongodb://USER:PASSWORD@127.0.0.1:27017/gymflow?authSource=admin` |
| **MongoDB Atlas** | Open [Atlas](https://cloud.mongodb.com) → your cluster → **Connect** → **Drivers** → copy the URI. Replace `<password>` with your database user password (if the password has `@`, `#`, etc., [URL-encode](https://www.urlencoder.org/) it). Change the database name at the end to `gymflow` if you like. |

**Atlas checklist:** create a database user, enable **Network Access** for your IP (or `0.0.0.0/0` only for testing), then paste the URI into `.env`.

After updating `.env`, run **`npm run seed`** once to create demo data in **your** cluster (optional).

Load **example gym + users**:

```bash
npm run seed
```

Start **API + website** together:

```bash
npm run dev
```

- Website: http://localhost:5173 (Vite may pick 5174+ if busy)  
- API: http://localhost:5000/api/health  

**Mac tip:** AirPlay Receiver often uses port **5000**. If you see `EADDRINUSE`, set `PORT=5050` in `backend/.env` and set `VITE_API_URL=http://localhost:5050/api` in `frontend/.env`, then restart.

### Demo logins (after seed)

| Role   | Email             | Password      |
|--------|-------------------|---------------|
| Owner  | owner@example.com | password123   |
| Manager| manager@example.com | password123 |
| Member | member@example.com | password123  |

Use **Owner** or **Manager** for the admin dashboard. **Member** accounts have limited API access by design.

## How the pieces fit (simple words)

- **Backend** saves everything in **MongoDB** (members, payments, attendance, etc.).
- **JWT** is a signed ticket: after login, the browser sends `Authorization: Bearer …` on each request.
- **Roles** (Owner, Manager, Trainer, …) decide which routes you can hit.
- **Razorpay / Cloudinary / Firebase** are **optional**. If keys are missing, the app still runs (payments fall back to “mock” orders; photos save under `/uploads`).
- **Socket.io** pushes live notifications to the dashboard when the API creates them.

## Folder map

```
Gym Flow/
├── backend/     Express API (routes → controllers → services → models)
├── frontend/    React + Vite + Tailwind + Redux Toolkit + Chart.js
└── package.json runs both with `npm run dev`
```

## Production notes (later)

- Change `JWT_SECRET`, enable real SMTP for password reset, lock down open Register routes, and host MongoDB with backups.
- Point `CLIENT_URL` to your real website URL for CORS.

## Tip: spaces in the folder name

Tools and terminals need the path quoted, e.g. `cd "Gym Flow"`. If you prefer no spaces later, you can rename the folder to `gym-flow` or `GymFlow` and update your IDE project root.
