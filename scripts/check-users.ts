/**
 * Quick script to check users in the database
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    console.log(`👥 Total users in database: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Name: ${user.name || "N/A"}`);
      console.log(`   - Created: ${user.createdAt}`);
      console.log(`   - Projects: ${user._count.projects}`);
      console.log("");
    });

    // Also check projects and their user assignments
    const allProjects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        userId: true,
      },
    });

    console.log(`📦 Total projects: ${allProjects.length}`);
    allProjects.forEach((project) => {
      const user = users.find((u) => u.id === project.userId);
      console.log(`   - ${project.name}`);
      console.log(`     Project ID: ${project.id}`);
      console.log(`     User ID: ${project.userId}`);
      console.log(`     User Email: ${user?.email || "NOT FOUND"}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();

