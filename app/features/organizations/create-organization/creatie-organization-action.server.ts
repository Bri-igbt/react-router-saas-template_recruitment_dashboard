import { redirect } from 'react-router';

import { saveOrganizationWithOwnerToDatabase } from '~/features/organizations/organizations-model.server';
import { requireAuthenticatedUserExists } from '~/features/user-accounts/user-accounts-helpers.server';
import { getIsDataWithResponseInit } from '~/utils/get-is-data-with-response-init.server';
import { slugify } from '~/utils/slugify.server';
import { validateFormData } from '~/utils/validate-form-data.server';

import type { CreateOrganizationFormErrors } from './create-organization-form-card';
import { createOrganizationFormSchema } from './create-organization-schemas';
import type { Route } from '.react-router/types/app/routes/onboarding+/+types/organization';

export async function createOrganizationAction({ request }: Route.ActionArgs) {
  try {
    const { user, headers } = await requireAuthenticatedUserExists(request);
    const data = await validateFormData(request, createOrganizationFormSchema);

    if (typeof data.name !== 'string') {
      throw new TypeError('Organization name must be a string');
    }

    const organization = await saveOrganizationWithOwnerToDatabase({
      organization: { name: data.name, slug: slugify(data.name) },
      userId: user.id,
    });

    return redirect(`/organizations/${organization.slug}`, { headers });
  } catch (error) {
    if (
      getIsDataWithResponseInit<{ errors: CreateOrganizationFormErrors }>(error)
    ) {
      return error;
    }

    throw error;
  }
}
