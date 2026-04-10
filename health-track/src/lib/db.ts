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

    this.version(2)
      .stores({
        goals: 'id, updatedAt, createdAt, isActive, version',
        meals: 'id, eatenAt, templateId, createdAt',
        mealTemplates: 'id, updatedAt, lastUsedAt, usageCount',
        weighIns: 'id, measuredAt'
      })
      .upgrade(async (tx) => {
        const goals = await tx.table<Goal, string>('goals').toArray()
        const sortedGoals = [...goals].sort((left, right) => left.createdAt.localeCompare(right.createdAt))

        await Promise.all(
          sortedGoals.map((goal, index) =>
            tx.table<Goal, string>('goals').put({
              ...goal,
              version: goal.version ?? index + 1,
              isActive: index === sortedGoals.length - 1,
              archivedAt: index === sortedGoals.length - 1 ? undefined : goal.archivedAt ?? goal.updatedAt
            })
          )
        )

        const templates = await tx.table<MealTemplate, string>('mealTemplates').toArray()
        await Promise.all(
          templates.map((template) =>
            tx.table<MealTemplate, string>('mealTemplates').put({
              ...template,
              usageCount: template.usageCount ?? 0,
              lastUsedAt: template.lastUsedAt
            })
          )
        )
      })
  }
}

export const db = new HealthTrackDatabase()

export async function getCurrentGoal() {
  const goals = await db.goals.orderBy('updatedAt').reverse().toArray()
  return goals.find((goal) => goal.isActive) ?? goals[0]
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
