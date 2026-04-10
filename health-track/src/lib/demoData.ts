import { subDays, subWeeks } from 'date-fns'
import { db, clearAllData } from './db'
import type { Goal, Meal, MealTemplate, WeighIn } from './types'

function createDemoGoals(today: Date): Goal[] {
  const previousCreatedAt = subWeeks(today, 2).toISOString()
  const currentCreatedAt = subDays(today, 4).toISOString()

  return [
    {
      id: 'demo-goal-v1',
      version: 1,
      isActive: false,
      heightCm: 175,
      currentWeightKg: 82,
      targetWeightKg: 74,
      age: 32,
      sex: 'male',
      activityLevel: 'light',
      direction: 'lose',
      bmr: 1759,
      tdee: 2419,
      dailyTargets: {
        calories: 2019,
        proteinG: 148,
        fatG: 56,
        carbsG: 228
      },
      createdAt: previousCreatedAt,
      updatedAt: currentCreatedAt,
      archivedAt: currentCreatedAt
    },
    {
      id: 'demo-goal-v2',
      version: 2,
      isActive: true,
      heightCm: 175,
      currentWeightKg: 80,
      targetWeightKg: 72,
      age: 32,
      sex: 'male',
      activityLevel: 'moderate',
      direction: 'lose',
      bmr: 1739,
      tdee: 2695,
      dailyTargets: {
        calories: 2295,
        proteinG: 144,
        fatG: 64,
        carbsG: 286
      },
      createdAt: currentCreatedAt,
      updatedAt: currentCreatedAt
    }
  ]
}

function createDemoTemplates(now: string): MealTemplate[] {
  const base = new Date(now)

  return [
    {
      id: 'template-chicken-bento',
      name: '雞胸便當',
      calories: 650,
      proteinG: 45,
      fatG: 18,
      carbsG: 75,
      usageCount: 4,
      lastUsedAt: new Date(base.getFullYear(), base.getMonth(), base.getDate(), 9, 0, 0).toISOString(),
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'template-eggs-sweet-potato',
      name: '茶葉蛋 + 地瓜',
      calories: 260,
      proteinG: 14,
      fatG: 10,
      carbsG: 30,
      usageCount: 3,
      lastUsedAt: new Date(base.getFullYear(), base.getMonth(), base.getDate(), 12, 0, 0).toISOString(),
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'template-greek-yogurt',
      name: '優格 + 乳清',
      calories: 220,
      proteinG: 28,
      fatG: 4,
      carbsG: 18,
      usageCount: 2,
      lastUsedAt: new Date(base.getFullYear(), base.getMonth(), base.getDate(), 18, 0, 0).toISOString(),
      createdAt: now,
      updatedAt: now
    }
  ]
}

function createDemoMeals(today: Date): Meal[] {
  const offsets = [
    { daysAgo: 6, id: 'meal-1', name: '雞胸便當', calories: 650, proteinG: 45, fatG: 18, carbsG: 75, templateId: 'template-chicken-bento' },
    { daysAgo: 6, id: 'meal-2', name: '茶葉蛋 + 地瓜', calories: 260, proteinG: 14, fatG: 10, carbsG: 30, templateId: 'template-eggs-sweet-potato' },
    { daysAgo: 5, id: 'meal-3', name: '雞胸便當', calories: 650, proteinG: 45, fatG: 18, carbsG: 75, templateId: 'template-chicken-bento' },
    { daysAgo: 4, id: 'meal-4', name: '優格 + 乳清', calories: 220, proteinG: 28, fatG: 4, carbsG: 18, templateId: 'template-greek-yogurt' },
    { daysAgo: 3, id: 'meal-5', name: '雞腿便當', calories: 760, proteinG: 38, fatG: 26, carbsG: 82 },
    { daysAgo: 2, id: 'meal-6', name: '雞胸便當', calories: 650, proteinG: 45, fatG: 18, carbsG: 75, templateId: 'template-chicken-bento' },
    { daysAgo: 1, id: 'meal-7', name: '茶葉蛋 + 地瓜', calories: 260, proteinG: 14, fatG: 10, carbsG: 30, templateId: 'template-eggs-sweet-potato' },
    { daysAgo: 0, id: 'meal-8', name: '雞胸便當', calories: 650, proteinG: 45, fatG: 18, carbsG: 75, templateId: 'template-chicken-bento' },
    { daysAgo: 0, id: 'meal-9', name: '優格 + 乳清', calories: 220, proteinG: 28, fatG: 4, carbsG: 18, templateId: 'template-greek-yogurt' }
  ]

  return offsets.map((item) => {
    const eatenAt = subDays(today, item.daysAgo)

    return {
      id: item.id,
      name: item.name,
      eatenAt: new Date(eatenAt.getFullYear(), eatenAt.getMonth(), eatenAt.getDate(), item.daysAgo === 0 ? 12 : 19).toISOString(),
      calories: item.calories,
      proteinG: item.proteinG,
      fatG: item.fatG,
      carbsG: item.carbsG,
      templateId: item.templateId,
      createdAt: new Date(eatenAt.getFullYear(), eatenAt.getMonth(), eatenAt.getDate(), 12).toISOString()
    }
  })
}

function createDemoWeighIns(today: Date): WeighIn[] {
  return [
    { id: 'weigh-1', measuredAt: subWeeks(today, 3).toISOString(), weightKg: 81.2, createdAt: subWeeks(today, 3).toISOString() },
    { id: 'weigh-2', measuredAt: subDays(subWeeks(today, 2), 1).toISOString(), weightKg: 80.6, createdAt: subDays(subWeeks(today, 2), 1).toISOString() },
    { id: 'weigh-3', measuredAt: subDays(subWeeks(today, 1), 2).toISOString(), weightKg: 80.0, createdAt: subDays(subWeeks(today, 1), 2).toISOString() },
    { id: 'weigh-4', measuredAt: subDays(today, 3).toISOString(), weightKg: 79.7, createdAt: subDays(today, 3).toISOString() },
    { id: 'weigh-5', measuredAt: today.toISOString(), weightKg: 79.4, createdAt: today.toISOString() }
  ]
}

export async function seedDemoData() {
  const today = new Date()
  today.setHours(8, 0, 0, 0)
  const now = new Date().toISOString()
  const goals = createDemoGoals(today)
  const templates = createDemoTemplates(now)
  const meals = createDemoMeals(today)
  const weighIns = createDemoWeighIns(today)

  await clearAllData()

  await db.transaction('rw', db.goals, db.mealTemplates, db.meals, db.weighIns, async () => {
    await db.goals.bulkPut(goals)
    await db.mealTemplates.bulkPut(templates)
    await db.meals.bulkPut(meals)
    await db.weighIns.bulkPut(weighIns)
  })
}
