# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: map-test.spec.js >> Check Map Loaded
- Location: tests/map-test.spec.js:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.leaflet-container')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('.leaflet-container')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - link "← Back to Map" [ref=e5] [cursor=pointer]:
      - /url: /
    - generic [ref=e6]:
      - img "FixConnect Logo" [ref=e8]
      - generic [ref=e9]: My Bookings
  - main [ref=e10]:
    - paragraph [ref=e12]: No bookings yet.
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  |
  3  | test('Check Map Loaded', async ({ page }) => {
  4  |   test.setTimeout(180000);
  5  |
  6  |   await page.goto('/register');
  7  |   const timestamp = Date.now();
  8  |   await page.getByRole('textbox', { name: 'First name' }).fill('Test');
  9  |   await page.getByRole('textbox', { name: 'Last name' }).fill('User');
  10 |   await page.getByRole('textbox', { name: 'Email' }).fill(`maptest${timestamp}@example.com`);
  11 |   await page.getByRole('textbox', { name: 'Password' }).first().fill('Password123!');
  12 |   await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Password123!');
  13 |
  14 |   const responsePromise = page.waitForResponse(response => response.url().includes('/api/auth/register') && response.request().method() === 'POST');
  15 |   await page.getByRole('button', { name: 'Sign Up' }).click();
  16 |   const response = await responsePromise;
  17 |   const registerText = await response.text();
  18 |
  19 |   await page.waitForTimeout(2000);
  20 |
  21 |   const regData = JSON.parse(registerText);
  22 |   await page.evaluate((data) => {
  23 |       localStorage.setItem('token', data.token);
  24 |       localStorage.setItem('userId', data._id);
  25 |   }, regData);
  26 |
  27 |   await page.goto('/dashboard');
  28 |   await page.waitForTimeout(2000);
  29 |
  30 |   const bookBtn = page.getByRole('button', { name: /book a service/i }).first();
  31 |   if (await bookBtn.isVisible()) await bookBtn.click();
  32 |   await page.waitForTimeout(1000);
  33 |
  34 |   const categorySelect = page.getByRole('combobox');
  35 |   if(await categorySelect.isVisible()) await categorySelect.selectOption({ index: 1 });
  36 |
  37 |   const dateInput = page.getByRole('textbox', { name: 'Date' });
  38 |   if (await dateInput.isVisible()) {
  39 |       const tomorrow = new Date();
  40 |       tomorrow.setDate(tomorrow.getDate() + 1);
  41 |       await dateInput.fill(tomorrow.toISOString().split('T')[0]);
  42 |   }
  43 |
  44 |   const timeInput = page.getByRole('textbox', { name: 'Start Time' });
  45 |   if (await timeInput.isVisible()) await timeInput.fill('10:00');
  46 |
  47 |   const addressInput = page.getByRole('textbox', { name: /search pickup location/i });
  48 |   if (await addressInput.isVisible()) {
  49 |       await addressInput.fill('Manila City Hall');
  50 |       await page.waitForTimeout(3000);
  51 |       const suggestion = page.locator('div.p-3.text-sm.hover\\:bg-muted').first();
  52 |       await suggestion.click();
  53 |       await page.waitForTimeout(1000);
  54 |   }
  55 |
  56 |   let bookingId;
  57 |   const confirmBookingBtn = page.getByRole('button', { name: /confirm booking/i }).first();
  58 |   if (await confirmBookingBtn.isVisible()) {
  59 |      // Don't wait for POST response because some frontends do an optimistic update or redirect immediately
  60 |      // which cancels the request in playwright if not careful
  61 |      await confirmBookingBtn.click();
  62 |   }
  63 |
  64 |   // Wait a few seconds for bot to accept
  65 |   await page.waitForTimeout(5000);
  66 |
  67 |   await page.goto('/bookings');
  68 |   await page.waitForTimeout(2000);
  69 |
  70 |   const firstBooking = page.locator('a[href^="/booking/"]').first();
  71 |   if (await firstBooking.isVisible()) {
  72 |       await firstBooking.click();
  73 |   } else {
  74 |       console.log("Could not find any booking in the list.");
  75 |   }
  76 |
  77 |   // Wait a bit to ensure map renders
  78 |   await page.waitForTimeout(5000);
  79 |
  80 |   console.log("Current URL:", page.url());
  81 |
  82 |   // Check for leaflet container
> 83 |   await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });
     |                                                    ^ Error: expect(locator).toBeVisible() failed
  84 |
  85 |   await page.screenshot({ path: 'map_test.png', fullPage: true });
  86 | });
  87 |
```