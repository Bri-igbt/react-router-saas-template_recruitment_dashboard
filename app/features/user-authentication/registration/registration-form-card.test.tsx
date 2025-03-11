import { describe, expect, test } from 'vitest';

import { createRoutesStub, render, screen } from '~/test/react-test-utils';
import type { Factory } from '~/utils/types';

import type {
  EmailRegistrationErrors,
  RegistrationFormCardProps,
} from './registration-form-card';
import { RegistrationFormCard } from './registration-form-card';

const createProps: Factory<RegistrationFormCardProps> = ({
  errors,
  isRegisteringWithEmail = false,
  isRegisteringWithGoogle = false,
  isSubmitting = false,
} = {}) => ({
  errors,
  isRegisteringWithEmail,
  isRegisteringWithGoogle,
  isSubmitting,
});
describe('RegistrationFormCard Component', () => {
  test('given: component renders with default props, should: render a card with an email registration form, a google registration form, and links to the terms and privacy policy', () => {
    const path = '/register';
    const RouterStub = createRoutesStub([
      { path, Component: () => <RegistrationFormCard /> },
    ]);

    render(<RouterStub initialEntries={[path]} />);

    // Verify the card title and description are displayed.
    expect(screen.getByText(/new here/i)).toBeInTheDocument();
    expect(
      screen.getByText(/create your account to get started/i),
    ).toBeInTheDocument();

    // Verify the email form elements are present.
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toHaveAttribute(
      'type',
      'submit',
    );

    // Verify the divider is present.
    expect(screen.getByText(/or/i)).toBeInTheDocument();

    // Verify the Google button is present.
    expect(screen.getByRole('button', { name: /google/i })).toHaveAttribute(
      'type',
      'submit',
    );

    // Verify the login link is present.
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute(
      'href',
      '/login',
    );

    // Verify the terms and privacy links are present.
    expect(
      screen.getByRole('link', { name: /terms of service/i }),
    ).toHaveAttribute('href', '/terms-of-service');
    expect(
      screen.getByRole('link', { name: /privacy policy/i }),
    ).toHaveAttribute('href', '/privacy-policy');
  });

  test('given: isSubmitting is true, should: disable both forms', () => {
    const props = createProps({ isSubmitting: true });
    const path = '/register';
    const RouterStub = createRoutesStub([
      { path, Component: () => <RegistrationFormCard {...props} /> },
    ]);

    render(<RouterStub initialEntries={[path]} />);

    // Get all form elements.
    const emailInput = screen.getByLabelText(/email/i);
    const emailButton = screen.getByRole('button', { name: /register/i });
    const googleButton = screen.getByRole('button', { name: /google/i });

    // Verify all form elements are disabled.
    expect(emailInput).toBeDisabled();
    expect(emailButton).toBeDisabled();
    expect(googleButton).toBeDisabled();
  });

  test('given: isRegisteringWithEmail is true, should: show loading state for email button', () => {
    const props = createProps({ isRegisteringWithEmail: true });
    const path = '/register';
    const RouterStub = createRoutesStub([
      { path, Component: () => <RegistrationFormCard {...props} /> },
    ]);

    render(<RouterStub initialEntries={[path]} />);

    const emailButton = screen.getByRole('button', { name: /registering/i });
    expect(emailButton).toBeInTheDocument();
  });

  test('given: errors for email field, should: display error message', () => {
    const errorMessage = 'Invalid email format';
    const errors: EmailRegistrationErrors = {
      email: { type: 'validation', message: errorMessage },
    };

    const props = createProps({ errors });
    const path = '/register';
    const RouterStub = createRoutesStub([
      { path, Component: () => <RegistrationFormCard {...props} /> },
    ]);

    render(<RouterStub initialEntries={[path]} />);

    // Verify the error message is displayed.
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
