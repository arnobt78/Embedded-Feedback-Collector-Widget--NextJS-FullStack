/**
 * API Route: /api/business-insights
 * 
 * Next.js App Router API Route Handler for Business Insights Data
 * This file exports HTTP method handlers (GET, OPTIONS) for insights endpoints.
 * 
 * Features:
 * - GET: Retrieve insights data (total feedback, average rating, project stats, etc.)
 * - OPTIONS: Handle CORS preflight requests
 * 
 * Query Parameters:
 * - projectId (optional): Filter insights by project ID
 * 
 * Note: Using /api/business-insights to avoid browser extension blocking
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS } from "@/lib/api-utils";
import { auth } from "@/lib/auth";

/**
 * OPTIONS Handler - CORS Preflight Request
 * 
 * Browsers send OPTIONS requests before actual GET requests
 * when making cross-origin requests. This handler responds with
 * allowed CORS headers so the browser knows the actual request is safe.
 * 
 * Status 204 = No Content (successful preflight)
 */
export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }));
}

/**
 * GET Handler - Get Business Insights Data
 * 
 * Calculates and returns insights data including:
 * - Total feedback count
 * - Average rating
 * - Feedback count by project
 * - Rating distribution
 * - Recent feedback count (last 7 days, last 30 days)
 * 
 * @param {Request} request - The incoming HTTP request
 * @returns {NextResponse} JSON response with insights data or error
 * 
 * Status Codes:
 * - 200: Successfully retrieved
 * - 500: Database/server error
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse query parameters from URL
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    // If projectId provided, verify it belongs to the authenticated user
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { userId: true },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      if (project.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    // Get user's project IDs (workaround for Prisma MongoDB ObjectId comparison issue)
    const allProjects = await prisma.project.findMany({
      select: { id: true, userId: true },
    });
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const userProjects = allProjects.filter((p) => p.userId === userId);
    const userProjectIds = userProjects.map((p) => p.id);

    // Build query filter: only feedback from user's projects
    const where = projectId
      ? { projectId: projectId } // If projectId provided, use it (already verified)
      : { projectId: { in: userProjectIds } }; // Otherwise, filter by all user's projects

    // Get total feedback count
    const totalFeedback = await prisma.feedback.count({
      where: where,
    });

    // Get average rating (only for feedback with ratings)
    const ratingStats = await prisma.feedback.aggregate({
      where: {
        ...where,
        rating: { not: null }, // Only count feedback with ratings
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true, // Count of feedback entries with ratings
      },
    });

    const averageRating = ratingStats._avg.rating || 0;
    const ratedFeedbackCount = ratingStats._count.rating || 0;

    // Get rating distribution (count of feedback for each rating 1-5)
    const ratingDistribution = await Promise.all(
      [1, 2, 3, 4, 5].map(async (rating) => {
        const count = await prisma.feedback.count({
          where: {
            ...where,
            rating: rating,
          },
        });
        return { rating, count };
      })
    );

    // Get feedback count by project (if not filtering by specific project)
    let feedbackByProject: Array<{
      projectId: string | null;
      projectName: string;
      count: number;
    }> = [];

    if (!projectId) {
      // Aggregate feedback count by project
      const projectStats = await prisma.feedback.groupBy({
        by: ["projectId"],
        where: where,
        _count: {
          id: true,
        },
      });

      // Get project names for each projectId
      feedbackByProject = await Promise.all(
        projectStats.map(async (stat: { projectId: string | null; _count: { id: number } }) => {
          if (stat.projectId) {
            const project = await prisma.project.findUnique({
              where: { id: stat.projectId },
              select: { name: true },
            });
            return {
              projectId: stat.projectId,
              projectName: project?.name || "Unknown Project",
              count: stat._count.id,
            };
          } else {
            return {
              projectId: null,
              projectName: "No Project",
              count: stat._count.id,
            };
          }
        })
      );
    } else {
      // If filtering by projectId, just return the count for that project
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { name: true },
      });
      feedbackByProject.push({
        projectId: projectId,
        projectName: project?.name || "Unknown Project",
        count: totalFeedback,
      });
    }

    // Get recent feedback counts (last 7 days, last 30 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recent7Days = await prisma.feedback.count({
      where: {
        ...where,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    const recent30Days = await prisma.feedback.count({
      where: {
        ...where,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get total projects count for authenticated user (if not filtering by project)
    const totalProjects = projectId
      ? 1
      : (await prisma.project.findMany({
          select: { userId: true, isActive: true },
        })).filter(
          (p) => p.userId === userId && p.isActive === true
        ).length;

    // Build insights response
    const insights = {
      totalFeedback,
      averageRating: Math.round((averageRating + Number.EPSILON) * 100) / 100, // Round to 2 decimal places
      ratedFeedbackCount,
      ratingDistribution,
      feedbackByProject,
      recent7Days,
      recent30Days,
      totalProjects,
    };

    return withCORS(NextResponse.json(insights, { status: 200 })); // 200 = OK
  } catch (error) {
    // Catch any database errors
    console.error("Error fetching business insights:", error);
    return withCORS(
      NextResponse.json({ error: "Failed to fetch business insights" }, { status: 500 })
    );
  }
}

