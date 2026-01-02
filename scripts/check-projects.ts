/**
 * Quick script to check project assignments in the database
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkProjects() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log("👥 Users in database:");
    users.forEach((user) => {
      console.log(`   - ${user.email} (ID: ${user.id})`);
    });

    console.log("\n📦 Projects:");
    
    // Try to get all projects (might fail if some don't have userId)
    try {
      const projects = await prisma.project.findMany({
        select: {
          id: true,
          name: true,
          userId: true,
        },
      });

      console.log(`Total projects: ${projects.length}`);
      projects.forEach((project) => {
        console.log(`   - ${project.name} (ID: ${project.id}) - User ID: ${project.userId || "NULL"}`);
      });

      // Group by user
      const projectsByUser: Record<string, number> = {};
      projects.forEach((project) => {
        const userId = project.userId || "NO_USER";
        projectsByUser[userId] = (projectsByUser[userId] || 0) + 1;
      });

      console.log("\n📊 Projects by user:");
      Object.entries(projectsByUser).forEach(([userId, count]) => {
        const user = users.find((u) => u.id === userId);
        const userEmail = user?.email || userId;
        console.log(`   - ${userEmail}: ${count} project(s)`);
      });
    } catch (error) {
      console.log("❌ Could not query projects with Prisma (might have null userId)");
      console.log("   Using raw MongoDB query instead...\n");

      // Use raw query
      const rawProjects = await prisma.$queryRaw<Array<{ _id: string; name: string; userId: string | null }>>`
        db.Project.find({}, { _id: 1, name: 1, userId: 1 })
      ` as any;

      if (Array.isArray(rawProjects)) {
        console.log(`Total projects: ${rawProjects.length}`);
        rawProjects.forEach((project: any) => {
          const userId = project.userId || "NULL";
          console.log(`   - ${project.name || "Unknown"} (ID: ${project._id}) - User ID: ${userId}`);
        });
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProjects();

