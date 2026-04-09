import { z } from 'zod'

export const mealSchema = z.object({
  name: z.string().trim().min(1, '請輸入餐點名稱').max(80, '餐點名稱太長'),
  eatenAt: z.string().min(1, '請選擇日期'),
  calories: z.coerce.number().min(0, '熱量不可小於 0').max(5000, '單餐熱量過高'),
  proteinG: z.coerce.number().min(0, '蛋白質不可小於 0').max(400, '蛋白質過高'),
  fatG: z.coerce.number().min(0, '脂肪不可小於 0').max(400, '脂肪過高'),
  carbsG: z.coerce.number().min(0, '碳水不可小於 0').max(800, '碳水過高'),
  saveAsTemplate: z.boolean().default(false)
})

export type MealFormValues = z.infer<typeof mealSchema>
