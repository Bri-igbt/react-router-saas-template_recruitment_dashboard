import type { UserAccount } from '@prisma/client';
import { describe, expect, onTestFinished, test } from 'vitest';

import { UPDATE_USER_ACCOUNT_INTENT } from '~/features/user-accounts/settings/account/account-settings-constants';
import { createPopulatedUserAccount } from '~/features/user-accounts/user-accounts-factories.server';
import {
  deleteUserAccountFromDatabaseById,
  retrieveUserAccountFromDatabaseById,
  saveUserAccountToDatabase,
} from '~/features/user-accounts/user-accounts-model.server';
import { supabaseHandlers } from '~/test/mocks/handlers/supabase';
import { setupMockServerLifecycle } from '~/test/msw-test-utils';
import { createAuthenticatedRequest } from '~/test/test-utils';
import { badRequest } from '~/utils/http-responses.server';
import { toFormData } from '~/utils/to-form-data';
import { getToast } from '~/utils/toast.server';

import { action } from './account';

const createUrl = () => 'http://localhost:3000/settings/account';

async function sendAuthenticatedRequest({
  formData,
  user,
}: {
  formData: FormData;
  user: UserAccount;
}) {
  const request = await createAuthenticatedRequest({
    url: createUrl(),
    user,
    method: 'POST',
    formData,
  });

  return await action({ request, params: {}, context: {} });
}

async function setup() {
  const user = createPopulatedUserAccount();
  await saveUserAccountToDatabase(user);

  onTestFinished(async () => {
    await deleteUserAccountFromDatabaseById(user.id);
  });

  return user;
}

setupMockServerLifecycle(...supabaseHandlers);

describe('/settings/account route action', () => {
  test('given: an unauthenticated request, should: throw a redirect to the login page', async () => {
    expect.assertions(2);

    const request = new Request(createUrl(), {
      method: 'POST',
      body: toFormData({}),
    });

    try {
      await action({ request, params: {}, context: {} });
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(302);
        expect(error.headers.get('Location')).toEqual(
          '/login?redirectTo=%2Fsettings%2Faccount',
        );
      } else {
        // Fail test if error is not a Response
        expect(error).toBeInstanceOf(Response);
      }
    }
  });

  describe(`${UPDATE_USER_ACCOUNT_INTENT} intent`, () => {
    const intent = UPDATE_USER_ACCOUNT_INTENT;

    test('given: a valid name, should: update user account name and return a success toast', async () => {
      const user = await setup();

      const newName = createPopulatedUserAccount().name;
      const formData = toFormData({ intent, name: newName });

      const actual = await sendAuthenticatedRequest({
        user,
        formData,
      });

      // Verify user account was updated in the database
      const updatedUser = await retrieveUserAccountFromDatabaseById(user.id);
      expect(updatedUser?.name).toEqual(newName);

      const maybeToast = (actual.init?.headers as Headers).get('Set-Cookie');
      const { toast } = await getToast(
        new Request(createUrl(), {
          headers: { cookie: maybeToast ?? '' },
        }),
      );
      expect(toast).toMatchObject({
        id: expect.any(String) as string,
        title: 'Your account has been updated',
        type: 'success',
      });
    });

    test.each([
      {
        given: 'no name provided',
        body: { intent },
        expected: badRequest({ errors: { name: { message: 'Required' } } }),
      },
      {
        given: 'a name that is too short (1 character)',
        body: { intent, name: 'a' },
        expected: badRequest({
          errors: {
            name: {
              message: 'user-accounts:settings.account.form.name-min-length',
            },
          },
        }),
      },
      {
        given: 'a name that is too long (129 characters)',
        body: { intent, name: 'a'.repeat(129) },
        expected: badRequest({
          errors: {
            name: {
              message: 'user-accounts:settings.account.form.name-max-length',
            },
          },
        }),
      },
      {
        given: 'a name with only whitespace',
        body: { intent, name: '   ' },
        expected: badRequest({
          errors: {
            name: {
              message: 'user-accounts:settings.account.form.name-min-length',
            },
          },
        }),
      },
      {
        given: 'a too short name with whitespace',
        body: { intent, name: '  a ' },
        expected: badRequest({
          errors: {
            name: {
              message: 'user-accounts:settings.account.form.name-min-length',
            },
          },
        }),
      },
    ])(
      'given: $given, should: return a 400 status code with an error message',
      async ({ body, expected }) => {
        const user = await setup();

        const formData = toFormData(body);

        const actual = await sendAuthenticatedRequest({
          user,
          formData,
        });
        expect(actual).toEqual(expected);
      },
    );
  });
});
