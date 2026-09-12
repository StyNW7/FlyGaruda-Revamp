import {
  ArrowUpCircle,
  Award,
  BadgePercent,
  Bell,
  Bookmark,
  BookOpen,
  Building2,
  Bus,
  Calculator,
  CalendarClock,
  Car,
  ClipboardList,
  Compass,
  CreditCard,
  FileText,
  Globe,
  HandCoins,
  Headphones,
  Heart,
  HelpCircle,
  Info,
  Landmark,
  Leaf,
  Luggage,
  MapPin,
  MessageSquare,
  MonitorPlay,
  Package,
  PackageSearch,
  PlaneTakeoff,
  PlusCircle,
  Radar,
  Settings,
  Shield,
  ShoppingBag,
  Sofa,
  Sparkles,
  TicketCheck,
  User,
  Users,
  UtensilsCrossed,
  Wifi,
  FlaskConical,
} from 'lucide-react'
import type { MoreGroup } from '../types'

/**
 * Functional coverage is based on the current FlyGaruda "More" and menu screens:
 * Check-In, Flight Status, Flight Schedule, BidUpgrade, Travel Advisories, Add On, Promo,
 * Excess Baggage Calculator, Charter, KirimAja, Travel Docs, More Info, Carbon Offset,
 * In Flight Entertainment, e-Library, Notification, My Wishlist, Garuda Things To Do,
 * Airport Transfer, Car Rental, Indosat / Telkomsel Roaming Package, Setting.
 */
export const MORE_GROUPS: MoreGroup[] = [
  {
    id: 'travel',
    title: 'Travel',
    items: [
      { slug: 'check-in', label: 'Check-in', description: 'Check in online from 24 hours before departure', icon: TicketCheck, to: '/trips' },
      { slug: 'flight-status', label: 'Flight Status', description: 'Live departure, arrival and gate information', icon: Radar, to: '/flight-status' },
      { slug: 'flight-schedule', label: 'Flight Schedule', description: 'Timetable for every Garuda route', icon: CalendarClock },
      { slug: 'manage-booking', label: 'Manage Booking', description: 'Change flights, seats and add services', icon: ClipboardList, to: '/trips' },
      { slug: 'baggage-information', label: 'Baggage Information', description: 'Allowances, restricted items and tips', icon: Luggage },
      { slug: 'excess-baggage-calculator', label: 'Excess Baggage Calculator', description: 'Estimate the cost of extra baggage', icon: Calculator },
      { slug: 'travel-docs', label: 'Travel Docs', description: 'Passport, visa and health document checks', icon: FileText },
      { slug: 'travel-advisories', label: 'Travel Advisories', description: 'Weather, operational and entry updates', icon: Info },
      { slug: 'airport-information', label: 'Airport Information', description: 'Terminals, maps and facilities', icon: Building2 },
    ],
  },
  {
    id: 'services',
    title: 'Garuda Services',
    items: [
      { slug: 'garudamiles', label: 'GarudaMiles', description: 'Your miles, tier and rewards', icon: Award, to: '/miles' },
      { slug: 'promo', label: 'Special Offers', description: 'Seasonal fares and member offers', icon: BadgePercent, to: '/offers' },
      { slug: 'bid-upgrade', label: 'BidUpgrade', description: 'Bid for a Business Class upgrade', icon: ArrowUpCircle },
      { slug: 'add-on', label: 'Add On', description: 'Extra baggage, seats, meals and more', icon: PlusCircle },
      { slug: 'lounge', label: 'Lounge', description: 'Garuda Indonesia Lounge access', icon: Sofa },
      { slug: 'in-flight-services', label: 'In-flight Services', description: 'Entertainment, meals and Wi-Fi', icon: MonitorPlay },
      { slug: 'e-library', label: 'e-Library', description: 'Colours magazine and reading on board', icon: BookOpen },
      { slug: 'charter', label: 'Charter', description: 'Private and group charter flights', icon: PlaneTakeoff },
      { slug: 'kirimaja', label: 'KirimAja', description: 'Send parcels and cargo with Garuda', icon: Package },
      { slug: 'carbon-offset', label: 'Carbon Offset', description: 'Offset the emissions of your journey', icon: Leaf },
      { slug: 'garudashop', label: 'GarudaShop', description: 'Merchandise and duty-free pre-order', icon: ShoppingBag },
    ],
  },
  {
    id: 'partners',
    title: 'Travel Partners',
    items: [
      { slug: 'things-to-do', label: 'Garuda Things To Do', description: 'Tours and experiences at your destination', icon: Compass },
      { slug: 'airport-transfer', label: 'Airport Transfer', description: 'Pre-book a ride to and from the airport', icon: Bus, badge: 'History' },
      { slug: 'car-rental', label: 'Car Rental', description: 'Rental cars from trusted partners', icon: Car, badge: 'History' },
      { slug: 'roaming-package', label: 'Roaming Package', description: 'Indosat and Telkomsel international roaming', icon: Wifi, badge: 'History' },
      { slug: 'hotels', label: 'Hotels & Stays', description: 'Partner hotels that earn GarudaMiles', icon: Landmark },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    items: [
      { slug: 'help-center', label: 'Help Center', description: 'Answers to common questions', icon: HelpCircle, to: '/help' },
      { slug: 'contact-us', label: 'Contact Us', description: 'Call centre, WhatsApp and offices', icon: Headphones },
      { slug: 'feedback', label: 'Feedback', description: 'Tell us about your experience', icon: MessageSquare },
      { slug: 'lost-and-found', label: 'Lost & Found', description: 'Report or trace a lost item', icon: PackageSearch },
      { slug: 'refund-request', label: 'Refund Request', description: 'Request and track a refund', icon: HandCoins },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    items: [
      { slug: 'profile', label: 'Profile', description: 'Personal details and travel preferences', icon: User, to: '/profile' },
      { slug: 'saved-passengers', label: 'Saved Passengers', description: 'Travellers you fly with', icon: Users },
      { slug: 'payment-methods', label: 'Payment Methods', description: 'Cards, wallet and bank accounts', icon: CreditCard },
      { slug: 'wishlist', label: 'My Wishlist', description: 'Destinations you have saved', icon: Heart },
      { slug: 'preferences', label: 'Preferences', description: 'Seat, meal and travel preferences', icon: Bookmark },
      { slug: 'language', label: 'Language', description: 'English / Bahasa Indonesia', icon: Globe },
      { slug: 'notifications', label: 'Notifications', description: 'Journey alerts and reminders', icon: Bell },
      { slug: 'privacy-security', label: 'Privacy & Security', description: 'Password, devices and data', icon: Shield },
    ],
  },
  {
    id: 'app',
    title: 'App',
    items: [
      { slug: 'settings', label: 'Settings', description: 'App behaviour and display', icon: Settings },
      { slug: 'about', label: 'About FlyGaruda', description: 'Version, credits and licences', icon: Sparkles },
      { slug: 'terms', label: 'Terms & Conditions', description: 'Conditions of carriage and use', icon: FileText },
      { slug: 'privacy-policy', label: 'Privacy Policy', description: 'How we handle your data', icon: Shield },
      { slug: 'prototype-controls', label: 'Prototype Controls', description: 'Demo tools for this prototype', icon: FlaskConical, to: '/prototype', badge: 'Demo' },
    ],
  },
]

export const ALL_FEATURES = MORE_GROUPS.flatMap((g) => g.items)

export function findFeature(slug: string) {
  return ALL_FEATURES.find((f) => f.slug === slug)
}

export const MEAL_ICON = UtensilsCrossed
export const MAP_ICON = MapPin
