import { expect, test } from '@playwright/test'

test('manifest is available', async ({ page }) => {
  const response = await page.goto('/manifest.webmanifest')
  expect(response?.ok()).toBe(true)
  await expect(page.locator('body')).toContainText('Health Track')
})
