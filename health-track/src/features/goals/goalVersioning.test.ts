import { describe, expect, it } from 'vitest'
import { buildNextGoalVersion } from './goalVersioning'

const input = {
  heightCm: 175,
  currentWeightKg: 80,
  targetWeightKg: 72,
  age: 32,
  sex: 'male' as const,
  activityLevel: 'moderate' as const,
  direction: 'lose' as const
}

describe('buildNextGoalVersion', () => {
  it('starts at version 1 when there is no previous goal', () => {
    expect(buildNextGoalVersion(input)).toMatchObject({
      version: 1,
      isActive: true,
      direction: 'lose'
    })
  })

  it('increments the version when a previous goal exists', () => {
    expect(
      buildNextGoalVersion(input, {
        id: 'goal-1',
        version: 2,
        isActive: true,
        heightCm: 175,
        currentWeightKg: 81,
        targetWeightKg: 73,
        age: 32,
        sex: 'male',
        activityLevel: 'light',
        direction: 'lose',
        bmr: 1700,
        tdee: 2300,
        dailyTargets: { calories: 2000, proteinG: 140, fatG: 60, carbsG: 220 },
        createdAt: '2026-04-01T00:00:00.000Z',
        updatedAt: '2026-04-01T00:00:00.000Z'
      })
    ).toMatchObject({
      version: 3,
      isActive: true
    })
  })
})
