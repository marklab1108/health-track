export type Sex = 'male' | 'female'

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active'

export type GoalDirection = 'lose' | 'maintain' | 'gain'

export type MacroTargets = {
  calories: number
  proteinG: number
  fatG: number
  carbsG: number
}

export type Goal = {
  id: string
  heightCm: number
  currentWeightKg: number
  targetWeightKg: number
  age: number
  sex: Sex
  activityLevel: ActivityLevel
  direction: GoalDirection
  bmr: number
  tdee: number
  dailyTargets: MacroTargets
  createdAt: string
  updatedAt: string
}

export type Meal = {
  id: string
  name: string
  eatenAt: string
  calories: number
  proteinG: number
  fatG: number
  carbsG: number
  templateId?: string
  createdAt: string
}

export type MealTemplate = {
  id: string
  name: string
  calories: number
  proteinG: number
  fatG: number
  carbsG: number
  createdAt: string
  updatedAt: string
}

export type WeighIn = {
  id: string
  measuredAt: string
  weightKg: number
  createdAt: string
}
