import type { FactSheet, Location } from '../types'
import { searchLocations } from '../services/nominatim'

/**
 * Main search pipeline - geocodes query and fetches all fact sheet data in parallel
 */
export async function searchLocation(
  query: string,
  creativeMode: boolean = false
): Promise<FactSheet> {
  // Step 1: Geocode via Nominatim (limit=1)
  const geocodeResults = await searchLocations(query, 1)

  if (geocodeResults.length === 0) {
    throw new Error(`No location found for query: "${query}"`)
  }

  const result = geocodeResults[0]
  const location = result.location

  // Step 2: Build header
  const header = buildHeader(location)

  // Step 3: Fetch all data in parallel
  const [
    wikipediaData,
    weatherData,
    attractionsData,
    yelpData,
    eventsData,
    ciaData,
    stateDeptData,
    creativeOverview,
  ] = await Promise.all([
    fetchWikipediaData(location),
    fetchWeatherData(location),
    fetchAttractions(location),
    fetchYelpData(location),
    fetchEvents(location),
    fetchCIAFactbook(location),
    fetchStateDeptInfo(location),
    creativeMode ? generateCreativeOverview(location) : Promise.resolve(undefined),
  ])

  // Step 4: Calculate recommended stay
  const recommendedStay = calculateRecommendedStay(location, attractionsData.length, yelpData.restaurants.length)

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
    restaurants: yelpData.restaurants.slice(0, 5),
    coffeeShops: yelpData.coffeeShops.slice(0, 5),
    bars: yelpData.bars.slice(0, 5),
    hotels: yelpData.hotels.slice(0, 10),
    recommendedStay,
    ciaSummary: ciaData,
    stateDept: stateDeptData,
  }
}

/**
 * Build header line from location
 * If country only → just country name
 * Else → postal|city, state, country
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
 * Fetch Wikipedia data: naming, famous people, history, recent events
 */
