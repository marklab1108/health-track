import { z } from 'zod'

export const weighInSchema = z.object({
  measuredAt: z.string().min(1, '請選擇日期'),
  weightKg: z.coerce.number().min(30, '體重至少 30 kg').max(250, '體重最多 250 kg')
})

export type WeighInFormValues = z.infer<typeof weighInSchema>
