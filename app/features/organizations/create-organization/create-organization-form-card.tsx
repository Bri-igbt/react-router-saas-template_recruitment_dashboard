import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import type { FieldErrors } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { Form, href, Link, useSubmit } from 'react-router';
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
import { DragAndDrop } from '~/components/ui/drag-and-drop';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';
import { toFormData } from '~/utils/to-form-data';

import { CREATE_ORGANIZATION_INTENT } from './create-organization-constants';
import type { CreateOrganizationFormSchema } from './create-organization-schemas';
import { createOrganizationFormSchema } from './create-organization-schemas';

export type CreateOrganizationFormErrors =
  FieldErrors<CreateOrganizationFormSchema>;

export type CreateOrganizationFormCardProps = {
  errors?: CreateOrganizationFormErrors;
  isCreatingOrganization?: boolean;
};

export function CreateOrganizationFormCard({
  errors,
  isCreatingOrganization = false,
}: CreateOrganizationFormCardProps) {
  const { t } = useTranslation('organizations', { keyPrefix: 'new.form' });
  const submit = useSubmit();

  const form = useForm<CreateOrganizationFormSchema>({
    resolver: zodResolver(createOrganizationFormSchema),
    defaultValues: {
      intent: CREATE_ORGANIZATION_INTENT,
      name: '',
      logo: undefined,
    },
    errors,
  });

  const handleSubmit = async (
    values: z.infer<typeof createOrganizationFormSchema>,
  ) => {
    await submit(toFormData(values), { method: 'POST' });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('card-title')}</CardTitle>
          <CardDescription>{t('card-description')}</CardDescription>
        </CardHeader>

        <CardContent>
          <FormProvider {...form}>
            <Form
              id="create-organization-form"
              method="POST"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <fieldset
                className="flex flex-col gap-6"
                disabled={isCreatingOrganization}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('name-label')}</FormLabel>

                      <FormControl>
                        <Input
                          autoComplete="organization"
                          autoFocus
                          placeholder={t('name-placeholder')}
                          required
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field: { onChange } }) => (
                    <FormItem>
                      <FormLabel htmlFor="organizationLogo">
                        {t('logo-label')}
                      </FormLabel>

                      <FormControl>
                        <DragAndDrop
                          accept="image/jpeg,image/png"
                          className={cn(
                            form.formState.errors.logo && 'border-destructive',
                          )}
                          id="organizationLogo"
                          multiple={false}
                          name="logo"
                          onFileChosen={file => {
                            onChange(file);
                            form.setValue('logo', file);
                          }}
                        />
                      </FormControl>

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
            form="create-organization-form"
            name="intent"
            type="submit"
          >
            {isCreatingOrganization ? (
              <>
                <Loader2Icon className="animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>{t('submit-button')}</>
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="text-muted-foreground [&_a]:hover:text-primary text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4">
        <Trans
          components={{
            1: <Link to={href('/terms-of-service')} />,
            2: <Link to={href('/privacy-policy')} />,
          }}
          i18nKey="organizations:new.form.terms-and-privacy"
        />
      </div>
    </div>
  );
}
