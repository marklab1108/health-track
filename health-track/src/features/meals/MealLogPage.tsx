import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { db } from '../../lib/db'
import { toDateInputValue } from '../../lib/dates'
import { buildMeal, buildMealTemplate, mealFormFromTemplate } from './mealCalculations'
import { mealSchema, type MealFormValues } from './mealSchema'
import { applyZodErrors } from '../shared/formErrors'
import { useAsyncValue } from '../shared/useAsyncValue'

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
  const { value: templates = [], reload } = useAsyncValue(useCallback(() => db.mealTemplates.orderBy('updatedAt').reverse().toArray(), []))
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
      }

      await db.meals.put(buildMeal(result.data, templateId))
      reset({ ...defaultValues, eatenAt: result.data.eatenAt })
      reload()
    },
    [reload, reset, setError]
  )

  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">30 秒記一餐</p>
        <h1>輸入你真的知道的數字</h1>
        <p>先記名稱、熱量和三大營養素。常吃餐點可以存成模板，下次一鍵帶入。</p>
      </div>

      {templates.length > 0 ? (
        <section className="section">
          <div className="section-heading">
            <h2>常吃餐點</h2>
          </div>
          <div className="template-row">
            {templates.map((template) => (
              <button key={template.id} className="template-chip" type="button" onClick={() => reset(mealFormFromTemplate(template, today))}>
                {template.name}
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

        <button className="button button--primary span-2" type="submit" disabled={isSubmitting}>
          儲存餐點
        </button>
        {isSubmitSuccessful ? <p className="form-note span-2">已儲存。你可以回到 <Link to="/today">今日</Link> 查看進度。</p> : null}
      </form>
    </section>
  )
}
