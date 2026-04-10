import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../lib/api'

const DATA_FILES = [
  { label: 'Nike Feedback (150 records)', value: 'data.json' },
  { label: 'Amazon Feedback (16 records)', value: 'amzdata.json' },
  { label: 'Extended Dataset 2', value: 'data2.json' },
  { label: 'Extended Dataset 3', value: 'data3.json' },
]

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(DATA_FILES[0].value)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLoad() {
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.ingest(selectedFile)
      if (res.data.status === 'ok') {
        navigate('/dashboard')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load data'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-black text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: '#FF6900' }}
            >
              S
            </div>
            <span className="font-semibold text-lg">Signal360</span>
          </div>
          <span className="text-gray-400 text-sm">Customer Intelligence Platform</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Turning Customer Signals into
              <br />
              <span style={{ color: '#FF6900' }}>Intelligent Actions</span>
            </h1>
            <p className="text-gray-500 text-lg">
              Aggregate omni-channel feedback, analyze sentiment, detect events, and generate
              AI-powered recommendations — powered by Nike's real customer data.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              'Sentiment Analysis',
              'Event Detection',
              'Trend Intelligence',
              'Persona Insights',
              'Risk Forecasting',
              'AI Recommendations',
            ].map((f) => (
              <span
                key={f}
                className="text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-3 py-1"
              >
                {f}
              </span>
            ))}
          </div>

          {/* Data load card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <h2 className="font-semibold text-gray-800 text-lg mb-1">Load Dataset</h2>
            <p className="text-gray-500 text-sm mb-6">
              Select a synthetic feedback dataset to begin the Signal360 analysis pipeline.
            </p>

            <div className="space-y-3 mb-6">
              {DATA_FILES.map((f) => (
                <label
                  key={f.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedFile === f.value
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="dataset"
                    value={f.value}
                    checked={selectedFile === f.value}
                    onChange={() => setSelectedFile(f.value)}
                    className="accent-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{f.label}</span>
                  <span className="text-xs text-gray-400 ml-auto">{f.value}</span>
                </label>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleLoad}
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: '#FF6900' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Running sentiment analysis...
                </>
              ) : (
                'Load Data & Open Dashboard →'
              )}
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Demo: Nike retail feedback · March–April 2026 · 150 multi-channel records
          </p>
        </div>
      </main>
    </div>
  )
}
