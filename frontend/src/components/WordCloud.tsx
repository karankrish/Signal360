import { useEffect, useState, useMemo } from 'react'
import apiClient from '../lib/api'

interface Word {
  text: string
  value: number
  sentiment: string
}

interface Props {
  words?: Word[]
  showSentimentSplit?: boolean
}

function wordColor(sentiment: string, index: number): string {
  if (sentiment === 'positive') {
    const shades = ['#16a34a', '#15803d', '#22c55e', '#4ade80', '#166534']
    return shades[index % shades.length]
  }
  if (sentiment === 'negative') {
    const shades = ['#dc2626', '#b91c1c', '#ef4444', '#f87171', '#991b1b']
    return shades[index % shades.length]
  }
  // neutral — orange/blue palette
  const shades = ['#FF6900', '#ea580c', '#2563eb', '#7c3aed', '#0891b2', '#be185d', '#92400e']
  return shades[index % shades.length]
}

function fontSize(value: number, min: number, max: number): string {
  const minPx = 12
  const maxPx = 42
  if (max === min) return `${(minPx + maxPx) / 2}px`
  const scaled = ((value - min) / (max - min)) * (maxPx - minPx) + minPx
  return `${Math.round(scaled)}px`
}

function fontWeight(value: number, min: number, max: number): number {
  const ratio = max === min ? 0.5 : (value - min) / (max - min)
  if (ratio > 0.7) return 700
  if (ratio > 0.4) return 600
  return 400
}

// Shuffle for a more organic look
function pseudoShuffle<T>(arr: T[], seed = 42): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = (seed * (i + 1) * 2654435761) % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function CloudView({ words }: { words: Word[] }) {
  const values = words.map((w) => w.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const shuffled = useMemo(() => pseudoShuffle(words), [words])

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-3 justify-center items-center p-4 min-h-[200px]">
      {shuffled.map((word, i) => (
        <span
          key={word.text}
          title={`${word.text}: ${word.value} mentions`}
          className="cursor-default transition-transform hover:scale-110 select-none leading-tight"
          style={{
            fontSize: fontSize(word.value, min, max),
            fontWeight: fontWeight(word.value, min, max),
            color: wordColor(word.sentiment, i),
            opacity: 0.85 + (word.value / max) * 0.15,
          }}
        >
          {word.text}
        </span>
      ))}
    </div>
  )
}

function SentimentSplitView({
  positive,
  negative,
}: {
  positive: { text: string; count: number }[]
  negative: { text: string; count: number }[]
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-green-50 rounded-xl border border-green-200 p-4">
        <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-1">
          <span>😊</span> Positive Sentiment Keywords
        </h4>
        <div className="flex flex-wrap gap-2">
          {positive.slice(0, 20).map((w, i) => (
            <span
              key={w.text}
              className="inline-block rounded-full px-2 py-0.5 text-green-800 font-medium"
              style={{ fontSize: `${Math.max(11, Math.min(18, 11 + (20 - i) * 0.4))}px` }}
            >
              {w.text}
              <span className="text-green-500 text-xs ml-1">({w.count})</span>
            </span>
          ))}
        </div>
      </div>
      <div className="bg-red-50 rounded-xl border border-red-200 p-4">
        <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-1">
          <span>😤</span> Negative Sentiment Keywords
        </h4>
        <div className="flex flex-wrap gap-2">
          {negative.slice(0, 20).map((w, i) => (
            <span
              key={w.text}
              className="inline-block rounded-full px-2 py-0.5 text-red-800 font-medium"
              style={{ fontSize: `${Math.max(11, Math.min(18, 11 + (20 - i) * 0.4))}px` }}
            >
              {w.text}
              <span className="text-red-400 text-xs ml-1">({w.count})</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function WordCloud({ words: propWords, showSentimentSplit = true }: Props) {
  const [words, setWords] = useState<Word[]>(propWords ?? [])
  const [sentimentKw, setSentimentKw] = useState<{
    positive: { text: string; count: number }[]
    negative: { text: string; count: number }[]
  } | null>(null)
  const [loading, setLoading] = useState(!propWords)
  const [view, setView] = useState<'all' | 'split'>('all')

  useEffect(() => {
    if (propWords) return
    setLoading(true)
    Promise.all([
      apiClient.getWordcloud(80),
      showSentimentSplit ? apiClient.getSentimentKeywords() : Promise.resolve(null),
    ])
      .then(([wcRes, skRes]) => {
        setWords(wcRes.data.words)
        if (skRes) setSentimentKw(skRes.data)
      })
      .finally(() => setLoading(false))
  }, [propWords, showSentimentSplit])

  const legend = [
    { color: '#22c55e', label: 'Positive' },
    { color: '#FF6900', label: 'Neutral' },
    { color: '#ef4444', label: 'Negative' },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900">Customer Voice — Word Cloud</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Most frequent words from {words.length > 0 ? 'all feedback' : '...'} · hover for count
          </p>
        </div>
        {showSentimentSplit && sentimentKw && (
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
            {(['all', 'split'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  view === v ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {v === 'all' ? 'All Words' : 'By Sentiment'}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <div className="animate-spin h-6 w-6 border-4 border-orange-400 border-t-transparent rounded-full mr-3" />
          Building word cloud...
        </div>
      ) : view === 'all' ? (
        <>
          <CloudView words={words} />
          <div className="flex justify-center gap-5 mt-3 pt-3 border-t border-gray-100">
            {legend.map((l) => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </>
      ) : (
        sentimentKw && <SentimentSplitView {...sentimentKw} />
      )}
    </div>
  )
}
