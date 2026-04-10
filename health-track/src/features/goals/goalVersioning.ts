import { db } from '../../lib/db'
import type { Goal } from '../../lib/types'
import { buildGoal } from './goalCalculations'
import type { GoalFormValues } from './goalSchema'
import { getCurrentGoal } from './goalQueries'

export function buildNextGoalVersion(input: GoalFormValues, previousGoal?: Goal) {
  const nextGoal = buildGoal(input)

  return {
    ...nextGoal,
    version: previousGoal ? previousGoal.version + 1 : 1,
    isActive: true
  }
}

export async function saveGoalVersion(input: GoalFormValues) {
  const previousGoal = await getCurrentGoal()
  const nextGoal = buildNextGoalVersion(input, previousGoal)
  const archivedAt = nextGoal.createdAt

  await db.transaction('rw', db.goals, async () => {
    if (previousGoal) {
      await db.goals.put({
        ...previousGoal,
        isActive: false,
        archivedAt,
        updatedAt: archivedAt
      })
    }

    await db.goals.put(nextGoal)
  })

  return nextGoal
}
