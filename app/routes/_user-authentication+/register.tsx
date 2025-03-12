import { useTranslation } from 'react-i18next';
import { useActionData, useNavigation } from 'react-router';

import { GeneralErrorBoundary } from '~/components/general-error-boundary';
import type { RegisterActionData } from '~/features/user-authentication/registration/register-action.server';
import { registerAction } from '~/features/user-authentication/registration/register-action.server';
import { RegistrationFormCard } from '~/features/user-authentication/registration/registration-form-card';
import { RegistrationVerificationAwaiting } from '~/features/user-authentication/registration/registration-verification-awaiting';
import { registerIntents } from '~/features/user-authentication/user-authentication-constants';
import {
  getIsAwaitingEmailConfirmation,
  hasErrors,
} from '~/features/user-authentication/user-authentication-helpers';
import { requireUserIsAnonymous } from '~/features/user-authentication/user-authentication-helpers.server';
import i18next from '~/utils/i18next.server';

import type { Route } from './+types/login';

export const handle = { i18n: 'user-authentication' };

export async function loader({ request }: Route.LoaderArgs) {
  await requireUserIsAnonymous(request);
  const t = await i18next.getFixedT(request, ['user-authentication', 'common']);
  const title = `${t('register.pageTitle')} | ${t('app-name')}`;
  return { title };
}

export const meta: Route.MetaFunction = ({ data }) => [{ title: data.title }];

export async function action(args: Route.ActionArgs) {
  return registerAction(args);
}

export default function RegisterRoute() {
  const { t } = useTranslation('user-authentication');
  const navigation = useNavigation();
  const actionData = useActionData<RegisterActionData>();

  const isAwaitingEmailConfirmation =
    getIsAwaitingEmailConfirmation(actionData);
  const errors = hasErrors(actionData) ? actionData.errors : undefined;

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
            errors={errors}
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
