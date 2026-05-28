/**
 * Prisma client singleton instance used across the entire backend application.
 * Provides database access for MongoDB operations defined in schema.prisma.
 */

import { PrismaClient } from '../../generated/prisma/client.js';

export const prisma = new PrismaClient();