async function fetchWikipediaData(location: Location): Promise<{
  naming: string
  famousPeople: string[]
  majorHistory: string[]
  recentEvents: string[]
}> {
  try {
    // Determine Wikipedia page title - try multiple fallback variants
    const pageTitles = getWikipediaPageTitles(location)

    for (const pageTitle of pageTitles) {
      try {
        const response = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`
        )

        if (!response.ok) continue

        const summary = await response.json()

        // Fetch full page content for sections
        const contentResponse = await fetch(
          `https://en.wikipedia.org/w/api.php?` +
          new URLSearchParams({
            action: 'parse',
            page: pageTitle,
            format: 'json',
            prop: 'sections|text',
            origin: '*'
          })
        )

        if (!contentResponse.ok) {
          // Return basic summary if full content unavailable
          return {
            naming: summary.extract || '',
            famousPeople: [],
            majorHistory: [],
            recentEvents: []
          }
        }

        const content = await contentResponse.json()

        return {
          naming: extractNaming(content, summary),
          famousPeople: extractFamousPeople(content),
          majorHistory: extractHistory(content),
          recentEvents: extractRecentEvents(content)
        }
      } catch (err) {
        continue // Try next fallback
      }
    }

    // If all fallbacks fail, return empty
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

/**
 * Get list of Wikipedia page titles to try (with fallbacks)
 */
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

/**
 * Extract naming/etymology from Wikipedia content
 */
function extractNaming(content: any, summary: any): string {
  try {
    const text = content?.parse?.text?.['*'] || ''
    const sections = content?.parse?.sections || []

    // Look for etymology/name origin sections
    const namingSection = sections.find((s: any) =>
      /etymology|name|origin/i.test(s.line)
    )

    if (namingSection) {
      // Extract text from that section
      const parser = new DOMParser()
      const doc = parser.parseFromString(text, 'text/html')
      const headings = doc.querySelectorAll('h2, h3')

      for (const heading of Array.from(headings)) {
        if (/etymology|name|origin/i.test(heading.textContent || '')) {
          // Get next paragraph
          let next = heading.nextElementSibling
          while (next && next.tagName !== 'P') {
            next = next.nextElementSibling
          }
          if (next) {
            return next.textContent?.trim() || summary.extract.substring(0, 200)
          }
        }
      }
    }

    // Fallback to summary
    return summary.extract.substring(0, 200) + '...'
  } catch (error) {
    console.error('Error extracting naming:', error)
    return summary.extract?.substring(0, 200) || ''
  }
}

/**
 * Extract famous people from Wikipedia content
 */
function extractFamousPeople(_content: any): string[] {
  try {
    // Look for "Notable people" or similar sections
    // This is a simplified extraction - real implementation would parse more carefully
    return []
  } catch (error) {
    return []
  }
}

/**
 * Extract major historical events
 */
function extractHistory(_content: any): string[] {
  try {
    // Look for History section and extract key events
    // This is a simplified extraction
    return []
  } catch (error) {
    return []
  }
}

/**
 * Extract recent events
 */
function extractRecentEvents(_content: any): string[] {
  try {
    // Look for recent events or current events sections
    return []
  } catch (error) {
    return []
  }
}

/**
 * Fetch weather data from Open-Meteo
 */
async function fetchWeatherData(location: Location): Promise<{
  past7DayAvg: { tempC?: number | null; precipMm?: number | null; windKph?: number | null }
  next7DayAvg: { tempC?: number | null; precipMm?: number | null; windKph?: number | null }
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
    const today = new Date()
    const past7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch historical and forecast data
    const [historicalResponse, forecastResponse] = await Promise.all([
      fetch(
        `https://api.open-meteo.com/v1/forecast?` +
        new URLSearchParams({
          latitude: location.lat.toString(),
          longitude: location.lon.toString(),
          start_date: past7Days.toISOString().split('T')[0],
          end_date: today.toISOString().split('T')[0],
          daily: 'temperature_2m_mean,precipitation_sum,windspeed_10m_max',
          timezone: 'auto'
        })
      ),
      fetch(
        `https://api.open-meteo.com/v1/forecast?` +
        new URLSearchParams({
          latitude: location.lat.toString(),
          longitude: location.lon.toString(),
          daily: 'temperature_2m_mean,precipitation_sum,windspeed_10m_max',
          forecast_days: '7',
          timezone: 'auto'
        })
      )
    ])

    if (!historicalResponse.ok || !forecastResponse.ok) {
      throw new Error('Weather API failed')
    }

    const historical = await historicalResponse.json()
    const forecast = await forecastResponse.json()

    // Calculate averages
    const past7DayAvg = {
      tempC: calculateAverage(historical.daily?.temperature_2m_mean),
      precipMm: calculateSum(historical.daily?.precipitation_sum),
      windKph: calculateMax(historical.daily?.windspeed_10m_max)
    }

    const next7DayAvg = {
      tempC: calculateAverage(forecast.daily?.temperature_2m_mean),
      precipMm: calculateSum(forecast.daily?.precipitation_sum),
      windKph: calculateMax(forecast.daily?.windspeed_10m_max)
    }

    // Derive seasonal climate (simplified based on latitude)
    const seasonalClimate = deriveSeasonalClimate(location.lat)

    return { past7DayAvg, next7DayAvg, seasonalClimate }
  } catch (error) {
    console.error('Weather fetch error:', error)
    return {
      past7DayAvg: { tempC: null, precipMm: null, windKph: null },
      next7DayAvg: { tempC: null, precipMm: null, windKph: null },
      seasonalClimate: ''
    }
  }
}

function calculateAverage(values: number[] | undefined): number | null {
  if (!values || values.length === 0) return null
  const sum = values.reduce((a, b) => a + b, 0)
  return Math.round(sum / values.length * 10) / 10
}

function calculateSum(values: number[] | undefined): number | null {
  if (!values || values.length === 0) return null
  return Math.round(values.reduce((a, b) => a + b, 0) * 10) / 10
}

function calculateMax(values: number[] | undefined): number | null {
  if (!values || values.length === 0) return null
  return Math.round(Math.max(...values) * 10) / 10
}

