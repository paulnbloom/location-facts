import Section from './Section'
import List from './List'
import type { FactSheet as FactSheetType } from '../types'

interface FactSheetProps {
  factSheet: FactSheetType
  creativeMode: boolean
}

export default function FactSheet({ factSheet, creativeMode }: FactSheetProps) {
  const { location, creativeOverview, wikipedia, weather, localHappenings, foodAndLodging, stayRecommendation, ciaFactbook, stateDept } = factSheet

  // Format header: <postal code>|<city>, <state/province>, <country>
  // If location is a country, return only the country name
  const formatHeader = () => {
    if (!location.city && !location.state) {
      return location.country
    }

    const parts = []
    if (location.postalCode) parts.push(location.postalCode)
    if (location.city) parts.push(location.city)
    if (location.state) parts.push(location.state)
    parts.push(location.country)

    return parts.join(', ')
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      {/* Header */}
      <header className="mb-8 pb-4 border-b-4 border-blue-600">
        <h1 className="text-3xl font-bold text-gray-900">{formatHeader()}</h1>
      </header>

      {/* Creative Overview (only when Creative Mode is ON) */}
      {creativeMode && creativeOverview && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
          <p className="text-gray-800 leading-relaxed">{creativeOverview}</p>
        </div>
      )}

      {/* Wikipedia Section */}
      <Section title="Wikipedia">
        {wikipedia ? (
          <div className="space-y-4">
            {wikipedia.nameOrigin && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How the location got its name:</h3>
                <p className="text-gray-700">{wikipedia.nameOrigin}</p>
              </div>
            )}

            {wikipedia.famousPeople && wikipedia.famousPeople.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Famous people:</h3>
                <List items={wikipedia.famousPeople} />
              </div>
            )}

            {wikipedia.historicalEvents && wikipedia.historicalEvents.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Major historical events:</h3>
                <List items={wikipedia.historicalEvents} />
              </div>
            )}

            {wikipedia.currentEvents && wikipedia.currentEvents.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Recent current events:</h3>
                <List items={wikipedia.currentEvents} />
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">No good answer</p>
        )}
      </Section>

      {/* Weather Section */}
      <Section title="Weather">
        {weather ? (
          <div className="space-y-3">
            {weather.past7Days && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Past 7 days:</h3>
                <p className="text-gray-700">{weather.past7Days}</p>
              </div>
            )}
            {weather.next7Days && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Next 7 days forecast:</h3>
                <p className="text-gray-700">{weather.next7Days}</p>
              </div>
            )}
            {weather.climateSummary && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Climate by seasons:</h3>
                <p className="text-gray-700">{weather.climateSummary}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">No good answer</p>
        )}
      </Section>

      {/* Local Happenings Section */}
      <Section title="Local Happenings">
        {localHappenings ? (
          <div className="space-y-4">
            {localHappenings.routineEvents && localHappenings.routineEvents.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Routine events:</h3>
                <List
                  items={localHappenings.routineEvents}
                  renderItem={(event) => (
                    <span>
                      {event.name}
                      {event.date && <span className="text-gray-600 text-sm ml-2">({event.date})</span>}
                    </span>
                  )}
                />
              </div>
            )}

            {localHappenings.upcomingEvents && localHappenings.upcomingEvents.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Upcoming events:</h3>
                <List
                  items={localHappenings.upcomingEvents}
                  renderItem={(event) => (
                    <span>
                      {event.name}
                      {event.date && <span className="text-gray-600 text-sm ml-2">({event.date})</span>}
                    </span>
                  )}
                />
              </div>
            )}

            {localHappenings.attractions && localHappenings.attractions.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Major attractions or notable places:</h3>
                <List
                  items={localHappenings.attractions}
                  renderItem={(attraction) => (
                    <span>
                      {attraction.name}
                      {attraction.rating && (
                        <span className="text-yellow-600 text-sm ml-2">★ {attraction.rating}</span>
                      )}
                    </span>
                  )}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">No good answer</p>
        )}
      </Section>

      {/* Food & Lodging Section */}
      <Section title="Food & Lodging">
        {foodAndLodging ? (
          <div className="space-y-4">
            {foodAndLodging.restaurants && foodAndLodging.restaurants.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Top 5 Restaurants:</h3>
                <List
                  items={foodAndLodging.restaurants.slice(0, 5)}
                  renderItem={(restaurant) => (
                    <span>
                      {restaurant.name}
                      {restaurant.rating && <span className="text-yellow-600 text-sm ml-2">★ {restaurant.rating}</span>}
                      {restaurant.cuisine && <span className="text-gray-600 text-sm ml-2">• {restaurant.cuisine}</span>}
                      {restaurant.priceLevel && <span className="text-gray-600 text-sm ml-2">• {restaurant.priceLevel}</span>}
                    </span>
                  )}
                />
              </div>
            )}

            {foodAndLodging.coffeeShops && foodAndLodging.coffeeShops.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Top 5 Coffee Shops:</h3>
                <List items={foodAndLodging.coffeeShops.slice(0, 5)} renderItem={(shop) => shop.name} />
              </div>
            )}

            {foodAndLodging.bars && foodAndLodging.bars.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Top 5 Bars:</h3>
                <List items={foodAndLodging.bars.slice(0, 5)} renderItem={(bar) => bar.name} />
              </div>
            )}

            {foodAndLodging.hotels && foodAndLodging.hotels.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Top 10 Highly Recommended Hotels:</h3>
                <List
                  items={foodAndLodging.hotels.slice(0, 10)}
                  renderItem={(hotel) => (
                    <span>
                      {hotel.name}
                      {hotel.rating && <span className="text-yellow-600 text-sm ml-2">★ {hotel.rating}</span>}
                      {hotel.priceRange && <span className="text-gray-600 text-sm ml-2">• {hotel.priceRange}</span>}
                    </span>
                  )}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">No good answer</p>
        )}
      </Section>

      {/* Stay Length Recommendation */}
      <Section title="Recommended Stay Length">
        {stayRecommendation ? (
          <div>
            <p className="text-gray-900 font-semibold text-lg mb-2">
              {stayRecommendation.recommendedDays} day{stayRecommendation.recommendedDays !== 1 ? 's' : ''}
            </p>
            {stayRecommendation.reasoning && (
              <p className="text-gray-700">{stayRecommendation.reasoning}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">No good answer</p>
        )}
      </Section>

      {/* CIA World Factbook */}
      <Section title="CIA World Factbook">
        {ciaFactbook ? (
          <div className="space-y-3">
            {ciaFactbook.introduction && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Introduction:</h3>
                <p className="text-gray-700">{ciaFactbook.introduction}</p>
              </div>
            )}
            {ciaFactbook.geography && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Geography:</h3>
                <p className="text-gray-700">{ciaFactbook.geography}</p>
              </div>
            )}
            {ciaFactbook.economy && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Economy:</h3>
                <p className="text-gray-700">{ciaFactbook.economy}</p>
              </div>
            )}
            {ciaFactbook.government && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Government:</h3>
                <p className="text-gray-700">{ciaFactbook.government}</p>
              </div>
            )}
            {ciaFactbook.terrorismIssues && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Terrorism & Transnational Issues:</h3>
                <p className="text-gray-700">{ciaFactbook.terrorismIssues}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">Needs proxy configured</p>
        )}
      </Section>

      {/* US State Department */}
      <Section title="US State Department Travel Information">
        {stateDept ? (
          <div className="space-y-3">
            {stateDept.travelRisks && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Active Travel Risks:</h3>
                <p className="text-gray-700">{stateDept.travelRisks}</p>
              </div>
            )}
            {stateDept.visaRequirements && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Visa Requirements:</h3>
                <p className="text-gray-700">{stateDept.visaRequirements}</p>
              </div>
            )}
            {stateDept.vaccinations && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Vaccination Suggestions:</h3>
                <p className="text-gray-700">{stateDept.vaccinations}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">Needs proxy configured</p>
        )}
      </Section>
    </div>
  )
}
