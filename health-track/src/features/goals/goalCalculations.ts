import type { Goal, MacroTargets } from '../../lib/types'
import { clamp, round } from '../../lib/numbers'
import type { GoalFormValues } from './goalSchema'

const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725
} satisfies Record<GoalFormValues['activityLevel'], number>

const calorieAdjustments = {
  lose: -400,
  maintain: 0,
  gain: 250
} satisfies Record<GoalFormValues['direction'], number>

export function calculateBmr(input: GoalFormValues) {
  const base = 10 * input.currentWeightKg + 6.25 * input.heightCm - 5 * input.age
  return round(input.sex === 'male' ? base + 5 : base - 161)
}

export function calculateTdee(input: GoalFormValues) {
  return round(calculateBmr(input) * activityMultipliers[input.activityLevel])
}

export function calculateDailyTargets(input: GoalFormValues): MacroTargets {
  const tdee = calculateTdee(input)
  const calories = clamp(round(tdee + calorieAdjustments[input.direction]), 1200, 4500)
  const proteinG = round(input.currentWeightKg * 1.8)
  const fatCalories = calories * 0.25
  const fatG = round(fatCalories / 9)
  const remainingCalories = Math.max(calories - proteinG * 4 - fatG * 9, 0)

  return {
    calories,
    proteinG,
    fatG,
    carbsG: round(remainingCalories / 4)
  }
}

export function buildGoal(input: GoalFormValues, previousId?: string): Goal {
  const now = new Date().toISOString()

  return {
    id: previousId ?? crypto.randomUUID(),
    ...input,
    bmr: calculateBmr(input),
    tdee: calculateTdee(input),
    dailyTargets: calculateDailyTargets(input),
    createdAt: now,
    updatedAt: now
  }
}
