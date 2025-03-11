import { createId } from '@paralleldrive/cuid2';
import type { RequestHandler } from 'msw';
import { http, HttpResponse } from 'msw';

import {
  createPopulatedSupabaseSession,
  createPopulatedSupabaseUser,
} from '~/features/user-authentication/user-authentication-factories';

/*
Auth handlers
*/

const getUserMock = http.get(
  `${process.env.SUPABASE_URL}/auth/v1/user`,
  ({ request }) => {
    // Check for the presence of an Authorization header
    const authHeader = request.headers.get('Authorization');

    // If no Authorization header or it doesn't start with 'Bearer ', return unauthenticated response
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'JWT token is missing' },
        { status: 401 },
      );
    }

    // Use the factory to create a consistent user
    const mockUser = createPopulatedSupabaseUser();

    // Mock user data response
    return HttpResponse.json({ user: mockUser });
  },
);

const rateLimitPrefix = 'rate-limited';

/**
 * Creates a rate limited email for testing purposes. The Supabase MSW handler
 * will return a 429 status code for this email.
 *
 * @returns An email that will be rate limited.
 */
export function createRateLimitedEmail() {
  return `${rateLimitPrefix}-${createId()}@example.com`;
}

const signInWithOtpMock = http.post(
  `${process.env.SUPABASE_URL}/auth/v1/otp`,
  async ({ request }) => {
    // Parse the request body to determine if it's an email or phone OTP request
    const body = (await request.json()) as Record<string, string>;

    if (body.email) {
      if (body.email.includes(rateLimitPrefix)) {
        // Rate limit response for specific email
        return HttpResponse.json(
          {
            message:
              'For security purposes, you can only request this after 60 seconds.',
          },
          { status: 429 },
        );
      }
      // Email OTP response
      return HttpResponse.json({
        // For email OTP, the response is typically empty with no error
      });
    } else if (body.phone) {
      // Phone OTP response
      return HttpResponse.json({
        message_id: 'mock-message-id-123456',
      });
    } else {
      // Invalid request
      return HttpResponse.json(
        { message: 'You must provide either an email or phone number.' },
        { status: 400 },
      );
    }
  },
);

const verifyOtpMock = http.post(
  `${process.env.SUPABASE_URL}/auth/v1/verify`,
  async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;

    // Check for invalid cases
    if (body.token_hash === 'invalid_token_hash') {
      return HttpResponse.json(
        {
          error: 'Invalid OTP',
          message: 'Invalid token_hash provided.',
        },
        { status: 401 },
      );
    }

    if (body.type === 'email' && !body.token_hash) {
      return HttpResponse.json(
        {
          error: 'Invalid parameters',
          message: 'Missing token_hash parameter.',
        },
        { status: 400 },
      );
    }

    // Use the token_hash to set the email, so we can control the user's email.
    const isValid = typeof body.token_hash === 'string';

    if (!isValid) {
      return HttpResponse.json(
        {
          error: 'Invalid OTP',
          message: 'Invalid verification parameters.',
        },
        { status: 401 },
      );
    }

    // Create a user with the provided email or phone
    const mockUser = createPopulatedSupabaseUser({ email: body.token_hash });

    // Create a session with the user
    const mockSession = createPopulatedSupabaseSession({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: mockUser,
    });

    // Return session data at the root level
    return HttpResponse.json(mockSession);
  },
);

export const supabaseHandlers: RequestHandler[] = [
  getUserMock,
  signInWithOtpMock,
  verifyOtpMock,
];
