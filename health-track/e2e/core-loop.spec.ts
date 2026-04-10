import { expect, test } from '@playwright/test'

test('core loop: setup, log a meal, review today', async ({ page }) => {
  await page.goto('/setup')
  await page.waitForURL('**/setup')
  await expect(page.getByRole('heading', { name: /先設定|調整你的每日目標/ })).toBeVisible()
  await page.getByRole('button', { name: '儲存目標' }).click()
  await page.waitForURL('**/today')

  await page.goto('/log')
  await page.waitForURL('**/log')
  await page.getByLabel('餐點名稱').fill('雞胸便當')
  await page.getByLabel('熱量 kcal').fill('650')
  await page.getByLabel('蛋白質 g').fill('45')
  await page.getByLabel('脂肪 g').fill('18')
  await page.getByLabel('碳水 g').fill('75')
  await page.getByLabel('存成常吃餐點').check()
  await page.getByRole('button', { name: '儲存餐點' }).click()
  await expect(page.getByText('已儲存。')).toBeVisible()

  await page.goto('/today')
  await page.waitForURL('**/today')
  await expect(page.getByRole('heading', { name: '雞胸便當' }).first()).toBeVisible()
})
