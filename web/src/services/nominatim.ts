import type { TypeaheadSuggestion } from '../types'

// OpenStreetMap Nominatim API
// Documentation: https://nominatim.org/release-docs/latest/api/Search/
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'

// User-Agent is required by Nominatim usage policy
const USER_AGENT = 'LocationFacts/1.0 (https://github.com/paulnbloom/location-facts)'

interface NominatimResult {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
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

/**
 * Search for locations using OpenStreetMap Nominatim
 * @param query - The search string (city, postal code, address, etc.)
 * @param limit - Maximum number of results (default: 5)
 * @returns Promise<TypeaheadSuggestion[]>
 */
export async function searchLocations(
  query: string,
  limit: number = 5
): Promise<TypeaheadSuggestion[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  try {
    const url = new URL(`${NOMINATIM_BASE_URL}/search`)
    url.searchParams.set('format', 'json')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('limit', limit.toString())
    url.searchParams.set('q', query.trim())

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
      },
    })

    if (!response.ok) {
      console.error('Nominatim API error:', response.status, response.statusText)
      return []
    }

    const results: NominatimResult[] = await response.json()

    return results.map((result) => convertToSuggestion(result))
  } catch (error) {
    console.error('Error fetching from Nominatim:', error)
    return []
  }
}

/**
 * Convert Nominatim result to TypeaheadSuggestion
 */
function convertToSuggestion(result: NominatimResult): TypeaheadSuggestion {
  const address = result.address

  // Extract location components
  const city =
    address?.city || address?.town || address?.village || address?.county || undefined
  const state = address?.state
  const country = address?.country || ''
  const postalCode = address?.postcode

  return {
    displayName: result.display_name,
    location: {
      city,
      state,
      country,
      postalCode,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
    },
  }
}

/**
 * Reverse geocode coordinates to location
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Promise<TypeaheadSuggestion | null>
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<TypeaheadSuggestion | null> {
  try {
    const url = new URL(`${NOMINATIM_BASE_URL}/reverse`)
    url.searchParams.set('format', 'json')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('lat', lat.toString())
    url.searchParams.set('lon', lon.toString())

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
      },
    })

    if (!response.ok) {
      console.error('Nominatim reverse geocode error:', response.status, response.statusText)
      return null
    }

    const result: NominatimResult = await response.json()
    return convertToSuggestion(result)
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    return null
  }
}
