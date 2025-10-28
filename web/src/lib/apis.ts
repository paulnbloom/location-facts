/**
 * API Fetchers for Location Facts
 * All external data sources with proper error handling and TypeScript types
 */

import type { Location, TypeaheadSuggestion } from '../types'

// ============================================================================
// NOMINATIM (OpenStreetMap Geocoding)
// ============================================================================

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const USER_AGENT = 'LocationFacts/1.0 (https://github.com/paulnbloom/location-facts)'

interface NominatimResult {
  place_id: number
  lat: string
  lon: string
  display_name: string
  address?: {
    house_number?: string
    road?: string
    suburb?: string
    city?: string
    town?: string
    village?: string
    county?: string
    state?: string
    postcode?: string
    country?: string
    country_code?: string
  }
  type: string
  importance: number
}

export async function nominatimSearch(query: string): Promise<Location | null> {
  try {
    const url = `${NOMINATIM_BASE}/search?` + new URLSearchParams({
      format: 'json',
      addressdetails: '1',
      limit: '1',
      q: query.trim()
    })

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    })

    if (!response.ok) return null

    const results: NominatimResult[] = await response.json()
    if (results.length === 0) return null

    const result = results[0]
    const address = result.address

    return {
      city: address?.city || address?.town || address?.village,
      state: address?.state,
      country: address?.country || '',
      postalCode: address?.postcode,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon)
    }
  } catch (error) {
    console.error('Nominatim search error:', error)
    return null
  }
}

export async function nominatimSuggest(
  query: string,
  limit: number = 5
): Promise<TypeaheadSuggestion[]> {
  try {
    const url = `${NOMINATIM_BASE}/search?` + new URLSearchParams({
      format: 'json',
      addressdetails: '1',
      limit: limit.toString(),
      q: query.trim()
    })

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    })

    if (!response.ok) return []

    const results: NominatimResult[] = await response.json()

    return results.map(result => {
      const address = result.address
      return {
        displayName: result.display_name,
        location: {
          city: address?.city || address?.town || address?.village,
          state: address?.state,
          country: address?.country || '',
          postalCode: address?.postcode,
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon)
        }
      }
    })
  } catch (error) {
    console.error('Nominatim suggest error:', error)
    return []
  }
}

// ============================================================================
// WIKIPEDIA
// ============================================================================

export async function wikipediaSummary(title: string): Promise<string> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    const response = await fetch(url)

    if (!response.ok) return ''

    const data = await response.json()
    return data.extract || ''
  } catch (error) {
    console.error('Wikipedia summary error:', error)
    return ''
  }
}

interface WikiSection {
  line: string
  level: string
  index: string
}

export async function wikipediaParseSections(title: string): Promise<{
  sections: WikiSection[]
  html: string
}> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?` + new URLSearchParams({
      action: 'parse',
      page: title,
      format: 'json',
      prop: 'sections|text',
      redirects: '1',
      origin: '*'
    })

    const response = await fetch(url)

    if (!response.ok) {
      return { sections: [], html: '' }
    }

    const data = await response.json()

    if (data.error) {
      return { sections: [], html: '' }
    }

    return {
      sections: data.parse?.sections || [],
      html: data.parse?.text?.['*'] || ''
    }
  } catch (error) {
    console.error('Wikipedia parse sections error:', error)
    return { sections: [], html: '' }
  }
}

// ============================================================================
// OPEN-METEO (Weather)
// ============================================================================

interface WeatherData {
  daily: {
    time: string[]
    temperature_2m_mean: number[]
    precipitation_sum: number[]
    wind_speed_10m_max: number[]
  }
}

export async function openMeteoDaily(
  lat: number,
  lon: number
): Promise<{
  past7Days: { tempC: number; precipMm: number; windKph: number }
  next7Days: { tempC: number; precipMm: number; windKph: number }
} | null> {
  try {
    // Get today's date
    const today = new Date()
    const past7Date = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch historical + forecast data
    const url = `https://api.open-meteo.com/v1/forecast?` + new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      daily: 'temperature_2m_mean,precipitation_sum,wind_speed_10m_max',
      start_date: past7Date.toISOString().split('T')[0],
      forecast_days: '14',
      timezone: 'auto'
    })

    const response = await fetch(url)

    if (!response.ok) return null

    const data: WeatherData = await response.json()

    if (!data.daily) return null

    // Split into past 7 and next 7
    const temps = data.daily.temperature_2m_mean
    const precip = data.daily.precipitation_sum
    const wind = data.daily.wind_speed_10m_max

    const midpoint = Math.floor(temps.length / 2)

    return {
      past7Days: {
        tempC: average(temps.slice(0, midpoint)),
        precipMm: sum(precip.slice(0, midpoint)),
        windKph: max(wind.slice(0, midpoint))
      },
      next7Days: {
        tempC: average(temps.slice(midpoint)),
        precipMm: sum(precip.slice(midpoint)),
        windKph: max(wind.slice(midpoint))
      }
    }
  } catch (error) {
    console.error('Open-Meteo error:', error)
    return null
  }
}

