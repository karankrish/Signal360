import type { PersonaInsight } from '../lib/api'
import { sentimentColor } from '../lib/utils'

interface Props {
  data: PersonaInsight[]
}

function SentimentBar({ score }: { score: number }) {
  const pct = Math.round(((score + 1) / 2) * 100)
  const color = sentimentColor(score)
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
      <div
        className="h-2 rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

export default function PersonaInsights({ data }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((p) => (
        <div key={p.segment} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-800">{p.segment}</h4>
            <span className="text-xs text-gray-500">{p.record_count} reviews</span>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Sentiment</span>
              <span
                style={{ color: sentimentColor(p.avg_sentiment) }}
                className="font-medium"
              >
                {p.avg_sentiment.toFixed(3)}
              </span>
            </div>
            <SentimentBar score={p.avg_sentiment} />
          </div>

          <div className="text-xs text-gray-600 mb-2">
            <span className="font-medium">Avg Rating:</span> {p.avg_rating.toFixed(1)}/5
          </div>

          {p.top_issues.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-1">Top Issues</p>
              <div className="flex flex-wrap gap-1">
                {p.top_issues.slice(0, 3).map((issue) => (
                  <span
                    key={issue}
                    className="text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-2 py-0.5"
                  >
                    {issue}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <span className="font-medium">Most Complained:</span> {p.most_complained_product}
          </div>
        </div>
      ))}
    </div>
  )
}
