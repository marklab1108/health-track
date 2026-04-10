import { db } from '../../lib/db'
import { fromDateInputValue } from '../../lib/dates'
import type { MealTemplate } from '../../lib/types'
import { getTemplateUsageTimestamp, trackTemplateUsage } from '../meals/mealTemplateStats'

export async function quickAddFromTemplate(template: MealTemplate, dateInput: string) {
  const eatenAt = fromDateInputValue(dateInput)

  await db.meals.put({
    id: crypto.randomUUID(),
    name: template.name,
    eatenAt,
    calories: template.calories,
    proteinG: template.proteinG,
    fatG: template.fatG,
    carbsG: template.carbsG,
    templateId: template.id,
    createdAt: new Date().toISOString()
  })

  await trackTemplateUsage(template.id, getTemplateUsageTimestamp())
}
