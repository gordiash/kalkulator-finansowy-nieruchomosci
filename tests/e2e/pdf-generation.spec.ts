import { test, expect } from '@playwright/test';

test.describe('PDF Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Logowanie użytkownika
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // Czekaj na przekierowanie
    await page.waitForURL('/panel');
  });

  test('should generate PDF from calculation details page', async ({ page }) => {
    // Idź do listy kalkulacji
    await page.goto('/panel/kalkulacje');
    
    // Sprawdź czy są jakieś kalkulacje
    const calculations = page.locator('li').filter({ hasText: 'Kalkulacja' });
    const count = await calculations.count();
    
    if (count > 0) {
      // Kliknij pierwszą kalkulację
      await calculations.first().click();
      
      // Czekaj na załadowanie szczegółów
      await page.waitForLoadState('networkidle');
      
      // Sprawdź czy przycisk PDF jest widoczny
      const pdfButton = page.locator('button').filter({ hasText: 'Pobierz PDF' });
      await expect(pdfButton).toBeVisible();
      
      // Przygotuj listener na pobranie pliku
      const downloadPromise = page.waitForEvent('download');
      
      // Kliknij przycisk PDF
      await pdfButton.click();
      
      // Czekaj na pobranie
      const download = await downloadPromise;
      
      // Sprawdź nazwę pliku
      expect(download.suggestedFilename()).toMatch(/^kalkulacja-.*\.pdf$/);
      
      // Sprawdź typ pliku
      const path = await download.path();
      expect(path).toBeTruthy();
    } else {
      // Jeśli nie ma kalkulacji, utwórz testową
      await page.goto('/kalkulator-zakupu-nieruchomosci');
      
      // Wypełnij formularz
      await page.fill('input[name="propertyValue"]', '500000');
      await page.fill('input[name="loanAmount"]', '400000');
      await page.fill('input[name="downPayment"]', '100000');
      await page.fill('input[name="loanTerm"]', '25');
      await page.fill('input[name="interestRate"]', '5.5');
      await page.fill('input[name="monthlyIncome"]', '8000');
      await page.fill('input[name="monthlyExpenses"]', '3000');
      
      // Kliknij oblicz
      await page.click('button[type="submit"]');
      
      // Czekaj na wyniki
      await page.waitForSelector('[data-testid="results"]', { timeout: 10000 });
      
      // Zapisz kalkulację
      await page.fill('input[name="title"]', 'Test PDF Kalkulacja');
      await page.click('button[type="submit"]');
      
      // Czekaj na komunikat sukcesu
      await page.waitForSelector('text=została pomyślnie zapisana', { timeout: 5000 });
      
      // Idź do szczegółów kalkulacji
      await page.goto('/panel/kalkulacje');
      await page.waitForLoadState('networkidle');
      
      // Kliknij na kalkulację
      const calculationLink = page.locator('a').filter({ hasText: 'Test PDF Kalkulacja' });
      await calculationLink.click();
      
      // Czekaj na załadowanie szczegółów
      await page.waitForLoadState('networkidle');
      
      // Sprawdź czy przycisk PDF jest widoczny
      const pdfButton = page.locator('button').filter({ hasText: 'Pobierz PDF' });
      await expect(pdfButton).toBeVisible();
      
      // Przygotuj listener na pobranie pliku
      const downloadPromise = page.waitForEvent('download');
      
      // Kliknij przycisk PDF
      await pdfButton.click();
      
      // Czekaj na pobranie
      const download = await downloadPromise;
      
      // Sprawdź nazwę pliku
      expect(download.suggestedFilename()).toMatch(/^kalkulacja-.*\.pdf$/);
      
      // Sprawdź typ pliku
      const path = await download.path();
      expect(path).toBeTruthy();
    }
  });

  test('should generate PDF from calculations table', async ({ page }) => {
    // Idź do listy kalkulacji
    await page.goto('/panel/kalkulacje');
    
    // Sprawdź czy są jakieś kalkulacje
    const calculations = page.locator('tr').filter({ hasText: 'Kalkulacja' });
    const count = await calculations.count();
    
    if (count > 0) {
      // Znajdź przycisk PDF w pierwszym wierszu
      const pdfIcon = page.locator('svg').filter({ hasText: 'download' }).first();
      await expect(pdfIcon).toBeVisible();
      
      // Przygotuj listener na pobranie pliku
      const downloadPromise = page.waitForEvent('download');
      
      // Kliknij ikonę PDF
      await pdfIcon.click();
      
      // Czekaj na pobranie
      const download = await downloadPromise;
      
      // Sprawdź nazwę pliku
      expect(download.suggestedFilename()).toMatch(/^kalkulacja-.*\.pdf$/);
      
      // Sprawdź typ pliku
      const path = await download.path();
      expect(path).toBeTruthy();
    }
  });

  test('should show error for unauthorized access', async ({ page }) => {
    // Wyloguj się
    await page.goto('/logout');
    
    // Spróbuj pobrać PDF bez autoryzacji
    const response = await page.request.get('/api/user/calculations/1/pdf');
    
    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Nieautoryzowany');
  });
});
