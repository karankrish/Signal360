import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts'

interface Props {
  data: { issue: string; count: number }[]
}

const CRITICAL_ISSUES = new Set(['app_crash', 'stock_out', 'launch_failure', 'payment_failure', 'bots'])
const HIGH_ISSUES = new Set(['delivery_delay', 'staff_behavior', 'checkout_error', 'counterfeit'])

function getColor(issue: string): string {
  if (CRITICAL_ISSUES.has(issue)) return '#ef4444'
  if (HIGH_ISSUES.has(issue)) return '#f59e0b'
  return '#FF6900'
}

export default function IssueBreakdown({ data }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Top Issues</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis dataKey="issue" type="category" tick={{ fontSize: 11 }} width={95} />
          <Tooltip formatter={(v: number) => [v, 'Count']} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getColor(entry.issue)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> High</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Other</span>
      </div>
    </div>
  )
}
