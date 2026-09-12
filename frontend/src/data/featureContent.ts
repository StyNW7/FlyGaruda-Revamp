export interface FeatureContent {
  intro: string
  highlights?: { title: string; description: string }[]
  sections?: { title: string; items: string[] }[]
  faqs?: { q: string; a: string }[]
  cta?: { label: string; to?: string; message?: string }
  note?: string
}

export const FEATURE_CONTENT: Record<string, FeatureContent> = {
  'flight-schedule': {
    intro: 'Daily timetable for Garuda Indonesia routes. Times are local and subject to seasonal changes.',
    sections: [
      { title: 'Jakarta (CGK) → Denpasar (DPS)', items: ['GA 400 · 06:15 – 08:05 · Daily', 'GA 412 · 08:20 – 10:10 · Daily', 'GA 420 · 12:45 – 14:35 · Daily', 'GA 428 · 17:30 – 19:30 · Daily'] },
      { title: 'Jakarta (CGK) → Singapore (SIN)', items: ['GA 824 · 06:15 – 09:05 · Daily', 'GA 860 · 07:40 – 10:30 · Daily', 'GA 832 · 12:45 – 15:35 · Daily', 'GA 838 · 17:30 – 20:30 · Daily'] },
      { title: 'Jakarta (CGK) → Tokyo Haneda (HND)', items: ['GA 874 · 23:30 – 08:40 (+1) · Daily', 'GA 876 · 08:20 – 17:30 · Mon, Wed, Fri, Sun'] },
    ],
    cta: { label: 'Search flights', to: '/book' },
  },
  'baggage-information': {
    intro: 'Every Garuda fare includes checked baggage. Allowances vary by cabin, fare and GarudaMiles tier.',
    highlights: [
      { title: 'Economy', description: '20 kg checked · 7 kg cabin (demo allowance)' },
      { title: 'Business', description: '40 kg checked · 2 × 7 kg cabin' },
      { title: 'GarudaMiles Silver', description: '+5 kg on Garuda-operated flights' },
    ],
    sections: [
      { title: 'Cabin baggage rules', items: ['Max 56 × 36 × 23 cm', 'Power banks and spare batteries in cabin only', 'Liquids up to 100 ml each in a clear bag (international)'] },
      { title: 'Restricted items', items: ['Flammable liquids, gases and aerosols', 'Lighters and matches in checked baggage', 'Sharp objects in cabin baggage'] },
    ],
    cta: { label: 'Excess baggage calculator', to: '/more/excess-baggage-calculator' },
  },
  'travel-docs': {
    intro: 'Make sure your documents are ready before you fly. Requirements depend on nationality and destination.',
    sections: [
      { title: 'Domestic flights', items: ['Valid KTP, passport or driving licence', 'Children: birth certificate or family card', 'Boarding pass on your phone or printed'] },
      { title: 'International flights', items: ['Passport valid at least 6 months from arrival', 'Visa or visa-on-arrival where required', 'Return or onward ticket may be requested'] },
    ],
    cta: { label: 'Check requirements for my trip', message: 'Your next trip Jakarta → Denpasar is domestic: KTP or passport is sufficient.' },
  },
  'travel-advisories': {
    intro: 'Operational and destination updates that may affect your journey.',
    highlights: [
      { title: 'Soekarno-Hatta Terminal 3', description: 'Road works on the airport toll road · allow 15 extra minutes until 30 Sep' },
      { title: 'Denpasar', description: 'Normal operations · afternoon showers expected this week' },
      { title: 'Tokyo Haneda', description: 'Typhoon season advisory · check status 24 hours before departure' },
    ],
    cta: { label: 'Check flight status', to: '/flight-status' },
  },
  'airport-information': {
    intro: 'Terminals, facilities and directions for airports across the Garuda network.',
    sections: [
      { title: 'Jakarta · Soekarno-Hatta (CGK)', items: ['Garuda Indonesia operates from Terminal 3', 'Garuda Lounge · Domestic Gates 10 – 16, International Gates 1 – 9', 'Skytrain connects Terminals 1, 2 and 3 every 7 minutes'] },
      { title: 'Denpasar · Ngurah Rai (DPS)', items: ['Domestic Terminal for all Garuda domestic arrivals', 'Baggage belts 1 – 8 · taxis and app-based rides at Arrival Hall'] },
    ],
    cta: { label: 'View journey companion', to: '/trips' },
  },
  'bid-upgrade': {
    intro: 'Bid for an upgrade to Business Class on eligible flights. If your bid is accepted, we notify you 48 hours before departure.',
    highlights: [
      { title: 'GA 412 · Jakarta → Denpasar', description: 'Bids open · minimum bid Rp 1,250,000' },
      { title: 'GA 860 · Jakarta → Singapore', description: 'Bids open · minimum bid Rp 2,400,000' },
    ],
    sections: [{ title: 'Business Class includes', items: ['Lie-flat or premium recliner seat', 'Priority check-in, boarding and baggage', 'Garuda Lounge access', 'Fine dining menu with Indonesian specialities'] }],
    cta: { label: 'Place a bid on GA 412', message: 'Bid of Rp 1,250,000 placed for GA 412. We will notify you 48 hours before departure.' },
  },
  'add-on': {
    intro: 'Personalise your journey with extra services, available up to 6 hours before departure.',
    highlights: [
      { title: 'Extra baggage', description: 'From Rp 275,000 per 10 kg' },
      { title: 'Preferred seat', description: 'Front rows and extra legroom from Rp 150,000' },
      { title: 'Lounge access', description: 'Garuda Indonesia Lounge · Rp 250,000' },
      { title: 'Travel protection', description: 'Delay, baggage and medical cover · Rp 68,000' },
    ],
    cta: { label: 'Manage my booking', to: '/trips' },
  },
  lounge: {
    intro: 'Relax before you fly in the Garuda Indonesia Lounge with Indonesian cuisine, showers and workspaces.',
    sections: [
      { title: 'Complimentary access', items: ['Business and First Class passengers', 'GarudaMiles Gold and Platinum members', 'SkyTeam Elite Plus members'] },
      { title: 'Purchase access', items: ['Economy passengers · Rp 250,000', 'GarudaMiles Silver · Rp 175,000'] },
    ],
    cta: { label: 'Add lounge access to GA 412', message: 'Lounge access added to GA 412 · Rp 175,000 (Silver rate)' },
  },
  'in-flight-services': {
    intro: 'Entertainment, meals and connectivity — all part of the full-service Garuda experience.',
    highlights: [
      { title: 'Entertainment', description: 'Movies, series and music on seat-back screens or your own device' },
      { title: 'Meals', description: 'Complimentary meal and beverage service on every flight' },
      { title: 'Wi-Fi', description: 'Available on wide-body aircraft · complimentary messaging' },
      { title: 'Colours magazine', description: 'Read on board or in the e-Library' },
    ],
    cta: { label: 'Open e-Library', to: '/more/e-library' },
  },
  'e-library': {
    intro: 'Read Colours magazine, newspapers and guides before and during your flight.',
    sections: [
      { title: 'This month', items: ['Colours · September 2026 · Bali Beyond the Beaches', 'Garuda News · New A330-900neo cabin', 'Onboard · Menu highlights this season'] },
      { title: 'Newspapers', items: ['Kompas', 'The Jakarta Post', 'The Straits Times'] },
    ],
    cta: { label: 'Download Colours for offline reading', message: 'Colours September 2026 saved for offline reading' },
  },
  charter: {
    intro: 'Private and group charter flights for corporate travel, sports teams, pilgrimages and special events.',
    sections: [{ title: 'Charter options', items: ['Boeing 737-800 · up to 162 passengers', 'Airbus A330-300 · up to 360 passengers', 'Cargo charter available'] }],
    cta: { label: 'Request a charter quote', message: 'Charter request submitted. Our team replies within 2 working days.' },
  },
  kirimaja: {
    intro: 'KirimAja — send parcels and cargo across Indonesia with Garuda’s network, door to door.',
    highlights: [
      { title: 'Same-day', description: 'Jakarta → Denpasar from Rp 45,000 per kg' },
      { title: 'Next-day', description: 'Nationwide from Rp 28,000 per kg' },
    ],
    cta: { label: 'Track a shipment', message: 'Enter your KirimAja airwaybill number to track a shipment.' },
  },
  'carbon-offset': {
    intro: 'Offset the estimated emissions of your flight by supporting verified reforestation projects in Indonesia.',
    highlights: [
      { title: 'GA 412 · Jakarta → Denpasar', description: 'Estimated 0.12 t CO₂ · offset for Rp 18,000' },
      { title: 'GA 860 · Jakarta → Singapore', description: 'Estimated 0.14 t CO₂ · offset for Rp 21,000' },
    ],
    sections: [{ title: 'Projects supported', items: ['Mangrove restoration · East Kalimantan', 'Community forestry · Central Sulawesi'] }],
    cta: { label: 'Offset my next flight', message: 'Thank you. 0.12 t CO₂ offset for GA 412 · Rp 18,000' },
  },
  garudashop: {
    intro: 'Garuda Indonesia merchandise and pre-ordered duty-free delivered to your seat.',
    highlights: [
      { title: 'Garuda Heritage collection', description: 'Batik scarves, model aircraft and travel accessories' },
      { title: 'Duty-free pre-order', description: 'Order 48 hours before an international flight' },
    ],
    cta: { label: 'Browse the collection', message: 'GarudaShop catalogue opens in the live app' },
  },
  'things-to-do': {
    intro: 'Curated tours and experiences at your destination, bookable with GarudaMiles.',
    highlights: [
      { title: 'Ubud rice terrace sunrise', description: 'Bali · from Rp 450,000 or 4,500 miles' },
      { title: 'Uluwatu temple & Kecak dance', description: 'Bali · from Rp 380,000 or 3,800 miles' },
      { title: 'Marina Bay night tour', description: 'Singapore · from Rp 520,000' },
    ],
    cta: { label: 'Explore Bali experiences', message: 'Experiences for your Bali trip are ready to book' },
  },
  'airport-transfer': {
    intro: 'Pre-book a car from your door to Terminal 3, timed to your recommended arrival.',
    highlights: [
      { title: 'Pick-up for GA 412', description: 'Sat 19 Sep · 05:20 from home · arrive 06:15' },
      { title: 'Standard sedan', description: 'Rp 185,000 · up to 3 passengers' },
      { title: 'Premium MPV', description: 'Rp 265,000 · up to 5 passengers' },
    ],
    sections: [{ title: 'Purchase history', items: ['12 Aug 2026 · Home → Terminal 3 · Rp 185,000', '18 Aug 2026 · Ngurah Rai → Seminyak · Rp 160,000'] }],
    cta: { label: 'Book pick-up for GA 412', message: 'Airport transfer booked · pick-up 05:20 on 19 Sep' },
  },
  'car-rental': {
    intro: 'Rental cars from trusted partners, with GarudaMiles earning on every booking.',
    highlights: [
      { title: 'Denpasar · 19 – 23 Sep', description: 'Compact from Rp 320,000 per day' },
      { title: 'Earn miles', description: '2 miles per Rp 10,000 spent' },
    ],
    sections: [{ title: 'Purchase history', items: ['Mar 2024 · Denpasar · Toyota Avanza · 3 days'] }],
    cta: { label: 'Search cars in Denpasar', message: 'Car rental partner search opens in the live app' },
  },
  'roaming-package': {
    intro: 'Stay connected abroad with roaming packages from Indosat and Telkomsel, activated before you land.',
    highlights: [
      { title: 'Telkomsel · Singapore 3 days', description: '5 GB · Rp 85,000' },
      { title: 'Indosat · Japan 7 days', description: '10 GB · Rp 220,000' },
    ],
    sections: [{ title: 'Purchase history', items: ['Jun 2026 · Indosat Japan 7 days · Rp 220,000', 'Jan 2025 · Telkomsel Singapore 3 days · Rp 85,000'] }],
    cta: { label: 'Activate for GA 860 to Singapore', message: 'Telkomsel Singapore package will activate on arrival · 3 Oct' },
  },
  hotels: {
    intro: 'Partner hotels that earn GarudaMiles on every stay.',
    highlights: [
      { title: 'Nusantara Hotels · Seminyak', description: 'From Rp 1,150,000 per night · 600 miles' },
      { title: 'Harbour Suites · Singapore', description: 'From Rp 2,400,000 per night · 900 miles' },
    ],
    cta: { label: 'Find stays in Bali', message: 'Hotel partner search opens in the live app' },
  },
  'contact-us': {
    intro: 'We are here around the clock. Choose the channel that suits you.',
    highlights: [
      { title: 'Call centre', description: '+62 21 2351 9999 · 24 hours' },
      { title: 'WhatsApp', description: '+62 811 1000 8888 · average reply 2 minutes' },
      { title: 'Email', description: 'customer@garuda-indonesia.com' },
      { title: 'City offices', description: 'Jakarta, Surabaya, Denpasar, Makassar, Medan' },
    ],
    cta: { label: 'Chat on WhatsApp', message: 'WhatsApp chat with Garuda Indonesia opens in the live app' },
  },
  feedback: {
    intro: 'Your feedback shapes the Garuda experience. Rate your last journey or tell us what could be better.',
    highlights: [{ title: 'GA 418 · Denpasar → Jakarta', description: '18 Aug 2026 · How was your flight?' }],
    cta: { label: 'Send feedback', message: 'Thank you — your feedback has been sent to the Garuda team' },
  },
  'lost-and-found': {
    intro: 'Report an item left on board or at the airport. Most items are traced within 48 hours.',
    sections: [{ title: 'What we need', items: ['Flight number and date', 'Seat number', 'Description of the item'] }],
    cta: { label: 'Report a lost item', message: 'Report submitted · reference LF-2026-04471' },
  },
  'refund-request': {
    intro: 'Request and track refunds for cancelled or changed bookings.',
    highlights: [
      { title: 'PM8V3K · GA 654 Jakarta → Makassar', description: 'Refund approved · Rp 2,347,000 · arriving within 14 working days' },
    ],
    sections: [{ title: 'Timeline', items: ['24 Jul · Cancellation received', '25 Jul · Refund approved', 'Est. 7 Aug · Funds returned to Visa •••• 4821'] }],
    cta: { label: 'Request a new refund', to: '/trips' },
  },
  'saved-passengers': {
    intro: 'Travellers you fly with, ready for faster checkout.',
    highlights: [
      { title: 'Raka Wijaya · Myself', description: 'GA-27845193 · KTP verified' },
      { title: 'Dewi Anggraini · Family', description: 'GA-30112788 · Passport X•••••441' },
      { title: 'Bima Wijaya · Family', description: 'Passport X•••••209' },
    ],
    cta: { label: 'Add a traveller', message: 'New traveller form opens in the live app' },
  },
  'payment-methods': {
    intro: 'Cards, wallet and bank accounts saved securely for one-tap payment.',
    highlights: [
      { title: 'Visa •••• 4821', description: 'Default · expires 09/28' },
      { title: 'Travel Wallet', description: 'Balance Rp 2,150,000' },
      { title: 'BCA virtual account', description: 'Bank transfer · instant confirmation' },
    ],
    cta: { label: 'Add a payment method', message: 'Card form opens in the live app' },
  },
  wishlist: {
    intro: 'Destinations you have saved. We will let you know when fares drop.',
    cta: { label: 'Explore destinations', to: '/destinations' },
  },
  preferences: {
    intro: 'Tell us how you like to travel and we will pre-fill it every time.',
    highlights: [
      { title: 'Preferred seat', description: 'Window' },
      { title: 'Meal preference', description: 'Standard meal' },
      { title: 'Travel preference', description: 'Leisure + Education' },
      { title: 'Home airport', description: 'Jakarta – Soekarno-Hatta (CGK)' },
    ],
    cta: { label: 'Edit in profile', to: '/profile' },
  },
  about: {
    intro: 'FlyGaruda is the official mobile application of Garuda Indonesia, The Airline of Indonesia and a SkyTeam member.',
    sections: [
      { title: 'This prototype', items: ['Version 2.0 · Pillar 1: Activate the Journey', 'Built for the 2026 business case competition', 'All data is demo data; no real transactions are processed'] },
      { title: 'Credits', items: ['Design system · Garuda navy, blue and turquoise', 'Icons · Lucide', 'Charts · Recharts'] },
    ],
  },
  terms: {
    intro: 'Conditions of carriage and terms of use for FlyGaruda.',
    sections: [
      { title: 'Summary', items: ['Tickets are subject to the fare rules of the fare family purchased', 'Check-in closes 45 minutes before domestic and 60 minutes before international departures', 'Baggage allowances depend on cabin, fare and membership tier'] },
    ],
    note: 'Prototype summary — refer to garuda-indonesia.com for the full conditions of carriage.',
  },
  'privacy-policy': {
    intro: 'How Garuda Indonesia collects, uses and protects your personal data.',
    sections: [
      { title: 'Summary', items: ['We use your data to operate your journey and personalise reminders', 'Location is used only for airport arrival recommendations, with your consent', 'You can export or delete your data from Privacy & Security'] },
    ],
    note: 'Prototype summary — refer to garuda-indonesia.com for the full privacy policy.',
  },
}
