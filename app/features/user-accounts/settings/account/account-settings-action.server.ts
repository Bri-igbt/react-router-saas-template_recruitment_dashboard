import { data } from 'react-router';
import { promiseHash } from 'remix-utils/promise';

import { requireAuthenticatedUserExists } from '~/features/user-accounts/user-accounts-helpers.server';
import { updateUserAccountInDatabaseById } from '~/features/user-accounts/user-accounts-model.server';
import { combineHeaders } from '~/utils/combine-headers.server';
import { getIsDataWithResponseInit } from '~/utils/get-is-data-with-response-init.server';
import i18next from '~/utils/i18next.server';
import { createToastHeaders } from '~/utils/toast.server';
import { validateFormData } from '~/utils/validate-form-data.server';

import type { UpdateUserAccountFormErrors } from './account-settings';
import { UPDATE_USER_ACCOUNT_INTENT } from './account-settings-constants';
import { updateUserAccountFormSchema } from './account-settings-schemas';
import type { Route } from '.react-router/types/app/routes/settings+/+types/account';

export async function accountSettingsAction({ request }: Route.ActionArgs) {
  try {
    const { auth, t } = await promiseHash({
      auth: requireAuthenticatedUserExists(request),
      t: i18next.getFixedT(request, 'user-accounts', {
        keyPrefix: 'settings.account.toast',
      }),
    });
    const { user, headers } = auth;
    const body = await validateFormData(request, updateUserAccountFormSchema);

    switch (body.intent) {
      case UPDATE_USER_ACCOUNT_INTENT: {
        if (body.name && body.name !== user.name) {
          await updateUserAccountInDatabaseById({
            id: user.id,
            user: { name: body.name },
          });
        }

        const toastHeaders = await createToastHeaders({
          title: t('user-account-updated'),
          type: 'success',
        });
        return data({}, { headers: combineHeaders(headers, toastHeaders) });
      }
    }
  } catch (error) {
    if (
      getIsDataWithResponseInit<{ errors: UpdateUserAccountFormErrors }>(error)
    ) {
      return error;
    }

    throw error;
  }
}
