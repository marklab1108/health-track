import { expect, test } from '@playwright/test'

test('core loop: setup, log a meal, review today', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /先設定|今日/ })).toBeVisible()

  if (await page.getByRole('heading', { name: /先設定/ }).isVisible()) {
    await page.getByRole('button', { name: '儲存目標' }).click()
  }

  await page.getByRole('link', { name: '記錄' }).click()
  await page.getByLabel('餐點名稱').fill('雞胸便當')
  await page.getByLabel('熱量 kcal').fill('650')
  await page.getByLabel('蛋白質 g').fill('45')
  await page.getByLabel('脂肪 g').fill('18')
  await page.getByLabel('碳水 g').fill('75')
  await page.getByLabel('存成常吃餐點').check()
  await page.getByRole('button', { name: '儲存餐點' }).click()

  await page.getByRole('link', { name: '今日' }).click()
  await expect(page.getByText('雞胸便當')).toBeVisible()
})
