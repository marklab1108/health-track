import { describe, expect, it, vi } from 'vitest'
import { cloneMealForDate, getTodayDateInputValue } from './mealQueries'

describe('mealQueries', () => {
  it('clones a meal onto a new date', () => {
    const randomUUID = vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(
      'copied-meal-0000-0000-0000-000000000000' as `${string}-${string}-${string}-${string}-${string}`
    )

    expect(
      cloneMealForDate(
        {
          id: 'meal-1',
          name: '雞胸便當',
          eatenAt: '2026-04-09T00:00:00.000Z',
          calories: 650,
          proteinG: 45,
          fatG: 18,
          carbsG: 75,
          templateId: 'template-1',
          createdAt: '2026-04-09T00:00:00.000Z'
        },
        '2026-04-10'
      )
    ).toMatchObject({
      id: 'copied-meal-0000-0000-0000-000000000000',
      name: '雞胸便當',
      eatenAt: '2026-04-09T16:00:00.000Z',
      templateId: 'template-1'
    })

    randomUUID.mockRestore()
  })

  it('returns a date input value for today', () => {
    expect(getTodayDateInputValue(new Date('2026-04-10T08:00:00.000Z'))).toBe('2026-04-10')
  })
})
