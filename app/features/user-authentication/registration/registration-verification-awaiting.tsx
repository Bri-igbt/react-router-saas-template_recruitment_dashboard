import { Loader2Icon } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { Form } from 'react-router';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

import { useCountdown } from '../use-countdown';
import { registerIntents } from '../user-authentication-constants';

export type RegistrationVerificationAwaitingProps = {
  email: string;
  isResending?: boolean;
  isSubmitting?: boolean;
};

export function RegistrationVerificationAwaiting({
  email,
  isResending = false,
  isSubmitting = false,
}: RegistrationVerificationAwaitingProps) {
  const { t } = useTranslation('user-authentication');

  const { secondsLeft, reset } = useCountdown(60);

  const waitingToResend = secondsLeft !== 0;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          {t('register.magicLink.cardTitle')}
        </CardTitle>

        <CardDescription className="text-center">
          {t('register.magicLink.cardDescription')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4">
          <p className="text-muted-foreground text-xs">
            <Trans
              i18nKey="user-authentication:register.magicLink.countdownMessage"
              count={secondsLeft}
              components={{ 1: <b /> }}
            />
          </p>

          <Form method="post" onSubmit={() => reset()}>
            <fieldset disabled={waitingToResend || isSubmitting || isResending}>
              <input type="hidden" name="email" value={email} />

              <Button
                className="w-full"
                name="intent"
                type="submit"
                value={registerIntents.registerWithEmail}
              >
                {isResending ? (
                  <>
                    <Loader2Icon className="animate-spin" />
                    {t('register.magicLink.resendButtonLoading')}
                  </>
                ) : (
                  t('register.magicLink.resendButton')
                )}
              </Button>
            </fieldset>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
