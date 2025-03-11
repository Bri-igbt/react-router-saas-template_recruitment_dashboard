import type { ComponentPropsWithoutRef } from 'react';

/**
 * Props for an SVG icon component.
 */
export type IconProps = Omit<ComponentPropsWithoutRef<'svg'>, 'fill'> & {
  className?: string;
};

/**
 * Arbitrary factory function for object of shape `Shape`.
 */
export type Factory<Shape> = (object?: Partial<Shape>) => Shape;
