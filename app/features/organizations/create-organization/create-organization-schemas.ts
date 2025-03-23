import { z } from 'zod';

import { CREATE_ORGANIZATION_INTENT } from './create-organization-constants';

export const createOrganizationFormSchema = z.object({
  intent: z.literal(CREATE_ORGANIZATION_INTENT),
  name: z
    .string({
      invalid_type_error: 'organizations:new.form.name-must-be-string',
    })
    .trim()
    .min(3, 'organizations:new.form.name-min-length')
    .max(255, 'organizations:new.form.name-max-length'),
  logo: z
    .instanceof(File, {
      message: 'organizations:new.form.logo-must-be-file',
    })
    .optional(),
});

export type CreateOrganizationFormSchema = z.infer<
  typeof createOrganizationFormSchema
>;
