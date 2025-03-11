import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { createPopulatedUserAccount } from '~/features/user-accounts/user-accounts-factories.server';
import {
  deleteUserAccountFromDatabaseById,
  saveUserAccountToDatabase,
} from '~/features/user-accounts/user-accounts-model';

import { getPath, loginByCookie } from '../../utils';

const path = '/login';

test.describe('login page', () => {
  test('given: a logged in user, should: redirect to the organizations page', async ({
    page,
  }) => {
    await loginByCookie({ page });

    await page.goto(path);

    expect(getPath(page)).toEqual('/organizations');
  });

  test('given: a logged out user, should: have the correct title and show the link to the register page', async ({
    page,
  }) => {
    await page.goto(path);

    // The page title is correct.
    await expect(page).toHaveTitle(/login/i);

    // The register button has the correct link.
    await expect(page.getByRole('link', { name: /sign up/i })).toHaveAttribute(
      'href',
      '/register',
    );
  });

  test.describe('email login', () => {
    test('given: a logged out user entering invalid data, should: show the correct error messages', async ({
      page,
    }) => {
      await page.goto(path);

      // Invalid email.
      const loginButton = page.getByRole('button', { name: /login/i });
      const emailInput = page.getByLabel(/email/i);
      await emailInput.fill('invalid@email');
      await loginButton.click();
      await expect(
        page.getByText(/a valid email consists of characters, '@' and '.'./i),
      ).toBeVisible();

      // User does not exist.
      await emailInput.fill(createPopulatedUserAccount().email);
      await loginButton.click();
      await expect(
        page.getByText(
          /user with given email doesn't exist. did you mean to create a new account instead?/i,
        ),
      ).toBeVisible();
    });

    test('given: a logged out user with an existing account, should: log the user in', async ({
      page,
    }) => {
      const userAccount = createPopulatedUserAccount();
      await saveUserAccountToDatabase(userAccount);

      await page.goto(path);

      // Fill in the email and click the login button.
      const loginButton = page.getByRole('button', { name: /login/i });
      const emailInput = page.getByLabel(/email/i);
      await emailInput.fill(userAccount.email);
      await loginButton.click();

      // Check that the magic link verification form is shown. The button
      // should be disabled because you can only request a new link every 60
      // seconds.
      await expect(page.getByText(/check your email/i)).toBeVisible();
      await expect(
        page.getByText(
          /if you haven't received the email within 60 seconds, you may request another link./i,
        ),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /request new login link/i }),
      ).toBeDisabled();

      await deleteUserAccountFromDatabaseById(userAccount.id);
    });
  });

  test('given: an anonymous user, should: lack any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto(path);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules('color-contrast')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
