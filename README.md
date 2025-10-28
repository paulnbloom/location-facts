# Location Facts

A lightweight web application for discovering comprehensive information about any location worldwide. Search by postal code, city, or country to get a detailed fact sheet including Wikipedia summaries, weather data, local events, dining recommendations, and travel advisories.

## Features

- **Smart Search**: Search by postal code, city, or country with intelligent typeahead suggestions
- **Comprehensive Fact Sheets**: Get detailed information including:
  - Wikipedia-driven historical context and notable people
  - 7-day past and forecast weather data
  - Local events and attractions
  - Top-rated restaurants, coffee shops, bars, and hotels
  - Recommended stay duration
  - CIA World Factbook summaries
  - US State Department travel advisories
- **"I'm Feeling Lucky"**: Get a deterministic pseudo-random location suggestion
- **Creative Mode**: Toggle between factual reporting and enhanced creative summaries
- **Deterministic by Default**: Consistent, reproducible results with transparent sorting

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS with Typography plugin
- **Linting**: ESLint + Prettier
- **Package Manager**: pnpm

## Data Sources

- **Wikipedia**: MediaWiki REST API for historical and cultural information
- **Geocoding**: OpenStreetMap Nominatim for location search and coordinates
- **Weather**: Open-Meteo API for current and forecast weather data
- **Attractions**: OpenTripMap API (requires API key)
- **Dining & Lodging**: Yelp Fusion API (requires API key)
- **Events**: Ticketmaster Discovery API (requires API key)
- **Travel Info**: CIA World Factbook & US State Department (may require CORS proxy)

## Setup

### Prerequisites

- Node.js 20+ (recommended: use nvm or fnm)
- pnpm (installed globally or via corepack)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/paulnbloom/location-facts.git
cd location-facts
```

2. Navigate to the web directory:
```bash
cd web
```

3. Install dependencies:
```bash
pnpm install
```

4. Set up environment variables:
```bash
cp .env.example .env
```

5. Edit `.env` and add your API keys:
```env
VITE_OPENTRIPMAP_API_KEY=your_opentripmap_api_key
VITE_YELP_API_KEY=your_yelp_api_key
VITE_TICKETMASTER_API_KEY=your_ticketmaster_api_key
VITE_PROXY_BASE_URL=https://your-cors-proxy.com  # Optional
```

### Getting API Keys

- **OpenTripMap**: Register at [OpenTripMap](https://opentripmap.io/product)
- **Yelp Fusion**: Create an app at [Yelp Developers](https://www.yelp.com/developers)
- **Ticketmaster**: Register at [Ticketmaster Developer Portal](https://developer.ticketmaster.com/)

### Running the App

Development mode:
```bash
pnpm dev
```

Build for production:
```bash
pnpm build
```

Preview production build:
```bash
pnpm preview
```

## Development

### Code Quality

Lint code:
```bash
pnpm lint
pnpm lint:fix  # Auto-fix issues
```

Format code:
```bash
pnpm format
pnpm format:check  # Check without modifying
```

### CORS Proxy Setup

Some data sources (CIA Factbook, State Department) may require a CORS proxy. You can:

1. **Use a public proxy** (not recommended for production):
   - `https://cors-anywhere.herokuapp.com/`

2. **Deploy your own serverless proxy**:
   - Use Cloudflare Workers, AWS Lambda, or Vercel Edge Functions
   - Example worker script:
   ```javascript
   export default {
     async fetch(request) {
       const url = new URL(request.url)
       const targetUrl = url.searchParams.get('url')
       if (!targetUrl) return new Response('Missing url parameter', { status: 400 })

       const response = await fetch(targetUrl)
       const newResponse = new Response(response.body, response)
       newResponse.headers.set('Access-Control-Allow-Origin', '*')
       return newResponse
     }
   }
   ```

## Project Structure

```
location-facts/
├── web/                    # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service layers
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions
│   │   ├── App.tsx        # Main app component
│   │   ├── main.tsx       # App entry point
│   │   └── index.css      # Global styles
│   ├── public/            # Static assets
│   ├── .env.example       # Environment variables template
│   ├── package.json       # Dependencies and scripts
│   ├── vite.config.ts     # Vite configuration
│   ├── tsconfig.json      # TypeScript configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── eslint.config.js   # ESLint configuration
├── LICENSE                # MIT License
└── README.md              # This file
```

## Determinism Rules

- **Default Behavior**: All results are sorted by API-provided rating/importance, then alphabetically
- **"I'm Feeling Lucky"**: Uses a stable seed (hash of current ISO date) for pseudo-random selection
- **Creative Mode OFF**: Strictly factual reporting, no embellishment
- **Creative Mode ON**: May add a human-sounding overview paragraph, but fact sheet sections remain factual

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm lint` and `pnpm format`
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details

## Acknowledgments

- OpenStreetMap contributors for geocoding data
- Wikipedia for historical and cultural information
- Open-Meteo for weather data
- OpenTripMap, Yelp, and Ticketmaster for location-based data
