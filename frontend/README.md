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

All data is mock data stored in `localStorage`. No backend or real APIs are used — but every
button does something real inside the prototype (state changes, generated files, native share).

## Things you can actually do

| Feature | What really happens |
| --- | --- |
| **Share Garuda Passport (Story Studio)** | Renders a real PNG on a canvas — Story (1080 × 1920) or Feed post (1080 × 1080). Pick a preset theme or your **own colours** (primary / secondary / accent), mascot, headline & caption, and toggle map / stamps / badges / stats / member ID. Live preview; **Save image** downloads it, **Share** opens the native share sheet. Choices are remembered. |
| **Boarding pass → Share / Wallet** | Same: a real PNG of the pass is generated and saved. |
| **Add to Calendar** | Downloads a standards-compliant `.ics` event (works with Google / Apple / Outlook). |
| **Share itinerary** | Native share sheet, or copies the itinerary to the clipboard. |
| **Miles goal** | Set any reward as your goal; Home and GarudaMiles track miles-to-go and flights-to-go. |
| **GarudaMiles** | Redeeming deducts miles, issues a voucher (My Rewards) with a code + QR; vouchers can be applied to a trip. Completing a journey credits miles + tier bonus. Claim missing miles, export a CSV statement, miles calculator. |
| **Checkout** | Promo codes `GARUDA10`, `BALI15`, `MILES2026` apply a real discount; **Cash + Miles** lets you pay part of the fare with miles (slider). |
| **Trips → Add trip** | Retrieve demo bookings `KD7P2Q` (Wijaya) and `BX3W8N` (Anggraini). |
| **More menu** | BidUpgrade, lounge, carbon offset, airport transfer, car rental, roaming, hotels, experiences, GarudaShop, feedback, lost & found, refunds, charter quotes, KirimAja tracking, travel-document check, saved passengers, payment methods, privacy (password, devices, data export as JSON). All persist. |
| **Support** | In-app chat assistant with deep links; WhatsApp / phone / email open real `wa.me`, `tel:` and `mailto:` links. |

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
