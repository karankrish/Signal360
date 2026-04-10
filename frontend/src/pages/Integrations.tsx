import { useState } from 'react'

type Status = 'active' | 'coming_soon' | 'configure'

interface Integration {
  id: string
  name: string
  description: string
  icon: string
  category: string
  status: Status
  features: string[]
  dataFlow?: string
}

const INTEGRATIONS: Integration[] = [
  // CRM
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Sync customer sentiment scores and event alerts directly into Salesforce CRM. Auto-create cases for high-severity feedback spikes.',
    icon: '☁️',
    category: 'CRM',
    status: 'active',
    features: ['Case auto-creation', 'Sentiment sync', 'Lead scoring', 'Contact enrichment'],
    dataFlow: 'Signal360 → Salesforce Cases & Contacts',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Push feedback insights into HubSpot deals and contacts. Trigger workflows based on sentiment thresholds or detected events.',
    icon: '🟠',
    category: 'CRM',
    status: 'active',
    features: ['Workflow triggers', 'Deal enrichment', 'Contact sentiment tags', 'Email sequences'],
    dataFlow: 'Signal360 → HubSpot CRM & Workflows',
  },
  {
    id: 'zoho',
    name: 'Zoho CRM',
    description: 'Bi-directional sync of customer feedback and sentiment analysis with Zoho CRM records.',
    icon: '🔵',
    category: 'CRM',
    status: 'coming_soon',
    features: ['Bi-directional sync', 'Custom modules', 'Blueprint triggers'],
    dataFlow: 'Signal360 ↔ Zoho CRM',
  },
  {
    id: 'freshdesk',
    name: 'Freshdesk',
    description: 'Route negative feedback signals to Freshdesk tickets automatically. Prioritize by sentiment severity and segment.',
    icon: '🟢',
    category: 'CRM',
    status: 'coming_soon',
    features: ['Auto-ticket creation', 'Priority scoring', 'Agent assignment', 'SLA tracking'],
    dataFlow: 'Signal360 → Freshdesk Tickets',
  },

  // Analytics
  {
    id: 'tableau',
    name: 'Tableau',
    description: 'Export Signal360 analytics datasets to Tableau for advanced custom visualization and enterprise reporting.',
    icon: '📊',
    category: 'Analytics',
    status: 'active',
    features: ['Live data connector', 'Custom dashboards', 'Scheduled exports', 'Embed views'],
    dataFlow: 'Signal360 API → Tableau Desktop / Server',
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics 4',
    description: 'Correlate feedback sentiment with website traffic, conversion rates, and user behavior patterns.',
    icon: '📈',
    category: 'Analytics',
    status: 'configure',
    features: ['Event correlation', 'Conversion impact', 'Audience overlap', 'GA4 custom dimensions'],
    dataFlow: 'GA4 Events ↔ Signal360 Sentiment',
  },
  {
    id: 'powerbi',
    name: 'Microsoft Power BI',
    description: 'Publish Signal360 metrics to Power BI workspaces for integrated enterprise intelligence reporting.',
    icon: '🟡',
    category: 'Analytics',
    status: 'coming_soon',
    features: ['DirectQuery support', 'Power BI Embedded', 'Report sharing', 'Alert thresholds'],
    dataFlow: 'Signal360 → Power BI Dataset',
  },
  {
    id: 'looker',
    name: 'Looker / Looker Studio',
    description: 'Connect Signal360 API as a Looker Studio data source for free embedded reporting.',
    icon: '🔍',
    category: 'Analytics',
    status: 'coming_soon',
    features: ['Community connector', 'Report builder', 'Scheduled email', 'Data blending'],
    dataFlow: 'Signal360 API → Looker Studio Reports',
  },

  // Social & Channels
  {
    id: 'twitter',
    name: 'X (Twitter) API',
    description: 'Ingest real-time tweets, mentions, and hashtag streams. Signal360 processes them through the sentiment pipeline automatically.',
    icon: '𝕏',
    category: 'Social',
    status: 'active',
    features: ['Filtered stream', 'Mention tracking', 'Hashtag monitoring', 'Real-time ingestion'],
    dataFlow: 'Twitter Stream → Signal360 Ingestion',
  },
  {
    id: 'instagram',
    name: 'Instagram Graph API',
    description: 'Pull comments, DMs, and media feedback from Instagram business accounts for sentiment analysis.',
    icon: '📷',
    category: 'Social',
    status: 'configure',
    features: ['Comment ingestion', 'DM sentiment', 'Story mentions', 'Brand monitoring'],
    dataFlow: 'Instagram Graph API → Signal360',
  },
  {
    id: 'reddit',
    name: 'Reddit PRAW',
    description: 'Monitor subreddits and brand mentions on Reddit. Capture organic unfiltered customer sentiment.',
    icon: '🤖',
    category: 'Social',
    status: 'coming_soon',
    features: ['Subreddit monitoring', 'Keyword alerts', 'Upvote-weighted sentiment', 'Thread tracking'],
    dataFlow: 'Reddit API → Signal360 Ingestion',
  },

  // E-Commerce & Retail
  {
    id: 'amazon',
    name: 'Amazon Seller Central',
    description: 'Pull product reviews, Q&A, and seller feedback from Amazon marketplace into Signal360.',
    icon: '📦',
    category: 'E-Commerce',
    status: 'active',
    features: ['Review ingestion', 'Star rating sync', 'Product-level sentiment', 'ASIN tracking'],
    dataFlow: 'Amazon MWS/SP-API → Signal360',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Ingest Shopify order reviews, product feedback, and customer notes for omni-channel coverage.',
    icon: '🛍️',
    category: 'E-Commerce',
    status: 'configure',
    features: ['Order feedback', 'Product reviews', 'Customer metafields', 'Webhook events'],
    dataFlow: 'Shopify Webhooks → Signal360',
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'WordPress + WooCommerce store reviews and customer feedback ingested via Signal360 plugin.',
    icon: '🟣',
    category: 'E-Commerce',
    status: 'coming_soon',
    features: ['Product reviews', 'Order notes', 'Plugin integration', 'Real-time webhooks'],
    dataFlow: 'WooCommerce → Signal360 Plugin',
  },

  // Notifications & Alerts
  {
    id: 'slack',
    name: 'Slack',
    description: 'Receive instant Slack alerts when Signal360 detects sentiment spikes, event anomalies, or risk threshold breaches.',
    icon: '💬',
    category: 'Notifications',
    status: 'active',
    features: ['Spike alerts', 'Daily digest', 'Risk threshold alerts', 'Interactive buttons'],
    dataFlow: 'Signal360 Alerts → Slack Channels',
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Push Signal360 insight summaries and critical alerts to Teams channels and meetings.',
    icon: '🟦',
    category: 'Notifications',
    status: 'configure',
    features: ['Adaptive cards', 'Channel alerts', 'Bot commands', 'Meeting digests'],
    dataFlow: 'Signal360 → Teams Webhooks',
  },
  {
    id: 'pagerduty',
    name: 'PagerDuty',
    description: 'Escalate critical feedback events (app crashes, mass stock-out complaints) to on-call teams via PagerDuty.',
    icon: '🚨',
    category: 'Notifications',
    status: 'coming_soon',
    features: ['Incident creation', 'Severity routing', 'On-call escalation', 'Acknowledgement sync'],
    dataFlow: 'Signal360 Events → PagerDuty Incidents',
  },

  // Cloud & Data Infrastructure
  {
    id: 'aws-s3',
    name: 'AWS S3',
    description: 'Export processed feedback datasets and AI reports to S3 buckets for long-term storage and downstream pipelines.',
    icon: '🪣',
    category: 'Cloud',
    status: 'active',
    features: ['JSON exports', 'Parquet format', 'Event-triggered uploads', 'IAM role auth'],
    dataFlow: 'Signal360 → S3 Buckets',
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    description: 'Stream enriched feedback records with sentiment scores into Snowflake for enterprise data warehouse integration.',
    icon: '❄️',
    category: 'Cloud',
    status: 'coming_soon',
    features: ['Snowpipe ingestion', 'Sentiment-enriched tables', 'Role-based access', 'Time travel'],
    dataFlow: 'Signal360 → Snowflake DW',
  },
  {
    id: 'bigquery',
    name: 'Google BigQuery',
    description: 'Export Signal360 analytics to BigQuery for large-scale SQL analytics and ML pipeline integration.',
    icon: '🔷',
    category: 'Cloud',
    status: 'coming_soon',
    features: ['Streaming inserts', 'Scheduled queries', 'ML.EVALUATE', 'Data Studio connector'],
    dataFlow: 'Signal360 → BigQuery Tables',
  },

  // Survey & Feedback Tools
  {
    id: 'typeform',
    name: 'Typeform',
    description: 'Pull survey responses from Typeform directly into Signal360 for unified NPS and CSAT analysis.',
    icon: '📝',
    category: 'Surveys',
    status: 'configure',
    features: ['Response ingestion', 'NPS calculation', 'CSAT scoring', 'Conditional routing'],
    dataFlow: 'Typeform Responses → Signal360',
  },
  {
    id: 'surveymonkey',
    name: 'SurveyMonkey',
    description: 'Import SurveyMonkey responses and merge with omni-channel feedback for holistic customer views.',
    icon: '🐒',
    category: 'Surveys',
    status: 'coming_soon',
    features: ['Bulk import', 'Response tagging', 'Benchmark comparison', 'Trend overlay'],
    dataFlow: 'SurveyMonkey API → Signal360',
  },
  {
    id: 'qualtrics',
    name: 'Qualtrics XM',
    description: 'Enterprise-grade Experience Management integration — merge Qualtrics CX data with Signal360 intelligence.',
    icon: '🎯',
    category: 'Surveys',
    status: 'coming_soon',
    features: ['XM API integration', 'CX journey overlay', 'Driver analysis', 'Closed-loop alerts'],
    dataFlow: 'Qualtrics XM ↔ Signal360',
  },
]

