import type { Meal, MealTemplate } from '../../lib/types'
import { fromDateInputValue, toDateInputValue } from '../../lib/dates'
import type { MealFormValues } from './mealSchema'

export function buildMeal(input: MealFormValues, templateId?: string): Meal {
  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    name: input.name,
    eatenAt: fromDateInputValue(input.eatenAt),
    calories: input.calories,
    proteinG: input.proteinG,
    fatG: input.fatG,
    carbsG: input.carbsG,
    templateId,
    createdAt: now
  }
}

export function buildMealTemplate(input: MealFormValues): MealTemplate {
  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    name: input.name,
    calories: input.calories,
    proteinG: input.proteinG,
    fatG: input.fatG,
    carbsG: input.carbsG,
    createdAt: now,
    updatedAt: now
  }
}

export function mealFormFromTemplate(template: MealTemplate, eatenAt: string): MealFormValues {
  return {
    name: template.name,
    eatenAt,
    calories: template.calories,
    proteinG: template.proteinG,
    fatG: template.fatG,
    carbsG: template.carbsG,
    saveAsTemplate: false
  }
}

export function mealFormFromMeal(meal: Meal): MealFormValues {
  return {
    name: meal.name,
    eatenAt: toDateInputValue(new Date(meal.eatenAt)),
    calories: meal.calories,
    proteinG: meal.proteinG,
    fatG: meal.fatG,
    carbsG: meal.carbsG,
    saveAsTemplate: false
  }
}

export function updateMealFromForm(meal: Meal, input: MealFormValues): Meal {
  return {
    ...meal,
    name: input.name,
    eatenAt: fromDateInputValue(input.eatenAt),
    calories: input.calories,
    proteinG: input.proteinG,
    fatG: input.fatG,
    carbsG: input.carbsG
  }
}
