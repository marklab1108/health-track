import { expect, test } from '@playwright/test'

test('demo data flow: load seeded data and review weekly summary', async ({ page }) => {
  await page.goto('/settings')

  if (await page.getByRole('button', { name: '清空本機資料' }).isVisible()) {
    await page.getByRole('button', { name: '清空本機資料' }).click()
  }

  await page.getByRole('button', { name: '載入 demo data' }).click()
  await expect(page.getByText('已載入 demo data')).toBeVisible()

  await page.getByRole('link', { name: '週回顧' }).click()
  await expect(page.getByRole('heading', { name: /平均 .* kcal \/ day/ })).toBeVisible()
  await expect(page.getByText('完整度')).toBeVisible()
  await expect(page.getByText('依目前目標計算')).toBeVisible()

  await page.getByRole('link', { name: '今日' }).click()
  await expect(page.getByRole('button', { name: '複製昨天' })).toBeVisible()
  await page.getByRole('button', { name: '複製昨天' }).click()
  await expect(page.getByText('已複製昨天的')).toBeVisible()
})
