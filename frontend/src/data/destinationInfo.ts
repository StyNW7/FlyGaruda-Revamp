import { Cloud, CloudRain, CloudSun, Sun } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AirportCode } from '../types'

export interface DestinationInfo {
  name: string
  weather: { tempC: number; label: string; icon: LucideIcon }
  timezone: string
  utcOffset: string
  currency: string
  tips: string[]
  transfer: string
}

/** Demo destination intelligence shown in the Journey Companion (weather is illustrative). */
export const DESTINATION_INFO: Record<AirportCode, DestinationInfo> = {
  CGK: { name: 'Jakarta', weather: { tempC: 31, label: 'Sunny', icon: Sun }, timezone: 'WIB', utcOffset: 'UTC+7', currency: 'IDR', tips: ['Terminal 3 Skytrain runs every 7 minutes', 'Allow 60 min for airport toll traffic'], transfer: 'Airport train to BNI City · 55 min' },
  DPS: { name: 'Bali', weather: { tempC: 29, label: 'Partly cloudy', icon: CloudSun }, timezone: 'WITA', utcOffset: 'UTC+8', currency: 'IDR', tips: ['Bali is 1 hour ahead of Jakarta', 'Tourist levy IDR 150,000 payable online before arrival', 'Belt 4 for GA domestic arrivals'], transfer: 'Airport taxi to Seminyak · 35 min' },
  SUB: { name: 'Surabaya', weather: { tempC: 32, label: 'Sunny', icon: Sun }, timezone: 'WIB', utcOffset: 'UTC+7', currency: 'IDR', tips: ['Juanda Terminal 2 for Garuda arrivals'], transfer: 'Taxi to city centre · 45 min' },
  UPG: { name: 'Makassar', weather: { tempC: 30, label: 'Partly cloudy', icon: CloudSun }, timezone: 'WITA', utcOffset: 'UTC+8', currency: 'IDR', tips: ['Makassar is 1 hour ahead of Jakarta'], transfer: 'Taxi to Losari · 40 min' },
  KNO: { name: 'Medan', weather: { tempC: 28, label: 'Showers', icon: CloudRain }, timezone: 'WIB', utcOffset: 'UTC+7', currency: 'IDR', tips: ['Railink airport train to Medan city · 30 min'], transfer: 'Railink train · 30 min' },
  SIN: { name: 'Singapore', weather: { tempC: 30, label: 'Thunderstorms', icon: CloudRain }, timezone: 'SGT', utcOffset: 'UTC+8', currency: 'SGD', tips: ['Complete the SG Arrival Card within 3 days of arrival', 'Changi Terminal 3 · Jewel is a 5-minute walk'], transfer: 'MRT from Terminal 3 · 35 min to city' },
  NRT: { name: 'Tokyo', weather: { tempC: 22, label: 'Cloudy', icon: Cloud }, timezone: 'JST', utcOffset: 'UTC+9', currency: 'JPY', tips: ['Visit Japan Web speeds up immigration', 'Narita Express to Tokyo Station · 60 min'], transfer: 'Narita Express · 60 min' },
  HND: { name: 'Tokyo', weather: { tempC: 22, label: 'Cloudy', icon: Cloud }, timezone: 'JST', utcOffset: 'UTC+9', currency: 'JPY', tips: ['Visit Japan Web speeds up immigration', 'Haneda is 20 minutes from central Tokyo'], transfer: 'Monorail to Hamamatsucho · 20 min' },
  ICN: { name: 'Seoul', weather: { tempC: 19, label: 'Sunny', icon: Sun }, timezone: 'KST', utcOffset: 'UTC+9', currency: 'KRW', tips: ['K-ETA may be required before departure'], transfer: 'AREX express to Seoul Station · 43 min' },
  SYD: { name: 'Sydney', weather: { tempC: 18, label: 'Sunny', icon: Sun }, timezone: 'AEST', utcOffset: 'UTC+10', currency: 'AUD', tips: ['Declare all food items on arrival', 'Sydney is 3 hours ahead of Jakarta'], transfer: 'Airport Link train · 13 min to Central' },
}

export const CHECKLIST_ITEMS = [
  { id: 'id', label: 'ID or passport in hand luggage' },
  { id: 'pass', label: 'Boarding pass saved offline' },
  { id: 'bag', label: 'Bag within 20 kg · no restricted items' },
  { id: 'power', label: 'Power bank in cabin bag' },
  { id: 'transport', label: 'Ride to Terminal 3 booked' },
]
