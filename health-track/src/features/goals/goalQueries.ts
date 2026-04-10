import { db } from '../../lib/db'

export async function getCurrentGoal() {
  const goals = await db.goals.orderBy('updatedAt').reverse().toArray()
  return goals.find((goal) => goal.isActive) ?? goals[0]
}

export async function getGoalHistory() {
  return db.goals.orderBy('updatedAt').reverse().toArray()
}

export async function getGoalForDate(dateIso: string) {
  const goals = await db.goals.orderBy('createdAt').toArray()
  const effectiveGoals = goals.filter((goal) => goal.createdAt <= dateIso)
  return effectiveGoals[effectiveGoals.length - 1] ?? goals[goals.length - 1]
}
