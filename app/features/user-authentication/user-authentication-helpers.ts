import type { AuthOtpResponse } from '@supabase/supabase-js';

import type { LoginActionData } from './login/login-action.server';
import type { EmailLoginErrors } from './login/login-form-card';
import type { RegisterActionData } from './registration/register-action.server';
import type { EmailRegistrationErrors } from './registration/registration-form-card';

export function getIsAwaitingEmailConfirmation(
  data: unknown,
): data is AuthOtpResponse['data'] & { email: string } {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  return (
    'session' in data &&
    'user' in data &&
    'email' in data &&
    data.session === null &&
    data.user === null &&
    typeof data.email === 'string'
  );
}

export function hasErrors(
  data: LoginActionData,
): data is { errors: EmailLoginErrors };
export function hasErrors(
  data: RegisterActionData,
): data is { errors: EmailRegistrationErrors };
export function hasErrors(
  data: LoginActionData | RegisterActionData,
): data is { errors: EmailLoginErrors | EmailRegistrationErrors } {
  return typeof data === 'object' && data !== null && 'errors' in data;
}
