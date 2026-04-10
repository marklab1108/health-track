# 專案架構與技術選型：Health Track

這份文件描述目前 `Health Track` 專案的實際架構、技術選型，以及之後擴充時應遵守的原則。

## 1. 專案定位

`Health Track` 是一個 mobile-first 的健康追蹤 web app，核心目標是：

1. 讓使用者能快速記錄飲食
2. 在今日頁即時看到熱量與三大營養素狀態
3. 在回顧頁把飲食與體重趨勢放在一起看

目前採用：

- local-first
- PWA-lite
- static frontend deployment

也就是說，第一版先不依賴後端 API，就能完成主要使用流程。

---

## 2. 技術選型

### 前端框架

- `React`
- `React Router`

原因：
- 單頁應用足夠支撐目前需求
- 頁面結構清楚：`/setup`、`/today`、`/log`、`/weekly`、`/settings`
- 可用 route-level lazy loading 控制初始 bundle

### Build Tool

- `Vite`
- `TypeScript`

原因：
- 啟動快、設定輕
- 適合 side project 與靜態部署
- TypeScript 有助於保護資料模型、表單驗證與計算函式

目前實際相容組合：
- `vite: ^7.3.2`
- `@vitejs/plugin-react: ^5.1.0`

備註：
- 其他套件多數採 `latest`
- `vite-plugin-pwa` 與 `vite@8` 目前不相容，所以 Vite 先固定在 7.x

### 資料儲存

- `IndexedDB`
- `Dexie`

原因：
- 飲食紀錄與體重資料會持續累積
- local-first 比 `localStorage` 更適合結構化資料
- Dexie 讓 table、index、transaction 比較好維護

目前資料表：
- `goals`
- `meals`
- `mealTemplates`
- `weighIns`

### 表單與驗證

- `React Hook Form`
- `Zod`

原因：
- 目標設定、餐點輸入、體重輸入都屬於結構化表單
- 需要欄位驗證、型別一致性與清楚錯誤訊息

### 圖表

- `Recharts`

原因：
- 足夠支撐目前的 bar chart 與 line chart
- 對 React 整合簡單
- 不需要引入 D3 等更底層工具

### 日期處理

- `date-fns`

原因：
- 專案大量依賴日 / 週 / 月邊界計算
- 需要處理：
  - 今日區間
  - 本週 / 上週
  - 本月 / 上月
  - 近四週趨勢

### PWA

- `vite-plugin-pwa`
- `manifest.webmanifest`
- service worker app shell cache

原因：
- 第一版要支援加入主畫面
- 第一版要支援離線開啟 app shell
- 部署仍保持 static hosting

目前策略：
- `autoUpdate`
- app shell 與靜態資產 cache
- 不做 background sync
- 不做跨裝置同步

### 測試

- `Vitest`
- `React Testing Library`
- `Playwright`

原因：
- 單元測試保護計算規則
- E2E 保護核心流程：
  - 設定目標
  - 記一餐
  - 查看今日
  - 驗證 manifest / PWA 基礎

---

## 3. 專案目錄結構

目前 app code 放在 repo root 的 `health-track/` 子目錄。

```text
health-track/
  package.json
  vite.config.ts
  vitest.config.ts
  playwright.config.ts
  index.html
  public/
    manifest.webmanifest
    icons/
  src/
    app/
      App.tsx
      pwa.ts
    features/
      goals/
      meals/
      dashboard/
      weekly-review/
      weigh-ins/
      settings/
      shared/
    lib/
      db.ts
      dates.ts
      demoData.ts
      numbers.ts
      types.ts
    test/
      setup.ts
    main.tsx
    styles.css
  e2e/
    core-loop.spec.ts
    pwa.spec.ts
```

---

## 4. 架構分層

### `src/app`

負責 app shell、route、lazy loading、底部導覽。

這層不應該放業務計算。

### `src/features`

依功能切分頁面與邏輯：

- `goals`: 目標設定
- `meals`: 餐點輸入與模板
- `dashboard`: 今日摘要
- `weekly-review`: 回顧與圖表
- `weigh-ins`: 體重輸入
- `settings`: 設定與 demo data 操作
- `shared`: 共用 form / async helpers

