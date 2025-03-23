import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form, useSubmit } from 'react-router';
import { z } from 'zod';

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

import { ONBOARDING_USER_ACCOUNT_INTENT } from './onboarding-user-account-constants';
import type {
  OnboardingUserAccountErrors,
  OnboardingUserAccountSchema,
} from './onboarding-user-account-schemas';
import { onboardingUserAccountSchema } from './onboarding-user-account-schemas';

export type OnboardingUserAccountFormCardProps = {
  errors?: OnboardingUserAccountErrors;
  isCreatingUserAccount?: boolean;
};

export function OnboardingUserAccountFormCard({
  errors,
  isCreatingUserAccount = false,
}: OnboardingUserAccountFormCardProps) {
  const { t } = useTranslation('onboarding', { keyPrefix: 'user-account' });
  const submit = useSubmit();

  const form = useForm<OnboardingUserAccountSchema>({
    resolver: zodResolver(onboardingUserAccountSchema),
    defaultValues: {
      intent: ONBOARDING_USER_ACCOUNT_INTENT,
      name: '',
    },
    errors,
  });

  const handleSubmit = async (
    values: z.infer<typeof onboardingUserAccountSchema>,
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
            id="user-account-form"
            method="POST"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <fieldset disabled={isCreatingUserAccount}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('user-name-label')}</FormLabel>

                    <FormControl>
                      <Input
                        autoComplete="name"
                        autoFocus
                        placeholder={t('user-name-placeholder')}
                        required
                        {...field}
                      />
                    </FormControl>

                    <FormDescription>
                      {t('user-name-description')}
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
          disabled={isCreatingUserAccount}
          form="user-account-form"
          name="intent"
          type="submit"
          value={ONBOARDING_USER_ACCOUNT_INTENT}
        >
          {isCreatingUserAccount ? (
            <>
              <Loader2Icon className="animate-spin" />
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
