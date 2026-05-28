/**
 * Setup script for MongoDB TTL (Time-To-Live) index on the token_blacklist collection.
 * Automatically expires blacklisted JWT tokens after their expiry time to clean up expired tokens.
 * Must run after database initialization: pnpm prisma:setup:ttl
 */

import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";

const prisma = new PrismaClient();

async function main() {
  const indexResult = (await prisma.$runCommandRaw({
    createIndexes: "token_blacklist",
    indexes: [
      {
        key: { expiry: 1 },
        name: "token_blacklist_expiry_ttl",
        expireAfterSeconds: 0,
      },
    ],
  })) as {
    ok?: number;
    note?: string;
    errmsg?: string;
    codeName?: string;
  };

  if (indexResult?.ok !== 1) {
    throw new Error(
      `Failed to create TTL index: ${JSON.stringify(indexResult)}`
    );
  }

  console.log("TTL index ensured: token_blacklist_expiry_ttl on token_blacklist.expiry");
  if (indexResult.note) {
    console.log(`MongoDB note: ${indexResult.note}`);
  }
}

main()
  .catch((error) => {
    // Mongo can return IndexOptionsConflict if an index with same name/options diverges.
    if (error?.message?.includes("IndexOptionsConflict")) {
      console.error(
        "TTL index exists with conflicting options. Drop the existing index and rerun this script."
      );
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
