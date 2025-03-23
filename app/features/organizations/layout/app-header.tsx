import { BellIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { SidebarTrigger } from '~/components/ui/sidebar';

export type AppHeaderProps = {
  title?: string;
};

export function AppHeader({ title }: AppHeaderProps) {
  const { t } = useTranslation('organizations', {
    keyPrefix: 'layout.app-header',
  });

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1.5" />

        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />

        {title && <h1 className="text-base font-medium">{title}</h1>}

        <div className="ml-auto flex items-center gap-2">
          <Button
            aria-label={t('notifications-button-label')}
            className="size-8"
            size="icon"
            variant="outline"
          >
            <BellIcon />
          </Button>
        </div>
      </div>
    </header>
  );
}
