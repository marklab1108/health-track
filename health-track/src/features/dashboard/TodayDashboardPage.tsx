import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router-dom'
import { db, getCurrentGoal } from '../../lib/db'
import { dayBounds } from '../../lib/dates'
import { formatNumber, percent, round } from '../../lib/numbers'
import type { Goal, Meal } from '../../lib/types'
import { applyZodErrors } from '../shared/formErrors'
import { useAsyncValue } from '../shared/useAsyncValue'
import { summarizeDay } from './dailySummary'
import { mealFormFromMeal, updateMealFromForm } from '../meals/mealCalculations'
import { mealSchema, type MealFormValues } from '../meals/mealSchema'
import { cloneMealForDate, getMostRecentMeal, getTodayDateInputValue, getYesterdayMeals } from '../meals/mealQueries'
import { getTemplateUsageTimestamp, trackTemplateUsage } from '../meals/mealTemplateStats'

export function TodayDashboardPage() {
  const [statusMessage, setStatusMessage] = useState<string>()
  const loader = useCallback(async () => {
    const goal = await getCurrentGoal()
    const bounds = dayBounds(new Date())
    const meals = await db.meals.where('eatenAt').between(bounds.start, bounds.end, true, true).sortBy('eatenAt')
    const yesterdayMeals = await getYesterdayMeals()
    const recentMeal = await getMostRecentMeal()
    return { goal, meals, yesterdayMeals, recentMeal }
  }, [])
  const { value, isLoading, error, reload } = useAsyncValue(loader)

  if (isLoading) return <PageMessage title="載入中" body="正在讀取今天的紀錄。" />
  if (error) return <PageMessage title="讀取失敗" body="請重新整理後再試一次。" />
  if (!value?.goal) return <Navigate to="/setup" replace />

  return (
    <TodayContent
      goal={value.goal}
      meals={value.meals}
      yesterdayMeals={value.yesterdayMeals}
      recentMeal={value.recentMeal}
      statusMessage={statusMessage}
      setStatusMessage={setStatusMessage}
      reload={reload}
    />
  )
}

