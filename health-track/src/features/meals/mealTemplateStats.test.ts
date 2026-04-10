import { describe, expect, it } from 'vitest'
import type { MealTemplate } from '../../lib/types'
import { sortTemplatesByRecent, sortTemplatesByUsage, touchMealTemplate } from './mealTemplateStats'

const templates: MealTemplate[] = [
  {
    id: 'a',
    name: '雞胸便當',
    calories: 650,
    proteinG: 45,
    fatG: 18,
    carbsG: 75,
    usageCount: 4,
    lastUsedAt: '2026-04-09T00:00:00.000Z',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-09T00:00:00.000Z'
  },
  {
    id: 'b',
    name: '優格 + 乳清',
    calories: 220,
    proteinG: 28,
    fatG: 4,
    carbsG: 18,
    usageCount: 2,
    lastUsedAt: '2026-04-10T00:00:00.000Z',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-10T00:00:00.000Z'
  },
  {
    id: 'c',
    name: '茶葉蛋 + 地瓜',
    calories: 260,
    proteinG: 14,
    fatG: 10,
    carbsG: 30,
    usageCount: 3,
    lastUsedAt: '2026-04-10T12:00:00.000Z',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-10T00:00:00.000Z'
  }
]

describe('mealTemplateStats', () => {
  it('sorts templates by usage first', () => {
    expect(sortTemplatesByUsage(templates).map((template) => template.id)).toEqual(['a', 'c', 'b'])
  })

  it('sorts templates by recent usage', () => {
    expect(sortTemplatesByRecent(templates).map((template) => template.id)).toEqual(['c', 'b', 'a'])
  })

  it('updates usage count and last used timestamp', () => {
    expect(touchMealTemplate(templates[0], '2026-04-10T12:00:00.000Z')).toMatchObject({
      usageCount: 5,
      lastUsedAt: '2026-04-10T12:00:00.000Z'
    })
  })
})
