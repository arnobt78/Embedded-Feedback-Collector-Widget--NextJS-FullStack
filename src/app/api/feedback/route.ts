/**
 * API Route: /api/feedback
 * 
 * Next.js App Router API Route Handler
 * This file exports HTTP method handlers (GET, POST, OPTIONS) for the feedback API endpoint.
 * 
 * Features:
 * - CORS support for cross-origin requests (allows widget embedding)
 * - POST: Create new feedback entries (optionally with API key for project association)
 * - GET: Retrieve all feedback entries (optionally filtered by project via query params)
 * - OPTIONS: Handle CORS preflight requests
 * - Backward compatible: Works without API key (uses default project)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, getProjectByApiKey, getDefaultProject } from "@/lib/api-utils";
import { auth } from "@/lib/auth";
import { sendFeedbackNotificationEmail } from "@/lib/email";

/**
 * OPTIONS Handler - CORS Preflight Request
 * 
 * Browsers send OPTIONS requests before actual POST/GET requests
 * when making cross-origin requests. This handler responds with
 * allowed CORS headers so the browser knows the actual request is safe.
 * 
 * Status 204 = No Content (successful preflight)
 */
export async function OPTIONS() {
  // Preflight CORS support
  return withCORS(new NextResponse(null, { status: 204 }));
}

/**
 * POST Handler - Create New Feedback Entry
 * 
 * Accepts feedback data (name, email, message, rating) and saves it to the database.
 * Optionally accepts X-API-Key header to associate feedback with a specific project.
 * If no API key is provided, uses default project (backward compatible).
 * 
 * @param {Request} request - The incoming HTTP request with JSON body
 * @returns {NextResponse} JSON response with created feedback or error
 * 
 * Status Codes:
 * - 201: Successfully created
 * - 400: Validation error (missing required message) or invalid API key
 * - 403: Project is inactive (API key provided but project is disabled)
 * - 500: Database/server error
 */
export async function POST(request: Request) {
  // Parse JSON body from request
  const body = await request.json();
  const { name, email, message, rating, metadata } = body;
  
  // Validation: message is required (other fields are optional)
  if (!message) {
    return withCORS(
      NextResponse.json({ error: "Message is required" }, { status: 400 })
    );
  }
  
  try {
    // Try to get project from API key (optional - backward compatible)
    const project = await getProjectByApiKey(request);
    
    let projectId: string | null = null;
    
    if (project) {
      // API key was provided - validate project is active
      if (!project.isActive) {
        return withCORS(
          NextResponse.json({ error: "Project is inactive" }, { status: 403 })
        );
      }
      projectId = project.id;
    } else {
      // No API key provided - use default project (backward compatibility)
      const defaultProject = await getDefaultProject();
      projectId = defaultProject.id;
    }
    
    // Save feedback to database using Prisma ORM
    // Prisma provides type-safe database access
    const feedback = await prisma.feedback.create({
      data: {
        name,
        email,
        message,
        rating,
        metadata: metadata || null, // Store optional metadata (userAgent, IP, referrer, etc.)
        projectId: projectId, // Associate with project
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    });

    // Send email notification (fire and forget, but wait briefly to capture errors)
    // Start email sending but don't block the response
    // Log email attempt immediately for debugging
    console.log("📧 Attempting to send feedback notification email...", {
      feedbackId: feedback.id,
      projectName: feedback.project?.name || "Default Project",
      submitterEmail: feedback.email || "no email",
      adminEmail: process.env.BREVO_ADMIN_EMAIL || "not set",
    });

    const emailPromise = sendFeedbackNotificationEmail({
      projectName: feedback.project?.name || "Default Project",
      projectDomain: feedback.project?.domain || "https://localhost:3000",
      feedbackId: feedback.id,
      submitterName: feedback.name,
      submitterEmail: feedback.email,
      message: feedback.message,
      rating: feedback.rating,
      createdAt: feedback.createdAt,
      dashboardUrl: process.env.NEXTAUTH_URL
        ? `${process.env.NEXTAUTH_URL}/dashboard/feedback/${feedback.id}`
        : undefined,
    })
      .then((result) => {
        if (result.success) {
          console.log(`✅ Email sent successfully via ${result.provider}: ${result.messageId}`);
        } else {
          console.error(`❌ Email sending failed: ${result.error}`);
        }
      })
      .catch((error) => {
        // Log email sending errors but don't fail the request
        console.error("❌ Failed to send feedback notification email:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          envVars: {
            hasBrevoKey: !!process.env.BREVO_API_KEY,
            hasResendToken: !!process.env.RESEND_TOKEN,
            adminEmail: process.env.BREVO_ADMIN_EMAIL || "not set",
          },
        });
      });

    // Wait up to 3 seconds for email to complete (to capture errors in logs)
    // This ensures errors are logged before function completes
    // After 3 seconds, function returns even if email is still sending
    Promise.race([
      emailPromise,
      new Promise((resolve) => setTimeout(() => {
        console.log("⏱️ Email sending in progress (function returning, email will complete in background)");
        resolve(null);
      }, 3000)),
    ]).catch(() => {
      // Ignore race timeout - email will continue in background
    });

    return withCORS(NextResponse.json(feedback, { status: 201 })); // 201 = Created
  } catch (error) {
    // Catch any database errors (connection, validation, etc.)
    console.error("Error creating feedback:", error);
    return withCORS(
      NextResponse.json({ error: "Failed to save feedback" }, { status: 500 })
    );
  }
}

/**
 * GET Handler - Retrieve All Feedback Entries
 * 
 * Fetches feedback entries for the authenticated user's projects, ordered by creation date (newest first).
 * Optionally filters by projectId via query parameter (must belong to authenticated user).
 * 
 * Query Parameters:
 * - projectId (optional): Filter feedback by project ID (must belong to authenticated user)
 * 
 * @param {Request} request - The incoming HTTP request
 * @returns {NextResponse} JSON response with array of feedback entries or error
 * 
 * Status Codes:
 * - 200: Successfully retrieved
 * - 401: Unauthorized (not authenticated)
 * - 403: Forbidden (project doesn't belong to user)
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

    // Fetch feedback entries, ordered by newest first
    const feedbacks = await prisma.feedback.findMany({
      where: where,
      orderBy: { createdAt: "desc" }, // Most recent first
      include: {
        project: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    });
    return withCORS(NextResponse.json(feedbacks, { status: 200 })); // 200 = OK
  } catch (error) {
    // Catch any database errors
    console.error("Error fetching feedback:", error);
    return withCORS(
      NextResponse.json({ error: "Failed to fetch feedbacks" }, { status: 500 })
    );
  }
}

