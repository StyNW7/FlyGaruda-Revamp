import type { AirportCode, Destination, Offer } from '../types'

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
    promoCode: 'BALI15',
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
    promoCode: 'GARUDA10',
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
    promoCode: 'MILES2026',
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

export interface Story {
  id: string
  title: string
  subtitle: string
  readTime: string
  code: AirportCode
  body: string[]
  tips: string[]
}

export const INSPIRATION: Story[] = [
  {
    id: 'i1',
    title: '48 hours in Ubud',
    subtitle: 'Rice terraces, temples and slow mornings',
    readTime: '4 min read',
    code: 'DPS',
    body: [
      'Land in Denpasar before noon on GA 412 and you can be sipping kopi in Ubud by two. The drive north takes about an hour and a half, winding past Batubulan stone carvers and the silver workshops of Celuk.',
      'Spend the first afternoon at Tegallalang, where the rice terraces catch the late light. Walk the Campuhan Ridge just before sunset; the trail is quiet, green and almost entirely free of traffic.',
      'Day two belongs to the temples. Start early at Tirta Empul, where locals queue for the purification springs, then take the back roads to Gunung Kawi and its rock-cut shrines. Finish with a slow dinner in a paddy-side warung — nasi campur, a young coconut, and the sound of frogs.',
    ],
    tips: ['Fly GA 400 (06:15) to make the most of day one', 'Bali is one hour ahead of Jakarta (WITA)', 'Tourist levy IDR 150,000 is payable online before arrival'],
  },
  {
    id: 'i2',
    title: 'Tokyo in autumn',
    subtitle: 'Where to see the best foliage from Haneda',
    readTime: '6 min read',
    code: 'HND',
    body: [
      'Garuda’s overnight GA 874 lands at Haneda at 08:40, which puts you in central Tokyo before most shops open. Drop your bags, and head straight for the ginkgo avenue at Meiji Jingu Gaien — peak yellow arrives in late November.',
      'Rikugien is the classic maple garden, lit up after dark for a few weeks each year. For something quieter, take the Chuo line out to Mount Takao; the trail to the summit takes ninety minutes and the view of Fuji on a clear morning is worth the early start.',
      'Save an evening for Yanaka, where the old town survives between temples and cat-themed bakeries. The neighbourhood is twenty minutes from Haneda on the monorail and Yamanote line.',
    ],
    tips: ['Register on Visit Japan Web to speed up immigration', 'Haneda is 20 minutes from central Tokyo', 'Foliage peaks between 20 November and 5 December'],
  },
  {
    id: 'i3',
    title: 'Eating your way through Makassar',
    subtitle: 'Coto, konro and the seafood of Losari',
    readTime: '3 min read',
    code: 'UPG',
    body: [
      'Makassar is a city that eats early and eats well. Start the day with coto Makassar — a rich beef and offal soup served with ketupat — at one of the stalls along Jalan Gagak, where the queue moves fast and the broth has been simmering since dawn.',
      'By afternoon, move to Losari Beach. The promenade fills with vendors grilling ikan bakar over coconut husks, and pisang epe, flattened bananas in palm sugar, is the local answer to dessert.',
      'Konro, the smoky rib soup, is best at night. Ask for it bakar — grilled — and finish with es pallu butung, banana in pink syrup, while the sun goes down over the strait.',
    ],
    tips: ['GA 654 departs Jakarta at 09:10 and lands in time for lunch', 'Makassar is one hour ahead of Jakarta (WITA)', 'Losari sunset is best from 17:30'],
  },
]
