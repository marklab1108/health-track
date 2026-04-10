import { describe, expect, it } from 'vitest'
import type { Goal, Meal, WeighIn } from '../../lib/types'
import { buildFourWeekWeightTrend, summarizeWeek } from './weeklySummary'

const goal = {
  dailyTargets: { calories: 2000, proteinG: 140, fatG: 60, carbsG: 220 }
} as Goal

const meals = [
  { eatenAt: '2026-04-06T00:00:00.000Z', calories: 1800, proteinG: 120, fatG: 60, carbsG: 200 },
  { eatenAt: '2026-04-07T00:00:00.000Z', calories: 2200, proteinG: 150, fatG: 70, carbsG: 240 }
] as Meal[]

const weighIns = [
  { measuredAt: '2026-04-06T00:00:00.000Z', weightKg: 79.7 },
  { measuredAt: '2026-04-07T00:00:00.000Z', weightKg: 79.5 }
] as WeighIn[]

const previousWeekWeighIns = [{ measuredAt: '2026-03-31T00:00:00.000Z', weightKg: 80 }] as WeighIn[]

describe('summarizeWeek', () => {
  it('calculates averages against target and weight change', () => {
    expect(summarizeWeek(meals, weighIns, previousWeekWeighIns, goal)).toMatchObject({
      dayCount: 2,
      expectedDayCount: 7,
      completenessRate: 29,
      missingDayCount: 5,
      mealCount: 2,
      averageCalories: 2000,
      averageProteinG: 135,
      averageFatG: 65,
      averageCarbsG: 220,
      targetCalories: 2000,
      calorieDeltaFromTarget: 0,
      targetProteinG: 140,
      proteinDeltaFromTarget: -5,
      previousPeriodWeightKg: 80,
      currentPeriodWeightKg: 79.5,
      weightChangeKg: -0.5
    })
  })
})

describe('buildFourWeekWeightTrend', () => {
  it('returns four weekly points using the latest weigh-in from each week', () => {
    expect(
      buildFourWeekWeightTrend(
        [
          { measuredAt: '2026-03-17T00:00:00.000Z', weightKg: 81.2 },
          { measuredAt: '2026-03-24T00:00:00.000Z', weightKg: 80.6 },
          { measuredAt: '2026-03-31T00:00:00.000Z', weightKg: 80 },
          { measuredAt: '2026-04-07T00:00:00.000Z', weightKg: 79.5 }
        ] as WeighIn[],
        new Date('2026-04-08T00:00:00.000Z')
      )
    ).toEqual([
      { label: '前三週', weight: 81.2 },
      { label: '前兩週', weight: 80.6 },
      { label: '前一週', weight: 80 },
      { label: '本週', weight: 79.5 }
    ])
  })
})