// ============================================================================
// OPENTRIPMAP (Attractions)
// ============================================================================

interface OpenTripMapPlace {
  name: string
  xid: string
  kinds: string
  dist: number
}

export async function openTripMapAttractions(
  lat: number,
  lon: number,
  limit: number = 20
): Promise<string[]> {
  const apiKey = import.meta.env.VITE_OPENTRIPMAP_API_KEY

  if (!apiKey) {
    console.warn('OpenTripMap API key not configured')
    return []
  }

  try {
    const url = `https://api.opentripmap.com/0.1/en/places/radius?` + new URLSearchParams({
      apikey: apiKey,
      radius: '10000',
      lon: lon.toString(),
      lat: lat.toString(),
      kinds: 'interesting_places,tourist_facilities,cultural,architecture,museums',
      limit: limit.toString(),
      format: 'json'
    })

    const response = await fetch(url)

    if (!response.ok) return []

    const data: OpenTripMapPlace[] = await response.json()

    return data
      .map(place => place.name)
      .filter(name => name && name.length > 0)
      .slice(0, limit)
  } catch (error) {
    console.error('OpenTripMap error:', error)
    return []
  }
}

// ============================================================================
// YELP (Food & Lodging) - Optional
// ============================================================================

interface YelpBusiness {
  name: string
  rating: number
  categories: Array<{ alias: string; title: string }>
  price?: string
}

export async function yelpTopPlaces(
  term: string,
  lat: number,
  lon: number,
  limit: number = 5
): Promise<string[]> {
  const apiKey = import.meta.env.VITE_YELP_API_KEY

  if (!apiKey) {
    return []
  }

  try {
    const url = `https://api.yelp.com/v3/businesses/search?` + new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      term,
      limit: limit.toString(),
      sort_by: 'rating'
    })

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    })

    if (!response.ok) return []

    const data = await response.json()
    const businesses: YelpBusiness[] = data.businesses || []

    return businesses.map(b => `${b.name} (★${b.rating})`)
  } catch (error) {
    console.error('Yelp error:', error)
    return []
  }
}

// ============================================================================
// TICKETMASTER (Events)
// ============================================================================

interface TicketmasterEvent {
  name: string
  dates: {
    start: {
      localDate?: string
    }
  }
}

