/**
 * CORS Proxy Worker for Location Facts
 * Allows fetching CIA Factbook and State Dept data from the browser
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        }
      })
    }

    const url = new URL(request.url)
    const targetUrl = url.searchParams.get('url')

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing url parameter' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Security: Only allow specific domains
    const allowedDomains = [
      'cia.gov',
      'www.cia.gov',
      'travel.state.gov'
    ]

    const targetHostname = new URL(targetUrl).hostname
    if (!allowedDomains.some(domain => targetHostname.endsWith(domain))) {
      return new Response(
        JSON.stringify({ error: 'Domain not allowed' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'LocationFacts/1.0 (https://github.com/paulnbloom/location-facts)'
        }
      })

      const body = await response.text()

      return new Response(body, {
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': response.headers.get('Content-Type') || 'text/html',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
      })
    } catch (error) {
      return new Response(
        JSON.stringify({ error: `Proxy error: ${error.message}` }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }
  }
}