function deriveSeasonalClimate(lat: number): string {
  // Simplified climate description based on latitude
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
 * Fetch attractions from OpenTripMap
 */
async function fetchAttractions(location: Location): Promise<string[]> {
  const apiKey = import.meta.env.VITE_OPENTRIPMAP_API_KEY

  if (!apiKey || !location.lat || !location.lon) {
    return []
  }

  try {
    const response = await fetch(
      `https://api.opentripmap.com/0.1/en/places/radius?` +
      new URLSearchParams({
        apikey: apiKey,
        radius: '10000',
        lon: location.lon.toString(),
        lat: location.lat.toString(),
        kinds: 'interesting_places,tourist_facilities,cultural,architecture,museums',
        limit: '10',
        format: 'json'
      })
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return (data.features || []).map((f: any) => f.properties.name).filter(Boolean)
  } catch (error) {
    console.error('OpenTripMap error:', error)
    return []
  }
}

/**
 * Fetch Yelp data for restaurants, coffee shops, bars, and hotels
 */
async function fetchYelpData(location: Location): Promise<{
  restaurants: string[]
  coffeeShops: string[]
  bars: string[]
  hotels: string[]
}> {
  const apiKey = import.meta.env.VITE_YELP_API_KEY

  if (!apiKey || !location.lat || !location.lon) {
    return { restaurants: [], coffeeShops: [], bars: [], hotels: [] }
  }

  try {
    const [restaurantsRes, coffeeRes, barsRes, hotelsRes] = await Promise.all([
      fetchYelpCategory(apiKey, location, 'restaurants', 5),
      fetchYelpCategory(apiKey, location, 'coffee', 5),
      fetchYelpCategory(apiKey, location, 'bars', 5),
      fetchYelpCategory(apiKey, location, 'hotels', 10),
    ])

    return {
      restaurants: restaurantsRes,
      coffeeShops: coffeeRes,
      bars: barsRes,
      hotels: hotelsRes
    }
  } catch (error) {
    console.error('Yelp API error:', error)
    return { restaurants: [], coffeeShops: [], bars: [], hotels: [] }
  }
}

async function fetchYelpCategory(
  apiKey: string,
  location: Location,
  category: string,
  limit: number
): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.yelp.com/v3/businesses/search?` +
      new URLSearchParams({
        latitude: location.lat!.toString(),
        longitude: location.lon!.toString(),
        categories: category,
        limit: limit.toString(),
        sort_by: 'rating'
      }),
      {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return (data.businesses || []).map((b: any) =>
      `${b.name} (★${b.rating})`
    )
  } catch (error) {
    return []
  }
}

/**
 * Fetch events from Ticketmaster
 */
async function fetchEvents(location: Location): Promise<{
  routineEvents: string[]
  upcomingEvents: string[]
}> {
  const apiKey = import.meta.env.VITE_TICKETMASTER_API_KEY

  if (!apiKey || !location.lat || !location.lon) {
    return { routineEvents: [], upcomingEvents: [] }
  }

  try {
    const response = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?` +
      new URLSearchParams({
        apikey: apiKey,
        latlong: `${location.lat},${location.lon}`,
        radius: '50',
        unit: 'km',
        size: '20',
        sort: 'date,asc'
      })
    )

    if (!response.ok) {
      return { routineEvents: [], upcomingEvents: [] }
    }

    const data = await response.json()
    const events = (data._embedded?.events || []).map((e: any) =>
      `${e.name} (${e.dates?.start?.localDate || 'TBD'})`
    )

    // Simple heuristic: classify events as routine vs upcoming
    const routineEvents: string[] = []
    const upcomingEvents: string[] = []

    for (const event of events) {
      // If contains "weekly" or "daily" or "monthly", consider routine
      if (/weekly|daily|monthly|every/i.test(event)) {
        routineEvents.push(event)
      } else {
        upcomingEvents.push(event)
      }
    }

    return { routineEvents, upcomingEvents }
  } catch (error) {
    console.error('Ticketmaster API error:', error)
    return { routineEvents: [], upcomingEvents: [] }
  }
}

/**
 * Fetch CIA World Factbook data (requires proxy)
 */
