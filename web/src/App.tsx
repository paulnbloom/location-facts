import { useState } from 'react'

function App() {
  const [query, setQuery] = useState('')
  const [creativeMode, setCreativeMode] = useState(false)

  const handleSearch = () => {
    console.log('Searching for:', query)
  }

  const handleLucky = () => {
    console.log('Feeling lucky!', query)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Location Facts</h1>
          <p className="text-gray-600">Search by postal code, city, or country</p>
        </header>

        <div className="max-w-2xl mx-auto">
          {/* Search Box */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter postal code, city, or country..."
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />

            {/* Buttons */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSearch}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Search
              </button>
              <button
                onClick={handleLucky}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                I'm Feeling Lucky
              </button>
            </div>

            {/* Creative Mode Toggle */}
            <div className="mt-4 flex items-center justify-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={creativeMode}
                  onChange={(e) => setCreativeMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-700">
                  Creative Mode
                </span>
              </label>
            </div>
          </div>

          {/* Placeholder for results */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-500 text-center">Enter a search query to see fact sheet results</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
