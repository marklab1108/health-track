import { useState } from 'react'
import { Link } from 'react-router-dom'
import { clearAllData } from '../../lib/db'
import { seedDemoData } from '../../lib/demoData'

export function SettingsPage() {
  const [statusMessage, setStatusMessage] = useState<string>()
  const [isMutating, setIsMutating] = useState(false)

  async function handleSeedDemoData() {
    setIsMutating(true)
    try {
      await seedDemoData()
      setStatusMessage('已載入 demo data。現在可以直接去看今日、記錄和週回顧。')
    } finally {
      setIsMutating(false)
    }
  }

  async function handleClearData() {
    setIsMutating(true)
    try {
      await clearAllData()
      setStatusMessage('已清空本機資料。你可以重新走一次空白流程。')
    } finally {
      setIsMutating(false)
    }
  }

  return (
    <section className="page">
      <div className="panel">
        <h2>目標設定</h2>
        <p>重新計算每日熱量與三大營養素建議。</p>
        <Link className="button" to="/setup">
          調整目標
        </Link>
      </div>

      <div className="panel">
        <h2>Demo Data</h2>
        <p>載入一組減脂情境的假資料，方便你本機測試今日儀表板、常吃模板和週回顧。</p>
        <div className="actions-row">
          <button className="button button--primary" type="button" onClick={handleSeedDemoData} disabled={isMutating}>
            載入 demo data
          </button>
          <button className="button" type="button" onClick={handleClearData} disabled={isMutating}>
            清空本機資料
          </button>
        </div>
        {statusMessage ? <p className="status-note">{statusMessage}</p> : null}
      </div>

      <div className="panel warning-panel">
        <h2>暫不支援資料保存</h2>
        <p>目前先不提供資料保存功能，之後再補上。</p>
      </div>
    </section>
  )
}
