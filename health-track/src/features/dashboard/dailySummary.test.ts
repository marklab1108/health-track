import { describe, expect, it } from 'vitest'
import type { Goal, Meal } from '../../lib/types'
import { summarizeDay } from './dailySummary'

const goal = {
  dailyTargets: { calories: 2000, proteinG: 140, fatG: 60, carbsG: 220 }
} as Goal

const meals = [
  { calories: 500, proteinG: 35, fatG: 20, carbsG: 50 },
  { calories: 700, proteinG: 45, fatG: 25, carbsG: 75 }
] as Meal[]

describe('summarizeDay', () => {
  it('sums meals and calculates remaining calories', () => {
    expect(summarizeDay(meals, goal)).toMatchObject({
      calories: 1200,
      proteinG: 80,
      fatG: 45,
      carbsG: 125,
      remainingCalories: 800,
      overCalories: 0,
      mealCount: 2
    })
  })

  it('tracks over target calories', () => {
    expect(summarizeDay(meals, { dailyTargets: { calories: 1000 } } as Goal).overCalories).toBe(200)
  })
})
