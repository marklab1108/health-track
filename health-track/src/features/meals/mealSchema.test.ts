import { describe, expect, it } from 'vitest'
import { mealSchema } from './mealSchema'

describe('mealSchema', () => {
  it('accepts a simple meal log', () => {
    const result = mealSchema.safeParse({
      name: '雞胸便當',
      eatenAt: '2026-04-08',
      calories: 650,
      proteinG: 45,
      fatG: 18,
      carbsG: 75,
      saveAsTemplate: true
    })

    expect(result.success).toBe(true)
  })

  it('rejects negative nutrients', () => {
    const result = mealSchema.safeParse({
      name: '錯誤餐點',
      eatenAt: '2026-04-08',
      calories: -1,
      proteinG: 0,
      fatG: 0,
      carbsG: 0,
      saveAsTemplate: false
    })

    expect(result.success).toBe(false)
  })
})
