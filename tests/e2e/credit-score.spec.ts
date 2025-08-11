// @ts-nocheck
import { test, expect } from '@playwright/test'

test.describe('Kalkulator zdolności kredytowej', () => {
  test('oblicza zdolność i pokazuje wyniki', async ({ page }) => {
    // Ustal URL bazowy; Playwright zwykle korzysta z BASE_URL; fallback to localhost:3000
    const base = process.env.BASE_URL || 'http://localhost:3000'
    await page.goto(`${base}/kalkulator-zdolnosci-kredytowej`)

    // Wypełnij podstawowe pola
    await page.getByLabel('Miesięczny dochód netto - główny kredytobiorca (zł)').fill('6000')
    await page.getByLabel('Miesięczny dochód netto - drugi kredytobiorca (zł)').fill('4000')
    await page.getByLabel('Miesięczne stałe opłaty (zł)').fill('1000')
    await page.getByLabel('Raty innych kredytów (zł)').fill('0')
    await page.getByLabel('Suma limitów na kartach kredytowych (zł)').fill('10000')
    await page.getByLabel('Suma limitów w koncie - debet (zł)').fill('0')
    await page.getByLabel('Liczba osób w gospodarstwie domowym').fill('1')
    await page.getByLabel('Wiek głównego kredytobiorcy (lata)').fill('30')

    // Upewnij się, że przycisk jest aktywny i kliknij
    const btn = page.getByRole('button', { name: 'Oblicz zdolność kredytową' })
    await expect(btn).toBeEnabled()
    await btn.click()

    // Oczekuj na pojawienie się wyników
    await expect(page.getByText('Twoja szacunkowa zdolność kredytowa')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Maksymalna miesięczna rata:')).toBeVisible()
    await expect(page.getByText('Maksymalna kwota kredytu:')).toBeVisible()
  })
})


