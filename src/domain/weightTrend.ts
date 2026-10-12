import type { WeightLog } from '../types'
import { addDays } from './dates'

export interface WeightPoint {
  date: string
  weightKg: number
  movingAverageKg: number
}

export function withMovingAverage(logs: WeightLog[]): WeightPoint[] {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date))
  const byDate = new Map(sorted.map((log) => [log.date, log.weightKg]))

  return sorted.map((log) => ({
    date: log.date,
    weightKg: log.weightKg,
    movingAverageKg: averageInWindow(byDate, log.date, 6),
  }))
}

function averageInWindow(
  byDate: Map<string, number>,
  endDate: string,
  lookbackDays: number,
): number {
  const values: number[] = []
  for (let offset = 0; offset <= lookbackDays; offset += 1) {
    const date = addDays(endDate, -offset)
    const weight = byDate.get(date)
    if (weight !== undefined) values.push(weight)
  }
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}
