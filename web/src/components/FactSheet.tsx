import Section from './Section'
import List from './List'
import type { FactSheet as FactSheetType } from '../types'

interface FactSheetProps {
  factSheet: FactSheetType
  creativeMode: boolean
}

export default function FactSheet({ factSheet, creativeMode }: FactSheetProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      {/* Header */}
      <header className="mb-8 pb-4 border-b-4 border-blue-600">
        <h1 className="text-3xl font-bold text-gray-900">{factSheet.header}</h1>
      </header>

      {/* Creative Overview (only when Creative Mode is ON) */}
      {creativeMode && factSheet.creativeOverview && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
          <p className="text-gray-800 leading-relaxed">{factSheet.creativeOverview}</p>
        </div>
      )}

      {/* Wikipedia Section */}
      <Section title="Wikipedia">
        <div className="space-y-4">
          {factSheet.naming && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How the location got its name:</h3>
              <p className="text-gray-700">{factSheet.naming}</p>
            </div>
          )}

          {factSheet.famousPeople.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Famous people:</h3>
              <List items={factSheet.famousPeople} />
            </div>
          )}

          {factSheet.majorHistory.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Major historical events:</h3>
              <List items={factSheet.majorHistory} />
            </div>
          )}

          {factSheet.recentEvents.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Recent current events:</h3>
              <List items={factSheet.recentEvents} />
            </div>
          )}

          {!factSheet.naming &&
            factSheet.famousPeople.length === 0 &&
            factSheet.majorHistory.length === 0 &&
            factSheet.recentEvents.length === 0 && (
              <p className="text-gray-500 italic">No good answer</p>
            )}
        </div>
      </Section>

      {/* Weather Section */}
      <Section title="Weather">
        <div className="space-y-3">
          {(factSheet.weatherPast7DayAvg.tempC !== null ||
            factSheet.weatherPast7DayAvg.precipMm !== null ||
            factSheet.weatherPast7DayAvg.windKph !== null) && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Past 7 days:</h3>
              <p className="text-gray-700">
                {factSheet.weatherPast7DayAvg.tempC !== null &&
                  `Avg temperature: ${factSheet.weatherPast7DayAvg.tempC}°C`}
                {factSheet.weatherPast7DayAvg.precipMm !== null &&
                  `, Total precipitation: ${factSheet.weatherPast7DayAvg.precipMm}mm`}
                {factSheet.weatherPast7DayAvg.windKph !== null &&
                  `, Max wind: ${factSheet.weatherPast7DayAvg.windKph} km/h`}
              </p>
            </div>
          )}

          {(factSheet.weatherNext7DayAvg.tempC !== null ||
            factSheet.weatherNext7DayAvg.precipMm !== null ||
            factSheet.weatherNext7DayAvg.windKph !== null) && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Next 7 days forecast:</h3>
              <p className="text-gray-700">
                {factSheet.weatherNext7DayAvg.tempC !== null &&
                  `Avg temperature: ${factSheet.weatherNext7DayAvg.tempC}°C`}
                {factSheet.weatherNext7DayAvg.precipMm !== null &&
                  `, Total precipitation: ${factSheet.weatherNext7DayAvg.precipMm}mm`}
                {factSheet.weatherNext7DayAvg.windKph !== null &&
                  `, Max wind: ${factSheet.weatherNext7DayAvg.windKph} km/h`}
              </p>
            </div>
          )}

          {factSheet.seasonalClimate && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Climate by seasons:</h3>
              <p className="text-gray-700">{factSheet.seasonalClimate}</p>
            </div>
          )}

          {factSheet.weatherPast7DayAvg.tempC === null &&
            factSheet.weatherPast7DayAvg.precipMm === null &&
            factSheet.weatherPast7DayAvg.windKph === null &&
            factSheet.weatherNext7DayAvg.tempC === null &&
            factSheet.weatherNext7DayAvg.precipMm === null &&
            factSheet.weatherNext7DayAvg.windKph === null &&
            !factSheet.seasonalClimate && <p className="text-gray-500 italic">No good answer</p>}
        </div>
      </Section>

      {/* Local Happenings Section */}
      <Section title="Local Happenings">
        <div className="space-y-4">
          {factSheet.routineEvents.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Routine events:</h3>
              <List items={factSheet.routineEvents} />
            </div>
          )}

          {factSheet.upcomingEvents.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Upcoming events:</h3>
              <List items={factSheet.upcomingEvents} />
            </div>
          )}

          {factSheet.attractions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Major attractions or notable places:</h3>
              <List items={factSheet.attractions} />
            </div>
          )}

          {factSheet.routineEvents.length === 0 &&
            factSheet.upcomingEvents.length === 0 &&
            factSheet.attractions.length === 0 && (
              <p className="text-gray-500 italic">No good answer</p>
            )}
        </div>
      </Section>

      {/* Food & Lodging Section */}
      <Section title="Food & Lodging">
        <div className="space-y-4">
          {factSheet.restaurants.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Top 5 Restaurants:</h3>
              <List items={factSheet.restaurants} />
            </div>
          )}

          {factSheet.coffeeShops.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Top 5 Coffee Shops:</h3>
              <List items={factSheet.coffeeShops} />
            </div>
          )}

          {factSheet.bars.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Top 5 Bars:</h3>
              <List items={factSheet.bars} />
            </div>
          )}

          {factSheet.hotels.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Top 10 Highly Recommended Hotels:</h3>
              <List items={factSheet.hotels} />
            </div>
          )}

          {factSheet.restaurants.length === 0 &&
            factSheet.coffeeShops.length === 0 &&
            factSheet.bars.length === 0 &&
            factSheet.hotels.length === 0 && (
              <p className="text-gray-500 italic">No good answer</p>
            )}
        </div>
      </Section>

      {/* Stay Length Recommendation */}
      <Section title="Recommended Stay Length">
        {factSheet.recommendedStay ? (
          <p className="text-gray-700">{factSheet.recommendedStay}</p>
        ) : (
          <p className="text-gray-500 italic">No good answer</p>
        )}
      </Section>

      {/* CIA World Factbook */}
      <Section title="CIA World Factbook">
        {factSheet.ciaSummary.error ? (
          <div>
            <p className="text-gray-500 italic mb-2">{factSheet.ciaSummary.error}</p>
            {factSheet.ciaSummary.url && (
              <a
                href={factSheet.ciaSummary.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                View on CIA.gov
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {factSheet.ciaSummary.introduction && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Introduction:</h3>
                <p className="text-gray-700">{factSheet.ciaSummary.introduction}</p>
              </div>
            )}
            {factSheet.ciaSummary.geography && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Geography:</h3>
                <p className="text-gray-700">{factSheet.ciaSummary.geography}</p>
              </div>
            )}
            {factSheet.ciaSummary.economy && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Economy:</h3>
                <p className="text-gray-700">{factSheet.ciaSummary.economy}</p>
              </div>
            )}
            {factSheet.ciaSummary.government && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Government:</h3>
                <p className="text-gray-700">{factSheet.ciaSummary.government}</p>
              </div>
            )}
            {factSheet.ciaSummary.terrorism && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Terrorism & Transnational Issues:</h3>
                <p className="text-gray-700">{factSheet.ciaSummary.terrorism}</p>
              </div>
            )}
            {!factSheet.ciaSummary.introduction &&
              !factSheet.ciaSummary.geography &&
              !factSheet.ciaSummary.economy &&
              !factSheet.ciaSummary.government &&
              !factSheet.ciaSummary.terrorism && (
                <p className="text-gray-500 italic">Needs proxy configured</p>
              )}
          </div>
        )}
      </Section>

      {/* US State Department */}
      <Section title="US State Department Travel Information">
        {factSheet.stateDept.error ? (
          <div>
            <p className="text-gray-500 italic mb-2">{factSheet.stateDept.error}</p>
            {factSheet.stateDept.urls && (
              <div className="space-y-1">
                <a
                  href={factSheet.stateDept.urls.advisoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm block"
                >
                  View Travel Advisory
                </a>
                <a
                  href={factSheet.stateDept.urls.infoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm block"
                >
                  View Country Information
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {factSheet.stateDept.advisoryLevel && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Travel Advisory Level:</h3>
                <p className="text-gray-700">{factSheet.stateDept.advisoryLevel}</p>
              </div>
            )}
            {factSheet.stateDept.notes && factSheet.stateDept.notes.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Important Notes:</h3>
                <List items={factSheet.stateDept.notes} />
              </div>
            )}
            {!factSheet.stateDept.advisoryLevel &&
              (!factSheet.stateDept.notes || factSheet.stateDept.notes.length === 0) && (
                <p className="text-gray-500 italic">Needs proxy configured</p>
              )}
          </div>
        )}
      </Section>
    </div>
  )
}
