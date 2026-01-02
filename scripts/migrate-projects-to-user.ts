/**
 * Migration Script: Migrate Projects to User Account
 * 
 * This script creates a user account (or uses existing one) and assigns all
 * existing projects without a userId to that account.
 * 
 * Usage:
 *   npx tsx scripts/migrate-projects-to-user.ts <email> <password> <name>
 * 
 * Examples:
 *   npx tsx scripts/migrate-projects-to-user.ts user@example.com mypassword123 "John Doe"
 *   npx tsx scripts/migrate-projects-to-user.ts user@example.com mypassword123
 * 
 * Or add to package.json:
 *   "migrate:user": "tsx scripts/migrate-projects-to-user.ts"
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Main migration function
 * 
 * Creates or finds a user account and assigns all projects without userId to it.
 */
async function migrateProjectsToUser(email?: string, password?: string, name?: string) {
  try {
    console.log("🚀 Starting project migration to user account...\n");

    let targetUser;

    if (email) {
      // Check if user already exists
      targetUser = await prisma.user.findUnique({
        where: { email },
      });

      if (targetUser) {
        console.log(`✅ User already exists: ${email}`);
        console.log(`   User ID: ${targetUser.id}\n`);
      } else {
        if (!password) {
          console.error("❌ Error: Password is required to create a new user account");
          console.log("\nUsage: npx tsx scripts/migrate-projects-to-user.ts <email> <password> [name]");
          process.exit(1);
        }

        // Create new user account
        console.log(`📦 Creating new user account: ${email}`);
        const hashedPassword = await bcrypt.hash(password, 10);
        
        targetUser = await prisma.user.create({
          data: {
            email,
            name: name || email.split("@")[0],
            password: hashedPassword,
          },
        });
        
        console.log(`✅ User account created successfully`);
        console.log(`   User ID: ${targetUser.id}`);
        console.log(`   Email: ${targetUser.email}`);
        console.log(`   Name: ${targetUser.name}\n`);
      }
    } else {
      // No email provided, find the first user or prompt
      const allUsers = await prisma.user.findMany({
        take: 1,
        orderBy: { createdAt: "asc" },
      });

      if (allUsers.length === 0) {
        console.error("❌ Error: No user account found. Please create an account first or provide email/password.");
        console.log("\nUsage: npx tsx scripts/migrate-projects-to-user.ts <email> <password> [name]");
        process.exit(1);
      }

      targetUser = allUsers[0];
      console.log(`✅ Using existing user account: ${targetUser.email}`);
      console.log(`   User ID: ${targetUser.id}\n`);
    }

    // Use raw MongoDB command to update projects that don't have userId
    // Prisma can't query documents that don't match the schema, so we use raw commands
    console.log("🔄 Migrating projects without userId to user account...\n");

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
              userId: targetUser.id,
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
      console.log(`✅ Successfully assigned ${updatedCount} project(s) to user account`);
    }

    console.log("\n✨ Migration completed successfully!");

    // Display summary using Prisma (now that all projects have userId)
    const totalProjects = await prisma.project.count({
      where: {
        userId: targetUser.id,
      },
    });

    const totalFeedbacks = await prisma.feedback.count({
      where: {
        project: {
          userId: targetUser.id,
        },
      },
    });

    console.log(`\n📊 Summary:`);
    console.log(`   - User ID: ${targetUser.id}`);
    console.log(`   - User Email: ${targetUser.email}`);
    console.log(`   - User Name: ${targetUser.name || "N/A"}`);
    console.log(`   - Projects owned by user: ${totalProjects}`);
    console.log(`   - Total feedback entries: ${totalFeedbacks}`);
    console.log(`\n💡 You can now sign in with:`);
    console.log(`   Email: ${targetUser.email}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const email = args[0];
const password = args[1];
const name = args[2];

// Run migration
migrateProjectsToUser(email, password, name)
  .then(() => {
    console.log("\n🎉 Migration script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration script failed:", error);
    process.exit(1);
  });

