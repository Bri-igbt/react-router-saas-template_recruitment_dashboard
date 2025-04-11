// User can change their name.
// Users should see their avatar (like the organization logo in the general
// settings).
// User can see their email, but can't change it.
// User can delete their account, if they are only admins or members of
// organizations, or if they are the only owner and member of an organization.
// This will implicitly delete those organizations.
// If they are an owner of an organization with multiple members, they first
// have to deactivate all members, or transfer ownership to another member and
// can NOT delete their own account.

// TODO: add e2e tests if a user tries to join an organization that they're
// already a member of.
// If its from the accept invite link page, they should be redirected to the
// dashboard of that organization with a toast saying they're already a member
// of that organization.
// If its from the login page, they should be redirected to the org's
// dashboard, too, with a toast saying they're already a member of that
// organization.

// TODO: add header to user account page that redirects to the last organization
// page they were on. (Use team switcher cookies for this.)
// TODO: add header to organization creation page that redirects to the last
// organization page they were on. (Use team switcher cookies for this.)

// TODO: File uploads for logos & avatars
// TODO: Notifications
// TODO: invite via email
// TODO: billing

// Billing:
// - Free Tier, Pro Tier, Enterprise Tier
// - Hobby Tier, Pro Tier, Enterprise Tier
//   - Optional: free trial

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { createPopulatedUserAccount } from '~/features/user-accounts/user-accounts-factories.server';
import { deleteUserAccountFromDatabaseById } from '~/features/user-accounts/user-accounts-model.server';

import { loginAndSaveUserAccountToDatabase } from '../../utils';

test.describe('account settings', () => {
  test('given: a logged out user, should: redirect to login page with redirectTo parameter', async ({
    page,
  }) => {
    await page.goto('/settings/account');

    // Verify redirect
    await expect(page).toHaveURL('/login?redirectTo=%2Fsettings%2Faccount');
  });

  test('given: a logged in user, should: show account settings form', async ({
    page,
  }) => {
    const user = await loginAndSaveUserAccountToDatabase({ page });

    await page.goto('/settings/account');

    // Verify page content
    await expect(
      page.getByRole('heading', { name: /settings/i, level: 1 }),
    ).toBeVisible();
    await expect(page).toHaveTitle(/account | react router saas template/i);
    await expect(page.getByText(/manage your account settings/i)).toBeVisible();

    // Verify form values
    await expect(page.getByRole('textbox', { name: /name/i })).toHaveValue(
      user.name,
    );
    await expect(page.getByRole('textbox', { name: /email/i })).toHaveValue(
      user.email,
    );
    await expect(page.getByRole('img', { name: /avatar/i })).toBeVisible();

    await deleteUserAccountFromDatabaseById(user.id);
  });

  test('given: a logged in user updating their name, should: update name and show success toast', async ({
    page,
  }) => {
    const user = await loginAndSaveUserAccountToDatabase({ page });

    await page.goto('/settings/account');

    // Update name
    const newName = createPopulatedUserAccount().name;
    await page.getByRole('textbox', { name: /name/i }).fill(newName);
    await page.getByRole('button', { name: /save changes/i }).click();

    // Verify success toast
    await expect(
      page
        .getByRole('region', {
          name: /notifications/i,
        })
        .getByText(/your account has been updated/i),
    ).toBeVisible();

    // Verify name was updated
    await expect(page.getByRole('textbox', { name: /name/i })).toHaveValue(
      newName,
    );

    await deleteUserAccountFromDatabaseById(user.id);
  });

  test('given: a logged in user submitting an invalid name, should: show validation errors', async ({
    page,
  }) => {
    const user = await loginAndSaveUserAccountToDatabase({ page });

    await page.goto('/settings/account');

    // Submit invalid name
    await page.getByRole('textbox', { name: /name/i }).fill('a');
    await page.getByRole('button', { name: /save changes/i }).click();

    // Verify validation error
    await expect(
      page.getByText(/your name must be at least 2 characters long/i),
    ).toBeVisible();

    await deleteUserAccountFromDatabaseById(user.id);
  });

  test('given: a logged in user, should: lack any automatically detectable accessibility issues', async ({
    page,
  }) => {
    const user = await loginAndSaveUserAccountToDatabase({ page });

    await page.goto('/settings/account');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules('color-contrast')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    await deleteUserAccountFromDatabaseById(user.id);
  });
});
