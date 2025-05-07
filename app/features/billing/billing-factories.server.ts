import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';
import type {
  StripePrice,
  StripeSubscription,
  StripeSubscriptionItem,
  StripeSubscriptionSchedule,
  StripeSubscriptionSchedulePhase,
} from '@prisma/client';

import type { Factory } from '~/utils/types';

import type { PriceLookupKey, Tier } from './billing-constants';
import { lookupKeys, pricesByTierAndInterval } from './billing-constants';

export const getRandomLookupKey = () => faker.helpers.arrayElement(lookupKeys);
export const getRandomTier = (): Tier =>
  faker.helpers.arrayElement(['low', 'mid', 'high']);

export function getStripeIdByLookupKey(lookupKey: PriceLookupKey): string {
  const entry = Object.values(pricesByTierAndInterval).find(
    price => price.lookupKey === lookupKey,
  );

  if (!entry) {
    throw new Error(`Unknown lookupKey "${lookupKey}"`);
  }

  return entry.id;
}

/* Base factories */

/**
 * Creates a Stripe price with populated values.
 *
 * @param priceParams - StripePrice params to create price with.
 * @returns A populated Stripe price with given params.
 */
export const createPopulatedStripePrice: Factory<StripePrice> = ({
  lookupKey = getRandomLookupKey(),
  stripeId = getStripeIdByLookupKey(lookupKey as PriceLookupKey),
  currency = 'usd',
  unitAmount = faker.number.int({ min: 500, max: 50_000 }),
  metadata = {},
} = {}) => ({
  stripeId,
  lookupKey,
  currency,
  unitAmount,
  metadata,
});

/**
 * Creates a Stripe subscription schedule with populated values.
 *
 * @param scheduleParams - StripeSubscriptionSchedule params to create the schedule with.
 * @returns A populated Stripe subscription schedule with given params.
 */
export const createPopulatedStripeSubscriptionSchedule: Factory<
  StripeSubscriptionSchedule
> = ({
  stripeId = `sub_sched_${createId()}`,
  subscriptionId = createPopulatedStripeSubscription().stripeId,
  created = faker.date.past({ years: 1 }),
  currentPhaseStart = faker.date.past({ years: 1 }),
  currentPhaseEnd = faker.date.future({ years: 1, refDate: currentPhaseStart }),
} = {}) => ({
  stripeId,
  subscriptionId,
  created,
  currentPhaseStart,
  currentPhaseEnd,
});

/**
 * Creates a Stripe subscription schedule phase with populated values.
 *
 * @param phaseParams - StripeSubscriptionSchedulePhase params to create the phase with.
 * @returns A populated Stripe subscription schedule phase with given params.
 */
export const createPopulatedStripeSubscriptionSchedulePhase: Factory<
  StripeSubscriptionSchedulePhase
> = ({
  id = createId(),
  scheduleId = createPopulatedStripeSubscriptionSchedule().stripeId,
  startDate = faker.date.past({ years: 1 }),
  endDate = faker.date.future({ years: 1, refDate: startDate }),
  priceId = `price_${createId()}`,
  quantity = faker.number.int({ min: 1, max: 100 }),
} = {}) => ({
  id,
  scheduleId,
  startDate,
  endDate,
  priceId,
  quantity,
});

/**
 * Creates a Stripe subscription item with populated values.
 *
 * @param subscriptionItemParams - StripeSubscriptionItem params to create subscription item with.
 * @returns A populated Stripe subscription item with given params.
 */
export const createPopulatedStripeSubscriptionItem: Factory<
  StripeSubscriptionItem
> = ({
  stripeId = `si_${createId()}`,
  stripeSubscriptionId = `sub_${createId()}`,
  currentPeriodEnd = faker.date.future({ years: 1 }),
  currentPeriodStart = faker.date.past({ years: 1, refDate: currentPeriodEnd }),
  priceId = `price_${createId()}`,
} = {}) => ({
  stripeId,
  stripeSubscriptionId,
  currentPeriodEnd,
  currentPeriodStart,
  priceId,
});

/**
 * Creates a Stripe subscription with populated values.
 *
 * @param subscriptionParams - StripeSubscription params to create subscription with.
 * @returns A populated Stripe subscription with given params.
 */
