import { db } from '../../lib/db'
import type { MealTemplate } from '../../lib/types'

export function touchMealTemplate(template: MealTemplate, usedAt: string): MealTemplate {
  return {
    ...template,
    usageCount: template.usageCount + 1,
    lastUsedAt: usedAt,
    updatedAt: new Date().toISOString()
  }
}

export async function trackTemplateUsage(templateId: string, usedAt: string) {
  const template = await db.mealTemplates.get(templateId)
  if (!template) return

  await db.mealTemplates.put(touchMealTemplate(template, usedAt))
}

export function getTemplateUsageTimestamp() {
  return new Date().toISOString()
}

export function sortTemplatesByUsage(templates: MealTemplate[]) {
  return [...templates].sort((left, right) => {
    const usageDelta = right.usageCount - left.usageCount
    if (usageDelta !== 0) return usageDelta

    return (right.lastUsedAt ?? right.updatedAt).localeCompare(left.lastUsedAt ?? left.updatedAt)
  })
}

export function sortTemplatesByRecent(templates: MealTemplate[]) {
  return [...templates].sort((left, right) => {
    const leftRecency = left.lastUsedAt ?? left.updatedAt
    const rightRecency = right.lastUsedAt ?? right.updatedAt
    return rightRecency.localeCompare(leftRecency)
  })
}
