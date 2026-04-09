import type { GoalDirection } from '../../lib/types'
import type { WeeklySummary } from './weeklySummary'

export function buildWeeklyInsight(summary: WeeklySummary, direction: GoalDirection = 'lose') {
  if (summary.mealCount === 0) {
    return '這週還沒有飲食紀錄。先讓記錄流程跑起來，週回顧才有判斷依據。'
  }

  if (summary.weightChangeKg === undefined) {
    return '這週還缺體重紀錄。補上至少兩筆體重，才能把飲食和體重變化放在一起看。'
  }

  if (direction === 'lose') {
    if (summary.calorieDeltaFromTarget > 150 && summary.weightChangeKg >= 0) {
      return '這週平均攝取高於建議量，而且體重沒有下降。下週先把常吃餐點份量調小一點。'
    }

    if (summary.calorieDeltaFromTarget <= 150 && summary.weightChangeKg < 0) {
      return '這週平均攝取接近建議量，體重也往目標方向移動。先維持這個節奏。'
    }
  }

  if (Math.abs(summary.calorieDeltaFromTarget) <= 100) {
    return '這週平均攝取接近建議量。下週可以先維持，再觀察體重趨勢。'
  }

  if (summary.calorieDeltaFromTarget > 0) {
    return '這週平均攝取高於建議量。先找出最常超標的餐點，而不是整週重來。'
  }

  return '這週平均攝取低於建議量。若精神或訓練狀態變差，下週可以把熱量補回一點。'
}
