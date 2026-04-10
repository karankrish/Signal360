import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient, {
  type SentimentPoint,
  type EventAlert,
  type RiskScore,
  type PersonaInsight,
  type Summary,
} from '../lib/api'
import SentimentTimeline from '../components/SentimentTimeline'
import IssueBreakdown from '../components/IssueBreakdown'
import ChannelDistribution from '../components/ChannelDistribution'
import EventAlerts from '../components/EventAlerts'
import PersonaInsights from '../components/PersonaInsights'
import RiskForecast from '../components/RiskForecast'
import AIRecommendations from '../components/AIRecommendations'
import WordCloud from '../components/WordCloud'
import TopicModeling from '../components/TopicModeling'
import Integrations from './Integrations'
import { sentimentColor } from '../lib/utils'

const TABS = ['Overview', 'Trends', 'Events', 'Personas', 'Risks', 'Text Analysis', 'AI Report', 'Integrations']

interface DashboardData {
  summary: Summary
  sentimentTimeline: SentimentPoint[]
  sentimentOverall: Record<string, number>
  topIssues: { issue: string; count: number }[]
  channelData: { channel: string; avg_sentiment: number; avg_rating: number; record_count: number }[]
  events: EventAlert[]
  personas: PersonaInsight[]
  risks: RiskScore[]
  forecast: { date: string; predicted_sentiment: number }[]
}

export default function Dashboard() {
  const [tab, setTab] = useState('Overview')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function loadAll() {
      try {
        const [summary, sentiment, trends, events, channels, personas, risks] = await Promise.all([
          apiClient.getSummary(),
          apiClient.getSentiment(),
          apiClient.getTrends(10),
          apiClient.getEvents(),
          apiClient.getChannels(),
          apiClient.getPersonas(),
          apiClient.getRisks(7),
        ])

        if ('status' in summary.data && summary.data.status === 'empty') {
          navigate('/')
          return
        }

        setData({
          summary: summary.data as Summary,
          sentimentTimeline: sentiment.data.timeline,
          sentimentOverall: sentiment.data.overall,
          topIssues: trends.data.top_issues,
          channelData: channels.data.sentiment_by_channel,
          events: events.data.alerts,
          personas: personas.data.personas,
          risks: risks.data.risk_scores,
          forecast: risks.data.sentiment_forecast,
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load dashboard'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading Signal360 dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 max-w-md text-center">
          <p className="font-semibold mb-2">Failed to load dashboard</p>
          <p className="text-sm">{error}</p>
          <button onClick={() => navigate('/')} className="mt-4 text-sm underline">
            Go back
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null
  const { summary } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: '#FF6900' }}
            >
              S
            </div>
            <span className="font-semibold text-lg">Signal360</span>
            <span className="text-gray-500 text-sm">— Intelligence Dashboard</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Load new data
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <KpiCard label="Total Records" value={summary.total_records.toLocaleString()} />
          <KpiCard
            label="Avg Sentiment"
            value={summary.avg_sentiment.toFixed(3)}
            valueColor={sentimentColor(summary.avg_sentiment)}
          />
          <KpiCard label="Avg Rating" value={`${summary.avg_rating.toFixed(1)}/5`} />
          <KpiCard label="Positive" value={`${summary.positive_pct}%`} valueColor="#22c55e" />
          <KpiCard label="Negative" value={`${summary.negative_pct}%`} valueColor="#ef4444" />
          <KpiCard
            label="Event Alerts"
            value={summary.alert_count.toString()}
            valueColor={summary.alert_count > 0 ? '#ef4444' : '#22c55e'}
          />
        </div>

        <div className="mb-1 text-xs text-gray-500">
          Top Issue: <strong className="text-orange-600">{summary.top_issue}</strong> ·
          Channels: {summary.channels.join(', ')} ·
          Segments: {summary.segments.length}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6 mt-4 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-t-lg ${
                tab === t
                  ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'Overview' && (
          <div className="space-y-4">
            <SentimentTimeline data={data.sentimentTimeline} forecastData={data.forecast} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <IssueBreakdown data={data.topIssues} />
              <ChannelDistribution data={data.channelData} />
            </div>
          </div>
        )}

        {tab === 'Trends' && (
          <div className="space-y-4">
            <IssueBreakdown data={data.topIssues} />
            <ChannelDistribution data={data.channelData} />
          </div>
        )}

        {tab === 'Events' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Event Spike Detection</h2>
              {data.events.length > 0 && (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {data.events.length} ALERTS
                </span>
              )}
            </div>
            <EventAlerts alerts={data.events} />
          </div>
        )}

        {tab === 'Personas' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Segment Insights</h2>
            <PersonaInsights data={data.personas} />
          </div>
        )}

        {tab === 'Risks' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Risk Assessment & Forecast</h2>
            <RiskForecast risks={data.risks} forecast={data.forecast} />
          </div>
        )}

        {tab === 'Text Analysis' && (
          <div className="space-y-6">
            <WordCloud showSentimentSplit />
            <TopicModeling />
          </div>
        )}

        {tab === 'AI Report' && <AIRecommendations />}

        {tab === 'Integrations' && <Integrations />}
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  valueColor,
}: {
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold" style={{ color: valueColor || '#111' }}>
        {value}
      </p>
    </div>
  )
}
