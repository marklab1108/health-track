import Dexie, { type Table } from 'dexie'
import type { Goal, Meal, MealTemplate, WeighIn } from './types'

export class HealthTrackDatabase extends Dexie {
  goals!: Table<Goal, string>
  meals!: Table<Meal, string>
  mealTemplates!: Table<MealTemplate, string>
  weighIns!: Table<WeighIn, string>

  constructor() {
    super('health-track')

    this.version(1).stores({
      goals: 'id, updatedAt',
      meals: 'id, eatenAt, templateId',
      mealTemplates: 'id, updatedAt',
      weighIns: 'id, measuredAt'
    })
  }
}

export const db = new HealthTrackDatabase()

export async function getCurrentGoal() {
  const goals = await db.goals.orderBy('updatedAt').reverse().limit(1).toArray()
  return goals[0]
}

export async function upsertGoal(goal: Goal) {
  await db.transaction('rw', db.goals, async () => {
    await db.goals.clear()
    await db.goals.put(goal)
  })
}

export async function clearAllData() {
  await db.transaction('rw', db.goals, db.meals, db.mealTemplates, db.weighIns, async () => {
    await Promise.all([
      db.goals.clear(),
      db.meals.clear(),
      db.mealTemplates.clear(),
      db.weighIns.clear()
    ])
  })
}
