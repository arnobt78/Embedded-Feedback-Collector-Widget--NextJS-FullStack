/**
 * Debug script to check user and project assignments
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debugSession() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    console.log("👥 Users in database:");
    users.forEach((user) => {
      console.log(`   - ${user.email} (ID: ${user.id})`);
      console.log(`     Projects: ${user._count.projects}`);
    });

    // Get all projects with their userId
    console.log("\n📦 All Projects:");
    try {
      const projects = await prisma.project.findMany({
        select: {
          id: true,
          name: true,
          userId: true,
          _count: {
            select: {
              feedbacks: true,
            },
          },
        },
      });

      projects.forEach((project) => {
        const user = users.find((u) => u.id === project.userId);
        console.log(`   - ${project.name}`);
        console.log(`     ID: ${project.id}`);
        console.log(`     User: ${user?.email || project.userId || "NULL"}`);
        console.log(`     Feedback count: ${project._count.feedbacks}`);
        console.log("");
      });

      // Check test@user.com specifically
      const testUser = users.find((u) => u.email === "test@user.com");
      if (testUser) {
        console.log(`\n🔍 Details for test@user.com (${testUser.id}):`);
        const userProjects = projects.filter((p) => p.userId === testUser.id);
        console.log(`   Total projects: ${userProjects.length}`);
        userProjects.forEach((p) => {
          console.log(`     - ${p.name} (${p._count.feedbacks} feedback entries)`);
        });
      }
    } catch (error: any) {
      console.error("Error querying projects:", error.message);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSession();