export async function ticketmasterEvents(
  lat: number,
  lon: number,
  radius: number = 50
): Promise<{ routine: string[]; upcoming: string[] }> {
  const apiKey = import.meta.env.VITE_TICKETMASTER_API_KEY

  if (!apiKey) {
    return { routine: [], upcoming: [] }
  }

  try {
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?` + new URLSearchParams({
      apikey: apiKey,
      latlong: `${lat},${lon}`,
      radius: radius.toString(),
      unit: 'km',
      size: '50',
      sort: 'date,asc'
    })

    const response = await fetch(url)

    if (!response.ok) return { routine: [], upcoming: [] }

    const data = await response.json()
    const events: TicketmasterEvent[] = data._embedded?.events || []

    const routine: string[] = []
    const upcoming: string[] = []

    events.forEach(event => {
      const date = event.dates?.start?.localDate || 'TBD'
      const eventStr = `${event.name} (${date})`

      // Classify as routine if contains certain keywords
      if (/weekly|daily|monthly|recurring|season|series/i.test(event.name)) {
        routine.push(eventStr)
      } else {
        upcoming.push(eventStr)
      }
    })

    return { routine, upcoming }
  } catch (error) {
    console.error('Ticketmaster error:', error)
    return { routine: [], upcoming: [] }
  }
}

// ============================================================================
// CIA FACTBOOK
// ============================================================================

export async function fetchCIAFactbook(country: string): Promise<{
  introduction?: string
  geography?: string
  economy?: string
  government?: string
  terrorism?: string
  error?: string
  url: string
}> {
  const proxyUrl = import.meta.env.VITE_PROXY_BASE_URL
  const slug = slugify(country)
  const targetUrl = `https://www.cia.gov/the-world-factbook/countries/${slug}/`

  if (!proxyUrl) {
    return {
      error: 'Proxy not configured',
      url: targetUrl
    }
  }

  try {
    const response = await fetch(`${proxyUrl}?url=${encodeURIComponent(targetUrl)}`)

    if (!response.ok) {
      return {
        error: 'Failed to fetch CIA Factbook',
        url: targetUrl
      }
    }

    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    return {
      introduction: extractSection(doc, 'introduction', 500),
      geography: extractSection(doc, 'geography', 500),
      economy: extractSection(doc, 'economy', 500),
      government: extractSection(doc, 'government', 500),
      terrorism: extractSection(doc, 'terrorism', 500),
      url: targetUrl
    }
  } catch (error) {
    console.error('CIA Factbook error:', error)
    return {
      error: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      url: targetUrl
    }
  }
}

// ============================================================================
// US STATE DEPARTMENT
// ============================================================================

export async function fetchStateDept(country: string): Promise<{
  advisoryLevel?: string | null
  notes?: string[]
  error?: string
  urls: {
    infoUrl: string
    advisoryUrl: string
  }
}> {
  const proxyUrl = import.meta.env.VITE_PROXY_BASE_URL
  const slug = slugify(country)

  const urls = {
    infoUrl: `https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/${country}.html`,
    advisoryUrl: `https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/${slug}-travel-advisory.html`
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
        error: 'Failed to fetch State Dept advisory',
        urls
      }
    }

    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Try to extract advisory level and notes
    const advisoryLevel = doc.querySelector('.advisory-level')?.textContent?.trim() || null
    const notes = Array.from(doc.querySelectorAll('.advisory-content p'))
      .slice(0, 5)
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
      error: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      urls
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const sum = numbers.reduce((a, b) => a + b, 0)
  return Math.round(sum / numbers.length * 10) / 10
}

export function sum(numbers: number[]): number {
  return Math.round(numbers.reduce((a, b) => a + b, 0) * 10) / 10
}

export function max(numbers: number[]): number {
  if (numbers.length === 0) return 0
  return Math.round(Math.max(...numbers) * 10) / 10
}

export function formatTemp(celsius: number | null): string {
  if (celsius === null) return 'N/A'
  const fahrenheit = (celsius * 9/5) + 32
  return `${celsius}°C (${Math.round(fahrenheit)}°F)`
}

export function recommendStay(
  population?: number,
  attractionsCount: number = 0,
  isCountry: boolean = false
): string {
  let days = 2 // Base minimum

  // Country-level stays are longer
  if (isCountry) {
    days = 7
    return `${days} days - Recommended for exploring a country's major cities and regions`
  }

  // Add days based on attractions
  if (attractionsCount > 20) days += 2
  else if (attractionsCount > 10) days += 1

  // Add days based on population (major cities)
  if (population) {
    if (population > 5000000) days += 2 // Mega city
    else if (population > 1000000) days += 1 // Major city
  }

  // Cap at reasonable maximum
  days = Math.min(days, 7)

  return `${days} days - Allows time to explore major attractions and experience local culture`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function extractSection(doc: Document, sectionName: string, maxLength: number = 500): string | undefined {
  // Try to find section by id first (e.g., id="introduction")
  const sectionId = sectionName.toLowerCase().replace(/\s+/g, '-')
  let sectionDiv = doc.getElementById(sectionId)

  // If not found by ID, try to find heading with section name
  if (!sectionDiv) {
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4'))
    const heading = headings.find(h =>
      h.textContent?.toLowerCase().includes(sectionName.toLowerCase())
    )

    if (heading) {
      sectionDiv = heading.parentElement
    }
  }

  if (!sectionDiv) return undefined

  // Extract all paragraph text within the section
  const paragraphs = sectionDiv.querySelectorAll('p')
  let content = ''

  for (const p of Array.from(paragraphs)) {
    const text = p.textContent?.trim()
    if (text && text.length > 0) {
      content += text + ' '
      if (content.length >= maxLength) break
    }
  }

  return content.trim().substring(0, maxLength) || undefined
}
