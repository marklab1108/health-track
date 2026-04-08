# 工程計畫：極簡健康追蹤 MVP

由 `/plan-eng-review` 產生：2026-04-08T07:02:46Z
分支：main
Repo：marklab1108/health-track
狀態：草稿
輸入文件：
- `docs/requirement.md`
- `docs/office-hours-design-20260408-065306.md`
- `docs/ui-ux-plan-design-review-20260408-074037.md`

## 結論

第一版做 mobile-first PWA-lite web app，採用 local-first 架構：

- 前端：React + Vite + TypeScript
- PWA：vite-plugin-pwa, Web App Manifest, app shell offline cache
- 路由：React Router
- 表單與驗證：React Hook Form + Zod
- 本機持久化：IndexedDB through Dexie
- 圖表：Recharts
- 日期處理：date-fns
- 單元 / 元件測試：Vitest + React Testing Library
- E2E 測試：Playwright
- 部署：Vercel 或 Netlify static PWA hosting

先不要做帳號系統、雲端同步、完整食物資料庫、條碼掃描、照片記餐、語音記餐、推播通知、背景同步。這些都不是 MVP 的瓶頸。

## Step 0：範圍挑戰

### 目前已存在的內容

- `docs/requirement.md` 已列出原始需求。
- `docs/office-hours-design-20260408-065306.md` 已將產品方向收斂成最小可用回饋迴路。
- 目前沒有 app code、資料模型、測試框架、部署設定可以重用。

### 最小可交付範圍

MVP 只需要交付完整回饋迴路：

1. 個人化目標設定。
2. 今日儀表板。
3. 快速記餐。
4. 常吃餐點模板。
5. 每週體重輸入。
6. 每週回顧，顯示平均攝取量、建議攝取量與體重變化。
7. PWA-lite：可以加到手機主畫面，app shell 可離線開啟。

### 明確不在範圍內

- 完整食物資料庫：資料維護成本高，會蓋掉核心學習目標。
- 條碼掃描：需要外部資料源，第一版不需要。
- 照片 / 語音記餐：10x 方向，等核心迴路有用後再做。
- 帳號登入與雲端同步：local-first 足夠驗證個人 side project。
- 醫療或營養師級建議：app 只做規劃輔助，不做醫療宣稱。
- 原生 iOS / Android：第一版用 mobile-first web 降低發佈成本。
- 推播通知：不是記餐核心迴路的必要條件。
- 背景同步：v1 沒有雲端同步，不需要處理同步衝突。
- 複雜 cache strategy：只快取 app shell 和靜態資產，不快取不存在的 API。

### 發佈方式

第一版是 static PWA web app，可以部署到 Vercel 或 Netlify。資料先存在使用者瀏覽器 IndexedDB。

這代表 v1 的限制很清楚：換裝置資料不會同步。這是刻意取捨，不是忘記做。

PWA-lite 的發佈要求：
- `manifest.webmanifest` 有 app name、short name、icons、theme color、display mode。
- service worker 能快取 app shell，讓 app 在離線時仍能打開。
- deploy 後用 Lighthouse / browser install prompt 檢查可安裝性。
- IndexedDB 資料留在本機，不透過 service worker 自作同步。
- service worker 更新策略使用 `autoUpdate`。
- icon 先採簡單健康追蹤符號：白底、深綠 / teal 線條、抽象進度環 + 小折線。不要用食物 emoji、醫療十字或複雜插畫。
- icon 檔案至少包含：192x192 PNG、512x512 PNG、maskable 512x512 PNG。

## 技術選型

### React + Vite + TypeScript

選這個，不選 Next.js。

原因：
- 需求不需要 SSR、server actions、middleware、edge runtime。
- local-first app 的核心在瀏覽器互動與本地資料，不在後端渲染。
- Vite 對 side project 的啟動、build、測試整合更輕。
- TypeScript 可以讓營養素、日期區間、週回顧計算更不容易寫壞。

取捨：
- 未來如果要做帳號同步，會需要補 API 或遷移到 full-stack framework。
- 但 MVP 階段這是正確取捨。現在引入 full-stack framework 是花 innovation token。

### PWA-lite: vite-plugin-pwa + Web App Manifest

選 PWA-lite，不選原生 mobile app。

