import { useState } from 'react'
import SearchBox from './components/SearchBox'
import FactSheet from './components/FactSheet'
import type { FactSheet as FactSheetType } from './types'
import { searchLocation } from './lib/search'

function App() {
  const [creativeMode, setCreativeMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [factSheet, setFactSheet] = useState<FactSheetType | null>(null)

  const handleSearch = async (query: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Use real search pipeline
      const result = await searchLocation(query, creativeMode)
      setFactSheet(result)
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
