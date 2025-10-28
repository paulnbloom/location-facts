import type { FactSheet, Location } from '../types'
import {
  nominatimSearch,
  wikipediaSummary,
  wikipediaParseSections,
  openMeteoDaily,
  openTripMapAttractions,
  yelpTopPlaces,
  ticketmasterEvents,
  fetchCIAFactbook,
  fetchStateDept,
  recommendStay
} from './apis'

/**
 * Main search pipeline - geocodes query and fetches all fact sheet data in parallel
 */
export async function searchLocation(
  query: string,
  creativeMode: boolean = false
): Promise<FactSheet> {
  // Step 1: Geocode via Nominatim
  const location = await nominatimSearch(query)

  if (!location) {
    throw new Error(`No location found for query: "${query}"`)
  }

  // Step 2: Build header
  const header = buildHeader(location)

  // Step 3: Determine if this is a country-only search
  const isCountry = !location.city && !location.state

  // Step 4: Fetch all data in parallel
  const [
    wikipediaData,
    weatherData,
    attractionsData,
    foodData,
    eventsData,
    ciaData,
    stateDeptData,
    creativeOverview,
  ] = await Promise.all([
    fetchWikipediaData(location),
    fetchWeatherData(location),
    fetchAttractions(location),
    fetchFoodAndLodging(location),
    fetchEvents(location),
    fetchCIAData(location),
    fetchStateDeptData(location),
    creativeMode ? generateCreativeOverview(location) : Promise.resolve(undefined),
  ])

  // Step 5: Calculate recommended stay
  const recommendedStay = recommendStay(
    undefined, // We don't have population data yet
    attractionsData.length,
    isCountry
  )

  return {
    header,
    location,
    creativeOverview,
    naming: wikipediaData.naming,
    famousPeople: wikipediaData.famousPeople,
    majorHistory: wikipediaData.majorHistory,
    recentEvents: wikipediaData.recentEvents,
    weatherPast7DayAvg: weatherData.past7DayAvg,
    weatherNext7DayAvg: weatherData.next7DayAvg,
    seasonalClimate: weatherData.seasonalClimate,
    routineEvents: eventsData.routineEvents,
    upcomingEvents: eventsData.upcomingEvents,
    attractions: attractionsData,
    restaurants: foodData.restaurants,
    coffeeShops: foodData.coffeeShops,
    bars: foodData.bars,
    hotels: foodData.hotels,
    recommendedStay,
    ciaSummary: ciaData,
    stateDept: stateDeptData,
  }
}

/**
 * Build header line from location
 */
function buildHeader(location: Location): string {
  if (!location.city && !location.state) {
    return location.country
  }

  const parts: string[] = []

  if (location.postalCode) {
    parts.push(location.postalCode)
  }

  if (location.city) {
    parts.push(location.city)
  }

  if (location.state) {
    parts.push(location.state)
  }

  parts.push(location.country)

  return parts.join(', ')
}

/**
 * Fetch Wikipedia data
 */
async function fetchWikipediaData(location: Location): Promise<{
  naming: string
  famousPeople: string[]
  majorHistory: string[]
  recentEvents: string[]
}> {
  try {
    const pageTitles = getWikipediaPageTitles(location)

    for (const pageTitle of pageTitles) {
      try {
        const [summary, parsed] = await Promise.all([
          wikipediaSummary(pageTitle),
          wikipediaParseSections(pageTitle)
        ])

        if (summary || parsed.html) {
          return {
            naming: summary.substring(0, 300) || '',
            famousPeople: extractListFromSection(parsed.html, 'notable people'),
            majorHistory: extractListFromSection(parsed.html, 'history'),
            recentEvents: extractListFromSection(parsed.html, 'recent')
          }
        }
      } catch (err) {
        continue
      }
    }

    return {
      naming: '',
      famousPeople: [],
      majorHistory: [],
      recentEvents: []
    }
  } catch (error) {
    console.error('Wikipedia fetch error:', error)
    return {
      naming: '',
      famousPeople: [],
      majorHistory: [],
      recentEvents: []
    }
  }
}

function getWikipediaPageTitles(location: Location): string[] {
  const titles: string[] = []

  if (location.city) {
    titles.push(location.city)
    if (location.state && location.country === 'United States') {
      titles.push(`${location.city}, ${location.state}`)
    }
    if (location.country) {
      titles.push(`${location.city}, ${location.country}`)
    }
  } else {
    titles.push(location.country)
  }

  return titles
}

function extractListFromSection(_html: string, _sectionKeyword: string): string[] {
  // Simplified extraction - would need proper HTML parsing for production
  // This is a placeholder that returns empty array
  return []
}

/**
 * Fetch weather data
 */
