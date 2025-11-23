// Configuration file for Prisma (not used in current setup)
// import { defineConfig } from '@prisma/client';

/**
 * Prisma 7 Configuration
 * 
 * This file configures database connections for Prisma migrations.
 * The datasourceUrl is used by Prisma Migrate for schema changes.
 * 
 * For connection pooling with Prisma Accelerate, set ACCELERATE_URL in your .env
 */
export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL!,
      // Direct connection for migrations (bypasses connection pooling)
      directUrl: process.env.DIRECT_URL,
    },
  },
});
