import type { ActionFunction } from 'react-router';
import { createCookie, redirect } from 'react-router';
import { safeRedirect } from 'remix-utils/safe-redirect';

import { badRequest } from '~/utils/http-responses.server';

import type { ColorScheme } from './color-scheme-constants';
import {
  COLOR_SCHEME_FORM_KEY,
  colorSchemes,
  RETURN_TO_FORM_KEY,
} from './color-scheme-constants';

type ColorSchemeCookie = {
  colorScheme: ColorScheme;
};

const cookie = createCookie('color-scheme', {
  maxAge: 60 * 60 * 24 * 365, // one year
  sameSite: 'lax',
});

/**
 * Parses the color scheme preference from the request's cookie.
 *
 * @param request - The incoming request object containing the cookie header
 * @returns The user's preferred color scheme, or 'system' if no preference is
 * set.
 */
export async function parseColorScheme(request: Request): Promise<ColorScheme> {
  const cookieHeader = request.headers.get('Cookie');
  const parsed = (await cookie.parse(cookieHeader)) as
    | ColorSchemeCookie
    | undefined;
  return parsed ? parsed.colorScheme : colorSchemes.system;
}

/**
 * Serializes the color scheme preference into a cookie string.
 * If the color scheme is 'system', the cookie is destroyed.
 *
 * @param colorScheme - The color scheme to serialize
 * @returns A serialized cookie string containing the color scheme preference
 */
function serializeColorScheme(colorScheme: ColorScheme) {
  const destroyCookie = colorScheme === colorSchemes.system;

  if (destroyCookie) {
    return cookie.serialize({}, { expires: new Date(0), maxAge: 0 });
  }

  return cookie.serialize({ colorScheme });
}

/**
 * Validates that a form value is a valid ColorScheme.
 *
 * @param formValue - The value to validate
 * @returns A type predicate indicating if the value is a valid ColorScheme
 */
function validateColorScheme(formValue: unknown): formValue is ColorScheme {
  return (
    formValue === ('dark' satisfies ColorScheme) ||
    formValue === ('light' satisfies ColorScheme) ||
    formValue === ('system' satisfies ColorScheme)
  );
}

/**
 * Action handler for updating the user's color scheme preference.
 * Validates the color scheme from form data and sets it in a cookie.
 *
 * @param param0 - The action parameters containing the request
 * @returns A redirect response with the updated color scheme cookie
 * @throws {Response} 400 Bad Request if the color scheme is invalid
 */
export const colorSchemeAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const colorScheme = formData.get(COLOR_SCHEME_FORM_KEY);
  const returnTo = safeRedirect(formData.get(RETURN_TO_FORM_KEY));

  if (!validateColorScheme(colorScheme)) {
    throw badRequest();
  }

  return redirect(returnTo ?? '/', {
    headers: { 'Set-Cookie': await serializeColorScheme(colorScheme) },
  });
};