function TodayContent({
  goal,
  meals,
  yesterdayMeals,
  recentMeal,
  statusMessage,
  setStatusMessage,
  reload
}: {
  goal: Goal
  meals: Meal[]
  yesterdayMeals: Meal[]
  recentMeal?: Meal
  statusMessage?: string
  setStatusMessage: (message: string | undefined) => void
  reload: () => void
}) {
  const summary = summarizeDay(meals, goal)
  const caloriePercent = percent(summary.calories, goal.dailyTargets.calories)
  const [editingMealId, setEditingMealId] = useState<string | null>(null)
  const todayInput = getTodayDateInputValue()

  const handleCopyYesterday = useCallback(async () => {
    if (yesterdayMeals.length === 0) return

    const clonedMeals = yesterdayMeals.map((meal) => cloneMealForDate(meal, todayInput))

    await db.meals.bulkPut(clonedMeals)
    await Promise.all(
      clonedMeals.filter((meal) => meal.templateId).map((meal) => trackTemplateUsage(meal.templateId as string, getTemplateUsageTimestamp()))
    )

    setStatusMessage(`已複製昨天的 ${yesterdayMeals.length} 餐。`)
    reload()
  }, [reload, todayInput, yesterdayMeals])

  const handleCopyRecentMeal = useCallback(async () => {
    if (!recentMeal) return

    const nextMeal = cloneMealForDate(recentMeal, todayInput)
    await db.meals.put(nextMeal)
    if (recentMeal.templateId) {
      await trackTemplateUsage(recentMeal.templateId, getTemplateUsageTimestamp())
    }
    setStatusMessage(`已複製最近一筆餐點：${recentMeal.name}`)
    reload()
  }, [recentMeal, reload, todayInput])

  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">今日</p>
        <h1>{summary.remainingCalories > 0 ? `還能吃 ${formatNumber(summary.remainingCalories)} kcal` : `已超過 ${formatNumber(summary.overCalories)} kcal`}</h1>
        <p>今天已記錄 {summary.mealCount} 餐。先看剩餘熱量，再決定下一餐怎麼調。</p>
      </div>

      <div className="panel hero-metric">
        <div>
          <span>已攝取</span>
          <strong>{formatNumber(summary.calories)} kcal</strong>
          <p>每日建議 {formatNumber(goal.dailyTargets.calories)} kcal</p>
        </div>
        <ProgressBar value={caloriePercent} />
      </div>

      <div className="macro-grid">
        <MacroCard label="蛋白質" value={summary.proteinG} target={goal.dailyTargets.proteinG} unit="g" />
        <MacroCard label="脂肪" value={summary.fatG} target={goal.dailyTargets.fatG} unit="g" />
        <MacroCard label="碳水" value={summary.carbsG} target={goal.dailyTargets.carbsG} unit="g" />
      </div>

      <section className="panel">
        <div className="section-heading">
          <h2>快速操作</h2>
        </div>
        <div className="quick-actions">
          <Link className="button button--primary" to="/log">
            記一餐
          </Link>
          <button className="button" type="button" onClick={handleCopyYesterday} disabled={yesterdayMeals.length === 0}>
            複製昨天
          </button>
          <button className="button" type="button" onClick={handleCopyRecentMeal} disabled={!recentMeal}>
            複製最近一筆
          </button>
        </div>
        {statusMessage ? <p className="status-note">{statusMessage}</p> : null}
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>今天的餐點</h2>
          <span className="badge badge--muted">記錄 {summary.mealCount} 餐</span>
        </div>
        {meals.length === 0 ? (
          <div className="empty-state">還沒有餐點。先記下一餐，週回顧才會開始有資料。</div>
        ) : (
          <div className="list">
            {meals.map((meal) => (
              <MealListItem
                key={meal.id}
                meal={meal}
                isEditing={editingMealId === meal.id}
                onEdit={() => setEditingMealId(meal.id)}
                onCancelEdit={() => setEditingMealId(null)}
                onSaved={() => {
                  setEditingMealId(null)
                  reload()
                }}
                onDeleted={() => {
                  if (editingMealId === meal.id) setEditingMealId(null)
                  reload()
                }}
              />
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

function MealListItem({
  meal,
  isEditing,
  onEdit,
  onCancelEdit,
  onSaved,
  onDeleted
}: {
  meal: Meal
  isEditing: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onSaved: () => void
  onDeleted: () => void
}) {
  const defaultValues = useMemo(() => mealFormFromMeal(meal), [meal])
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<MealFormValues>({ defaultValues })

  const onSubmit = useCallback(
    async (values: MealFormValues) => {
      const result = mealSchema.safeParse(values)
      if (!result.success) {
        applyZodErrors(result.error, setError)
        return
      }

      await db.meals.put(updateMealFromForm(meal, result.data))
      onSaved()
    },
    [meal, onSaved, setError]
  )

  const onDelete = useCallback(async () => {
    await db.meals.delete(meal.id)
    onDeleted()
  }, [meal.id, onDeleted])

  if (isEditing) {
    return (
      <form className="list-item list-item--editing" onSubmit={handleSubmit(onSubmit)}>
        <label className="span-2">
          <span>餐點名稱</span>
          <input {...register('name')} />
          {errors.name ? <small>{errors.name.message}</small> : null}
        </label>
        <label>
          <span>日期</span>
          <input type="date" {...register('eatenAt')} />
        </label>
        <label>
          <span>熱量 kcal</span>
          <input type="number" inputMode="decimal" {...register('calories', { valueAsNumber: true })} />
          {errors.calories ? <small>{errors.calories.message}</small> : null}
        </label>
        <label>
          <span>蛋白質 g</span>
          <input type="number" inputMode="decimal" {...register('proteinG', { valueAsNumber: true })} />
        </label>
        <label>
          <span>脂肪 g</span>
          <input type="number" inputMode="decimal" {...register('fatG', { valueAsNumber: true })} />
        </label>
        <label>
          <span>碳水 g</span>
          <input type="number" inputMode="decimal" {...register('carbsG', { valueAsNumber: true })} />
        </label>
        <div className="actions-row span-2">
          <button className="button button--primary" type="submit" disabled={isSubmitting}>
            儲存修改
          </button>
          <button
            className="button"
            type="button"
            onClick={() => {
              reset(defaultValues)
              onCancelEdit()
            }}
          >
            取消
          </button>
          <button className="button button--danger" type="button" onClick={onDelete}>
            刪除
          </button>
        </div>
      </form>
    )
  }

  return (
    <article className="list-item">
      <div className="meal-content">
        <h3>{meal.name}</h3>
        <p>
          蛋白質 {meal.proteinG}g / 脂肪 {meal.fatG}g / 碳水 {meal.carbsG}g
        </p>
      </div>
      <div className="meal-actions">
        <strong>{formatNumber(meal.calories)} kcal</strong>
        <span className="meal-subvalue">
          蛋白質 {round(meal.proteinG, 0)}g
        </span>
        <div className="actions-row actions-row--compact">
          <button className="button button--small" type="button" onClick={onEdit}>
            修改
          </button>
          <button className="button button--small button--danger" type="button" onClick={onDelete}>
            刪除
          </button>
        </div>
      </div>
    </article>
  )
}

function MacroCard({ label, value, target, unit }: { label: string; value: number; target: number; unit: string }) {
  return (
    <article className="panel macro-card">
      <span>{label}</span>
      <strong>
        {formatNumber(value)}
        {unit}
      </strong>
      <p>
        目標 {formatNumber(target)}
        {unit}
      </p>
      <ProgressBar value={percent(value, target)} />
    </article>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress" aria-label={`目前進度 ${formatNumber(value)}%`}>
      <div className={value > 100 ? 'progress__fill progress__fill--over' : 'progress__fill'} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  )
}

function PageMessage({ title, body }: { title: string; body: string }) {
  return (
    <section className="page">
      <div className="empty-state">
        <h1>{title}</h1>
        <p>{body}</p>
      </div>
    </section>
  )
}
