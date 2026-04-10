import { subDays } from 'date-fns'
import { db } from '../../lib/db'
import { dayBounds, fromDateInputValue, toDateInputValue } from '../../lib/dates'
import type { Meal } from '../../lib/types'

export async function getMealsForDate(date: Date) {
  const bounds = dayBounds(date)
  return db.meals.where('eatenAt').between(bounds.start, bounds.end, true, true).sortBy('eatenAt')
}

export async function getYesterdayMeals(referenceDate = new Date()) {
  return getMealsForDate(subDays(referenceDate, 1))
}

export async function getMostRecentMeal() {
  return db.meals.orderBy('eatenAt').reverse().first()
}

export async function getRecentMeals(limit = 8) {
  return db.meals.orderBy('eatenAt').reverse().limit(limit).toArray()
}

export async function searchRecentMeals(query: string, limit = 8) {
  const meals = await getRecentMeals(24)
  const normalized = query.trim().toLowerCase()

  if (!normalized) return meals.slice(0, limit)

  return meals.filter((meal) => meal.name.toLowerCase().includes(normalized)).slice(0, limit)
}

export function cloneMealForDate(meal: Meal, dateInput: string): Meal {
  const targetDate = fromDateInputValue(dateInput)

  return {
    ...meal,
    id: crypto.randomUUID(),
    eatenAt: targetDate,
    createdAt: new Date().toISOString()
  }
}

export function getTodayDateInputValue(referenceDate = new Date()) {
  return toDateInputValue(referenceDate)
}
