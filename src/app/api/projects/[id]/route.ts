/**
 * API Route: /api/projects/[id]
 *
 * Next.js App Router API Route Handler for Individual Project Operations
 * This file exports HTTP method handlers (GET, PUT, DELETE, OPTIONS) for a specific project.
 *
 * Features:
 * - GET: Get project details by ID
 * - PUT: Update project by ID
 * - DELETE: Delete project by ID (soft delete by setting isActive to false, or hard delete)
 * - OPTIONS: Handle CORS preflight requests
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS } from "@/lib/api-utils";
import { auth } from "@/lib/auth";
import { randomBytes } from "crypto";

/**
 * Generate a secure random API key for a project
 *
 * @returns {string} A random 32-character hexadecimal string
 */
function generateApiKey(): string {
  return randomBytes(16).toString("hex");
}

/**
 * OPTIONS Handler - CORS Preflight Request
 *
 * Browsers send OPTIONS requests before actual PUT/DELETE requests
 * when making cross-origin requests. This handler responds with
 * allowed CORS headers so the browser knows the actual request is safe.
 *
 * Status 204 = No Content (successful preflight)
 */
export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }));
}

/**
 * GET Handler - Get Project by ID
 *
 * Fetches a single project by its ID for the authenticated user, including feedback count.
 *
 * @param {Request} request - The incoming HTTP request
 * @param {Object} context - Route context containing the project ID
 * @returns {NextResponse} JSON response with project details or error
 *
 * Status Codes:
 * - 200: Successfully retrieved
 * - 401: Unauthorized (not authenticated)
 * - 403: Forbidden (project doesn't belong to user)
 * - 404: Project not found
 * - 500: Database/server error
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    // Fetch project by ID and verify ownership
    const project = await prisma.project.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            feedbacks: true, // Include count of feedback entries
          },
        },
      },
    });

    if (!project) {
      return withCORS(
        NextResponse.json({ error: "Project not found" }, { status: 404 })
      );
    }

    // Verify project belongs to authenticated user
    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return withCORS(NextResponse.json(project, { status: 200 })); // 200 = OK
  } catch (error) {
    // Catch any database errors
    console.error("Error fetching project:", error);
    return withCORS(
      NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
    );
  }
}

/**
 * PUT Handler - Update Project by ID
 *
 * Updates a project's information (name, domain, description, isActive).
 * API key cannot be updated through this endpoint.
 *
 * Request Body (all optional):
 * - name: Project name
 * - domain: Project domain/URL
 * - description: Project description
 * - isActive: Whether project is active
 *
 * @param {Request} request - The incoming HTTP request with JSON body
 * @param {Object} context - Route context containing the project ID
 * @returns {NextResponse} JSON response with updated project or error
 *
 * Status Codes:
 * - 200: Successfully updated
 * - 404: Project not found
 * - 400: Validation error
 * - 500: Database/server error
 */
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const { name, domain, description, isActive, regenerateApiKey } = body;

    // Check if project exists and verify ownership
    const existingProject = await prisma.project.findUnique({
      where: { id: id },
    });

    if (!existingProject) {
      return withCORS(
        NextResponse.json({ error: "Project not found" }, { status: 404 })
      );
    }

    // Verify project belongs to authenticated user
    if (existingProject.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build update data object (only include provided fields)
    const updateData: {
      name?: string;
      domain?: string;
      description?: string | null;
      isActive?: boolean;
      apiKey?: string;
    } = {};

    if (name !== undefined) updateData.name = name.trim();
    if (domain !== undefined) updateData.domain = domain.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle API key regeneration
    if (regenerateApiKey === true) {
      updateData.apiKey = generateApiKey();
    }

    // If no fields to update, return existing project
    if (Object.keys(updateData).length === 0) {
      const project = await prisma.project.findUnique({
        where: { id: id },
        include: {
          _count: {
            select: {
              feedbacks: true,
            },
          },
        },
      });
      return withCORS(NextResponse.json(project, { status: 200 }));
    }

    // Update project
    const project = await prisma.project.update({
      where: { id: id },
      data: updateData,
      include: {
        _count: {
          select: {
            feedbacks: true, // Include count of feedback entries
          },
        },
      },
    });

    return withCORS(NextResponse.json(project, { status: 200 })); // 200 = OK
  } catch (error) {
    // Catch any database errors
    console.error("Error updating project:", error);
    return withCORS(
      NextResponse.json({ error: "Failed to update project" }, { status: 500 })
    );
  }
}

/**
 * DELETE Handler - Delete Project by ID
 *
 * Deletes a project from the database. This will also delete all associated feedback entries
 * due to the cascade relationship (or set them to null if projectId is nullable).
 *
 * Note: In production, you might want to implement soft delete (set isActive to false)
 * instead of hard delete to preserve data.
 *
 * @param {Request} request - The incoming HTTP request
 * @param {Object} context - Route context containing the project ID
 * @returns {NextResponse} JSON response confirming deletion or error
 *
 * Status Codes:
 * - 200: Successfully deleted
 * - 404: Project not found
 * - 500: Database/server error
 */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    // Check if project exists and verify ownership
    const existingProject = await prisma.project.findUnique({
      where: { id: id },
    });

    if (!existingProject) {
      return withCORS(
        NextResponse.json({ error: "Project not found" }, { status: 404 })
      );
    }

    // Verify project belongs to authenticated user
    if (existingProject.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete project (this will set projectId to null for associated feedback due to optional relation)
    await prisma.project.delete({
      where: { id: id },
    });

    return withCORS(
      NextResponse.json(
        { message: "Project deleted successfully" },
        { status: 200 }
      )
    ); // 200 = OK
  } catch (error) {
    // Catch any database errors
    console.error("Error deleting project:", error);
    return withCORS(
      NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
    );
  }
}
