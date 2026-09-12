# FlyGaruda — Redesigned Mobile-First Prototype

A high-fidelity, mobile-first web prototype of the redesigned **FlyGaruda** application,
built as a proof-of-concept for **Pillar 1 — Activate the Journey: Make Every Step Seamless**.

> Discover the Value → Book Effortlessly → Travel Confidently

## Stack

React 18 · Vite · TypeScript · Tailwind CSS · Lucide React · Recharts · React Router

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL. The app renders as a centered mobile viewport on desktop and full-width on phones.

## Demo account

| Field    | Value                 |
| -------- | --------------------- |
| Email    | demo@flygaruda.app    |
| Password | FlyGaruda2026         |

All data is mock data stored in `localStorage`. No backend or real APIs are used.

## Main demo path

Onboarding → Home → Search CGK → DPS → Results (Garuda Value Card) → Value Breakdown →
Select Fare → Checkout → Confirmation → My Trip → Journey Companion → Check-in →
Seat Selection → Boarding Pass → Flight Update (disruption)

Use **More → Prototype Controls** to reset the demo, simulate a disruption, change the journey stage or preview offline mode.

## Structure

```
src/
  components/   common · booking · trips · journey · miles
  pages/        every screen
  data/         seeded dummy data (airports, flights, fares, trips, user, miles, notifications, offers, more)
  store/        app state + localStorage persistence
  hooks/ utils/ types/ layouts/
```
