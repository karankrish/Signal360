import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

interface ChannelSentiment {
  channel: string
  avg_sentiment: number
  avg_rating: number
  record_count: number
}

interface Props {
  data: ChannelSentiment[]
}

const COLORS = ['#FF6900', '#111111', '#94a3b8', '#22c55e']

export default function ChannelDistribution({ data }: Props) {
  const pieData = data.map((d) => ({ name: d.channel, value: d.record_count }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Channel Distribution & Sentiment</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-2 text-center">Volume by Channel</p>
          <PieChart width={200} height={200}>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name}>
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-2 text-center">Sentiment by Channel</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="channel" tick={{ fontSize: 10 }} />
              <YAxis domain={[-1, 1]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [v.toFixed(3), 'Avg Sentiment']} />
              <Bar dataKey="avg_sentiment" radius={[4, 4, 0, 0]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.avg_sentiment > 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
