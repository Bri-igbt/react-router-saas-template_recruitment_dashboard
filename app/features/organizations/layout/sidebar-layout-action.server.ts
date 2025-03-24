import { redirect } from 'react-router';
import { safeRedirect } from 'remix-utils/safe-redirect';

import { getIsDataWithResponseInit } from '~/utils/get-is-data-with-response-init.server';
import { validateFormData } from '~/utils/validate-form-data.server';

import {
  findOrganizationIfUserIsMemberById,
  requireUserIsMemberOfOrganization,
} from '../organizations-helpers.server';
import { switchSlugInRoute } from './layout-helpers.server';
import { createCookieForOrganizationSwitcherSession } from './organization-switcher-session.server';
import { SWITCH_ORGANIZATION_INTENT } from './sidebar-layout-constants';
import { switchOrganizationSchema } from './sidebar-layout-schemas';
import type { Route } from '.react-router/types/app/routes/organizations_+/$organizationSlug+/+types/_sidebar-layout';

export async function sidebarLayoutAction({
  request,
  params,
}: Route.ActionArgs) {
  try {
    const { user } = await requireUserIsMemberOfOrganization(
      request,
      params.organizationSlug,
    );
    const body = await validateFormData(request, switchOrganizationSchema);

    switch (body.intent) {
      case SWITCH_ORGANIZATION_INTENT: {
        const { organization } = findOrganizationIfUserIsMemberById(
          user,
          body.organizationId,
        );
        const cookie = await createCookieForOrganizationSwitcherSession(
          request,
          organization.id,
        );
        return redirect(
          safeRedirect(switchSlugInRoute(body.currentPath, organization.slug)),
          { headers: { 'Set-Cookie': cookie } },
        );
      }
    }
  } catch (error) {
    if (getIsDataWithResponseInit(error)) {
      return error;
    }

    throw error;
  }
}