MVP 內容：
- 可安裝到手機主畫面。
- 使用 standalone display mode，開起來像 app。
- 快取 app shell 和靜態資產。
- 離線時能開啟 app，並讀取 IndexedDB 裡既有資料。
- 顯示離線狀態提示，避免使用者誤以為資料已同步到雲端。

明確不做：
- 推播通知。
- 背景同步。
- 跨裝置同步。
- 離線 mutation conflict resolution。
- App Store / Play Store 發佈。

原因：
- 記餐是高頻手機場景，PWA 比純網頁更貼近使用者習慣。
- local-first + IndexedDB 和 PWA 很搭，離線打開 app 是合理要求。
- vite-plugin-pwa 可以把 manifest 和 service worker 接到 Vite build 裡，不需要手寫一套 service worker。

取捨：
- iOS/Android PWA 行為仍有平台差異，要用真機或瀏覽器檢查核心流程。
- PWA 不等於原生 app，系統整合能力較弱。
- Cache 設錯會造成使用者拿到舊版 app，所以 v1 要採簡單明確的 app shell cache。
- 更新策略已選 `autoUpdate`，MVP 不做手動更新提示。

### IndexedDB + Dexie

選 Dexie 包 IndexedDB，不直接操作 `localStorage`。

原因：
- 食物紀錄會逐日增加，用 IndexedDB 比 localStorage 合理。
- Dexie 提供 typed tables、查詢、索引與 transaction，避免手寫 IndexedDB 的 callback hell。
- local-first 讓使用者可以不用註冊就開始用，符合 30 秒低摩擦定位。

取捨：
- 沒有雲端同步。
- 需要設計資料 migration。
- 匯出 / 匯入先不規劃進版本，等後續需要資料可攜性時再討論。

### Zod + React Hook Form

原因：
- 表單輸入是這個 app 的主要錯誤來源：空值、負數、非數字、極端數字。
- Zod 可以讓執行期驗證和 TypeScript type 來自同一份 schema。
- React Hook Form 適合多表單、低樣板碼。

### Recharts

原因：
- 需求只需要趨勢線、bar chart、簡單比較圖。
- Recharts 和 React 整合直接，對 MVP 足夠。
- 不需要 D3 這種較底層的圖表自由度。

### Vitest + React Testing Library + Playwright

原因：
- 計算規則要單元測試：熱量、macro 分配、週平均、週變化。
- 表單與 dashboard 要元件 / 整合測試：錯誤輸入、空狀態、超標狀態。
- 核心使用者流程要 E2E：設定目標、記餐、建立模板、輸入體重、看週回顧。

## 架構

建議目錄，放在 repo root 的 `health-track/` 子目錄底下：

```text
health-track/
  src/
    app/
      App.tsx
      router.tsx
      pwa.ts
    features/
      goals/
        GoalSetupPage.tsx
        goalSchema.ts
        goalCalculations.ts
      meals/
        MealLogPage.tsx
        mealSchema.ts
        mealCalculations.ts
        mealTemplates.ts
      dashboard/
        TodayDashboardPage.tsx
        dailySummary.ts
      weekly-review/
        WeeklyReviewPage.tsx
        weeklySummary.ts
        recommendationRules.ts
      weigh-ins/
        WeighInPage.tsx
        weightTrend.ts
    lib/
      db.ts
      dates.ts
      numbers.ts
    test/
      factories.ts
  public/
    manifest.webmanifest
    icons/
```

資料流：

```text
使用者輸入
  │
  ▼
React Hook Form
  │
  ▼
Zod schema 驗證
  │
  ├── 無效 → 表單欄位內錯誤
  │
  ▼
功能 command / helper
  │
  ▼
Dexie IndexedDB
  │
  ▼
衍生摘要函式
  │
  ├── dailySummary()
  ├── weeklySummary()
  └── recommendationRules()
  │
  ▼
Dashboard / 每週回顧 / 圖表
```

原則：計算邏輯不要埋在 React component 裡。Component 負責輸入和呈現，計算放在純函式，這樣測試容易、錯誤少。

PWA 資料流：

```text
瀏覽器載入 app
  │
  ▼
Service worker
  │
  ├── app shell 已快取 → 離線渲染 app
  └── 靜態資產未命中 → 透過網路取得
  │
  ▼
React app
  │
  ▼
Dexie IndexedDB
  │
  ├── 既有本機資料 → dashboard / 每週回顧
  └── 寫入失敗 → 顯示錯誤狀態，保留表單輸入
```

