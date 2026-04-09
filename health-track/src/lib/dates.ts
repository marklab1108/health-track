import { endOfDay, endOfMonth, endOfWeek, format, startOfDay, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns'

export function toDateInputValue(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

export function dayBounds(date: Date) {
  return {
    start: startOfDay(date).toISOString(),
    end: endOfDay(date).toISOString()
  }
}

export function weekBounds(date: Date) {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }).toISOString(),
    end: endOfWeek(date, { weekStartsOn: 1 }).toISOString()
  }
}

export function previousWeekBounds(date: Date) {
  const previous = subDays(startOfWeek(date, { weekStartsOn: 1 }), 1)
  return weekBounds(previous)
}

export function monthBounds(date: Date) {
  return {
    start: startOfMonth(date).toISOString(),
    end: endOfMonth(date).toISOString()
  }
}

export function previousMonthBounds(date: Date) {
  return monthBounds(subMonths(date, 1))
}

export function lastFourWeeksBounds(date: Date) {
  return {
    start: startOfWeek(subWeeks(date, 3), { weekStartsOn: 1 }).toISOString(),
    end: endOfWeek(date, { weekStartsOn: 1 }).toISOString()
  }
}

export function fromDateInputValue(value: string) {
  return startOfDay(new Date(`${value}T00:00:00`)).toISOString()
}