原則：
- UI、表單、功能邏輯放在對應 feature
- 不做以技術類型為主的切法，例如全部 pages 放一起、全部 hooks 放一起

### `src/lib`

放跨 feature 共用的核心能力：

- `db.ts`: IndexedDB schema 與資料操作
- `dates.ts`: 日期區間工具
- `numbers.ts`: 數字格式化與簡單計算
- `demoData.ts`: seed data
- `types.ts`: domain types

原則：
- `lib` 只放真正通用的能力
- 不要把 feature-specific business logic 全丟進 `lib`

---

## 5. 資料流

目前主要資料流如下：

```text
UI Form
  -> React Hook Form
  -> Zod schema 驗證
  -> feature helper / calculation
  -> Dexie / IndexedDB
  -> summary function
  -> UI render
```

這裡最重要的約束是：

> 計算邏輯不埋在 component render 裡。

像這些應該維持在純函式：
- 目標熱量與三大營養素計算
- 每日摘要
- 週 / 月比較
- 四週體重趨勢
- 回顧提示規則

---

## 6. 目前實作的核心功能模組

### 目標設定

負責：
- 身高、體重、年齡、性別、活動量、目標方向
- 每日熱量與 macro 建議值

關鍵檔案：
- `src/features/goals/GoalSetupPage.tsx`
- `src/features/goals/goalSchema.ts`
- `src/features/goals/goalCalculations.ts`

### 今日頁

負責：
- 今日攝取摘要
- macro progress
- 餐點列表
- 餐點修改 / 刪除

關鍵檔案：
- `src/features/dashboard/TodayDashboardPage.tsx`
- `src/features/dashboard/dailySummary.ts`

### 記餐

負責：
- 新增餐點
- 常吃模板
- 套用模板

關鍵檔案：
- `src/features/meals/MealLogPage.tsx`
- `src/features/meals/mealSchema.ts`
- `src/features/meals/mealCalculations.ts`

### 週回顧

負責：
- 平均攝取 vs 建議量
- 月體重比較
- 近四週體重變化圖
- 每週 insight

關鍵檔案：
- `src/features/weekly-review/WeeklyReviewPage.tsx`
- `src/features/weekly-review/weeklySummary.ts`
- `src/features/weekly-review/recommendationRules.ts`

### 設定

負責：
- 目標重新設定入口
- 載入 demo data
- 清空本機資料

關鍵檔案：
- `src/features/settings/SettingsPage.tsx`
- `src/lib/demoData.ts`

---

## 7. 部署架構

目前部署方式是：

- Static frontend
- Vercel / Netlify
- build output 在 `health-track/dist`

Vercel 建議設定：

- Framework Preset: `Other` 或 `Vite`
- Install Command: `cd health-track && npm install`
- Build Command: `cd health-track && npm run build`
- Output Directory: `health-track/dist`
- Node.js Version: `24.x`

---

## 8. 為什麼目前不選這些技術

### 不用 Next.js

原因：
- 目前沒有 SSR 需求
- 沒有後端 rendering 需求
- local-first app 的核心在瀏覽器端資料與互動

### 不用後端 API / DB

原因：
- 第一版先驗證使用價值
- 目前同步與帳號不是第一瓶頸

### 不用大型食物資料庫

原因：
- 資料維護成本高
- 會偏離核心價值

### 不用原生 mobile

原因：
- PWA-lite 已足夠支撐第一版
- 可先降低部署與維護成本

---

## 9. 後續擴充原則

之後新增功能時，建議遵守這些原則：

1. 先補回饋迴路，不先補大而全資料庫
2. 先補資料可攜性，再補同步
3. 先補規則式建議，再補 AI 輸入
4. 先維持 local-first 清晰性，再決定何時引入後端
5. 讓 feature 自己擁有自己的 page + schema + calculations

---

## 10. 一句話總結

目前這個專案的技術選型，本質上是：

> 用 React + Vite + IndexedDB + PWA-lite，做一個 local-first、mobile-first、可快速迭代的健康追蹤 app。

這個架構對現在的 phase 是合理的，也保留了未來往 `adaptive coach`、資料可攜性與同步演進的空間。
