import type { AuthOtpResponse } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { useActionData, useNavigation } from 'react-router';
import { z } from 'zod';

import { GeneralErrorBoundary } from '~/components/general-error-boundary';
import { retrieveUserAccountFromDatabaseByEmail } from '~/features/user-accounts/user-accounts-model';
import type { EmailRegistrationErrors } from '~/features/user-authentication/registration/registration-form-card';
import {
  registerWithEmailSchema,
  registerWithGoogleSchema,
  RegistrationFormCard,
} from '~/features/user-authentication/registration/registration-form-card';
import { RegistrationVerificationAwaiting } from '~/features/user-authentication/registration/registration-verification-awaiting';
import { registerIntents } from '~/features/user-authentication/user-authentication-constants';
import { requireUserIsAnonymous } from '~/features/user-authentication/user-authentication-helpers.server';
import { getErrorMessage } from '~/utils/get-error-message';
import { getIsDataWithResponseInit } from '~/utils/get-is-data-with-response-init.server';
import { conflict, tooManyRequests } from '~/utils/http-responses.server';
import i18next from '~/utils/i18next.server';
import { validateFormData } from '~/utils/validate-form-data.server';

import type { Route } from './+types/login';

export const handle = { i18n: 'user-authentication' };

export async function loader({ request }: Route.LoaderArgs) {
  await requireUserIsAnonymous(request);
  const t = await i18next.getFixedT(request, ['user-authentication', 'common']);
  const title = `${t('register.pageTitle')} | ${t('app-name')}`;
  return { title };
}

export const meta: Route.MetaFunction = ({ data }) => [{ title: data.title }];

const registerSchema = z.discriminatedUnion('intent', [
  registerWithEmailSchema,
  registerWithGoogleSchema,
]);

type RegisterActionData =
  | (AuthOtpResponse['data'] & { email: string })
  | { errors: EmailRegistrationErrors }
  | undefined;

export async function action({
  request,
}: Route.ActionArgs): Promise<RegisterActionData> {
  try {
    const { supabase } = await requireUserIsAnonymous(request);
    const t = await i18next.getFixedT(request);
    const body = await validateFormData(request, registerSchema);

    switch (body.intent) {
      case registerIntents.registerWithEmail: {
        const userAccount = await retrieveUserAccountFromDatabaseByEmail(
          body.email,
        );

        if (userAccount) {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw conflict({
            errors: {
              email: {
                message:
                  'user-authentication:register.form.user-already-exists',
              },
            },
          });
        }

        const { data, error } = await supabase.auth.signInWithOtp({
          email: body.email,
          options: {
            data: { intent: body.intent, appName: t('common:app-name') },
            shouldCreateUser: true,
          },
        });

        if (error) {
          const errorMessage = getErrorMessage(error);

          if (errorMessage.includes('you can only request this after')) {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw tooManyRequests({
              errors: {
                email: {
                  message: 'user-authentication:register.registration-failed',
                },
              },
            });
          }

          throw error;
        }

        return { ...data, email: body.email };
      }
      case registerIntents.registerWithGoogle: {
        // TODO: Implement Google registration.
        // @ts-expect-error - Google registration is not implemented yet.
        return {};
      }
    }
  } catch (error) {
    if (getIsDataWithResponseInit<{ errors: EmailRegistrationErrors }>(error)) {
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

export default function RegisterRoute() {
  const { t } = useTranslation('user-authentication');
  const navigation = useNavigation();
  const actionData = useActionData<RegisterActionData>();

  const isAwaitingEmailConfirmation =
    getIsAwaitingEmailConfirmation(actionData);

  const isRegisteringWithEmail =
    navigation.formData?.get('intent') === registerIntents.registerWithEmail;
  const isRegisteringWithGoogle =
    navigation.formData?.get('intent') === registerIntents.registerWithGoogle;
  const isSubmitting = isRegisteringWithEmail || isRegisteringWithGoogle;

  return (
    <>
      <h1 className="sr-only">{t('register.pageTitle')}</h1>

      <div className="flex flex-col gap-6">
        {isAwaitingEmailConfirmation ? (
          <RegistrationVerificationAwaiting
            email={actionData?.email}
            isResending={isRegisteringWithEmail}
            isSubmitting={isSubmitting}
          />
        ) : (
          <RegistrationFormCard
            errors={actionData?.errors}
            isRegisteringWithEmail={isRegisteringWithEmail}
            isRegisteringWithGoogle={isRegisteringWithGoogle}
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
