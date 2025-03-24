import type { Organization, UserAccount } from '@prisma/client';
import { href } from 'react-router';
import { describe, expect, test } from 'vitest';

import { SWITCH_ORGANIZATION_INTENT } from '~/features/organizations/layout/sidebar-layout-constants';
import { createPopulatedOrganization } from '~/features/organizations/organizations-factories.server';
import {
  addMembersToOrganizationInDatabaseById,
  saveOrganizationToDatabase,
} from '~/features/organizations/organizations-model.server';
import { supabaseHandlers } from '~/test/mocks/handlers/supabase';
import { setupMockServerLifecycle } from '~/test/msw-test-utils';
import { setupUserWithOrgAndAddAsMember } from '~/test/server-test-utils';
import { createAuthenticatedRequest } from '~/test/test-utils';
import { badRequest, notFound } from '~/utils/http-responses.server';
import { toFormData } from '~/utils/to-form-data';

import { action } from './_sidebar-layout';

const createUrl = (organizationSlug: string) =>
  `http://localhost:3000/organizations/${organizationSlug}`;

async function sendAuthenticatedRequest({
  formData,
  organizationSlug,
  user,
}: {
  formData: FormData;
  organizationSlug: Organization['slug'];
  user: UserAccount;
}) {
  const request = await createAuthenticatedRequest({
    url: createUrl(organizationSlug),
    user,
    method: 'POST',
    formData,
  });

  return await action({ request, context: {}, params: { organizationSlug } });
}

setupMockServerLifecycle(...supabaseHandlers);

