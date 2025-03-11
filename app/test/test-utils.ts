import type { UserAccount } from '@prisma/client';

import { createPopulatedUserAccount } from '~/features/user-accounts/user-accounts-factories.server';
import {
  createPopulatedSupabaseSession,
  createPopulatedSupabaseUser,
} from '~/features/user-authentication/user-authentication-factories';

/**
 * Creates a mock Supabase session with a fixed access token and refresh token.
 *
 * @param options - An object containing the user to create the session for.
 * @returns A Promise that resolves to a mock Supabase session.
 */
export const createMockSupabaseSession = ({
  user = createPopulatedUserAccount(),
}: {
  user?: UserAccount;
}) => {
  // Create a Supabase user with the provided ID and email
  const supabaseUser = createPopulatedSupabaseUser({
    id: user.supabaseUserId,
    email: user.email,
  });

  // Create a session with fixed tokens for testing
  return createPopulatedSupabaseSession({
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    user: supabaseUser,
  });
};

/**
 * Creates an authenticated request object with the given parameters and a user
 * auth session behind the scenes.
 * NOTE: You need to activate the MSW mocks for Supabase (`getUser`) for this to
 * work.
 *
 * @param options - An object containing the url and user as well as optional
 * form data.
 * @returns A Request object with authentication cookies.
 */
export function createAuthenticatedRequest({
  url,
  user,
  method = 'POST',
  formData,
}: {
  url: string;
  user: UserAccount;
  method?: string;
  formData?: FormData;
}) {
  // Create a mock session with the provided user details.
  const mockSession = createMockSupabaseSession({ user });

  // Determine the Supabase project reference for the cookie name.
  const projectReference =
    process.env.SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1] ?? 'default';
  const cookieName = `sb-${projectReference}-auth-token`;
  const cookieValue = encodeURIComponent(JSON.stringify(mockSession));

  // Create a new request with the auth cookie.
  const request = new Request(url, { method, body: formData });
  request.headers.set('Cookie', `${cookieName}=${cookieValue}`);

  return request;
}
