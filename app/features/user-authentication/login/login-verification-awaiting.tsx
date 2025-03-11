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
import { loginIntents } from '../user-authentication-constants';

export type LoginVerificationAwaitingProps = {
  email: string;
  isResending?: boolean;
  isSubmitting?: boolean;
};

export function LoginVerificationAwaiting({
  email,
  isResending = false,
  isSubmitting = false,
}: LoginVerificationAwaitingProps) {
  const { t } = useTranslation('user-authentication');

  const { secondsLeft, reset } = useCountdown(60);

  const waitingToResend = secondsLeft !== 0;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          {t('login.magicLink.cardTitle')}
        </CardTitle>

        <CardDescription className="text-center">
          {t('login.magicLink.cardDescription')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4">
          <p className="text-muted-foreground text-xs">
            <Trans
              i18nKey="user-authentication:login.magicLink.countdownMessage"
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
                value={loginIntents.loginWithEmail}
              >
                {isResending ? (
                  <>
                    <Loader2Icon className="animate-spin" />
                    {t('login.magicLink.resendButtonLoading')}
                  </>
                ) : (
                  t('login.magicLink.resendButton')
                )}
              </Button>
            </fieldset>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
