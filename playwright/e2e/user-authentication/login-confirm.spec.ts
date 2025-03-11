import { expect, test } from '@playwright/test';

import { createPopulatedUserAccount } from '~/features/user-accounts/user-accounts-factories.server';
import {
  deleteUserAccountFromDatabaseById,
  saveUserAccountToDatabase,
} from '~/features/user-accounts/user-accounts-model';

import { loginByCookie } from '../../utils';

const path = '/login/confirm';

test.describe(`${path} API route`, () => {
  test('given: a valid token_hash, should: verify OTP and redirect to organizations page', async ({
    page,
  }) => {
    // Create a test user account.
    const userAccount = createPopulatedUserAccount();
    await saveUserAccountToDatabase(userAccount);

    // Mock token hash.
    const tokenHash = userAccount.email;

    // Navigate to the login-confirm page with token hash.
    await page.goto(`${path}?token_hash=${tokenHash}`);

    // Verify the user is redirected to the organizations page.
    expect(page.url()).toContain('/organizations');

    // Clean up.
    await deleteUserAccountFromDatabaseById(userAccount.id);
  });

  test('given: an invalid token_hash, should: return an error', async ({
    request,
  }) => {
    // Make request with invalid token
    const response = await request.get(`${path}?token_hash=invalid_token_hash`);

    // Verify response
    expect(response.status()).toEqual(500);
  });

  test('given: no token_hash parameter, should: return an error', async ({
    request,
  }) => {
    // Make request without token hash
    const response = await request.get(path);

    // Verify response
    expect(response.status()).toEqual(500);
  });

  test('given: a logged in user, should: redirect to organizations page', async ({
    page,
  }) => {
    // Create a test user account.
    const userAccount = createPopulatedUserAccount();
    await saveUserAccountToDatabase(userAccount);

    // Log in the user using cookies.
    await loginByCookie({
      page,
      supabaseUserId: userAccount.supabaseUserId,
      email: userAccount.email,
    });

    // Navigate to the login-confirm page with any token.
    await page.goto(`${path}?token_hash=any_token`);

    // Verify the user is redirected to the organizations page.
    expect(page.url()).toContain('/organizations');

    // Clean up.
    await deleteUserAccountFromDatabaseById(userAccount.id);
  });
});
