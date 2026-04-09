import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { db, getCurrentGoal } from '../../lib/db'
import { lastFourWeeksBounds, monthBounds, previousMonthBounds, toDateInputValue, weekBounds } from '../../lib/dates'
import { formatNumber } from '../../lib/numbers'
import { useAsyncValue } from '../shared/useAsyncValue'
import { applyZodErrors } from '../shared/formErrors'
import { buildWeighIn } from '../weigh-ins/weightTrend'
import { weighInSchema, type WeighInFormValues } from '../weigh-ins/weighInSchema'
import { buildWeeklyInsight } from './recommendationRules'
import { buildFourWeekWeightTrend, summarizeWeek } from './weeklySummary'

const defaultValues: WeighInFormValues = {
  measuredAt: toDateInputValue(new Date()),
  weightKg: 80
}

export function WeeklyReviewPage() {
  const loader = useCallback(async () => {
    const goal = await getCurrentGoal()
    const weeklyBounds = weekBounds(new Date())
    const currentMonth = monthBounds(new Date())
    const previousMonth = previousMonthBounds(new Date())
    const fourWeekBounds = lastFourWeeksBounds(new Date())
    const meals = await db.meals.where('eatenAt').between(weeklyBounds.start, weeklyBounds.end, true, true).sortBy('eatenAt')
    const weighIns = await db.weighIns.where('measuredAt').between(currentMonth.start, currentMonth.end, true, true).sortBy('measuredAt')
    const previousMonthWeighIns = await db.weighIns
      .where('measuredAt')
      .between(previousMonth.start, previousMonth.end, true, true)
      .sortBy('measuredAt')
    const fourWeekWeighIns = await db.weighIns
      .where('measuredAt')
      .between(fourWeekBounds.start, fourWeekBounds.end, true, true)
      .sortBy('measuredAt')
    return { goal, meals, weighIns, previousMonthWeighIns, fourWeekWeighIns }
  }, [])
  const { value, isLoading, reload } = useAsyncValue(loader)
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<WeighInFormValues>({ defaultValues })

  const onSubmit = useCallback(
    async (values: WeighInFormValues) => {
      const result = weighInSchema.safeParse(values)
      if (!result.success) {
        applyZodErrors(result.error, setError)
        return
      }

      await db.weighIns.put(buildWeighIn(result.data))
      reset({ ...result.data })
      reload()
    },
    [reload, reset, setError]
  )

  if (isLoading || !value) {
    return (
      <section className="page">
        <div className="empty-state">正在讀取本月資料。</div>
      </section>
    )
  }

  const summary = summarizeWeek(value.meals, value.weighIns, value.previousMonthWeighIns, value.goal)
  const insight = buildWeeklyInsight(summary, value.goal?.direction)
  const macroData = [
    { name: '熱量', actual: summary.averageCalories, target: summary.targetCalories },
    { name: '蛋白質', actual: summary.averageProteinG, target: value.goal?.dailyTargets.proteinG ?? 0 },
    { name: '脂肪', actual: summary.averageFatG, target: value.goal?.dailyTargets.fatG ?? 0 },
    { name: '碳水', actual: summary.averageCarbsG, target: value.goal?.dailyTargets.carbsG ?? 0 }
  ]
  const weightData = buildFourWeekWeightTrend(value.fourWeekWeighIns)

  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">週回顧</p>
        <h1>{summary.mealCount > 0 ? `平均 ${formatNumber(summary.averageCalories)} kcal / day` : '先累積本週紀錄'}</h1>
        <p>{insight}</p>
      </div>

      <div className="stats-grid">
        <MetricCard label="建議熱量" value={`${formatNumber(summary.targetCalories)} kcal`} />
        <MetricCard label="平均差距" value={`${summary.calorieDeltaFromTarget > 0 ? '+' : ''}${formatNumber(summary.calorieDeltaFromTarget)} kcal`} />
        <MetricCard label="本月體重變化" value={summary.weightChangeKg === undefined ? '資料不足' : `${summary.weightChangeKg > 0 ? '+' : ''}${summary.weightChangeKg} kg`} />
      </div>

      <section className="panel chart-panel">
        <h2>平均攝取 vs 建議量</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={macroData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="target" name="建議" fill="#99f6e4" radius={[6, 6, 0, 0]} />
            <Bar dataKey="actual" name="實際" fill="#0f766e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="panel chart-panel">
        <h2>近四週體重變化</h2>
        {weightData.filter((item) => item.weight !== null).length < 2 ? (
          <p>至少要有兩週的體重資料，才能看到近四週走勢。</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" name="體重" stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      <form className="panel form-grid" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="span-2">新增體重</h2>
        <label>
          <span>日期</span>
          <input type="date" {...register('measuredAt')} />
          {errors.measuredAt ? <small>{errors.measuredAt.message}</small> : null}
        </label>
        <label>
          <span>體重 kg</span>
          <input type="number" inputMode="decimal" step="0.1" {...register('weightKg', { valueAsNumber: true })} />
          {errors.weightKg ? <small>{errors.weightKg.message}</small> : null}
        </label>
        <button className="button button--primary span-2" type="submit" disabled={isSubmitting}>
          儲存體重
        </button>
        <p className="form-note span-2">本月體重變化會用本月最後一筆體重，和上月最後一筆體重相比。</p>
      </form>
    </section>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="panel metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}
