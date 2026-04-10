import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import apiClient from '../lib/api'

export default function AIRecommendations() {
  const [report, setReport] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  async function handleGenerate() {
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.generateInsights()
      setReport(res.data.report)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate report'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">AI Intelligence Report</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Powered by Claude — analyzes all feedback signals to generate actionable recommendations
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-nike-orange text-white px-5 py-2.5 rounded-lg font-medium text-sm
                       hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#FF6900' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {!report && !loading && !error && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">🧠</div>
            <p className="text-sm">Click "Generate Report" to run the AI analysis agent</p>
            <p className="text-xs mt-1">Requires ANTHROPIC_API_KEY to be set in the backend</p>
          </div>
        )}

        {report && (
          <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700
                          prose-li:text-gray-700 prose-strong:text-gray-900">
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
