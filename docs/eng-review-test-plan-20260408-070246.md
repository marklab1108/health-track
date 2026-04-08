# 測試計畫

由 `/plan-eng-review` 產生：2026-04-08T07:02:46Z
分支：main
Repo：marklab1108/health-track

## 受影響頁面 / 路由

- `/setup` — 驗證個人化目標設定、表單錯誤、熱量與三大營養素目標產生。
- `/today` — 驗證今日熱量與三大營養素統計、空狀態、超標狀態。
- `/meals/new` — 驗證手動記餐、儲存成常吃餐點模板。
- `/templates` — 驗證常吃餐點模板列表與一鍵加入。
- `/weigh-ins` — 驗證每週體重輸入。
- `/weekly` — 驗證本週平均攝取量 vs 建議攝取量 vs 體重變化。
- PWA app shell — 驗證正式建置具備 manifest、service worker、離線開啟能力。
- PWA icons — 驗證 192x192、512x512、maskable 512x512 icon 存在並被 manifest 引用。

## 需要驗證的關鍵互動

- 第一次使用者沒有啟用中的目標時，進入 `/today` 會被導向或提示前往 `/setup`。
- 使用者完成 `/setup` 後會看到 `/today`。
- 使用者在 `/meals/new` 新增一餐後，`/today` 的熱量、蛋白質、脂肪、碳水會即時更新。
- 使用者可以將一餐儲存成模板，之後從模板快速新增。
- 使用者輸入本週體重後，`/weekly` 顯示體重變化。
- 使用者在 `/weekly` 看到本週平均攝取量是否超過建議目標。
- 使用者第一次載入 app 後，之後離線仍可開啟 app shell 並讀到 IndexedDB 既有資料。
- 部署版本符合 PWA 可安裝性的基本條件，可以加入手機主畫面。
- 底部導覽顯示「今日 / 記錄 / 週回顧 / 設定」，且 44px 觸控目標可點擊。
- `/today` 第一眼能看到剩餘熱量與 `記一餐` 主行動。
- `/weekly` 在圖表前先顯示文字摘要，避免只靠圖表理解。
- `/settings` 說明本機儲存與離線限制。

## 邊界情境

- 身高、體重、年齡、熱量、三大營養素欄位為空。
- 數值為 0、負數、極端大數。
- 沒有餐點紀錄時的今日儀表板。
- 沒有體重紀錄時的每週回顧。
- 只有一筆體重紀錄時，不要顯示誤導性的週變化。
- 同一天多筆餐點紀錄要正確加總。
- 刪除模板後，過去餐點紀錄不應消失。
- IndexedDB 寫入失敗時，使用者要看到錯誤，表單輸入不應直接遺失。
- 離線狀態下打開 app，不應白屏。
- service worker 更新後，不應讓使用者長期卡在舊版 app。
- service worker 使用 `autoUpdate`，新版本部署後可自動更新。
- 進度條不能只靠顏色傳達狀態，必須有文字數值。
- 沒有資料的畫面不能只顯示 `No data`，要有下一步行動。

## 關鍵路徑

- 核心迴路：`/setup` → `/today` → `/meals/new` → `/today` → `/weigh-ins` → `/weekly`
- 模板迴路：`/meals/new` 儲存模板 → `/templates` 一鍵加入 → `/today` 更新統計
- 空狀態迴路：新使用者 → `/today` → setup 提示 → 完成 setup → dashboard 可用
- PWA 迴路：正式建置 → 第一次在線造訪 → 離線 → 重新開啟 app → dashboard shell 正常顯示
- PWA 更新迴路：部署新版 → service worker autoUpdate → 重新開啟 app 時使用新版 assets

## 必要自動化測試

- 單元測試：目標熱量與三大營養素計算。
- 單元測試：每日摘要計算。
- 單元測試：每週摘要與建議規則。
- 單元測試：目標、餐點、模板、體重紀錄的 Zod schema。
- 元件測試：setup 表單驗證與成功路徑。
- 元件測試：dashboard 空狀態 / 正常狀態 / 超標狀態。
- 元件測試：有體重紀錄與無體重紀錄時的每週回顧。
- E2E 測試：從 setup 到每週回顧的完整核心迴路。
- E2E / 手動測試：PWA manifest、service worker 註冊、離線 app shell、可安裝性。
- E2E / 手動測試：PWA `autoUpdate` 更新策略與 icon manifest 引用。
- E2E / 手動測試：mobile-first layout、底部導覽、觸控目標、空狀態、圖表前的文字摘要。
