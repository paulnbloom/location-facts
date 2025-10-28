// Location search and fact sheet types

export interface Location {
  postalCode?: string
  city?: string
  state?: string
  country: string
  lat?: number
  lon?: number
}

export interface TypeaheadSuggestion {
  displayName: string
  location: Location
}

export interface WikipediaInfo {
  nameOrigin?: string
  famousPeople?: string[]
  historicalEvents?: string[]
  currentEvents?: string[]
}

export interface WeatherData {
  past7Days?: string
  next7Days?: string
  climateSummary?: string
}

export interface Event {
  name: string
  date?: string
  type: 'routine' | 'upcoming'
}

export interface Attraction {
  name: string
  rating?: number
  description?: string
}

export interface Restaurant {
  name: string
  rating?: number
  cuisine?: string
  priceLevel?: string
}

export interface Hotel {
  name: string
  rating?: number
  priceRange?: string
}

export interface LocalHappenings {
  routineEvents?: Event[]
  upcomingEvents?: Event[]
  attractions?: Attraction[]
}

export interface FoodAndLodging {
  restaurants?: Restaurant[]
  coffeeShops?: Restaurant[]
  bars?: Restaurant[]
  hotels?: Hotel[]
}

export interface StayRecommendation {
  recommendedDays: number
  reasoning?: string
}

export interface CIAFactbook {
  introduction?: string
  geography?: string
  economy?: string
  government?: string
  terrorismIssues?: string
}

export interface StateDeptInfo {
  travelRisks?: string
  visaRequirements?: string
  vaccinations?: string
}

export interface FactSheet {
  location: Location
  creativeOverview?: string // Only when Creative Mode is ON
  wikipedia?: WikipediaInfo
  weather?: WeatherData
  localHappenings?: LocalHappenings
  foodAndLodging?: FoodAndLodging
  stayRecommendation?: StayRecommendation
  ciaFactbook?: CIAFactbook
  stateDept?: StateDeptInfo
}

export interface SearchState {
  isLoading: boolean
  error: string | null
  factSheet: FactSheet | null
}
