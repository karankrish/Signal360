import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import type { RiskScore } from '../lib/api'
import { riskLevelColor, formatDate } from '../lib/utils'

interface Props {
  risks: RiskScore[]
  forecast: { date: string; predicted_sentiment: number }[]
}

export default function RiskForecast({ risks, forecast }: Props) {
  const chartData = forecast.map((f) => ({
    date: formatDate(f.date),
    sentiment: f.predicted_sentiment,
  }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {risks.map((risk) => (
          <div
            key={risk.risk_type}
            className={`rounded-xl border p-4 ${riskLevelColor(risk.level)}`}
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-sm">{risk.risk_type}</h4>
              <span className="text-xs font-bold uppercase">{risk.level}</span>
            </div>
            <div className="text-2xl font-bold mb-1">{Math.round(risk.score * 100)}%</div>
            <div className="w-full bg-white bg-opacity-50 rounded-full h-1.5 mb-2">
              <div
                className="h-1.5 rounded-full bg-current opacity-60"
                style={{ width: `${Math.round(risk.score * 100)}%` }}
              />
            </div>
            <p className="text-xs opacity-80">{risk.description}</p>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-3">7-Day Sentiment Forecast</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[-1, 1]} tick={{ fontSize: 11 }} tickFormatter={(v) => v.toFixed(1)} />
              <Tooltip formatter={(v: number) => [v.toFixed(3), 'Predicted Sentiment']} />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="sentiment"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#94a3b8', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
