import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ZodError } from 'zod'

export function applyZodErrors<TFieldValues extends FieldValues>(
  error: ZodError,
  setError: UseFormSetError<TFieldValues>
) {
  for (const issue of error.issues) {
    const field = issue.path[0]
    if (typeof field === 'string') {
      setError(field as Path<TFieldValues>, { message: issue.message })
    }
  }
}
