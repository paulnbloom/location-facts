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
  header: string
  location: Location
  creativeOverview?: string // Only when Creative Mode is ON
  naming: string // how location got its name
  famousPeople: string[]
  majorHistory: string[]
  recentEvents: string[]
  weatherPast7DayAvg: {
    tempC?: number | null
    precipMm?: number | null
    windKph?: number | null
  }
  weatherNext7DayAvg: {
    tempC?: number | null
    precipMm?: number | null
    windKph?: number | null
  }
  seasonalClimate: string
  routineEvents: string[]
  upcomingEvents: string[]
  attractions: string[]
  restaurants: string[] // top 5
  coffeeShops: string[] // top 5
  bars: string[] // top 5
  hotels: string[] // top 10
  recommendedStay: string // deterministic heuristic
  ciaSummary: {
    introduction?: string
    geography?: string
    economy?: string
    government?: string
    terrorism?: string
    error?: string
    url?: string
  }
  stateDept: {
    advisoryLevel?: string | null
    notes?: string[]
    error?: string
    urls?: {
      infoUrl: string
      advisoryUrl: string
    }
  }
}

export interface SearchState {
  isLoading: boolean
  error: string | null
  factSheet: FactSheet | null
}
