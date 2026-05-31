import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        # Login as Admin
        print("Navigating to app...")
        await page.goto("http://localhost:5173")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="auth_1.png")

        try:
            print("Clicking Get Started / Login...")
            await page.click("text='Log In'")
            await page.wait_for_timeout(2000)
            await page.screenshot(path="auth_2.png")

            await page.fill("input[type='email']", "admin@fixconnect.com")
            await page.fill("input[type='password']", "admin123")
            await page.click("button:has-text('Sign In')")

            print("Waiting for dashboard to load...")
            await page.wait_for_selector("text=Control Center", timeout=10000)

            print("Taking screenshot of Admin Dashboard Overview...")
            await page.screenshot(path="admin_overview.png")

            print("Clicking on Moderate Users tab...")
            await page.click("button:has-text('Moderate Users')")
            await page.wait_for_timeout(1000)
            await page.screenshot(path="admin_moderate_users.png")

            print("Clicking on System tab...")
            await page.click("button:has-text('System')")
            await page.wait_for_timeout(1000)
            await page.screenshot(path="admin_system.png")

            print("Clicking on Disputes tab...")
            await page.click("button:has-text('Disputes')")
            await page.wait_for_timeout(1000)
            await page.screenshot(path="admin_disputes.png")
        except Exception as e:
            print("Error occurred:", e)
            await page.screenshot(path="error.png")

        print("Test completed.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
