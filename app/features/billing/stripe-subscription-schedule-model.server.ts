import type { StripeSubscriptionSchedule } from '@prisma/client';
import type Stripe from 'stripe';

import { prisma } from '~/utils/database.server';

/**
 * Upserts a Stripe subscription schedule and its phases into our database.
 * On update, all existing phases are deleted and replaced with new ones since
 * Stripe doesn't provide real IDs for phases.
 *
 * @param stripeSchedule - Stripe.SubscriptionSchedule to upsert
 * @returns The upserted StripeSubscriptionSchedule record
 */
export async function upsertStripeSubscriptionScheduleInDatabase(
  stripeSchedule: Stripe.SubscriptionSchedule,
) {
  if (!stripeSchedule.current_phase) {
    // The subscription schedule is released.
    return;
  }

  const createPhases = stripeSchedule.phases.map(phase => {
    if (!phase.items?.[0]?.price || typeof phase.items[0].price !== 'string') {
      throw new Error('Each phase must have at least one item with a price ID');
    }

    return {
      startDate: new Date(phase.start_date * 1000),
      endDate: new Date(phase.end_date * 1000),
      price: {
        connect: { stripeId: phase.items[0].price },
      },
      quantity: phase.items[0].quantity ?? 1,
    };
  });

  return prisma.stripeSubscriptionSchedule.upsert({
    where: { stripeId: stripeSchedule.id },
    create: {
      stripeId: stripeSchedule.id,
      subscription: {
        connect: { stripeId: stripeSchedule.subscription as string },
      },
      created: new Date(stripeSchedule.created * 1000),
      currentPhaseStart: new Date(
        stripeSchedule.current_phase.start_date * 1000,
      ),
      currentPhaseEnd: new Date(stripeSchedule.current_phase.end_date * 1000),
      phases: {
        create: createPhases,
      },
    },
    update: {
      created: new Date(stripeSchedule.created * 1000),
      currentPhaseStart: new Date(
        stripeSchedule.current_phase.start_date * 1000,
      ),
      currentPhaseEnd: new Date(stripeSchedule.current_phase.end_date * 1000),
      phases: {
        // First delete all existing phases
        deleteMany: {},
        // Then create new ones
        create: createPhases,
      },
    },
    include: { phases: true },
  });
}

/**
 * Deletes a Stripe subscription schedule from our database.
 * This should be called after canceling a schedule in Stripe.
 *
 * @param scheduleId - The ID of the Stripe subscription schedule to delete
 * @returns The deleted StripeSubscriptionSchedule record
 */
export async function deleteStripeSubscriptionScheduleFromDatabaseById(
  scheduleId: StripeSubscriptionSchedule['stripeId'],
) {
  return prisma.stripeSubscriptionSchedule.delete({
    where: { stripeId: scheduleId },
  });
}
