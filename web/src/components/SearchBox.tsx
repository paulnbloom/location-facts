import { useState, useEffect, useRef } from 'react'
import type { TypeaheadSuggestion } from '../types'
import { searchCountries } from '../data/countries'
import { searchLocations } from '../services/nominatim'

interface SearchBoxProps {
  onSearch: (query: string) => void
  onLucky: () => void
  creativeMode: boolean
  onCreativeModeChange: (enabled: boolean) => void
  isLoading: boolean
}

export default function SearchBox({
  onSearch,
  onLucky,
  creativeMode,
  onCreativeModeChange,
  isLoading,
}: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<TypeaheadSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Debounced typeahead with countries + Nominatim
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Debounce: wait 300ms after user stops typing
    debounceTimerRef.current = setTimeout(async () => {
      try {
        // 1. Search countries first (synchronous, fast)
        const countryMatches = searchCountries(query, 5)

        // Convert country names to TypeaheadSuggestion format
        const countrySuggestions: TypeaheadSuggestion[] = countryMatches.map((country) => ({
          displayName: country,
          location: {
            country,
          },
        }))

        // 2. Query Nominatim for cities/postal codes
        const nominatimResults = await searchLocations(query, 5)

        // 3. Merge: countries on top, then Nominatim results
        // Remove any Nominatim results that match countries we already have
        const countryNames = new Set(countryMatches)
        const filteredNominatim = nominatimResults.filter(
          (result) => !countryNames.has(result.location.country)
        )

        const mergedSuggestions = [...countrySuggestions, ...filteredNominatim].slice(0, 8)
        setSuggestions(mergedSuggestions)
      } catch (error) {
        console.error('Error fetching typeahead suggestions:', error)
        // On error, still show country matches if available
        const countryMatches = searchCountries(query, 5)
        const countrySuggestions: TypeaheadSuggestion[] = countryMatches.map((country) => ({
          displayName: country,
          location: {
            country,
          },
        }))
        setSuggestions(countrySuggestions)
      }
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query])

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter key triggers search
      if (e.key === 'Enter' && document.activeElement === inputRef.current) {
        handleSearch()
        return
      }

      // Alt+L triggers "I'm feeling lucky"
      if (e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        handleLucky()
        return
      }

      // Arrow navigation for suggestions
      if (showSuggestions && suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault()
          selectSuggestion(suggestions[selectedIndex])
        } else if (e.key === 'Escape') {
          setShowSuggestions(false)
          setSelectedIndex(-1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSuggestions, suggestions, selectedIndex, query])

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim())
      setShowSuggestions(false)
    }
  }

  const handleLucky = () => {
    onLucky()
    setShowSuggestions(false)
  }

  const selectSuggestion = (suggestion: TypeaheadSuggestion) => {
    setQuery(suggestion.displayName)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    onSearch(suggestion.displayName)
  }

  const handleInputChange = (value: string) => {
    setQuery(value)
    setShowSuggestions(value.length >= 2)
    setSelectedIndex(-1)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* App Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Location Facts</h1>
      <p className="text-gray-600 text-center mb-6">
        Search by postal code, city, or country
      </p>

      {/* Search Input with Typeahead */}
      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder="Enter postal code, city, or country..."
          disabled={isLoading}
          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        {/* Typeahead Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors
                           ${index === selectedIndex ? 'bg-blue-100' : ''}`}
              >
                <span className="text-gray-900">{suggestion.displayName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold
                     py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400
                     disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
        <button
          onClick={handleLucky}
          disabled={isLoading}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold
                     py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400
                     disabled:cursor-not-allowed"
          title="Alt+L"
        >
          I'm Feeling Lucky
        </button>
      </div>

      {/* Creative Mode Toggle */}
      <div className="flex items-center justify-center">
        <label className="flex items-center cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={creativeMode}
              onChange={(e) => onCreativeModeChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer
                          peer-focus:ring-4 peer-focus:ring-blue-300
                          peer-checked:after:translate-x-full
                          rtl:peer-checked:after:-translate-x-full
                          peer-checked:after:border-white
                          after:content-[''] after:absolute after:top-[2px]
                          after:start-[2px] after:bg-white after:border-gray-300
                          after:border after:rounded-full after:h-5 after:w-5
                          after:transition-all peer-checked:bg-blue-600"></div>
          </div>
          <span className="ms-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
            Creative Mode {creativeMode ? 'ON' : 'OFF'}
          </span>
        </label>
      </div>

      {/* Keyboard Hints */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Enter</kbd> to search
        {' • '}
        <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Alt+L</kbd> for lucky
      </div>
    </div>
  )
}
