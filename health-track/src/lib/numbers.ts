export function round(value: number, digits = 0) {
  const multiplier = 10 ** digits
  return Math.round(value * multiplier) / multiplier
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat('zh-TW', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value)
}

export function percent(value: number, target: number) {
  if (target <= 0) return 0
  return clamp((value / target) * 100, 0, 999)
}
