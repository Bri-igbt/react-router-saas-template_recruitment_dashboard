import { cn } from '~/lib/utils';
import type { IconProps } from '~/utils/types';

/**
 * Tabler Brightness Icon
 * @see https://tabler.io/icons/icon/brightness
 */
export function BrightnessIcon({ className, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn(
        'icon icon-tabler icons-tabler-outline icon-tabler-brightness',
        className,
      )}
      fill="none"
      height="24"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" />
      <path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0M12 3v18M12 9l4.65-4.65M12 14.3l7.37-7.37M12 19.6l8.85-8.85" />
    </svg>
  );
}
