import { describe, expect, it } from 'vitest'
import { buildWeeklyInsight } from './recommendationRules'

describe('buildWeeklyInsight', () => {
  it('asks for more data when there are no meals', () => {
    expect(
      buildWeeklyInsight({
        dayCount: 0,
        expectedDayCount: 7,
        completenessRate: 0,
        missingDayCount: 7,
        mealCount: 0,
        averageCalories: 0,
        averageProteinG: 0,
        averageFatG: 0,
        averageCarbsG: 0,
        targetCalories: 2000,
        calorieDeltaFromTarget: 0,
        targetProteinG: 140,
        proteinDeltaFromTarget: -140
      })
    ).toContain('還沒有飲食紀錄')
  })

  it('keeps the current rhythm when cut data is on track', () => {
    expect(
      buildWeeklyInsight(
        {
          dayCount: 5,
          expectedDayCount: 7,
          completenessRate: 71,
          missingDayCount: 2,
          mealCount: 12,
          averageCalories: 1950,
          averageProteinG: 130,
          averageFatG: 60,
          averageCarbsG: 220,
          targetCalories: 2000,
          calorieDeltaFromTarget: -50,
          targetProteinG: 140,
          proteinDeltaFromTarget: -10,
          previousPeriodWeightKg: 80,
          currentPeriodWeightKg: 79.5,
          weightChangeKg: -0.5
        },
        'lose'
      )
    ).toContain('先維持')
  })

  it('asks for more days when weekly logging is sparse', () => {
    expect(
      buildWeeklyInsight(
        {
          dayCount: 2,
          expectedDayCount: 7,
          completenessRate: 29,
          missingDayCount: 5,
          mealCount: 4,
          averageCalories: 1900,
          averageProteinG: 120,
          averageFatG: 60,
          averageCarbsG: 210,
          targetCalories: 2000,
          calorieDeltaFromTarget: -100,
          targetProteinG: 140,
          proteinDeltaFromTarget: -20,
          previousPeriodWeightKg: 80,
          currentPeriodWeightKg: 79.8,
          weightChangeKg: -0.2
        },
        'lose'
      )
    ).toContain('只記錄了 2 天')
  })
})
