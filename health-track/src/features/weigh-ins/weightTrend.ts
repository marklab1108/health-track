import type { WeighIn } from '../../lib/types'
import { fromDateInputValue } from '../../lib/dates'
import type { WeighInFormValues } from './weighInSchema'

export function buildWeighIn(input: WeighInFormValues): WeighIn {
  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    measuredAt: fromDateInputValue(input.measuredAt),
    weightKg: input.weightKg,
    createdAt: now
  }
}
