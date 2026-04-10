import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { getCurrentGoal } from '../../lib/db'
import { calculateDailyTargets } from './goalCalculations'
import { goalSchema, type GoalFormValues } from './goalSchema'
import { applyZodErrors } from '../shared/formErrors'
import { useAsyncValue } from '../shared/useAsyncValue'
import { saveGoalVersion } from './goalVersioning'

const defaultValues: GoalFormValues = {
  heightCm: 175,
  currentWeightKg: 80,
  targetWeightKg: 72,
  age: 32,
  sex: 'male',
  activityLevel: 'moderate',
  direction: 'lose'
}

export function GoalSetupPage() {
  const navigate = useNavigate()
  const [showActivityHint, setShowActivityHint] = useState(false)
  const { value: currentGoal } = useAsyncValue(getCurrentGoal)
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<GoalFormValues>({ defaultValues })
  const watched = watch()
  const previewResult = goalSchema.safeParse(watched)
  const preview = previewResult.success ? calculateDailyTargets(previewResult.data) : undefined

  useEffect(() => {
    if (!currentGoal) return

    reset({
      heightCm: currentGoal.heightCm,
      currentWeightKg: currentGoal.currentWeightKg,
      targetWeightKg: currentGoal.targetWeightKg,
      age: currentGoal.age,
      sex: currentGoal.sex,
      activityLevel: currentGoal.activityLevel,
      direction: currentGoal.direction
    })
  }, [currentGoal, reset])

  const onSubmit = useCallback(
    async (values: GoalFormValues) => {
      const result = goalSchema.safeParse(values)
      if (!result.success) {
        applyZodErrors(result.error, setError)
        return
      }

      await saveGoalVersion(result.data)
      navigate('/today')
    },
    [navigate, setError]
  )

  return (
    <section className="page page--setup">
      <div className="page-header">
        <p className="eyebrow">個人化目標</p>
        <h1>{currentGoal ? '調整你的每日目標' : '先設定你的減脂基準線'}</h1>
        <p>輸入基本資料後，系統會估算每日熱量與三大營養素。第一版用這個作為週回顧的比較基準。</p>
        {currentGoal ? (
          <div className="badge-row">
            <span className="badge badge--active">目前目標</span>
            <span className="badge">最近更新 {format(new Date(currentGoal.updatedAt), 'yyyy/MM/dd')}</span>
          </div>
        ) : null}
      </div>

      <form className="panel form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label>
          <span>身高 cm</span>
          <input type="number" inputMode="decimal" {...register('heightCm', { valueAsNumber: true })} />
          {errors.heightCm ? <small>{errors.heightCm.message}</small> : null}
        </label>

        <label>
          <span>目前體重 kg</span>
          <input type="number" inputMode="decimal" step="0.1" {...register('currentWeightKg', { valueAsNumber: true })} />
          {errors.currentWeightKg ? <small>{errors.currentWeightKg.message}</small> : null}
        </label>

        <label>
          <span>目標體重 kg</span>
          <input type="number" inputMode="decimal" step="0.1" {...register('targetWeightKg', { valueAsNumber: true })} />
          {errors.targetWeightKg ? <small>{errors.targetWeightKg.message}</small> : null}
        </label>

        <label>
          <span>年齡</span>
          <input type="number" inputMode="numeric" {...register('age', { valueAsNumber: true })} />
          {errors.age ? <small>{errors.age.message}</small> : null}
        </label>

        <label>
          <span>性別</span>
          <select {...register('sex')}>
            <option value="male">男性</option>
            <option value="female">女性</option>
          </select>
          {errors.sex ? <small>{errors.sex.message}</small> : null}
        </label>

        <label>
          <span className="field-label">
            活動量
            <button
              className="info-button"
              type="button"
              aria-expanded={showActivityHint}
              aria-controls="activity-level-hint"
              onClick={() => setShowActivityHint((current) => !current)}
            >
              i
            </button>
          </span>
          <select {...register('activityLevel')}>
            <option value="sedentary">久坐</option>
            <option value="light">輕量活動</option>
            <option value="moderate">中等活動</option>
            <option value="active">高活動量</option>
          </select>
          {showActivityHint ? (
            <div className="field-hint" id="activity-level-hint">
              <strong>活動量怎麼選</strong>
              <ul className="hint-list">
                <li>
                  <span>久坐：</span>大多數時間坐著，平常幾乎沒有運動。
                </li>
                <li>
                  <span>輕量活動：</span>每週 1-3 次輕度運動，或通勤、走路稍微多一點。
                </li>
                <li>
                  <span>中等活動：</span>每週 3-5 次規律訓練，或工作型態需要常走動。
                </li>
                <li>
                  <span>高活動量：</span>每週高頻訓練，或工作本身就很耗體力。
                </li>
              </ul>
            </div>
          ) : null}
          {errors.activityLevel ? <small>{errors.activityLevel.message}</small> : null}
        </label>

        <label>
          <span>目標方向</span>
          <select {...register('direction')}>
            <option value="lose">減脂</option>
            <option value="maintain">維持</option>
            <option value="gain">增重</option>
          </select>
          {errors.direction ? <small>{errors.direction.message}</small> : null}
        </label>

        {preview ? (
          <div className="target-preview">
            <span>每日建議</span>
            <strong>{preview.calories} kcal</strong>
            <p>蛋白質 {preview.proteinG}g / 脂肪 {preview.fatG}g / 碳水 {preview.carbsG}g</p>
          </div>
        ) : null}

        <button className="button button--primary" type="submit" disabled={isSubmitting}>
          儲存目標
        </button>
      </form>
    </section>
  )
}
