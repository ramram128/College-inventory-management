const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for EmailJS API calls
  page.on('response', response => {
    if (response.url().includes('api.emailjs.com/api/v1.0/email/send')) {
      console.log(`[EmailJS Network Response] Status: ${response.status()}`);
    }
  });

  try {
    console.log("Navigating to login...");
    await page.goto('http://localhost:5174/');
    
    // Login as admin
    await page.locator('button:has-text("Researcher Login")').click();
    await page.getByPlaceholder('john@university.edu').fill('clginventorymanagement@gmail.com');
    await page.getByPlaceholder('••••••••').fill('password1234@mce');
    await page.getByRole('button', { name: 'Sign In' }).click();

    console.log("Waiting for dashboard...");
    await page.waitForTimeout(3000); // Wait for auth state

    console.log("Clicking on bookings section...");
    // The "View All Bookings" button on the dashboard or the side nav
    await page.getByText('View All Bookings').click();
    await page.waitForTimeout(1000);

    console.log("Looking for an Approve button...");
    const approveBtn = page.locator('button:has-text("Approve")').first();
    const isApproveVisible = await approveBtn.isVisible();
    
    if (isApproveVisible) {
      console.log("Clicking Approve...");
      await approveBtn.click();
      await page.waitForTimeout(1000);
      
      console.log("Confirming Approval...");
      await page.getByRole('button', { name: 'Confirm Approved' }).click();
      console.log("Approval confirmed. Waiting for network...");
      await page.waitForTimeout(2000);
    } else {
      console.log("No pending bookings found to approve.");
    }

    console.log("Looking for a Reject button...");
    const rejectBtn = page.locator('button:has-text("Reject")').first();
    const isRejectVisible = await rejectBtn.isVisible();

    if (isRejectVisible) {
      console.log("Clicking Reject...");
      await rejectBtn.click();
      await page.waitForTimeout(1000);
      
      console.log("Confirming Rejection...");
      await page.getByRole('button', { name: 'Confirm Rejected' }).click();
      console.log("Rejection confirmed. Waiting for network...");
      await page.waitForTimeout(2000);
    } else {
      console.log("No pending bookings found to reject.");
    }

  } catch (err) {
    console.error("Test error:", err);
  } finally {
    console.log("Closing browser.");
    await browser.close();
  }
})();
