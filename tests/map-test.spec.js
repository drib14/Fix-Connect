const { test, expect } = require('@playwright/test');

test('Check Map Loaded', async ({ page }) => {
  test.setTimeout(180000);

  await page.goto('/register');
  const timestamp = Date.now();
  await page.getByRole('textbox', { name: 'First name' }).fill('Test');
  await page.getByRole('textbox', { name: 'Last name' }).fill('User');
  await page.getByRole('textbox', { name: 'Email' }).fill(`maptest${timestamp}@example.com`);
  await page.getByRole('textbox', { name: 'Password' }).first().fill('Password123!');
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Password123!');

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/auth/register') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  const response = await responsePromise;
  const registerText = await response.text();

  await page.waitForTimeout(2000);

  const regData = JSON.parse(registerText);
  await page.evaluate((data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data._id);
  }, regData);

  await page.goto('/dashboard');
  await page.waitForTimeout(2000);

  const bookBtn = page.getByRole('button', { name: /book a service/i }).first();
  if (await bookBtn.isVisible()) await bookBtn.click();
  await page.waitForTimeout(1000);

  const categorySelect = page.getByRole('combobox');
  if(await categorySelect.isVisible()) await categorySelect.selectOption({ index: 1 });

  const dateInput = page.getByRole('textbox', { name: 'Date' });
  if (await dateInput.isVisible()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await dateInput.fill(tomorrow.toISOString().split('T')[0]);
  }

  const timeInput = page.getByRole('textbox', { name: 'Start Time' });
  if (await timeInput.isVisible()) await timeInput.fill('10:00');

  const addressInput = page.getByRole('textbox', { name: /search pickup location/i });
  if (await addressInput.isVisible()) {
      await addressInput.fill('Manila City Hall');
      await page.waitForTimeout(3000);
      const suggestion = page.locator('div.p-3.text-sm.hover\\:bg-muted').first();
      await suggestion.click();
      await page.waitForTimeout(1000);
  }

  let bookingId;
  const confirmBookingBtn = page.getByRole('button', { name: /confirm booking/i }).first();
  if (await confirmBookingBtn.isVisible()) {
     // Don't wait for POST response because some frontends do an optimistic update or redirect immediately
     // which cancels the request in playwright if not careful
     await confirmBookingBtn.click();
  }

  // Wait a few seconds for bot to accept
  await page.waitForTimeout(5000);

  await page.goto('/bookings');
  await page.waitForTimeout(2000);

  const firstBooking = page.locator('a[href^="/booking/"]').first();
  if (await firstBooking.isVisible()) {
      await firstBooking.click();
  } else {
      console.log("Could not find any booking in the list.");
  }

  // Wait a bit to ensure map renders
  await page.waitForTimeout(5000);

  console.log("Current URL:", page.url());

  // Check for leaflet container
  await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });

  await page.screenshot({ path: 'map_test.png', fullPage: true });
});
