import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

export interface SentimentPoint {
  date: string
  avg_sentiment: number
  positive_count: number
  neutral_count: number
  negative_count: number
  total_count: number
}

export interface EventAlert {
  date: string
  spike_magnitude: number
  dominant_issues: string[]
  affected_products: string[]
  description: string
}

export interface RiskScore {
  risk_type: string
  score: number
  level: string
  description: string
}

export interface PersonaInsight {
  segment: string
  avg_sentiment: number
  avg_rating: number
  record_count: number
  top_issues: string[]
  most_complained_product: string
}

export interface Summary {
  total_records: number
  avg_sentiment: number
  avg_rating: number
  positive_pct: number
  neutral_pct: number
  negative_pct: number
  top_issue: string
  alert_count: number
  channels: string[]
  segments: string[]
}

export const apiClient = {
  ingest: (filename = 'data.json') =>
    api.post<{ status: string; records_loaded: number }>(`/ingest?filename=${filename}`),

  uploadFile: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<{ status: string; records_loaded: number; file: string }>(
      '/ingest/upload',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  },

  getSummary: () => api.get<Summary>('/summary'),

  getSentiment: () =>
    api.get<{ timeline: SentimentPoint[]; overall: Record<string, number> }>('/sentiment'),

  getTrends: (topN = 10) =>
    api.get<{
      top_issues: { issue: string; count: number }[]
      issue_trend_over_time: Record<string, unknown>[]
      topic_by_channel: { channel: string; issue: string; count: number }[]
      product_sentiment: { product: string; avg_sentiment: number; review_count: number }[]
    }>(`/trends?top_n=${topN}`),

  getEvents: () =>
    api.get<{ alert_count: number; alerts: EventAlert[] }>('/events'),

  getChannels: () =>
    api.get<{
      sentiment_by_channel: { channel: string; avg_sentiment: number; avg_rating: number; record_count: number }[]
      issue_channel_heatmap: Record<string, unknown>[]
      cross_channel_correlations: { issue: string; channels: string[]; occurrence_count: number }[]
    }>('/channels'),

  getPersonas: () =>
    api.get<{ personas: PersonaInsight[] }>('/personas'),

  getRisks: (daysAhead = 7) =>
    api.get<{ risk_scores: RiskScore[]; sentiment_forecast: { date: string; predicted_sentiment: number }[] }>(
      `/risks?days_ahead=${daysAhead}`
    ),

  generateInsights: () =>
    api.post<{ report: string }>('/insights'),

  getWordcloud: (topN = 80) =>
    api.get<{ words: { text: string; value: number; sentiment: string }[] }>(
      `/wordcloud?top_n=${topN}`
    ),

  getTopics: (nTopics = 5) =>
    api.get<{
      topics: { topic_id: number; label: string; keywords: string[]; relevance: number }[]
    }>(`/topics?n_topics=${nTopics}`),

  getSentimentKeywords: () =>
    api.get<{
      positive: { text: string; count: number }[]
      negative: { text: string; count: number }[]
    }>('/sentiment-keywords'),
}

export default apiClient
