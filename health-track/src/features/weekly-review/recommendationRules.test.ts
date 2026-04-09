import { describe, expect, it } from 'vitest'
import { buildWeeklyInsight } from './recommendationRules'

describe('buildWeeklyInsight', () => {
  it('asks for more data when there are no meals', () => {
    expect(
      buildWeeklyInsight({
        dayCount: 0,
        mealCount: 0,
        averageCalories: 0,
        averageProteinG: 0,
        averageFatG: 0,
        averageCarbsG: 0,
        targetCalories: 2000,
        calorieDeltaFromTarget: 0
      })
    ).toContain('還沒有飲食紀錄')
  })

  it('keeps the current rhythm when cut data is on track', () => {
    expect(
      buildWeeklyInsight(
        {
          dayCount: 5,
          mealCount: 12,
          averageCalories: 1950,
          averageProteinG: 130,
          averageFatG: 60,
          averageCarbsG: 220,
          targetCalories: 2000,
          calorieDeltaFromTarget: -50,
          previousPeriodWeightKg: 80,
          currentPeriodWeightKg: 79.5,
          weightChangeKg: -0.5
        },
        'lose'
      )
    ).toContain('先維持')
  })
})
