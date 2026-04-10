import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { db } from '../../lib/db'
import { toDateInputValue } from '../../lib/dates'
import { buildMeal, buildMealTemplate, mealFormFromTemplate } from './mealCalculations'
import { mealSchema, type MealFormValues } from './mealSchema'
import { applyZodErrors } from '../shared/formErrors'
import { useAsyncValue } from '../shared/useAsyncValue'
import { getRecentMeals, searchRecentMeals } from './mealQueries'
import { getTemplateUsageTimestamp, sortTemplatesByRecent, sortTemplatesByUsage, trackTemplateUsage } from './mealTemplateStats'

const today = toDateInputValue(new Date())
const defaultValues: MealFormValues = {
  name: '',
  eatenAt: today,
  calories: 0,
  proteinG: 0,
  fatG: 0,
  carbsG: 0,
  saveAsTemplate: false
}

export function MealLogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortMode, setSortMode] = useState<'recent' | 'usage'>('recent')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>()
  const loader = useCallback(async () => {
    const templates = await db.mealTemplates.toArray()
    const recentMeals = await getRecentMeals()
    const searchedMeals = await searchRecentMeals(searchQuery)
    return { templates, recentMeals, searchedMeals }
  }, [searchQuery])
  const { value, reload } = useAsyncValue(loader)
  const templates = useMemo(() => {
    const items = value?.templates ?? []
    return sortMode === 'recent' ? sortTemplatesByRecent(items) : sortTemplatesByUsage(items)
  }, [sortMode, value?.templates])
  const recentMeals = value?.recentMeals ?? []
  const searchedMeals = searchQuery.trim() ? value?.searchedMeals ?? [] : []
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful }
  } = useForm<MealFormValues>({ defaultValues })

  const onSubmit = useCallback(
    async (values: MealFormValues) => {
      const result = mealSchema.safeParse(values)
      if (!result.success) {
        applyZodErrors(result.error, setError)
        return
      }

      let templateId: string | undefined
      if (result.data.saveAsTemplate) {
        const template = buildMealTemplate(result.data)
        templateId = template.id
        await db.mealTemplates.put(template)
      } else {
        templateId = selectedTemplateId
      }

      const meal = buildMeal(result.data, templateId)
      await db.meals.put(meal)
      if (templateId) {
        await trackTemplateUsage(templateId, getTemplateUsageTimestamp())
      }
      reset({ ...defaultValues, eatenAt: result.data.eatenAt })
      setSelectedTemplateId(undefined)
      reload()
    },
    [reload, reset, selectedTemplateId, setError]
  )

  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">30 秒記一餐</p>
        <h1>輸入你真的知道的數字</h1>
        <p>先記名稱、熱量和三大營養素。常吃餐點可以存成模板，下次一鍵帶入。</p>
      </div>

      <section className="panel">
        <div className="section-heading">
          <h2>快速找餐點</h2>
        </div>
        <label>
          <span>搜尋最近輸入過的餐點</span>
          <input placeholder="例如 雞胸便當" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
        </label>
        {searchQuery.trim() ? (
          searchedMeals.length > 0 ? (
            <div className="list">
              {searchedMeals.map((meal) => (
                <button
                  key={meal.id}
                  className="list-item list-item--button"
                  type="button"
                  onClick={() => {
                    reset({
                      ...mealFormFromTemplate(
                        {
                          id: meal.id,
                          name: meal.name,
                          calories: meal.calories,
                          proteinG: meal.proteinG,
                          fatG: meal.fatG,
                          carbsG: meal.carbsG,
                          usageCount: 0,
                          createdAt: meal.createdAt,
                          updatedAt: meal.createdAt
                        },
                        today
                      ),
                      saveAsTemplate: false
                    })
                    setSelectedTemplateId(meal.templateId)
                  }}
                >
                  <div className="meal-content">
                    <h3>{meal.name}</h3>
                    <p>
                      {meal.calories} kcal / 蛋白質 {meal.proteinG}g
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p>找不到符合的最近餐點。</p>
          )
        ) : (
          <p>先從最近吃過的餐點找，通常比重打一次更快。</p>
        )}
      </section>

      {templates.length > 0 ? (
        <section className="section">
          <div className="section-heading">
            <h2>常吃餐點</h2>
            <div className="segmented-control" role="tablist" aria-label="模板排序">
              <button
                className={sortMode === 'recent' ? 'segmented-control__item segmented-control__item--active' : 'segmented-control__item'}
                type="button"
                onClick={() => setSortMode('recent')}
              >
                最近使用
              </button>
              <button
                className={sortMode === 'usage' ? 'segmented-control__item segmented-control__item--active' : 'segmented-control__item'}
                type="button"
                onClick={() => setSortMode('usage')}
              >
                最常使用
              </button>
            </div>
          </div>
          <div className="template-row">
            {templates.map((template) => (
              <button
                key={template.id}
                className={selectedTemplateId === template.id ? 'template-chip template-chip--selected' : 'template-chip'}
                type="button"
                onClick={() => {
                  reset(mealFormFromTemplate(template, today))
                  setSelectedTemplateId(template.id)
                }}
              >
                {template.name}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {recentMeals.length > 0 ? (
        <section className="section">
          <div className="section-heading">
            <h2>最近記錄</h2>
          </div>
          <div className="list">
            {recentMeals.slice(0, 3).map((meal) => (
              <button
                key={meal.id}
                className="list-item list-item--button"
                type="button"
                onClick={() => {
                  reset({
                    name: meal.name,
                    eatenAt: today,
                    calories: meal.calories,
                    proteinG: meal.proteinG,
                    fatG: meal.fatG,
                    carbsG: meal.carbsG,
                    saveAsTemplate: false
                  })
                  setSelectedTemplateId(meal.templateId)
                }}
              >
                <div className="meal-content">
                  <h3>{meal.name}</h3>
                  <p>
                    {meal.calories} kcal / 蛋白質 {meal.proteinG}g / 脂肪 {meal.fatG}g / 碳水 {meal.carbsG}g
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <form className="panel form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label className="span-2">
          <span>餐點名稱</span>
          <input placeholder="例如 雞胸便當" {...register('name')} />
          {errors.name ? <small>{errors.name.message}</small> : null}
        </label>

        <label className="span-2">
          <span>日期</span>
          <input type="date" {...register('eatenAt')} />
          {errors.eatenAt ? <small>{errors.eatenAt.message}</small> : null}
        </label>

        <label>
          <span>熱量 kcal</span>
          <input type="number" inputMode="decimal" {...register('calories', { valueAsNumber: true })} />
          {errors.calories ? <small>{errors.calories.message}</small> : null}
        </label>

        <label>
          <span>蛋白質 g</span>
          <input type="number" inputMode="decimal" {...register('proteinG', { valueAsNumber: true })} />
          {errors.proteinG ? <small>{errors.proteinG.message}</small> : null}
        </label>

        <label>
          <span>脂肪 g</span>
          <input type="number" inputMode="decimal" {...register('fatG', { valueAsNumber: true })} />
          {errors.fatG ? <small>{errors.fatG.message}</small> : null}
        </label>

        <label>
          <span>碳水 g</span>
          <input type="number" inputMode="decimal" {...register('carbsG', { valueAsNumber: true })} />
          {errors.carbsG ? <small>{errors.carbsG.message}</small> : null}
        </label>

        <label className="checkbox-field span-2">
          <input type="checkbox" {...register('saveAsTemplate')} />
          <span>存成常吃餐點</span>
        </label>

        {selectedTemplateId ? <p className="form-note span-2">這筆餐點會沿用已選模板的使用紀錄。</p> : null}

        <button className="button button--primary span-2" type="submit" disabled={isSubmitting}>
          儲存餐點
        </button>
        {isSubmitSuccessful ? <p className="form-note span-2">已儲存。你可以回到 <Link to="/today">今日</Link> 查看進度。</p> : null}
      </form>
    </section>
  )
}