async function fetchWeatherData(location: Location): Promise<{
  past7DayAvg: { tempC: number | null; precipMm: number | null; windKph: number | null }
  next7DayAvg: { tempC: number | null; precipMm: number | null; windKph: number | null }
  seasonalClimate: string
}> {
  if (!location.lat || !location.lon) {
    return {
      past7DayAvg: { tempC: null, precipMm: null, windKph: null },
      next7DayAvg: { tempC: null, precipMm: null, windKph: null },
      seasonalClimate: ''
    }
  }

  try {
    const weather = await openMeteoDaily(location.lat, location.lon)

    if (!weather) {
      return {
        past7DayAvg: { tempC: null, precipMm: null, windKph: null },
        next7DayAvg: { tempC: null, precipMm: null, windKph: null },
        seasonalClimate: ''
      }
    }

    const seasonalClimate = deriveSeasonalClimate(location.lat)

    return {
      past7DayAvg: weather.past7Days,
      next7DayAvg: weather.next7Days,
      seasonalClimate
    }
  } catch (error) {
    console.error('Weather fetch error:', error)
    return {
      past7DayAvg: { tempC: null, precipMm: null, windKph: null },
      next7DayAvg: { tempC: null, precipMm: null, windKph: null },
      seasonalClimate: ''
    }
  }
}

function deriveSeasonalClimate(lat: number): string {
  const absLat = Math.abs(lat)

  if (absLat < 23.5) {
    return 'Tropical: Hot and humid year-round with minimal temperature variation'
  } else if (absLat < 35) {
    return 'Subtropical: Warm summers and mild winters'
  } else if (absLat < 55) {
    return 'Temperate: Four distinct seasons with warm summers and cold winters'
  } else {
    return 'Cold: Short summers and long, cold winters'
  }
}

/**
 * Fetch attractions
 */
async function fetchAttractions(location: Location): Promise<string[]> {
  if (!location.lat || !location.lon) {
    return []
  }

  try {
    return await openTripMapAttractions(location.lat, location.lon, 15)
  } catch (error) {
    console.error('Attractions fetch error:', error)
    return []
  }
}

/**
 * Fetch food and lodging
 */
async function fetchFoodAndLodging(location: Location): Promise<{
  restaurants: string[]
  coffeeShops: string[]
  bars: string[]
  hotels: string[]
}> {
  if (!location.lat || !location.lon) {
    return { restaurants: [], coffeeShops: [], bars: [], hotels: [] }
  }

  try {
    const [restaurants, coffeeShops, bars, hotels] = await Promise.all([
      yelpTopPlaces('restaurants', location.lat, location.lon, 5),
      yelpTopPlaces('coffee', location.lat, location.lon, 5),
      yelpTopPlaces('bars', location.lat, location.lon, 5),
      yelpTopPlaces('hotels', location.lat, location.lon, 10),
    ])

    return { restaurants, coffeeShops, bars, hotels }
  } catch (error) {
    console.error('Food/lodging fetch error:', error)
    return { restaurants: [], coffeeShops: [], bars: [], hotels: [] }
  }
}

/**
 * Fetch events
 */
async function fetchEvents(location: Location): Promise<{
  routineEvents: string[]
  upcomingEvents: string[]
}> {
  if (!location.lat || !location.lon) {
    return { routineEvents: [], upcomingEvents: [] }
  }

  try {
    const events = await ticketmasterEvents(location.lat, location.lon)
    return {
      routineEvents: events.routine,
      upcomingEvents: events.upcoming
    }
  } catch (error) {
    console.error('Events fetch error:', error)
    return { routineEvents: [], upcomingEvents: [] }
  }
}

/**
 * Fetch CIA Factbook data
 */
async function fetchCIAData(location: Location): Promise<{
  introduction?: string
  geography?: string
  economy?: string
  government?: string
  terrorism?: string
  error?: string
  url?: string
}> {
  try {
    return await fetchCIAFactbook(location.country)
  } catch (error) {
    console.error('CIA Factbook fetch error:', error)
    return {
      error: 'Failed to fetch CIA Factbook',
      url: `https://www.cia.gov/the-world-factbook/countries/${location.country.toLowerCase()}/`
    }
  }
}

/**
 * Fetch State Department data
 */
async function fetchStateDeptData(location: Location): Promise<{
  advisoryLevel?: string | null
  notes?: string[]
  error?: string
  urls?: {
    infoUrl: string
    advisoryUrl: string
  }
}> {
  try {
    return await fetchStateDept(location.country)
  } catch (error) {
    console.error('State Dept fetch error:', error)
    return {
      error: 'Failed to fetch State Department info',
      urls: {
        infoUrl: '',
        advisoryUrl: ''
      }
    }
  }
}

/**
 * Generate creative overview
 */
async function generateCreativeOverview(location: Location): Promise<string> {
  const locationName = location.city || location.country
  const descriptions = [
    `${locationName} - a vibrant destination where culture and history intertwine`,
    `Discover ${locationName}, where every street tells a story`,
    `${locationName} awaits with its unique charm and endless possibilities`,
    `Experience the magic of ${locationName}, where tradition meets modernity`,
  ]

  // Deterministic selection based on location name
  const hash = locationName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return descriptions[hash % descriptions.length]
}
