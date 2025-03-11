import type { Prisma, UserAccount } from '@prisma/client';

import { prisma } from '~/utils/database.server';

/* CREATE */

/**
 * Saves a user account to the database.
 *
 * @param userAccount The user account to save.
 * @returns The saved user account.
 */
export async function saveUserAccountToDatabase(
  userAccount: Prisma.UserAccountCreateInput,
) {
  return prisma.userAccount.create({ data: userAccount });
}

/* READ */

/**
 * Retrieves a user account by its id.
 *
 * @param id The id of the user account.
 * @returns The user account or null.
 */
export async function retrieveUserAccountFromDatabaseById(
  id: UserAccount['id'],
) {
  return prisma.userAccount.findUnique({ where: { id } });
}

/**
 * Retrieves a user account by its email.
 *
 * @param email The email of the user account.
 * @returns The user account or null.
 */
export async function retrieveUserAccountFromDatabaseByEmail(
  email: UserAccount['email'],
) {
  return prisma.userAccount.findUnique({ where: { email } });
}

/* DELETE */

/**
 * Deletes a user account from the database.
 *
 * @param id The id of the user account to delete.
 * @returns The deleted user account.
 */
export async function deleteUserAccountFromDatabaseById(id: UserAccount['id']) {
  return prisma.userAccount.delete({ where: { id } });
}
