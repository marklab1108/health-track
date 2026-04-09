import { describe, expect, it } from 'vitest'
import { calculateBmr, calculateDailyTargets, calculateTdee } from './goalCalculations'
import type { GoalFormValues } from './goalSchema'

const baseInput: GoalFormValues = {
  heightCm: 175,
  currentWeightKg: 80,
  targetWeightKg: 72,
  age: 32,
  sex: 'male',
  activityLevel: 'moderate',
  direction: 'lose'
}

describe('goal calculations', () => {
  it('calculates BMR with Mifflin-St Jeor', () => {
    expect(calculateBmr(baseInput)).toBe(1739)
  })

  it('calculates TDEE from activity level', () => {
    expect(calculateTdee(baseInput)).toBe(2695)
  })

  it('creates calorie and macro targets for a cut', () => {
    expect(calculateDailyTargets(baseInput)).toEqual({
      calories: 2295,
      proteinG: 144,
      fatG: 64,
      carbsG: 286
    })
  })
})