## 資料模型

```ts
type Goal = {
  id: string
  heightCm: number
  currentWeightKg: number
  targetWeightKg: number
  age: number
  sex: 'male' | 'female'
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active'
  direction: 'cut' | 'maintain' | 'gain'
  bmr: number
  tdee: number
  dailyCalories: number
  proteinGrams: number
  fatGrams: number
  carbGrams: number
  createdAt: string
  updatedAt: string
}

type Meal = {
  id: string
  name: string
  calories: number
  proteinGrams: number
  fatGrams: number
  carbGrams: number
  eatenAt: string
  createdAt: string
  templateId?: string
}

type MealTemplate = {
  id: string
  name: string
  calories: number
  proteinGrams: number
  fatGrams: number
  carbGrams: number
  lastUsedAt?: string
  createdAt: string
  updatedAt: string
}

type WeighIn = {
  id: string
  weightKg: number
  measuredAt: string
  createdAt: string
}
```

### IndexedDB tables

```text
goals:          id, updatedAt
meals:          id, eatenAt, templateId
mealTemplates:  id, lastUsedAt, updatedAt
weighIns:       id, measuredAt
```

MVP 可以只允許一個啟用中的目標。資料模型仍使用 table，是為了未來支援目標歷史，不是現在做完整多目標系統。

## 初版公式

第一版公式要簡單、可解釋、可替換。

建議：
- 使用 Mifflin-St Jeor 估算 BMR。
- 第一版目標設定多加兩個欄位：年齡、性別、活動量。只靠身高、體重、理想目標很難算出合理熱量。
- TDEE = BMR * activityFactor。
- cut: TDEE - 300 到 500 kcal，先取 -400 kcal。
- maintain: TDEE。
- gain: TDEE + 250 kcal。
- protein: 1.6g * currentWeightKg。
- fat: 25% calories。
- carbs: 剩餘熱量換算成 grams。

如果你堅持目標設定只輸入身高、體重、理想目標，那就要在 UI 明確標示「粗略估算」。工程上可以支援，但產品上比較不誠實。

## 路由

```text
/setup          目標設定
/today          今日儀表板
/meals/new      記錄一餐
/templates      常吃餐點模板
/weigh-ins      每週體重輸入
/weekly         每週回顧
```

初次使用流程：

```text
沒有啟用中的目標
  │
  ▼
/setup
  │ 儲存目標
  ▼
/today
  │ 記錄餐點
  ▼
/meals/new
  │ 儲存餐點
  ▼
/today
  │ 週末回顧
  ▼
/weekly
```

## 邊界情境

- 沒有目標時，除了 setup 以外的頁面應導向 setup 或顯示明確空狀態。
- 沒有餐點紀錄時，今日儀表板應顯示 0，而不是壞掉。
- 沒有體重紀錄時，每週回顧仍可顯示平均攝取，但體重趨勢區塊要提示輸入體重。
- macro grams 不能為負數。
- calories 不能為負數。
- 極端輸入要被擋下，例如 0 cm、999 kg、100000 calories。
- 同一天多筆餐點紀錄要正確加總。
- 週區間要固定，建議從週一到週日。
- 使用者跨時區不是 MVP 主要情境，但 date helper 要集中管理，避免到處手寫日期切割。
- 刪除模板不應刪除過去餐點紀錄，只移除 template link。
- 目標更新後，舊餐點紀錄不應被重算，只影響之後 dashboard 和每週回顧的比較基準。

## 失敗模式

| 程式路徑 | 產品環境可能失敗的方式 | 處理方式 | 測試 |
|---|---|---|---|
| goal setup | 使用者輸入不合理身高/體重 | Zod 顯示欄位內錯誤 | 單元 + 元件 |
| calorie calculation | carbs 算出負數 | clamp 或 validation 阻擋不合理 macro 分配 | 單元 |
| meal save | IndexedDB 寫入失敗 | toast / error state，保留表單輸入 | 元件 |
| daily summary | 沒有目標或沒有餐點紀錄 | 顯示空狀態，不 crash | 單元 + 元件 |
| weekly summary | 缺少體重紀錄 | 顯示「尚未輸入體重」 | 單元 + 元件 |
| template add | 模板被刪除但餐點仍引用 | 餐點保留 snapshot values，不依賴 template join | 單元 |
| chart render | 資料不足 | 顯示空狀態，不渲染誤導性圖表 | 元件 |
| PWA app shell | 使用者離線打開 app | service worker 回傳 cached app shell | E2E / 手動 |
| PWA cache update | 新版部署後仍看到舊版 | 使用 vite-plugin-pwa `autoUpdate` | E2E / 手動 |

