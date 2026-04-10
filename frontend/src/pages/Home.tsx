import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../lib/api'

const DEMO_FILES = [
  { label: 'Nike Feedback', sub: '150 records · Multi-channel · March–Apr 2026', value: 'data.json', icon: '👟' },
  { label: 'Amazon Feedback', sub: '16 records · E-commerce · Apr 2026', value: 'amzdata.json', icon: '📦' },
  { label: 'Extended Dataset 2', sub: 'Additional synthetic feedback', value: 'data2.json', icon: '📊' },
  { label: 'Extended Dataset 3', sub: 'Additional synthetic feedback', value: 'data3.json', icon: '📈' },
]

const FEATURES = [
  'Sentiment Analysis', 'Event Detection', 'Trend Intelligence',
  'Persona Insights', 'Risk Forecasting', 'Word Cloud',
  'Topic Modeling', 'AI Recommendations',
]

type Mode = 'upload' | 'demo'

export default function Home() {
  const [mode, setMode] = useState<Mode>('upload')
  const [selectedDemo, setSelectedDemo] = useState(DEMO_FILES[0].value)
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // ── File handling ────────────────────────────────────────────────────────
  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndSet(file)
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) validateAndSet(file)
  }

  function validateAndSet(file: File) {
    setError('')
    if (!file.name.endsWith('.json') && !file.name.endsWith('.txt')) {
      setError('Only .json or .txt files are accepted.')
      return
    }
    setUploadedFile(file)
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      if (mode === 'upload') {
        if (!uploadedFile) { setError('Please select a file first.'); setLoading(false); return }
        await apiClient.uploadFile(uploadedFile)
      } else {
        await apiClient.ingest(selectedDemo)
      }
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load data'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = mode === 'demo' || !!uploadedFile

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-black text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: '#FF6900' }}>S</div>
            <span className="font-semibold text-lg">Signal360</span>
          </div>
          <span className="text-gray-400 text-sm">Customer Intelligence Platform</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="max-w-2xl w-full">

          {/* Hero */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Turning Customer Signals into<br />
              <span style={{ color: '#FF6900' }}>Intelligent Actions</span>
            </h1>
            <p className="text-gray-500 text-base">
              Aggregate omni-channel feedback, compute sentiment, detect events, and generate
              AI-powered recommendations — in minutes.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {FEATURES.map(f => (
              <span key={f} className="text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-3 py-1">
                {f}
              </span>
            ))}
          </div>

          {/* Main card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Mode toggle */}
            <div className="flex border-b border-gray-100">
              {(['upload', 'demo'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError('') }}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                    mode === m
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-700 bg-gray-50'
                  }`}
                  style={mode === m ? { backgroundColor: '#FF6900' } : {}}
                >
                  {m === 'upload' ? '⬆ Upload Your JSON' : '⚡ Use Demo Data'}
                </button>
              ))}
            </div>

            <div className="p-7">
              {/* ── Upload mode ── */}
              {mode === 'upload' && (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload any JSON file that follows the Signal360 feedback schema
                    <span className="text-xs text-gray-400"> (array of feedback objects with feedback_id, text, rating, source, channel…)</span>
                  </p>

                  {/* Drop zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                      dragOver
                        ? 'border-orange-400 bg-orange-50'
                        : uploadedFile
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.txt"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {uploadedFile ? (
                      <>
                        <div className="text-4xl mb-2">✅</div>
                        <p className="font-semibold text-green-700">{uploadedFile.name}</p>
                        <p className="text-xs text-green-600 mt-1">
                          {(uploadedFile.size / 1024).toFixed(1)} KB · Click to replace
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl mb-3">📂</div>
                        <p className="font-medium text-gray-700">Drop your JSON file here</p>
                        <p className="text-xs text-gray-400 mt-1">or click to browse · .json / .txt accepted</p>
                      </>
                    )}
                  </div>

                  {/* Schema hint */}
                  <details className="mt-4">
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
                      View expected JSON schema
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto">
{`[
  {
    "feedback_id": "NK-001",
    "timestamp": "2026-03-11T09:23:00Z",
    "source": "twitter",
    "channel": "social",
    "location": "Mumbai",
    "product_name": "Air Jordan 1",
    "category": "Footwear",
    "customer_segment": "Sneakerhead",
    "text": "App crashed during the drop!",
    "rating": 1,
    "issue_tags": ["app_crash", "launch_failure"]
  }
]`}
                    </pre>
                  </details>
                </div>
              )}

              {/* ── Demo mode ── */}
              {mode === 'demo' && (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    Pre-loaded synthetic datasets for instant demo — no file needed.
                  </p>
                  <div className="space-y-2">
                    {DEMO_FILES.map(f => (
                      <label
                        key={f.value}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedDemo === f.value
                            ? 'border-orange-400 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-200 hover:bg-orange-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="dataset"
                          value={f.value}
                          checked={selectedDemo === f.value}
                          onChange={() => setSelectedDemo(f.value)}
                          className="accent-orange-500"
                        />
                        <span className="text-xl">{f.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{f.label}</p>
                          <p className="text-xs text-gray-400">{f.sub}</p>
                        </div>
                        <span className="text-xs text-gray-300 font-mono">{f.value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleSubmit}
                disabled={loading || !canSubmit}
                className="mt-6 w-full py-3.5 rounded-xl font-bold text-white text-sm transition-opacity
                           disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: '#FF6900' }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Running sentiment analysis pipeline...
                  </>
                ) : (
                  'Analyze & Open Dashboard →'
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Signal360 · AI-powered omni-channel customer intelligence · Hackathon Demo 2026
          </p>
        </div>
      </main>
    </div>
  )
}
