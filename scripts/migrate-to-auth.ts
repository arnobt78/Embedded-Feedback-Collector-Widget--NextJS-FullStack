/**
 * Migration Script: Migrate Existing Projects to User Account
 * 
 * This script creates a default user account (test@user.com) and assigns all
 * existing projects to it for backward compatibility. This ensures that existing
 * project data continues to work after adding authentication.
 * 
 * Usage:
 *   npx tsx scripts/migrate-to-auth.ts
 * 
 * Or add to package.json:
 *   "migrate:auth": "tsx scripts/migrate-to-auth.ts"
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Default test user credentials
 */
const TEST_USER_EMAIL = "test@user.com";
const TEST_USER_PASSWORD = "12345678";
const TEST_USER_NAME = "Test User";

/**
 * Main migration function
 * 
 * Creates a default user account and assigns all existing projects to it.
 */
async function migrateToAuth() {
  try {
    console.log("🚀 Starting migration to authentication model...\n");

    // Check if test user already exists
    let testUser = await prisma.user.findUnique({
      where: {
        email: TEST_USER_EMAIL,
      },
    });

    if (testUser) {
      console.log(`✅ Test user already exists: ${TEST_USER_EMAIL}`);
      console.log(`   User ID: ${testUser.id}\n`);
    } else {
      // Create test user with hashed password
      console.log(`📦 Creating test user account: ${TEST_USER_EMAIL}`);
      const hashedPassword = await bcrypt.hash(TEST_USER_PASSWORD, 10);
      
      testUser = await prisma.user.create({
        data: {
          email: TEST_USER_EMAIL,
          name: TEST_USER_NAME,
          password: hashedPassword,
        },
      });
      
      console.log(`✅ Test user created successfully`);
      console.log(`   User ID: ${testUser.id}`);
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password: ${TEST_USER_PASSWORD}\n`);
    }

    // Use raw MongoDB command to update projects that don't have userId
    // Prisma can't query documents that don't match the schema, so we use raw commands
    console.log("🔄 Updating projects without userId using raw MongoDB command...\n");

    const updateResult = await prisma.$runCommandRaw({
      update: "Project",
      updates: [
        {
          q: {
            $or: [
              { userId: { $exists: false } },
              { userId: null },
            ],
          },
          u: {
            $set: {
              userId: testUser.id,
            },
          },
          multi: true,
        },
      ],
    });

    const updatedCount = (updateResult as any)?.nModified || (updateResult as any)?.modifiedCount || 0;

    if (updatedCount === 0) {
      console.log("✅ All projects already have a user assigned");
    } else {
      console.log(`✅ Successfully assigned ${updatedCount} project(s) to test user`);
    }

    console.log("\n✨ Migration completed successfully!");

    // Display summary using Prisma (now that all projects have userId)
    const totalProjects = await prisma.project.count({
      where: {
        userId: testUser.id,
      },
    });

    const totalFeedbacks = await prisma.feedback.count({
      where: {
        project: {
          userId: testUser.id,
        },
      },
    });

    console.log(`\n📊 Summary:`);
    console.log(`   - Test User ID: ${testUser.id}`);
    console.log(`   - Test User Email: ${testUser.email}`);
    console.log(`   - Test User Password: ${TEST_USER_PASSWORD}`);
    console.log(`   - Projects owned by test user: ${totalProjects}`);
    console.log(`   - Total feedback entries: ${totalFeedbacks}`);
    console.log(`\n💡 You can now sign in with:`);
    console.log(`   Email: ${TEST_USER_EMAIL}`);
    console.log(`   Password: ${TEST_USER_PASSWORD}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateToAuth()
  .then(() => {
    console.log("\n🎉 Migration script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration script failed:", error);
    process.exit(1);
  });
