import { faker } from '@faker-js/faker';
import userEvent from '@testing-library/user-event';
import { createRoutesStub } from 'react-router';
import { describe, expect, test } from 'vitest';

import { SidebarProvider } from '~/components/ui/sidebar';
import { render, screen } from '~/test/react-test-utils';
import type { Factory } from '~/utils/types';

import { createPopulatedOrganization } from '../organizations-factories.server';
import type { OrganizationSwitcherProps } from './organization-switcher';
import { OrganizationSwitcher } from './organization-switcher';

const createOrganization: Factory<
  OrganizationSwitcherProps['organizations'][0]
> = ({
  id = createPopulatedOrganization().id,
  slug = createPopulatedOrganization().slug,
  name = createPopulatedOrganization().name,
  logo = createPopulatedOrganization().imageUrl,
  plan = faker.helpers.arrayElement(['Free', 'Pro', 'Enterprise']),
} = {}) => ({ id, slug, name, logo, plan });

const createProps: Factory<OrganizationSwitcherProps> = ({
  organizations = [
    createOrganization({ name: 'Home Org' }),
    createOrganization({ name: 'Work Org' }),
  ],
} = {}) => ({ organizations });

describe('OrganizationSwitcher Component', () => {
  test('given: organizations data, should: render active organization in the button', () => {
    const props = createProps();
    const { organizations } = props;
    const path = '/test';
    const RouterStub = createRoutesStub([
      { path, Component: () => <OrganizationSwitcher {...props} /> },
    ]);

    render(
      <SidebarProvider>
        <RouterStub initialEntries={[path]} />
      </SidebarProvider>,
    );

    // Verify active organization is displayed.
    expect(screen.getByText(organizations[0].name)).toBeInTheDocument();
    expect(screen.getByText(organizations[0].plan)).toBeInTheDocument();
  });

  test('given: organizations data, should: handle dropdown menu interactions', async () => {
    const user = userEvent.setup();
    const props = createProps();
    const { organizations } = props;
    const path = '/test';
    const RouterStub = createRoutesStub([
      { path, Component: () => <OrganizationSwitcher {...props} /> },
    ]);

    render(
      <SidebarProvider>
        <RouterStub initialEntries={[path]} />
      </SidebarProvider>,
    );

    // Verify dropdown menu is initially closed.
    expect(screen.queryByText(organizations[1].name)).not.toBeInTheDocument();

    // Click the organization button to open the menu.
    const orgButton = screen.getByRole('button');
    await user.click(orgButton);

    // Verify all organizations are now visible.
    for (const org of organizations) {
      expect(
        screen.getByRole('menuitem', { name: new RegExp(org.name, 'i') }),
      ).toBeInTheDocument();
    }

    // Verify add organization button is displayed.
    expect(
      screen.getByRole('link', { name: /add organization/i }),
    ).toHaveAttribute('href', '/organizations/new');

    // Press escape to close the dropdown.
    await user.keyboard('{Escape}');

    // Verify menu is closed.
    expect(screen.queryByText(organizations[1].name)).not.toBeInTheDocument();
  });

  test('given: multiple organizations, should: switch active organization when clicked', async () => {
    const user = userEvent.setup();
    const props = createProps();
    const { organizations } = props;
    const path = '/test';
    const RouterStub = createRoutesStub([
      { path, Component: () => <OrganizationSwitcher {...props} /> },
    ]);

    render(
      <SidebarProvider>
        <RouterStub initialEntries={[path]} />
      </SidebarProvider>,
    );

    // Open the menu.
    const orgButton = screen.getByRole('button');
    await user.click(orgButton);

    // Click the second organization.
    const secondOrg = screen.getByText(organizations[1].name);
    await user.click(secondOrg);

    // Verify the second organization is now active.
    expect(screen.getByText(organizations[1].name)).toBeInTheDocument();
    expect(screen.getByText(organizations[1].plan)).toBeInTheDocument();
  });
});
