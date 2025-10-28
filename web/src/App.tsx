import { useState } from 'react'
import SearchBox from './components/SearchBox'
import FactSheet from './components/FactSheet'
import type { FactSheet as FactSheetType } from './types'

function App() {
  const [creativeMode, setCreativeMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [factSheet, setFactSheet] = useState<FactSheetType | null>(null)

  const handleSearch = async (_query: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // TODO: Implement actual API calls using _query
      // For now, create mock data
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      const mockData: FactSheetType = {
        location: {
          city: 'New York',
          state: 'NY',
          country: 'USA',
          lat: 40.7128,
          lon: -74.006,
        },
        creativeOverview: creativeMode
          ? 'The Big Apple, a vibrant metropolis where dreams are made and skyscrapers touch the clouds. A melting pot of cultures, cuisines, and endless possibilities awaits around every corner.'
          : undefined,
        wikipedia: {
          nameOrigin:
            'The city was named after the Duke of York, who would become King James II of England.',
          famousPeople: [
            'Franklin D. Roosevelt - 32nd President of the United States',
            'Jay-Z - Rapper and entrepreneur',
            'Lady Gaga - Singer and actress',
          ],
          historicalEvents: [
            '1624 - Dutch settlement of New Amsterdam founded',
            '1776 - Battle of Long Island during American Revolution',
            '1886 - Statue of Liberty dedicated',
            '2001 - September 11 attacks',
          ],
          currentEvents: [
            'New York City continues to lead in COVID-19 recovery efforts',
            'Major infrastructure projects underway for public transit',
          ],
        },
        weather: {
          past7Days: 'Average temperature: 65°F (18°C), partly cloudy with occasional rain',
          next7Days: 'Forecast: 68-72°F (20-22°C), mix of sun and clouds',
          climateSummary:
            'Spring: Mild, 50-70°F. Summer: Warm to hot, 70-85°F. Fall: Cool, 50-70°F. Winter: Cold, 30-45°F with snow.',
        },
        localHappenings: {
          routineEvents: [
            { name: 'Broadway Shows', type: 'routine' },
            { name: 'Weekend Markets (Union Square, Brooklyn Flea)', type: 'routine' },
          ],
          upcomingEvents: [
            { name: 'NYC Marathon', date: 'November 3, 2025', type: 'upcoming' },
            { name: 'Thanksgiving Day Parade', date: 'November 28, 2025', type: 'upcoming' },
          ],
          attractions: [
            { name: 'Statue of Liberty', rating: 4.7 },
            { name: 'Central Park', rating: 4.8 },
            { name: 'Empire State Building', rating: 4.6 },
            { name: 'Times Square', rating: 4.5 },
            { name: 'Brooklyn Bridge', rating: 4.7 },
          ],
        },
        foodAndLodging: {
          restaurants: [
            { name: 'Le Bernardin', rating: 4.9, cuisine: 'French Seafood', priceLevel: '$$$$' },
            { name: 'Peter Luger Steak House', rating: 4.7, cuisine: 'Steakhouse', priceLevel: '$$$' },
            { name: 'Eleven Madison Park', rating: 4.8, cuisine: 'Contemporary', priceLevel: '$$$$' },
            { name: 'Katz\'s Delicatessen', rating: 4.6, cuisine: 'Deli', priceLevel: '$$' },
            { name: 'Joe\'s Pizza', rating: 4.5, cuisine: 'Pizza', priceLevel: '$' },
          ],
          coffeeShops: [
            { name: 'Blue Bottle Coffee', rating: 4.4 },
            { name: 'La Colombe', rating: 4.5 },
            { name: 'Stumptown Coffee Roasters', rating: 4.3 },
            { name: 'Devoción', rating: 4.6 },
            { name: 'Gregory\'s Coffee', rating: 4.2 },
          ],
          bars: [
            { name: 'Death & Co', rating: 4.7 },
            { name: 'Please Don\'t Tell (PDT)', rating: 4.6 },
            { name: 'The Dead Rabbit', rating: 4.8 },
            { name: 'Attaboy', rating: 4.5 },
            { name: 'Employees Only', rating: 4.6 },
          ],
          hotels: [
            { name: 'The Plaza Hotel', rating: 4.5, priceRange: '$$$$' },
            { name: 'The St. Regis New York', rating: 4.7, priceRange: '$$$$' },
            { name: 'The Carlyle', rating: 4.6, priceRange: '$$$$' },
            { name: 'Ace Hotel New York', rating: 4.3, priceRange: '$$$' },
            { name: 'The NoMad Hotel', rating: 4.5, priceRange: '$$$' },
            { name: 'The Bowery Hotel', rating: 4.4, priceRange: '$$$' },
            { name: 'citizenM New York Times Square', rating: 4.2, priceRange: '$$' },
            { name: 'Pod 51 Hotel', rating: 4.0, priceRange: '$' },
            { name: 'The Jane Hotel', rating: 3.9, priceRange: '$' },
            { name: 'YOTEL New York', rating: 4.1, priceRange: '$$' },
          ],
        },
        stayRecommendation: {
          recommendedDays: 4,
          reasoning:
            'Based on traveler data, 4-5 days allows you to see major attractions, experience different neighborhoods, catch a Broadway show, and enjoy the food scene without feeling rushed.',
        },
        ciaFactbook: {
          introduction:
            'The United States is the world\'s third-largest country by size and population. The economy is the largest and most technologically powerful.',
          geography:
            'Total area: 9,833,517 sq km. Varied terrain including vast central plains, mountains in the west, hills and low mountains in the east.',
          economy:
            'The US has the most technologically powerful economy in the world, with a per capita GDP of $59,800. The economy is market-oriented.',
          government:
            'Constitution-based federal republic with strong democratic tradition. Three branches: executive, legislative, and judicial.',
          terrorismIssues:
            'The US faces threats from both domestic extremists and international terrorist organizations.',
        },
        stateDept: {
          travelRisks: 'Exercise normal precautions when traveling to the United States.',
          visaRequirements:
            'Visa requirements vary by nationality. Many countries participate in the Visa Waiver Program (VWP) for tourism/business stays up to 90 days.',
          vaccinations:
            'No special vaccinations required. Routine vaccines recommended (MMR, DTaP, flu, etc.).',
        },
      }

      setFactSheet(mockData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLucky = async () => {
    // Generate deterministic pseudo-random location based on current date
    const today = new Date().toISOString().split('T')[0]
    const hash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

    const locations = [
      'Tokyo, Japan',
      'Paris, France',
      'London, UK',
      'Sydney, Australia',
      'Rio de Janeiro, Brazil',
      'Cairo, Egypt',
      'Mumbai, India',
      'Toronto, Canada',
    ]

    const luckyLocation = locations[hash % locations.length]
    await handleSearch(luckyLocation)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-[900px]">
        {/* Search Box Card */}
        <div className="mb-6">
          <SearchBox
            onSearch={handleSearch}
            onLucky={handleLucky}
            creativeMode={creativeMode}
            onCreativeModeChange={setCreativeMode}
            isLoading={isLoading}
          />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto flex-shrink-0 text-red-500 hover:text-red-700"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-md p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading fact sheet...</p>
            </div>
          </div>
        )}

        {/* Fact Sheet */}
        {!isLoading && factSheet && <FactSheet factSheet={factSheet} creativeMode={creativeMode} />}

        {/* Empty State */}
        {!isLoading && !factSheet && !error && (
          <div className="bg-white rounded-lg shadow-md p-12">
            <p className="text-gray-500 text-center text-lg">
              Enter a search query to discover comprehensive location facts
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
