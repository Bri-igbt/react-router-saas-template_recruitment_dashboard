import { Loader2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';

import { DELETE_ORGANIZATION_INTENT } from './general-settings-constants';

export type DangerZoneProps = {
  isDeletingOrganization?: boolean;
  isSubmitting?: boolean;
};

export function DangerZone({
  isDeletingOrganization = false,
  isSubmitting = false,
}: DangerZoneProps) {
  const { t } = useTranslation('organizations', {
    keyPrefix: 'settings.general.danger-zone',
  });

  return (
    <div className="flex flex-col gap-y-4">
      <h2 className="text-destructive leading-none font-semibold">
        {t('title')}
      </h2>

      <div className="border-destructive rounded-xl border px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-foreground font-medium">
              {t('delete-title')}
            </div>

            <p className="text-muted-foreground text-sm leading-7">
              {t('delete-description')}
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">{t('delete-button')}</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('dialog-title')}</DialogTitle>
                <DialogDescription>{t('dialog-description')}</DialogDescription>
              </DialogHeader>

              <DialogFooter className="sm:justify-end">
                <DialogClose asChild>
                  <Button
                    className="mt-2 sm:mt-0"
                    disabled={isSubmitting}
                    type="button"
                    variant="secondary"
                  >
                    {t('cancel')}
                  </Button>
                </DialogClose>

                <Form method="POST" replace>
                  <fieldset className="w-full" disabled={isSubmitting}>
                    <Button
                      className="w-full"
                      name="intent"
                      type="submit"
                      value={DELETE_ORGANIZATION_INTENT}
                      variant="destructive"
                    >
                      {isDeletingOrganization ? (
                        <>
                          <Loader2Icon className="animate-spin" />
                          {t('deleting')}
                        </>
                      ) : (
                        <>{t('delete-this-organization')}</>
                      )}
                    </Button>
                  </fieldset>
                </Form>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