## 測試計畫

### 程式路徑覆蓋

```text
程式路徑覆蓋
==================
[+] goalCalculations.ts
    ├── [缺口] BMR/TDEE 計算：cut / maintain / gain
    ├── [缺口] macro 分配：protein / fat / carbs
    └── [缺口] 無效數值：0、負數、極端輸入

[+] goalSchema.ts
    ├── [缺口] 有效 setup 輸入
    └── [缺口] 無效身高、體重、目標、年齡、活動量

[+] mealSchema.ts
    ├── [缺口] 有效餐點輸入
    └── [缺口] 無效 calories / macros / name / date

[+] dailySummary.ts
    ├── [缺口] 沒有餐點紀錄
    ├── [缺口] 同一天多筆餐點紀錄
    └── [缺口] 超標與未超標狀態

[+] weeklySummary.ts
    ├── [缺口] 指定週的平均攝取量
    ├── [缺口] 沒有體重紀錄
    ├── [缺口] 只有一筆體重紀錄
    └── [缺口] 週對週體重變化

[+] recommendationRules.ts
    ├── [缺口] 維持目前策略
    ├── [缺口] 稍微減少
    └── [缺口] 稍微增加

[+] PWA shell
    ├── [缺口] manifest 包含可安裝 app metadata
    ├── [缺口] service worker 在正式建置中註冊
    └── [缺口] 第一次造訪後，離線仍可載入 app
```

### 使用者流程覆蓋

```text
使用者流程覆蓋
==================
[+] 第一次 setup [→E2E]
    ├── [缺口] 使用者完成目標設定並進入 /today
    └── [缺口] 無效 setup 輸入會阻擋送出並顯示清楚訊息

[+] 記錄餐點 [→E2E]
    ├── [缺口] 使用者記錄餐點後 dashboard 更新
    ├── [缺口] 使用者將餐點儲存成模板
    └── [缺口] 使用者透過模板在 30 秒內新增餐點

[+] 每週回顧 [→E2E]
    ├── [缺口] 使用者輸入每週體重
    ├── [缺口] 每週回顧顯示攝取量 vs 目標
    └── [缺口] 每週回顧顯示體重變化方向

[+] PWA 安裝 / 離線路徑 [→E2E / 手動]
    ├── [缺口] 正式建置後符合可安裝條件
    └── [缺口] 回訪使用者離線時可以打開 cached app shell
```

規劃階段覆蓋率：0/29，因為目前尚未實作。

開始實作後需要的測試檔：
- `health-track/src/features/goals/goalCalculations.test.ts`
- `health-track/src/features/goals/goalSchema.test.ts`
- `health-track/src/features/meals/mealSchema.test.ts`
- `health-track/src/features/dashboard/dailySummary.test.ts`
- `health-track/src/features/weekly-review/weeklySummary.test.ts`
- `health-track/src/features/weekly-review/recommendationRules.test.ts`
- `health-track/src/features/*/*.test.tsx`：表單 / dashboard 空狀態與錯誤狀態
- `health-track/e2e/core-loop.spec.ts`：setup → 記餐 → 模板 → 體重紀錄 → 每週回顧
- `health-track/e2e/pwa.spec.ts` 或文件化手動 QA：可安裝性 / 離線 app shell

## 效能檢查

MVP 風險低，因為資料量小且資料在本機。

仍需設計合理限制：
- 依日期區間查詢餐點，不要永遠載入所有餐點。
- 在 IndexedDB 對 `eatenAt` 和 `measuredAt` 加索引。
- 如果 rendering 變得吵雜，再在 hook / component 邊界 memoize 衍生摘要。
- 在 prop drilling 真正成為問題前，不要加全域狀態管理。v1 的本機 Dexie 資料不需要 React Query。
- service worker 快取範圍要窄：只快取 app shell 和靜態資產。
- 不要透過 service worker 快取可變動的營養紀錄。Dexie 負責本機使用者資料。

## 實作順序

