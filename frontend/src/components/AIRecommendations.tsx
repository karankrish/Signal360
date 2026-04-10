import { useState } from 'react'
import apiClient from '../lib/api'

// ── Section parser ──────────────────────────────────────────────────────────
interface ReportSection {
  title: string
  content: string
  lines: string[]
}

function parseReport(raw: string): ReportSection[] {
  const sections: ReportSection[] = []
  const parts = raw.split(/^##\s+/m).filter(Boolean)
  for (const part of parts) {
    const newline = part.indexOf('\n')
    const title = newline === -1 ? part.trim() : part.slice(0, newline).trim()
    const content = newline === -1 ? '' : part.slice(newline + 1).trim()
    const lines = content
      .split('\n')
      .map((l) => l.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').trim())
      .filter(Boolean)
    sections.push({ title, content, lines })
  }
  return sections
}

function cleanLine(line: string): string {
  return line.replace(/\*\*(.*?)\*\*/g, '$1').trim()
}

// ── Section configs ──────────────────────────────────────────────────────────
const SECTION_CONFIG: Record<string, { icon: string; accent: string; bg: string; border: string }> = {
  default: {
    icon: '📋',
    accent: 'text-gray-700',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
  },
}

function getSectionStyle(title: string) {
  const t = title.toLowerCase()
  if (t.includes('executive') || t.includes('summary'))
    return { icon: '📊', accent: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' }
  if (t.includes('critical') || t.includes('issue'))
    return { icon: '⚠️', accent: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' }
  if (t.includes('recommend') || t.includes('action'))
    return { icon: '✅', accent: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700' }
  if (t.includes('risk') || t.includes('outlook'))
    return { icon: '🔮', accent: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' }
  return { icon: '📋', accent: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700' }
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SummarySection({ section }: { section: ReportSection }) {
  const style = getSectionStyle(section.title)
  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{style.icon}</span>
        <h3 className={`font-bold text-base ${style.accent}`}>{section.title}</h3>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">
        {section.content.replace(/\*\*(.*?)\*\*/g, '$1')}
      </p>
    </div>
  )
}

function IssueSection({ section }: { section: ReportSection }) {
  const style = getSectionStyle(section.title)
  const isNumbered = /recommended|action/i.test(section.title)

  return (
    <div className={`rounded-xl border ${style.border} p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{style.icon}</span>
        <h3 className={`font-bold text-base ${style.accent}`}>{section.title}</h3>
      </div>
      <div className="space-y-3">
        {section.lines.map((line, i) => {
          const clean = cleanLine(line)
          if (!clean) return null
          // Split on " — " or " - " for issue/description pairs
          const [head, ...rest] = clean.split(/ — | - /)
          const desc = rest.join(' — ')
          return (
            <div key={i} className="flex gap-3 items-start">
              <span
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${style.badge}`}
              >
                {isNumbered ? i + 1 : '•'}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-gray-800">{head}</span>
                {desc && (
                  <span className="text-sm text-gray-500"> — {desc}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RiskSection({ section }: { section: ReportSection }) {
  const style = getSectionStyle(section.title)

  function getRiskLevel(line: string): { level: string; color: string } {
    const l = line.toLowerCase()
    if (l.includes('critical')) return { level: 'CRITICAL', color: 'bg-red-100 text-red-700' }
    if (l.includes('high')) return { level: 'HIGH', color: 'bg-orange-100 text-orange-700' }
    if (l.includes('medium')) return { level: 'MEDIUM', color: 'bg-yellow-100 text-yellow-700' }
    return { level: 'LOW', color: 'bg-green-100 text-green-700' }
  }

  return (
    <div className={`rounded-xl border ${style.border} p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{style.icon}</span>
        <h3 className={`font-bold text-base ${style.accent}`}>{section.title}</h3>
      </div>
      <div className="space-y-2">
        {section.lines.map((line, i) => {
          const clean = cleanLine(line)
          if (!clean) return null
          const { level, color } = getRiskLevel(clean)
          return (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-orange-100 last:border-0">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${color}`}>
                {level}
              </span>
              <span className="text-sm text-gray-700">{clean}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ReportSection({ section }: { section: ReportSection }) {
  const t = section.title.toLowerCase()
  if (t.includes('executive') || t.includes('summary')) return <SummarySection section={section} />
  if (t.includes('risk') || t.includes('outlook')) return <RiskSection section={section} />
  return <IssueSection section={section} />
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AIRecommendations() {
  const [report, setReport] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [generatedAt, setGeneratedAt] = useState<string>('')
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.generateInsights()
      setReport(res.data.report)
      setGeneratedAt(new Date().toLocaleTimeString())
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate report'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sections = report ? parseReport(report) : []

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: '#FF6900' }}
              >
                AI
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Signal360 Intelligence Report</h3>
            </div>
            <p className="text-sm text-gray-500">
              Powered by GPT-4o-mini · Analyzes all feedback signals across channels, segments, and events
            </p>
          </div>

          <div className="flex items-center gap-2">
            {report && (
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600
                           hover:bg-gray-50 transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg font-semibold text-white text-sm
                         hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-opacity flex items-center gap-2"
              style={{ backgroundColor: '#FF6900' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analyzing...
                </>
              ) : report ? (
                'Regenerate'
              ) : (
                'Generate Report'
              )}
            </button>
          </div>
        </div>

        {generatedAt && !loading && (
          <p className="text-xs text-gray-400 mt-3">
            Last generated at {generatedAt}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <span className="font-semibold">Error: </span>{error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-medium">AI agent is analyzing feedback data...</p>
          <p className="text-gray-400 text-sm mt-1">Calling tools · Building insights · Writing report</p>
        </div>
      )}

      {/* Empty state */}
      {!report && !loading && !error && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-5xl mb-4">🧠</div>
          <p className="text-gray-600 font-medium mb-1">No report generated yet</p>
          <p className="text-gray-400 text-sm">
            Click "Generate Report" to run the AI analysis pipeline across all 5 signal tools
          </p>
        </div>
      )}

      {/* Parsed report sections */}
      {sections.length > 0 && !loading && (
        <div className="space-y-3">
          {sections.map((section, i) => (
            <ReportSection key={i} section={section} />
          ))}
        </div>
      )}
    </div>
  )
}
