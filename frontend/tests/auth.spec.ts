import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

  test('Should register a new user successfully', async ({ page }) => {
    // Generate a random email to avoid collisions
    const randomEmail = `testuser_${Date.now()}@example.com`;

    await page.goto('/register');
    await expect(page).toHaveTitle(/CyphLab/i);

    // Fill form
    await page.getByTestId('register-name').fill('Test User');
    await page.getByTestId('register-email').fill(randomEmail);
    await page.getByTestId('register-password').fill('password123');
    await page.getByTestId('register-confirm-password').fill('password123');
    
    // Test show/hide password toggle
    const passwordInput = page.getByTestId('register-password');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await page.getByTestId('register-show-password').click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Submit
    await page.getByTestId('register-submit').click();

    // Should redirect to login upon success
    await expect(page).toHaveURL(/\/login/);
  });

  test('Should login an existing user and logout', async ({ page }) => {
    const randomEmail = `loginuser_${Date.now()}@example.com`;
    
    // Register first
    await page.goto('/register');
    await page.getByTestId('register-name').fill('Login User');
    await page.getByTestId('register-email').fill(randomEmail);
    await page.getByTestId('register-password').fill('testpass');
    await page.getByTestId('register-confirm-password').fill('testpass');
    await page.getByTestId('register-submit').click();
    await expect(page).toHaveURL(/\/login/);

    // Login Flow
    await page.getByTestId('login-email').fill(randomEmail);
    await page.getByTestId('login-password').fill('testpass');
    
    // Test show/hide
    await page.getByTestId('login-show-password').click();
    await expect(page.getByTestId('login-password')).toHaveAttribute('type', 'text');

    await page.getByTestId('login-submit').click();

    // Verify successful login (should go to member dashboard by default)
    await expect(page).toHaveURL(/\/dashboard\/member/);
    
    // Verify Header Profile
    await expect(page.getByTestId('header-user-name')).toContainText('Login User');
    await expect(page.getByTestId('header-user-role')).toContainText('TEAM MEMBER');

    // Logout
    await page.getByTestId('header-logout').click();
    await expect(page).toHaveURL(/\/$/); 
  });

  test('Should show error on invalid login', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill('nonexistent@example.com');
    await page.getByTestId('login-password').fill('wrongpassword');
    await page.getByTestId('login-submit').click();

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('Forgot and Reset Password flow UI', async ({ page }) => {
    // Forgot Password
    await page.goto('/login');
    await page.getByTestId('login-forgot-password').click();
    await expect(page).toHaveURL(/\/forgot-password/);

    await page.getByTestId('forgot-email').fill('test@example.com');
    await page.getByTestId('forgot-submit').click();

    await expect(page.getByText('Check your email')).toBeVisible();
    await expect(page.getByTestId('forgot-back-to-login')).toBeVisible();
    
    await page.goto('/reset-password?token=dummy_token');
    
    await page.getByTestId('reset-password').fill('newpassword');
    await page.getByTestId('reset-confirm-password').fill('newpassword');
    await page.getByTestId('reset-submit').click();

    await expect(page.locator('text=Invalid or expired token')).toBeVisible();
  });

});
