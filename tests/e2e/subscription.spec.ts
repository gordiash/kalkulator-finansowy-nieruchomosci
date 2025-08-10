// @ts-nocheck

import { test, expect } from '@playwright/test';

test('user can view subscription dashboard', async ({ page }) => {
  // Zakładamy, że istnieje użytkownik testowy i helper login route /login-test
  await page.goto('/login'); // dostosuj do własnego flow logowania
  // ... logowanie ...
  await page.goto('/dashboard/subscription');
  await expect(page.getByText('Subskrypcja')).toBeVisible();
}); 