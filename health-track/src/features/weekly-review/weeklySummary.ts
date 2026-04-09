import { differenceInCalendarDays, endOfWeek, startOfWeek, subWeeks } from 'date-fns'
import type { Goal, Meal, WeighIn } from '../../lib/types'
import { round } from '../../lib/numbers'

export type WeeklySummary = {
  dayCount: number
  mealCount: number
  averageCalories: number
  averageProteinG: number
  averageFatG: number
  averageCarbsG: number
  targetCalories: number
  calorieDeltaFromTarget: number
  previousPeriodWeightKg?: number
  currentPeriodWeightKg?: number
  weightChangeKg?: number
}

export type FourWeekWeightPoint = {
  label: string
  weight: number | null
}

export function summarizeWeek(meals: Meal[], currentPeriodWeighIns: WeighIn[], previousPeriodWeighIns: WeighIn[] = [], goal?: Goal): WeeklySummary {
  const sortedCurrentWeights = [...currentPeriodWeighIns].sort((a, b) => a.measuredAt.localeCompare(b.measuredAt))
  const sortedPreviousWeights = [...previousPeriodWeighIns].sort((a, b) => a.measuredAt.localeCompare(b.measuredAt))
  const dayCount = countRecordedDays(meals)
  const divisor = Math.max(dayCount, 1)
  const totals = meals.reduce(
    (summary, meal) => ({
      calories: summary.calories + meal.calories,
      proteinG: summary.proteinG + meal.proteinG,
      fatG: summary.fatG + meal.fatG,
      carbsG: summary.carbsG + meal.carbsG
    }),
    { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 }
  )
  const targetCalories = goal?.dailyTargets.calories ?? 0
  const previousPeriodWeight = sortedPreviousWeights[sortedPreviousWeights.length - 1]?.weightKg
  const currentPeriodWeight = sortedCurrentWeights[sortedCurrentWeights.length - 1]?.weightKg
  const weightChange = previousPeriodWeight !== undefined && currentPeriodWeight !== undefined ? round(currentPeriodWeight - previousPeriodWeight, 1) : undefined
  const averageCalories = round(totals.calories / divisor)

  return {
    dayCount,
    mealCount: meals.length,
    averageCalories,
    averageProteinG: round(totals.proteinG / divisor),
    averageFatG: round(totals.fatG / divisor),
    averageCarbsG: round(totals.carbsG / divisor),
    targetCalories,
    calorieDeltaFromTarget: targetCalories ? round(averageCalories - targetCalories) : 0,
    previousPeriodWeightKg: previousPeriodWeight,
    currentPeriodWeightKg: currentPeriodWeight,
    weightChangeKg: weightChange
  }
}

function countRecordedDays(meals: Meal[]) {
  const days = new Set(meals.map((meal) => meal.eatenAt.slice(0, 10)))

  if (days.size > 0) return days.size
  if (meals.length === 0) return 0

  const sorted = [...meals].sort((a, b) => a.eatenAt.localeCompare(b.eatenAt))
  return differenceInCalendarDays(new Date(sorted[sorted.length - 1].eatenAt), new Date(sorted[0].eatenAt)) + 1
}

export function buildFourWeekWeightTrend(weighIns: WeighIn[], referenceDate = new Date()): FourWeekWeightPoint[] {
  const labels = ['前三週', '前兩週', '前一週', '本週']

  return labels.map((label, index) => {
    const weekDate = subWeeks(referenceDate, 3 - index)
    const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 }).toISOString()
    const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 }).toISOString()
    const weekWeighIns = weighIns
      .filter((weighIn) => weighIn.measuredAt >= weekStart && weighIn.measuredAt <= weekEnd)
      .sort((a, b) => a.measuredAt.localeCompare(b.measuredAt))

    return {
      label,
      weight: weekWeighIns.length > 0 ? weekWeighIns[weekWeighIns.length - 1].weightKg : null
    }
  })
}
