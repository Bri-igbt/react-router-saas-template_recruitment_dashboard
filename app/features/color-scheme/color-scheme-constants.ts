export const THEME_TOGGLE_INTENT = 'themeToggle';
export const COLOR_SCHEME_FORM_KEY = 'colorScheme';
export const RETURN_TO_FORM_KEY = 'returnTo';

export const colorSchemes = {
  light: 'light',
  dark: 'dark',
  system: 'system',
} as const;

export type ColorScheme = (typeof colorSchemes)[keyof typeof colorSchemes];
