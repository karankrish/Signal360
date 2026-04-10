import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatDate } from '../lib/utils'
import type { SentimentPoint } from '../lib/api'

interface Props {
  data: SentimentPoint[]
  forecastData?: { date: string; predicted_sentiment: number }[]
}

export default function SentimentTimeline({ data, forecastData = [] }: Props) {
  const chartData = [
    ...data.map((d) => ({ ...d, date: formatDate(d.date) })),
    ...forecastData.map((f) => ({
      date: formatDate(f.date),
      avg_sentiment: undefined,
      predicted_sentiment: f.predicted_sentiment,
    })),
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Sentiment Timeline</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis domain={[-1, 1]} tickFormatter={(v) => v.toFixed(1)} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value: number, name: string) => [
              value?.toFixed(3),
              name === 'avg_sentiment' ? 'Sentiment' : 'Forecast',
            ]}
          />
          <Legend />
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
          <ReferenceLine y={0.1} stroke="#22c55e" strokeDasharray="2 2" opacity={0.4} />
          <ReferenceLine y={-0.1} stroke="#ef4444" strokeDasharray="2 2" opacity={0.4} />
          <Line
            type="monotone"
            dataKey="avg_sentiment"
            stroke="#FF6900"
            strokeWidth={2}
            dot={false}
            name="Sentiment"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="predicted_sentiment"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Forecast"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
