const { chromium, expect } = require('playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:5173/register');
  const timestamp = Date.now();
  await page.getByRole('textbox', { name: 'First name' }).fill('Test');
  await page.getByRole('textbox', { name: 'Last name' }).fill('User');
  await page.getByRole('textbox', { name: 'Email' }).fill(`maptest${timestamp}@example.com`);
  await page.getByRole('textbox', { name: 'Password' }).first().fill('Password123!');
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Password123!');

  await page.getByRole('button', { name: 'Sign Up' }).click();

  await page.waitForURL(/.*\/(dashboard|)$/, { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Directly call the API from browser context to bypass UI form flakiness
  const bookingId = await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      const payload = {
          serviceCategory: 'Carpentry',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          startTime: '10:00',
          address: 'Manila City Hall',
          lat: 14.5892957,
          lng: 120.9816411,
          paymentMethod: 'Cash'
      };

      const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log(data);
      return data.data?._id;
  });

  console.log("Created API Booking:", bookingId);

  if(bookingId) {
      await page.goto(`http://localhost:5173/booking/${bookingId}`);
      await expect(page.locator('.leaflet-container')).toBeAttached({ timeout: 15000 });

      // Give the map and bot simulation a few seconds to kick in and draw routes
      await page.waitForTimeout(10000);
      await page.screenshot({ path: 'map_test_verified.png', fullPage: true });
      console.log('Screenshot taken!');
  }

  await browser.close();
})();
