import type { EventAlert } from '../lib/api'

interface Props {
  alerts: EventAlert[]
}

function severityClass(magnitude: number): string {
  if (magnitude >= 3) return 'border-red-400 bg-red-50'
  if (magnitude >= 2) return 'border-orange-400 bg-orange-50'
  return 'border-yellow-400 bg-yellow-50'
}

function severityLabel(magnitude: number): string {
  if (magnitude >= 3) return 'CRITICAL'
  if (magnitude >= 2) return 'HIGH'
  return 'MEDIUM'
}

function severityBadge(magnitude: number): string {
  if (magnitude >= 3) return 'bg-red-100 text-red-700'
  if (magnitude >= 2) return 'bg-orange-100 text-orange-700'
  return 'bg-yellow-100 text-yellow-700'
}

export default function EventAlerts({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
        No significant event spikes detected in the dataset.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`rounded-xl border-2 p-4 ${severityClass(alert.spike_magnitude)}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${severityBadge(alert.spike_magnitude)}`}
              >
                {severityLabel(alert.spike_magnitude)}
              </span>
              <span className="font-semibold text-gray-800">{alert.date}</span>
              <span className="text-gray-500 text-sm ml-2">
                ({alert.spike_magnitude.toFixed(1)}σ above baseline)
              </span>
            </div>
          </div>
          <p className="text-gray-700 text-sm mb-2">{alert.description}</p>
          <div className="flex flex-wrap gap-2">
            {alert.dominant_issues.map((issue) => (
              <span
                key={issue}
                className="text-xs bg-white border border-gray-300 rounded-full px-2 py-0.5 text-gray-700"
              >
                {issue}
              </span>
            ))}
          </div>
          {alert.affected_products.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Products: {alert.affected_products.join(', ')}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
