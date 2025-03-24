import type { Organization } from '@prisma/client';

import type { OnboardingUser } from '~/features/onboarding/onboarding-helpers.server';

import type { NavUserProps } from './nav-user';
import type { OrganizationSwitcherProps } from './organization-switcher';

/**
 * Gets the sidebar state from the request cookies. This is used to determine
 * whether to server render the sidebar open or closed.
 *
 * @param request - The request object containing cookies
 * @returns boolean - The sidebar state (true if sidebar_state cookie is "true",
 * false otherwise).
 */
export function getSidebarState(request: Request): boolean {
  const cookies = request.headers.get('cookie') ?? '';
  const sidebarState = cookies
    .split(';')
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith('sidebar_state='))
    ?.split('=')[1];

  // Return true by default if no cookie is found
  if (!sidebarState) return true;

  return sidebarState === 'true';
}

/**
 * Maps an onboarding user to the organization layout props.
 * @param user - The onboarding user to map
 * @returns The organization layout props containing organizations and user data
 */
export function mapOnboardingUserToOrganizationLayoutProps({
  user,
  organizationSlug,
}: {
  user: OnboardingUser;
  organizationSlug: Organization['slug'];
}): OrganizationSwitcherProps & NavUserProps {
  const mappedOrganizations = user.memberships.map(membership => ({
    id: membership.organization.id,
    name: membership.organization.name,
    logo: membership.organization.imageUrl,
    slug: membership.organization.slug,
    plan: 'Free',
  }));
  return {
    currentOrganization: mappedOrganizations.find(
      organization => organization.slug === organizationSlug,
    ),
    organizations: mappedOrganizations,
    user: {
      name: user.name,
      email: user.email,
      avatar: user.imageUrl,
    },
  };
}

/**
 * Switches the slug in the route with the given slug.
 *
 * @param route - The route to switch the slug in
 * @param slug - The slug to switch in the route
 * @returns The route with the slug switched
 */
export function switchSlugInRoute(route: string, slug: Organization['slug']) {
  return route.replace(/\/organizations\/[^/]+/, `/organizations/${slug}`);
}
