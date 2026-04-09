import { useCallback, useEffect, useState } from 'react'

export function useAsyncValue<T>(loader: () => Promise<T>, dependencies: unknown[] = []) {
  const [value, setValue] = useState<T | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<unknown>()
  const [version, setVersion] = useState(0)

  const reload = useCallback(() => {
    setVersion((current) => current + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(undefined)

    loader()
      .then((nextValue) => {
        if (!cancelled) setValue(nextValue)
      })
      .catch((nextError) => {
        if (!cancelled) setError(nextError)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [loader, version, ...dependencies])

  return { value, isLoading, error, reload }
}
