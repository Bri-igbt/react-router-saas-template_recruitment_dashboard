import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';
import type { APIResponse, Page } from '@playwright/test';
import { request } from '@playwright/test';
import type { UserAccount } from '@prisma/client';
import dotenv from 'dotenv';

import { createPopulatedUserAccount } from '~/features/user-accounts/user-accounts-factories.server';
import { createMockSupabaseSession } from '~/test/test-utils';

dotenv.config();

/**
 * Returns the pathname with the search of a given page's url.
 *
 * @param page - The page to get the path of.
 * @returns The path of the page's url.
 */
export const getPath = (page: Page | APIResponse) => {
  const url = new URL(page.url());
  return `${url.pathname}${url.search}`;
};

/**
 * Fake logs in a user by setting the necessary Supabase auth cookies.
 * This allows testing authenticated routes without going through the actual
 * login flow.
 *
 * NOTE: You need to activate the MSW mocks for Supabase (`getUser`) for this
 * to work. You need to run the server mocks (`npm run dev-with-server-mocks`)
 * and have the MSW interceptor for `getUser` enabled (see `startMockServer`).
 *
 * @param options - The options for logging in.
 * @param options.page - The Playwright page to set cookies on.
 * @param options.superbaseUserId - Optional Supabase user ID to set in the
 * session.
 * @param options.email - Optional email to set in the session.
 * @returns A promise that resolves when the cookies have been set.
 */
export async function loginByCookie({
  email = faker.internet.email(),
  page,
  supabaseUserId = createId(),
}: {
  email?: UserAccount['email'];
  page: Page;
  supabaseUserId?: UserAccount['supabaseUserId'];
}) {
  // Create a mock session with the provided user details
  const mockSession = createMockSupabaseSession({
    user: createPopulatedUserAccount({ email, supabaseUserId }),
  });

  // Set the Supabase session cookie
  // The cookie name is typically 'sb-{project-ref}-auth-token'
  // You may need to adjust this based on your Supabase project reference
  const projectReference =
    process.env.SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1] ?? 'default';

  // Set the cookie with the session data
  await page.context().addCookies([
    {
      name: `sb-${projectReference}-auth-token`,
      value: JSON.stringify(mockSession),
      domain: 'localhost',
      path: '/',
    },
  ]);
}

/**
 * Creates an authenticated Playwright request context with a Supabase auth cookie.
 * Useful for testing API endpoints that require authentication via cookies.
 *
 * @param options - The options for creating the authenticated request.
 * @param options.supabaseUserId - The Supabase user ID to set in the session.
 * @param options.email - The email to set in the session.
 * @returns A promise that resolves to an authenticated APIRequestContext.
 */
export async function createAuthenticatedRequest({
  supabaseUserId,
  email,
}: {
  supabaseUserId: UserAccount['supabaseUserId'];
  email: UserAccount['email'];
}) {
  // Create a mock session with the provided user details
  const user = createPopulatedUserAccount({ supabaseUserId, email });
  const mockSession = createMockSupabaseSession({ user });

  // Determine the Supabase project reference for the cookie name
  const projectReference =
    process.env.SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1] ?? 'default';
  const cookieName = `sb-${projectReference}-auth-token`;
  const cookieValue = JSON.stringify(mockSession);

  // Create a new request context with the auth cookie
  const authenticatedRequest = await request.newContext({
    extraHTTPHeaders: {
      Cookie: `${cookieName}=${encodeURIComponent(cookieValue)}`,
    },
  });

  return authenticatedRequest;
}