async function fetchCIAFactbook(location: Location): Promise<{
  introduction?: string
  geography?: string
  economy?: string
  government?: string
  terrorism?: string
  error?: string
  url?: string
}> {
  const proxyUrl = import.meta.env.VITE_PROXY_BASE_URL

  if (!proxyUrl) {
    return {
      error: 'Proxy not configured',
      url: `https://www.cia.gov/the-world-factbook/countries/${slugify(location.country)}/`
    }
  }

  try {
    const countrySlug = slugify(location.country)
    const url = `https://www.cia.gov/the-world-factbook/countries/${countrySlug}/`

    const response = await fetch(`${proxyUrl}?url=${encodeURIComponent(url)}`)

    if (!response.ok) {
      return {
        error: 'Failed to fetch CIA Factbook',
        url
      }
    }

    const html = await response.text()

    // Parse HTML and extract key sections
    // This is a simplified extraction - real implementation would need careful parsing
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    return {
      introduction: extractSection(doc, 'introduction'),
      geography: extractSection(doc, 'geography'),
      economy: extractSection(doc, 'economy'),
      government: extractSection(doc, 'government'),
      terrorism: extractSection(doc, 'terrorism'),
      url
    }
  } catch (error) {
    console.error('CIA Factbook error:', error)
    return {
      error: 'Error fetching CIA Factbook',
      url: `https://www.cia.gov/the-world-factbook/countries/${slugify(location.country)}/`
    }
  }
}

function extractSection(doc: Document, sectionName: string): string | undefined {
  // Simplified section extraction from CIA Factbook HTML
  const heading = Array.from(doc.querySelectorAll('h2, h3')).find(
    h => h.textContent?.toLowerCase().includes(sectionName.toLowerCase())
  )

  if (heading) {
    let content = ''
    let next = heading.nextElementSibling
    while (next && !['H2', 'H3'].includes(next.tagName)) {
      content += next.textContent + ' '
      next = next.nextElementSibling
    }
    return content.trim().substring(0, 500)
  }

  return undefined
}

/**
 * Fetch US State Department travel information
 */
async function fetchStateDeptInfo(location: Location): Promise<{
  advisoryLevel?: string | null
  notes?: string[]
  error?: string
  urls?: {
    infoUrl: string
    advisoryUrl: string
  }
}> {
  const proxyUrl = import.meta.env.VITE_PROXY_BASE_URL
  const countrySlug = slugify(location.country)

  const urls = {
    infoUrl: `https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/${location.country}.html`,
    advisoryUrl: `https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/${countrySlug}-travel-advisory.html`
  }

  if (!proxyUrl) {
    return {
      error: 'Proxy not configured',
      urls
    }
  }

  try {
    const response = await fetch(`${proxyUrl}?url=${encodeURIComponent(urls.advisoryUrl)}`)

    if (!response.ok) {
      return {
        error: 'Failed to fetch State Dept info',
        urls
      }
    }

    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Extract advisory level and key notes
    const advisoryLevel = doc.querySelector('.advisory-level')?.textContent?.trim() || null
    const notes = Array.from(doc.querySelectorAll('.advisory-content p'))
      .slice(0, 3)
      .map(p => p.textContent?.trim() || '')
      .filter(Boolean)

    return {
      advisoryLevel,
      notes,
      urls
    }
  } catch (error) {
    console.error('State Dept error:', error)
    return {
      error: 'Error fetching State Dept info',
      urls
    }
  }
}

/**
 * Generate creative overview using location context
 */
async function generateCreativeOverview(location: Location): Promise<string> {
  // In Creative Mode, generate a creative description
  // For now, return a simple template-based description
  const city = location.city || location.country
  const descriptions = [
    `${city} - a vibrant destination where culture and history intertwine`,
    `Discover ${city}, where every street tells a story`,
    `${city} awaits with its unique charm and endless possibilities`,
    `Experience the magic of ${city}, where tradition meets modernity`,
  ]

  // Use deterministic selection based on location name
  const hash = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return descriptions[hash % descriptions.length]
}

/**
 * Calculate recommended stay duration based on attractions and amenities
 */
function calculateRecommendedStay(
  location: Location,
  numAttractions: number,
  numRestaurants: number
): string {
  // Deterministic heuristic based on location type and available data
  let days = 2 // Base minimum

  // Add days based on attractions
  if (numAttractions > 20) days += 2
  else if (numAttractions > 10) days += 1

  // Add days based on dining scene
  if (numRestaurants > 10) days += 1

  // Country-level stays are usually longer
  if (!location.city) days += 3

  // Major cities typically need more time
  const majorCities = ['New York', 'London', 'Paris', 'Tokyo', 'Rome', 'Barcelona', 'Amsterdam']
  if (location.city && majorCities.some(c => location.city?.includes(c))) {
    days += 1
  }

  return `${days} days - Allows time to explore major attractions and experience local culture`
}

/**
 * Convert location name to URL slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