1. 建立 Vite React TypeScript app。
2. 加入 lint / test tooling：ESLint、Prettier、Vitest、React Testing Library、Playwright。
3. 加入 PWA-lite 設定：vite-plugin-pwa、`autoUpdate`、manifest、icons、app shell cache。
4. 加入 routing 和 app shell。
5. 加入 Dexie database 和 schemas。
6. 建立純計算函式並補測試。
7. 建立 goal setup 頁面。
8. 建立 today dashboard 與空狀態。
9. 建立 meal logging 和 meal templates。
10. 建立 weekly weigh-in。
11. 建立 weekly review 和 charts。
12. 加入 seeded demo data。
13. 加入核心迴路 E2E 測試。
14. 加入 PWA install/offline 驗證。
15. 部署 static PWA app。

## Worktree 平行化策略

第一個 scaffold 建議循序實作，因為 repo 目前是空的，早期步驟會共用同一個 app 結構。

scaffold 和資料模型存在後，可以拆成以下工作：

| 步驟 | 會碰到的模組 | 依賴 |
|---|---|---|
| 目標設定 | `health-track/src/features/goals`, `health-track/src/lib/db` | scaffold, db |
| 記餐 / 模板 | `health-track/src/features/meals`, `health-track/src/lib/db` | scaffold, db |
| PWA-lite | `health-track/src/app`, `health-track/public`, build config | scaffold |
| 每週回顧 | `health-track/src/features/weekly-review`, `health-track/src/features/weigh-ins`, `health-track/src/lib/db` | goals, meals, db |
| E2E 測試 | `health-track/e2e`, all routes | feature pages |

scaffold 後的平行 lane：
- Lane A：目標設定。
- Lane B：記餐 / 模板。
- Lane C：PWA-lite 設定，可在 scaffold 後、最終部署前進行。
- Lane D：每週回顧，等待 A + B。
- Lane E：E2E，等待 A + B + C + D。

## 未決工程決策

1. 目標設定應加入年齡、性別、活動量，因為只靠身高 + 體重 + 目標無法得到夠好的熱量估算。
2. MVP 使用每週體重輸入，不先做每日體重平均趨勢。每日趨勢之後會更好，但每週輸入符合你的需求，也降低摩擦。
3. MVP 使用 local-first storage。先不做 export/import，等後續需要資料可攜性時再討論。
4. 先做 mobile-first PWA-lite。Native mobile 要等你確定自己會連續使用幾週後再考慮。

## UI/UX 決策

第一版實作以 `docs/ui-ux-plan-design-review-20260408-074037.md` 作為設計依據。

關鍵實作約束：
- 底部導覽：今日 / 記錄 / 週回顧 / 設定。
- `/setup` 是專注 onboarding flow，完成 setup 前不顯示底部導覽。
- `/today` 以剩餘熱量作為主要視覺焦點。
- `/meals/new` 優先顯示常吃模板與單一主要儲存行動。
- `/weekly` 在圖表前先顯示白話洞察。
- `/settings` 必須說明 local-only IndexedDB storage 和 PWA / 離線行為。
- 使用 `Noto Sans TC`、克制的 green / teal accent、8px max radius、44px touch targets。
- 不使用 generic SaaS card grids、紫色漸層、裝飾 blobs、emoji 或 marketing copy。
- 文件溝通語言：中文為主，必要技術詞保留英文，能順暢溝通優先。

## 完整度分數

完整方案建議：6/6

- 做完整核心迴路，而不是只做快速記錄。
- 選 PWA-lite 而不是純 web page，因為每日追蹤器需要 mobile install / offline app shell。
- IndexedDB instead of localStorage.
- 執行期驗證，而不是只有 TypeScript types。
- 從第一天就做單元 + 元件 + E2E 測試。
- 明確部署路徑，不讓發佈方式保持模糊。

## 參考資料

- Vite guide：https://vite.dev/guide/
- vite-plugin-pwa docs：https://vite-pwa-org.netlify.app/
- web.dev PWA overview：https://web.dev/explore/progressive-web-apps
- React docs：https://react.dev/learn
- React Router installation：https://reactrouter.com/start/declarative/installation
- Dexie React tutorial：https://dexie.org/docs/Tutorial/React
- Zod docs：https://zod.dev/
- Recharts getting started：https://recharts.org/en-US/guide/getting-started
- Vitest guide：https://vitest.dev/guide/
- Playwright intro：https://playwright.dev/docs/intro
