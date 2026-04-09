import type { Goal, Meal, MacroTargets } from '../../lib/types'

export type DailySummary = MacroTargets & {
  remainingCalories: number
  overCalories: number
  mealCount: number
}

export function summarizeDay(meals: Meal[], goal?: Goal): DailySummary {
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

  return {
    ...totals,
    remainingCalories: Math.max(targetCalories - totals.calories, 0),
    overCalories: Math.max(totals.calories - targetCalories, 0),
    mealCount: meals.length
  }
}
