import { test, expect } from '@playwright/test';

test.describe('Operator Journey', () => {

    test('Solo Pilot Registration and Bidding', async ({ page }) => {
        console.log("Starting Solo Pilot Test - Version 2");
        const uniqueId = Date.now();
        const email = `pilot.${uniqueId}@dronehub.test`;
        const password = 'password123';

        // 1. Register
        await page.goto('/register/operator');

        // Fill fields using name attributes for robustness
        await page.locator('input[name="name"]').fill(`Test Pilot ${uniqueId}`);
        await page.locator('input[name="email"]').fill(email);
        await page.locator('input[name="password"]').fill(password);

        // Select Specialties
        await page.getByLabel('Aerial Photography').check();
        await page.getByLabel('Industrial/Thermal').check();

        await page.locator('input[name="radius"]').fill('100');

        await page.getByRole('button', { name: 'Initiate Onboarding' }).click();

        // Wait for success page and click Login Now
        await expect(page).toHaveURL(/.*\/register\/success/, { timeout: 10000 });
        await page.getByRole('button', { name: 'Login Now' }).click();

        // 2. Login
        await page.locator('input[name="email"]').fill(email);
        await page.locator('input[name="password"]').fill(password);
        await page.getByRole('button', { name: 'Authorize Entry' }).click();

        try {
            await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
        } catch (e) {
            console.log("Redirect failed. Checking for errors...");
            throw e;
        }

        // 3. Verify Dashboard Identity
        await expect(page.getByText('Independent Pilot')).toBeVisible();
        await expect(page.getByText('Pilot Rank')).toBeVisible();

        // 4. Browse Missions
        await page.getByRole('link', { name: 'Browse All' }).click();
        await expect(page).toHaveURL(/.*\/jobs/);

        // 5. Select a Mission (First one)
        await page.getByRole('button', { name: /View Details/i }).first().click();

        // 6. Submit Proposal
        // Using loose text matching or placeholders if names unavailable in proposal form (not checked yet)
        await page.locator('input[name="amount"]').fill('450');
        await page.locator('input[name="deliveryTime"]').fill('2 days');
        await page.locator('textarea[name="coverLetter"]').fill('Ready to fly. Certified and insured.');

        await page.getByRole('button', { name: 'Authorize Bid Submission' }).click();
    });

    test('Company Registration Verification', async ({ page }) => {
        const uniqueId = Date.now();
        const email = `company.${uniqueId}@dronehub.test`;
        const password = 'password123';

        // 1. Register
        await page.goto('/register/operator');

        // Toggle Company
        await page.getByText('Service Co.').click();

        // Fill Company Fields
        await page.locator('input[name="companyName"]').fill(`DroneCorp ${uniqueId}`);
        await page.locator('input[name="name"]').fill(`Commander ${uniqueId}`); // Lead Pilot Name matches 'name' field
        await page.locator('input[name="email"]').fill(email);
        await page.locator('input[name="password"]').fill(password);

        await page.locator('input[name="fleetSize"]').fill('5');

        // Specialties
        await page.getByLabel('Industrial/Thermal').check();
        await page.getByLabel('Search & Rescue').check();

        await page.getByRole('button', { name: 'Initiate Onboarding' }).click();

        // Wait for success page and click Login Now
        await expect(page).toHaveURL(/.*\/register\/success/, { timeout: 15000 });
        await page.getByRole('button', { name: 'Login Now' }).click();

        // Login
        await page.locator('input[name="email"]').fill(email);
        await page.locator('input[name="password"]').fill(password);
        await page.getByRole('button', { name: 'Authorize Entry' }).click();

        // 2. Verify Dashboard
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

        // 3. Verify Company Identity
        await expect(page.getByRole('heading', { level: 1 })).toContainText(`DroneCorp ${uniqueId}`);
        await expect(page.getByText('Licensed Carrier')).toBeVisible();
        await expect(page.getByText('Fleet Size')).toBeVisible();
        await expect(page.getByText('5', { exact: true })).toBeVisible(); // Stat value
    });

});