export const createPopulatedStripeSubscription: Factory<StripeSubscription> = ({
  stripeId = `sub_${createId()}`,
  organizationId = createId(),
  purchasedById = createId(),
  created = faker.date.past({ years: 1 }),
  cancelAtPeriodEnd = false,
  status = 'active',
} = {}) => ({
  stripeId,
  organizationId,
  purchasedById,
  created,
  cancelAtPeriodEnd,
  status,
});

/* Compound factories */

export type SubscriptionItemWithPrice = StripeSubscriptionItem & {
  price: StripePrice;
};

/**
 * Creates a Stripe subscription item with its associated price relation.
 *
 * @param subscriptionItemWithPriceParams - Parameters to create the
 * subscription item and price with.
 * @returns A populated Stripe subscription item with its associated price.
 */
export const createSubscriptionItemWithPrice: Factory<
  SubscriptionItemWithPrice
> = ({ price = createPopulatedStripePrice(), ...rest } = {}) => ({
  price,
  ...createPopulatedStripeSubscriptionItem({
    priceId: price.stripeId,
    ...rest,
  }),
});

export type SubscriptionSchedulePhaseWithPrice =
  StripeSubscriptionSchedulePhase & {
    price: StripePrice;
  };

export type SubscriptionScheduleWithPhases = StripeSubscriptionSchedule & {
  phases: SubscriptionSchedulePhaseWithPrice[];
};

export type SubscriptionWithItems = StripeSubscription & {
  items: SubscriptionItemWithPrice[];
  schedules: SubscriptionScheduleWithPhases[];
};

/**
 * Creates a Stripe subscription with its associated subscription items and
 * prices.
 *
 * @param subscriptionWithItemsParams - Parameters to create the subscription,
 * items and prices with.
 * @returns A populated Stripe subscription with its associated items and
 * prices.
 */
export const createSubscriptionWithItems: Factory<SubscriptionWithItems> = ({
  stripeId = createPopulatedStripeSubscription().stripeId,
  items = [createSubscriptionItemWithPrice({ stripeSubscriptionId: stripeId })],
  ...rest
} = {}) => ({
  ...createPopulatedStripeSubscription({ stripeId, ...rest }),
  schedules: [],
  items: items.map(item => ({ ...item, stripeSubscriptionId: stripeId })),
});

/**
 * Creates a Stripe subscription with a populated price.
 *
 * @param subscriptionWithPriceParams - Parameters to create the subscription with.
 * @returns A populated Stripe subscription with a populated price.
 */
export const createSubscriptionWithPrice = ({
  lookupKey = getRandomLookupKey(),
  ...rest
}: Partial<
  StripeSubscription & { lookupKey: PriceLookupKey }
> = {}): SubscriptionWithItems => ({
  ...createSubscriptionWithItems({
    items: [
      createSubscriptionItemWithPrice({
        price: createPopulatedStripePrice({ lookupKey }),
      }),
    ],
    ...rest,
  }),
});
/**
 * Creates a Stripe subscription schedule phase with its associated price relation.
 *
 * @param params - Parameters to create the schedule phase and price with.
 * @returns A populated schedule phase with its associated price.
 */
export const createSubscriptionSchedulePhaseWithPrice: Factory<
  SubscriptionSchedulePhaseWithPrice
> = ({ price = createPopulatedStripePrice(), ...rest } = {}) => ({
  price,
  ...createPopulatedStripeSubscriptionSchedulePhase({
    priceId: price.stripeId,
    ...rest,
  }),
});

/**
 * Creates a Stripe subscription schedule with its associated phases and prices.
 *
 * @param params - Parameters to create the schedule and phases with.
 * @returns A populated schedule with its associated phases and prices.
 */
export const createSubscriptionScheduleWithPhases: Factory<
  SubscriptionScheduleWithPhases
> = ({
  stripeId = createPopulatedStripeSubscriptionSchedule().stripeId,
  phases = [createSubscriptionSchedulePhaseWithPrice({ scheduleId: stripeId })],
  ...rest
} = {}) => {
  const base = createPopulatedStripeSubscriptionSchedule({ stripeId, ...rest });
  return {
    ...base,
    phases: phases.map(phase => ({ ...phase, scheduleId: stripeId })),
  };
};
