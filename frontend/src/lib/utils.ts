import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function sentimentColor(score: number): string {
  if (score > 0.1) return '#22c55e'
  if (score < -0.1) return '#ef4444'
  return '#94a3b8'
}

export function riskLevelColor(level: string): string {
  switch (level) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-300'
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    default: return 'bg-green-100 text-green-800 border-green-300'
  }
}