describe('/organizations/:organizationSlug route action', () => {
  test('given: an unauthenticated request, should: throw a redirect to the login page', async () => {
    expect.assertions(2);

    const organization = createPopulatedOrganization();
    const request = new Request(createUrl(organization.slug), {
      method: 'POST',
      body: toFormData({}),
    });

    try {
      await action({
        request,
        context: {},
        params: { organizationSlug: organization.slug },
      });
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(302);
        expect(error.headers.get('Location')).toEqual(
          `/login?redirectTo=%2Forganizations%2F${organization.slug}`,
        );
      }
    }
  });

  test('given: a user who is not a member of the organization, should: return a 404', async () => {
    // Create a user with an organization.
    const { user } = await setupUserWithOrgAndAddAsMember();
    // Creates a user and another organization.
    const { organization } = await setupUserWithOrgAndAddAsMember();

    const actual = await sendAuthenticatedRequest({
      user,
      formData: toFormData({}),
      organizationSlug: organization.slug,
    });
    const expected = notFound();

    expect(actual).toEqual(expected);
  });

  describe(`${SWITCH_ORGANIZATION_INTENT} intent`, () => {
    const intent = SWITCH_ORGANIZATION_INTENT;

    const createBody = ({
      currentPath = href('/organizations/:organizationSlug/settings/general', {
        organizationSlug: createPopulatedOrganization().slug,
      }),
      organizationId = createPopulatedOrganization().id,
    }: Partial<{
      currentPath: string;
      organizationId: string;
    }>) => toFormData({ intent, currentPath, organizationId });

    test("given: a valid organization switch request, should: redirect to the new organization's same route with updated cookie", async () => {
      const { user, organization: currentOrg } =
        await setupUserWithOrgAndAddAsMember();
      const targetOrg = createPopulatedOrganization();
      await saveOrganizationToDatabase(targetOrg);
      await addMembersToOrganizationInDatabaseById({
        id: targetOrg.id,
        members: [user.id],
        role: 'member',
      });

      const formData = createBody({
        currentPath: href('/organizations/:organizationSlug/settings/general', {
          organizationSlug: currentOrg.slug,
        }),
        organizationId: targetOrg.id,
      });

      const response = (await sendAuthenticatedRequest({
        user,
        formData,
        organizationSlug: currentOrg.slug,
      })) as Response;

      expect(response.status).toEqual(302);
      expect(response.headers.get('Location')).toEqual(
        `/organizations/${targetOrg.slug}/settings/general`,
      );

      // Verify cookie is set correctly
      const cookie = response.headers.get('Set-Cookie');
      expect(cookie).toContain(`__organization_switcher=ey`);
    });

    test('given: an invalid organization ID of a non-existent organization, should: return a 404 with validation errors', async () => {
      const { user, organization } = await setupUserWithOrgAndAddAsMember();

      const formData = createBody({
        organizationId: 'invalid-id',
        currentPath: href('/organizations/:organizationSlug/settings/general', {
          organizationSlug: organization.slug,
        }),
      });

      const actual = await sendAuthenticatedRequest({
        user,
        formData,
        organizationSlug: organization.slug,
      });
      const expected = notFound();

      expect(actual).toEqual(expected);
    });

    test('given: a request to switch to an organization the user is not a member of, should: return a 404', async () => {
      const { user, organization: currentOrg } =
        await setupUserWithOrgAndAddAsMember();
      const { organization: targetOrg } =
        await setupUserWithOrgAndAddAsMember();

      const formData = createBody({
        organizationId: targetOrg.id,
        currentPath: href('/organizations/:organizationSlug/settings/general', {
          organizationSlug: currentOrg.slug,
        }),
      });

      const actual = await sendAuthenticatedRequest({
        user,
        formData,
        organizationSlug: currentOrg.slug,
      });
      const expected = notFound();

      expect(actual).toEqual(expected);
    });

    test('given: a request without an intent, should: return a 400 with validation errors', async () => {
      const { user, organization } = await setupUserWithOrgAndAddAsMember();

      const formData = createBody({
        organizationId: organization.id,
        currentPath: href('/organizations/:organizationSlug/settings/general', {
          organizationSlug: organization.slug,
        }),
      });
      formData.delete('intent');

      const actual = await sendAuthenticatedRequest({
        user,
        formData,
        organizationSlug: organization.slug,
      });
      const expected = badRequest({
        errors: {
          intent: {
            message: 'Invalid literal value, expected "switchOrganization"',
          },
        },
      });

      expect(actual).toEqual(expected);
    });

    test('given: a request with an invalid intent, should: return a 400 with validation errors', async () => {
      const { user, organization } = await setupUserWithOrgAndAddAsMember();

      const formData = createBody({
        organizationId: organization.id,
        currentPath: href('/organizations/:organizationSlug/settings/general', {
          organizationSlug: organization.slug,
        }),
      });
      formData.delete('intent');
      formData.append('intent', 'invalidIntent');

      const actual = await sendAuthenticatedRequest({
        user,
        formData,
        organizationSlug: organization.slug,
      });
      const expected = badRequest({
        errors: {
          intent: {
            message: 'Invalid literal value, expected "switchOrganization"',
          },
        },
      });

      expect(actual).toEqual(expected);
    });

    test('given: no organization ID, should: return a 400 with validation errors', async () => {
      const { user, organization } = await setupUserWithOrgAndAddAsMember();

      const formData = createBody({});
      formData.delete('organizationId');

      const actual = await sendAuthenticatedRequest({
        user,
        formData,
        organizationSlug: organization.slug,
      });
      const expected = badRequest({
        errors: { organizationId: { message: 'Required' } },
      });

      expect(actual).toEqual(expected);
    });

    test('given: no current path, should: return a 400 with validation errors', async () => {
      const { user, organization } = await setupUserWithOrgAndAddAsMember();

      const formData = createBody({ organizationId: organization.id });
      formData.delete('currentPath');

      const actual = await sendAuthenticatedRequest({
        user,
        formData,
        organizationSlug: organization.slug,
      });
      const expected = badRequest({
        errors: { currentPath: { message: 'Required' } },
      });

      expect(actual).toEqual(expected);
    });
  });
});
