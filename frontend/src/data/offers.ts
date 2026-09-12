import type { Destination, Offer } from '../types'

export const OFFERS: Offer[] = [
  {
    id: 'o1',
    title: 'Explore Bali',
    subtitle: 'Premium journey from Jakarta, full-service included',
    destination: 'Denpasar',
    destinationCode: 'DPS',
    priceFrom: 1549000,
    tag: 'Domestic',
    tone: 'turquoise',
  },
  {
    id: 'o2',
    title: 'Discover Tokyo',
    subtitle: 'Travel comfortably with Garuda Indonesia non-stop',
    destination: 'Tokyo',
    destinationCode: 'HND',
    priceFrom: 9120000,
    tag: 'International',
    tone: 'navy',
  },
  {
    id: 'o3',
    title: 'GarudaMiles Member Offer',
    subtitle: 'Earn bonus miles on selected routes this season',
    destination: 'Singapore',
    destinationCode: 'SIN',
    priceFrom: 2870000,
    tag: 'Members',
    tone: 'gold',
  },
  {
    id: 'o4',
    title: 'Weekend in Makassar',
    subtitle: 'Seafood, sunsets and Indonesian hospitality',
    destination: 'Makassar',
    destinationCode: 'UPG',
    priceFrom: 1890000,
    tag: 'Domestic',
    tone: 'blue',
  },
]

export const DESTINATIONS: Destination[] = [
  { code: 'DPS', city: 'Bali', country: 'Indonesia', priceFrom: 1549000, tagline: 'Island of the Gods', tone: 'turquoise' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', priceFrom: 2870000, tagline: 'City in a garden', tone: 'navy' },
  { code: 'HND', city: 'Tokyo', country: 'Japan', priceFrom: 9120000, tagline: 'Tradition meets tomorrow', tone: 'deep' },
  { code: 'SUB', city: 'Surabaya', country: 'Indonesia', priceFrom: 1215000, tagline: 'City of heroes', tone: 'blue' },
  { code: 'SYD', city: 'Sydney', country: 'Australia', priceFrom: 9860000, tagline: 'Harbour city', tone: 'gold' },
  { code: 'KNO', city: 'Medan', country: 'Indonesia', priceFrom: 1720000, tagline: 'Gateway to Lake Toba', tone: 'turquoise' },
  { code: 'ICN', city: 'Seoul', country: 'South Korea', priceFrom: 8450000, tagline: 'Dynamic and timeless', tone: 'navy' },
  { code: 'UPG', city: 'Makassar', country: 'Indonesia', priceFrom: 1890000, tagline: 'Sunsets over Losari', tone: 'deep' },
]

export const INSPIRATION = [
  { id: 'i1', title: '48 hours in Ubud', subtitle: 'Rice terraces, temples and slow mornings', readTime: '4 min read' },
  { id: 'i2', title: 'Tokyo in autumn', subtitle: 'Where to see the best foliage from Haneda', readTime: '6 min read' },
  { id: 'i3', title: 'Eating your way through Makassar', subtitle: 'Coto, konro and the seafood of Losari', readTime: '3 min read' },
]
