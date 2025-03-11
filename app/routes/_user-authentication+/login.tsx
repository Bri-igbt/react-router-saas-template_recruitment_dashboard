import type { AuthOtpResponse } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { useActionData, useNavigation } from 'react-router';
import { z } from 'zod';

import { GeneralErrorBoundary } from '~/components/general-error-boundary';
import { retrieveUserAccountFromDatabaseByEmail } from '~/features/user-accounts/user-accounts-model';
import type { EmailLoginErrors } from '~/features/user-authentication/login/login-form-card';
import {
  LoginFormCard,
  loginWithEmailSchema,
  loginWithGoogleSchema,
} from '~/features/user-authentication/login/login-form-card';
import { LoginVerificationAwaiting } from '~/features/user-authentication/login/login-verification-awaiting';
import { loginIntents } from '~/features/user-authentication/user-authentication-constants';
import { requireUserIsAnonymous } from '~/features/user-authentication/user-authentication-helpers.server';
import { getErrorMessage } from '~/utils/get-error-message';
import { getIsDataWithResponseInit } from '~/utils/get-is-data-with-response-init.server';
import { tooManyRequests, unauthorized } from '~/utils/http-responses.server';
import i18next from '~/utils/i18next.server';
import { validateFormData } from '~/utils/validate-form-data.server';

import type { Route } from './+types/login';

export const handle = { i18n: 'user-authentication' };

export async function loader({ request }: Route.LoaderArgs) {
  await requireUserIsAnonymous(request);
  const t = await i18next.getFixedT(request, ['user-authentication', 'common']);
  const title = `${t('login.pageTitle')} | ${t('app-name')}`;
  return { title };
}

export const meta: Route.MetaFunction = ({ data }) => [{ title: data.title }];

const loginSchema = z.discriminatedUnion('intent', [
  loginWithEmailSchema,
  loginWithGoogleSchema,
]);

type LoginActionData =
  | (AuthOtpResponse['data'] & { email: string })
  | { errors: EmailLoginErrors }
  | undefined;

export async function action({
  request,
}: Route.ActionArgs): Promise<LoginActionData> {
  try {
    const { supabase } = await requireUserIsAnonymous(request);
    const t = await i18next.getFixedT(request);
    const body = await validateFormData(request, loginSchema);

    switch (body.intent) {
      case loginIntents.loginWithEmail: {
        const userAccount = await retrieveUserAccountFromDatabaseByEmail(
          body.email,
        );

        if (!userAccount) {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw unauthorized({
            errors: {
              email: {
                message: 'user-authentication:login.form.user-doesnt-exist',
              },
            },
          });
        }

        const { data, error } = await supabase.auth.signInWithOtp({
          email: body.email,
          options: {
            data: { intent: body.intent, appName: t('common:app-name') },
            shouldCreateUser: false,
          },
        });

        if (error) {
          const errorMessage = getErrorMessage(error);

          // Error: For security purposes, you can only request this after 10 seconds.
          if (errorMessage.includes('you can only request this after')) {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw tooManyRequests({
              errors: {
                email: {
                  message: 'user-authentication:login.form.login-failed',
                },
              },
            });
          }

          throw new Error(errorMessage);
        }

        return { ...data, email: body.email };
      }
      case loginIntents.loginWithGoogle: {
        // TODO: Implement Google login.
        // @ts-expect-error - Google login is not implemented yet.
        return {};
      }
    }
  } catch (error) {
    if (getIsDataWithResponseInit<{ errors: EmailLoginErrors }>(error)) {
      // @ts-expect-error - TypeScript doesn't know that React Router will
      // access the properties of the data property of the response.
      return error;
    }

    throw error;
  }
}

function getIsAwaitingEmailConfirmation(
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

export default function LoginRoute() {
  const { t } = useTranslation('user-authentication');
  const navigation = useNavigation();
  const actionData = useActionData<LoginActionData>();

  const isAwaitingEmailConfirmation =
    getIsAwaitingEmailConfirmation(actionData);

  const isLoggingInWithEmail =
    navigation.formData?.get('intent') === loginIntents.loginWithEmail;
  const isLoggingInWithGoogle =
    navigation.formData?.get('intent') === loginIntents.loginWithGoogle;
  const isSubmitting = isLoggingInWithEmail || isLoggingInWithGoogle;

  return (
    <>
      <h1 className="sr-only">{t('login.pageTitle')}</h1>

      <div className="flex flex-col gap-6">
        {isAwaitingEmailConfirmation ? (
          <LoginVerificationAwaiting
            email={actionData?.email}
            isResending={isLoggingInWithEmail}
            isSubmitting={isSubmitting}
          />
        ) : (
          <LoginFormCard
            errors={actionData?.errors}
            isLoggingInWithEmail={isLoggingInWithEmail}
            isLoggingInWithGoogle={isLoggingInWithGoogle}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
