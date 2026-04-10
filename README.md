# Health Track

Health Track 是一個 mobile-first、local-first 的健康追蹤 web app。

核心目標：

1. 讓使用者可以快速記錄一餐
2. 在今日頁即時看到熱量與三大營養素狀態
3. 在回顧頁把飲食與體重趨勢放在一起看

目前採用：

- React + Vite + TypeScript
- IndexedDB + Dexie
- React Hook Form + Zod
- Recharts
- PWA-lite

專案 source code 放在 repo root 的 [`health-track/`](./health-track) 子目錄。

## 專案結構

```text
.
├─ health-track/   # app source code
├─ docs/           # requirement / design / roadmap / backlog / architecture docs
└─ README.md
```

## 本機開發

先進入 app 目錄：

```sh
cd health-track
```

安裝依賴：

```sh
npm install
```

啟動開發環境：

```sh
npm run dev
```

如果你的 shell 預設 Node 不是 v24，先把 PATH 指到 v24 再執行上述指令。

## 測試與建置

單元測試：

```sh
npm test
```

E2E：

```sh
npm run e2e
```

production build：

```sh
npm run build
```

## Demo Data

本機啟動後，可以到 app 的 `設定` 頁：

- `載入 demo data`
- `清空本機資料`

這樣可以快速測試：

- 今日頁
- 快速記餐
- 常吃餐點排序
- 週回顧 / 月比較 / 四週體重圖

## 部署

目前建議部署到 Vercel。

如果 Vercel 專案不是直接指到 `health-track/` 子目錄，建議使用：

- Install Command:
  ```sh
  cd health-track && npm install
  ```
- Build Command:
  ```sh
  cd health-track && npm run build
  ```
- Output Directory:
  ```sh
  health-track/dist
  ```

Node.js version 建議固定 `24.x`。

## 文件導覽

- [需求文件](./docs/requirement.md)
- [設計基準](./docs/DESIGN.md)
- [UI/UX 調整清單](./docs/design-adjustment-notes-20260410.md)
- [後續 Phase Roadmap](./docs/future-phases-roadmap-20260410.md)
- [Product Backlog](./docs/product-backlog-20260410.md)
- [專案架構與技術選型](./docs/project-architecture-tech-stack-20260410.md)

## 目前狀態

目前已完成的核心能力：

- 個人化目標設定
- 今日儀表板
- 快速記餐
- 常吃餐點模板與排序
- 體重輸入
- 月比較與近四週體重圖
- Demo data
- PWA-lite 基礎

目前文件已收斂成 requirement、design、roadmap、backlog、architecture 幾份主文件；後續調整以 `docs/DESIGN.md` 為最高 UI 基準。
