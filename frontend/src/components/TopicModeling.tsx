import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import apiClient from '../lib/api'

interface Topic {
  topic_id: number
  label: string
  keywords: string[]
  relevance: number
}

const TOPIC_COLORS = ['#FF6900', '#2563eb', '#16a34a', '#9333ea', '#0891b2']
const TOPIC_ICONS: Record<string, string> = {
  'App & Digital Experience': '📱',
  'Product Quality & Fit': '👟',
  'Delivery & Shipping': '📦',
  'Pricing & Value': '💰',
  'Customer Service': '🎧',
  'Stock & Availability': '📉',
  'General Feedback': '💬',
}

function TopicCard({ topic, color, rank }: { topic: Topic; color: string; rank: number }) {
  const icon = TOPIC_ICONS[topic.label] ?? '📋'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: color }}
              >
                #{rank}
              </span>
              <h4 className="font-semibold text-gray-800 text-sm">{topic.label}</h4>
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-500 font-medium">{topic.relevance}% of feedback</span>
      </div>

      {/* Relevance bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${Math.min(topic.relevance * 3, 100)}%`, backgroundColor: color }}
        />
      </div>

      {/* Keywords */}
      <div className="flex flex-wrap gap-1.5">
        {topic.keywords.map((kw, i) => (
          <span
            key={kw}
            className="text-xs px-2 py-0.5 rounded-full border font-medium"
            style={{
              borderColor: color,
              color: color,
              backgroundColor: `${color}12`,
              opacity: 1 - i * 0.08,
            }}
          >
            {kw}
          </span>
        ))}
      </div>
    </div>
  )
}

function TopicBarChart({ topics }: { topics: Topic[] }) {
  const data = topics.map((t, i) => ({
    name: t.label.split(' ')[0],  // short label for axis
    fullLabel: t.label,
    relevance: t.relevance,
    color: TOPIC_COLORS[i % TOPIC_COLORS.length],
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-bold text-gray-900 mb-1">Topic Distribution</h3>
      <p className="text-xs text-gray-500 mb-4">Share of feedback per discovered topic</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
          <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} />
          <Tooltip
            formatter={(v: number, _: string, props: { payload?: { fullLabel?: string } }) => [
              `${v}%`,
              props.payload?.fullLabel ?? 'Relevance',
            ]}
          />
          <Bar dataKey="relevance" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function TopicModeling() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [nTopics, setNTopics] = useState(5)

  async function loadTopics(n: number) {
    setLoading(true)
    try {
      const res = await apiClient.getTopics(n)
      setTopics(res.data.topics)
    } catch (e) {
      console.error('Topic modeling error', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTopics(nTopics)
  }, [])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Topic Modeling</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              LDA (Latent Dirichlet Allocation) — discovers hidden themes across all feedback
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Topics:</span>
            {[4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => { setNTopics(n); loadTopics(n) }}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  nTopics === n
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={nTopics === n ? { backgroundColor: '#FF6900' } : {}}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <div className="animate-spin h-6 w-6 border-4 border-orange-400 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Running LDA topic model on feedback corpus...</p>
        </div>
      ) : topics.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400 text-sm">
          Not enough data to model topics. Load more feedback records.
        </div>
      ) : (
        <>
          <TopicBarChart topics={topics} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {topics.map((topic, i) => (
              <TopicCard
                key={topic.topic_id}
                topic={topic}
                color={TOPIC_COLORS[i % TOPIC_COLORS.length]}
                rank={i + 1}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
