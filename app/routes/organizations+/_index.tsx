import { requireUserIsAuthenticated } from '~/features/user-authentication/user-authentication-helpers.server';

import type { Route } from '../onboarding+/+types/_index';

export async function loader({ request }: Route.LoaderArgs) {
  await requireUserIsAuthenticated(request);
}

export default function OrganizationsRoute() {
  return <div>Organizations</div>;
}
