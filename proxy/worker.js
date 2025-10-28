/**
 * CORS Proxy Worker with Puppeteer for Location Facts
 * Renders JavaScript-heavy sites and caches results for 30 days
 */

import puppeteer from '@cloudflare/puppeteer';

const CACHE_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

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

    // Check cache first
    const cacheKey = `rendered:${targetUrl}`
    const cached = await env.CACHE.get(cacheKey)

    if (cached) {
      return new Response(cached, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'text/html',
          'Cache-Control': `public, max-age=${CACHE_TTL}`,
          'X-Cache': 'HIT'
        }
      })
    }

    try {
      // Launch browser and render page
      const browser = await puppeteer.launch(env.BROWSER);
      const page = await browser.newPage();

      // Set a reasonable timeout
      await page.goto(targetUrl, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for content to render (CIA Factbook specific)
      await page.waitForSelector('#introduction, #geography, #economy', {
        timeout: 10000
      }).catch(() => {
        // Continue even if selector not found
      });

      // Get the rendered HTML
      const html = await page.content();

      await browser.close();

      // Cache the rendered HTML for 30 days
      ctx.waitUntil(
        env.CACHE.put(cacheKey, html, {
          expirationTtl: CACHE_TTL
        })
      );

      return new Response(html, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'text/html',
          'Cache-Control': `public, max-age=${CACHE_TTL}`,
          'X-Cache': 'MISS'
        }
      })
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: `Proxy error: ${error.message}`,
          stack: error.stack
        }),
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
