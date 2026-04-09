import { z } from 'zod'

export const goalSchema = z.object({
  heightCm: z.coerce.number().min(120, '身高至少 120 cm').max(230, '身高最多 230 cm'),
  currentWeightKg: z.coerce.number().min(30, '體重至少 30 kg').max(250, '體重最多 250 kg'),
  targetWeightKg: z.coerce.number().min(30, '目標體重至少 30 kg').max(250, '目標體重最多 250 kg'),
  age: z.coerce.number().int('年齡必須是整數').min(13, '年齡至少 13 歲').max(100, '年齡最多 100 歲'),
  sex: z.enum(['male', 'female'], { message: '請選擇性別' }),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active'], { message: '請選擇活動量' }),
  direction: z.enum(['lose', 'maintain', 'gain'], { message: '請選擇目標方向' })
})

export type GoalFormValues = z.infer<typeof goalSchema>
