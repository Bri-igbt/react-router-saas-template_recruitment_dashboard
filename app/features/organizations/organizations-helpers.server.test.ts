import { OrganizationMembershipRole } from '@prisma/client';
import { describe, expect, test } from 'vitest';

import { notFound } from '~/utils/http-responses.server';

import { createUserWithOrganizations } from '../onboarding/onboarding-helpers.server.test';
import { createPopulatedOrganization } from './organizations-factories.server';
import { findOrganizationIfUserIsMember } from './organizations-helpers.server';

describe('findOrganizationIfUserIsMember()', () => {
  test('given: a user who is a member of the organization, should: return the organization and role', () => {
    const organization = createPopulatedOrganization();
    const user = createUserWithOrganizations({
      memberships: [
        {
          role: OrganizationMembershipRole.member,
          organization,
          deactivatedAt: null,
        },
      ],
    });

    const actual = findOrganizationIfUserIsMember(user, organization.slug);
    const expected = { organization, role: OrganizationMembershipRole.member };

    expect(actual).toEqual(expected);
  });

  test('given: a user who is an admin of the organization, should: return the organization and admin role', () => {
    const organization = createPopulatedOrganization();
    const user = createUserWithOrganizations({
      memberships: [
        {
          role: OrganizationMembershipRole.admin,
          organization,
          deactivatedAt: null,
        },
      ],
    });

    const actual = findOrganizationIfUserIsMember(user, organization.slug);
    const expected = { organization, role: OrganizationMembershipRole.admin };

    expect(actual).toEqual(expected);
  });

  test('given: a user who is not a member of the organization, should: throw a 404', () => {
    expect.assertions(1);

    const user = createUserWithOrganizations({
      memberships: [
        {
          role: OrganizationMembershipRole.member,
          organization: createPopulatedOrganization(),
          deactivatedAt: null,
        },
      ],
    });
    const nonExistentSlug = createPopulatedOrganization().slug;

    try {
      findOrganizationIfUserIsMember(user, nonExistentSlug);
    } catch (error) {
      expect(error).toEqual(notFound());
    }
  });

  test('given: a user with no memberships, should: throw a 404', () => {
    expect.assertions(1);

    const user = createUserWithOrganizations({ memberships: [] });
    const organizationSlug = createPopulatedOrganization().slug;

    try {
      findOrganizationIfUserIsMember(user, organizationSlug);
    } catch (error) {
      expect(error).toEqual(notFound());
    }
  });
});