const CATEGORIES = ['All', 'CRM', 'Analytics', 'Social', 'E-Commerce', 'Notifications', 'Cloud', 'Surveys']

const STATUS_CONFIG = {
  active: { label: 'Live', color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e' },
  configure: { label: 'Configure', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' },
  coming_soon: { label: 'Coming Soon', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', dot: '#d1d5db' },
}

const STATS = [
  { label: 'Live Integrations', value: '7', color: '#22c55e' },
  { label: 'Ready to Configure', value: '5', color: '#f59e0b' },
  { label: 'Roadmap', value: '12', color: '#6b7280' },
  { label: 'Categories', value: '8', color: '#FF6900' },
]

function IntegrationCard({ integration }: { integration: Integration }) {
  const cfg = STATUS_CONFIG[integration.status]
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-xl">
            {integration.icon}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">{integration.name}</h4>
            <span className="text-xs text-gray-400">{integration.category}</span>
          </div>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
          style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: cfg.dot }} />
          {cfg.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 mb-3 leading-relaxed flex-1">{integration.description}</p>

      {/* Data flow */}
      {integration.dataFlow && (
        <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-2.5 py-1.5 mb-3 font-mono">
          {integration.dataFlow}
        </div>
      )}

      {/* Features */}
      <div className="flex flex-wrap gap-1">
        {integration.features.map(f => (
          <span key={f} className="text-xs bg-orange-50 text-orange-700 border border-orange-100 rounded-full px-2 py-0.5">
            {f}
          </span>
        ))}
      </div>

      {/* CTA */}
      <button
        className="mt-4 w-full py-2 rounded-lg text-xs font-semibold transition-all"
        style={
          integration.status === 'active'
            ? { backgroundColor: '#FF6900', color: 'white' }
            : integration.status === 'configure'
            ? { backgroundColor: '#fff7ed', color: '#FF6900', border: '1px solid #fed7aa' }
            : { backgroundColor: '#f3f4f6', color: '#9ca3af', cursor: 'default' }
        }
        disabled={integration.status === 'coming_soon'}
      >
        {integration.status === 'active'
          ? 'View Connection →'
          : integration.status === 'configure'
          ? 'Connect Now →'
          : 'Notify Me'}
      </button>
    </div>
  )
}

export default function Integrations() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = INTEGRATIONS.filter(i => {
    const matchCat = activeCategory === 'All' || i.category === activeCategory
    const matchSearch =
      !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #111 0%, #1f1f1f 60%, #3a1a00 100%)' }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">
              Integration Hub
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-1">Connect Signal360 to Your Stack</h2>
          <p className="text-gray-400 text-sm max-w-2xl">
            Signal360 is designed to be the intelligence layer across your entire customer data ecosystem.
            Plug into your CRM, analytics, social, cloud, and notification tools — no data silos.
          </p>
          <div className="flex gap-6 mt-4">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative */}
        <div className="absolute right-6 top-4 opacity-5 text-9xl select-none pointer-events-none">⚡</div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1.5 text-xs font-semibold rounded-full transition-all"
              style={
                activeCategory === cat
                  ? { backgroundColor: '#FF6900', color: 'white' }
                  : { backgroundColor: '#f3f4f6', color: '#374151' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search integrations…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ml-auto px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-orange-300 w-48"
        />
      </div>

      {/* Architecture diagram callout */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-4 items-start">
        <span className="text-2xl">🏗️</span>
        <div>
          <p className="text-sm font-semibold text-blue-800">How Signal360 Integrations Work</p>
          <p className="text-xs text-blue-600 mt-0.5">
            All integrations flow through Signal360's unified ingestion pipeline — data is normalized, sentiment-scored,
            and enriched before being stored. Outbound integrations push processed insights (not raw data) downstream.
            API keys are stored encrypted; OAuth 2.0 is used for all social connectors.
          </p>
          <div className="flex gap-2 mt-2 text-xs font-mono text-blue-700 flex-wrap">
            <span className="bg-blue-100 px-2 py-0.5 rounded">Source APIs</span>
            <span>→</span>
            <span className="bg-blue-100 px-2 py-0.5 rounded">Signal360 Ingestion</span>
            <span>→</span>
            <span className="bg-blue-100 px-2 py-0.5 rounded">NLP Pipeline</span>
            <span>→</span>
            <span className="bg-blue-100 px-2 py-0.5 rounded">Intelligence Layer</span>
            <span>→</span>
            <span className="bg-blue-100 px-2 py-0.5 rounded">CRM / Analytics / Alerts</span>
          </div>
        </div>
      </div>

      {/* Integration grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No integrations match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(integration => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      )}

      {/* Footer note */}
      <div className="text-center py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Signal360 Integration Hub · All listed integrations are part of the Signal360 product roadmap ·
          <span className="text-orange-500 ml-1">Request a custom integration →</span>
        </p>
      </div>
    </div>
  )
}
