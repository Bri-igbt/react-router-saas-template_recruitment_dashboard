import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form, useSubmit } from 'react-router';
import type { z } from 'zod';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';

import { ONBOARDING_ORGANIZATION_INTENT } from './onboarding-organization-consants';
import type {
  OnboardingOrganizationErrors,
  OnboardingOrganizationSchema,
} from './onboarding-organization-schemas';
import { onboardingOrganizationSchema } from './onboarding-organization-schemas';

export type OnboardingOrganizationFormCardProps = {
  errors?: OnboardingOrganizationErrors;
  isCreatingOrganization?: boolean;
};

export function OnboardingOrganizationFormCard({
  errors,
  isCreatingOrganization = false,
}: OnboardingOrganizationFormCardProps) {
  const { t } = useTranslation('onboarding', { keyPrefix: 'organization' });
  const submit = useSubmit();

  const form = useForm<OnboardingOrganizationSchema>({
    resolver: zodResolver(onboardingOrganizationSchema),
    defaultValues: {
      intent: ONBOARDING_ORGANIZATION_INTENT,
      name: '',
    },
    errors,
  });

  const handleSubmit = async (
    values: z.infer<typeof onboardingOrganizationSchema>,
  ) => {
    await submit(values, { method: 'POST' });
  };

  return (
    <Card className="m-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('card-title')}</CardTitle>

        <CardDescription>{t('card-description')}</CardDescription>
      </CardHeader>

      <CardContent>
        <FormProvider {...form}>
          <Form
            id="organization-form"
            method="POST"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <fieldset disabled={isCreatingOrganization}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('organization-name-label')}</FormLabel>

                    <FormControl>
                      <Input
                        autoComplete="organization"
                        autoFocus
                        placeholder={t('organization-name-placeholder')}
                        required
                        {...field}
                      />
                    </FormControl>

                    <FormDescription>
                      {t('organization-name-description')}
                    </FormDescription>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>
          </Form>
        </FormProvider>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          disabled={isCreatingOrganization}
          form="organization-form"
          name="intent"
          type="submit"
          value={ONBOARDING_ORGANIZATION_INTENT}
        >
          {isCreatingOrganization ? (
            <>
              <Loader2Icon className="mr-2 size-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            <>{t('save')}</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
