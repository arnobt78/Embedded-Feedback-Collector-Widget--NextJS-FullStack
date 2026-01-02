/**
 * API Utility Functions
 * 
 * Shared utility functions for API route handlers.
 * Used across multiple API endpoints for common functionality.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Helper function to add CORS headers to responses
 * 
 * CORS (Cross-Origin Resource Sharing) allows the widget to be embedded
 * on different domains than where the API is hosted.
 * 
 * @param {NextResponse} response - The Next.js response object
 * @returns {NextResponse} Response with CORS headers added
 */
export function withCORS(response: NextResponse): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", "*"); // Allow all origins (for widget embedding)
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS"); // Allowed HTTP methods
  response.headers.set("Access-Control-Allow-Headers", "Content-Type,X-API-Key"); // Allowed request headers
  return response;
}

/**
 * Get project by API key from request headers
 * 
 * Extracts API key from X-API-Key header and finds the corresponding project.
 * Returns null if API key is not provided or project not found.
 * 
 * @param {Request} request - The incoming HTTP request
 * @returns {Promise<{ id: string; name: string; domain: string; apiKey: string; isActive: boolean } | null>} Project object or null
 */
export async function getProjectByApiKey(request: Request): Promise<{
  id: string;
  name: string;
  domain: string;
  apiKey: string;
  isActive: boolean;
} | null> {
  try {
    const apiKey = request.headers.get("X-API-Key");
    
    // If no API key provided, return null (backward compatibility - uses default project)
    if (!apiKey) {
      return null;
    }

    // Find project by API key
    const project = await prisma.project.findUnique({
      where: {
        apiKey: apiKey,
      },
      select: {
        id: true,
        name: true,
        domain: true,
        apiKey: true,
        isActive: true,
      },
    });

    return project;
  } catch (error) {
    console.error("Error fetching project by API key:", error);
    return null;
  }
}

/**
 * Get default project or create one if it doesn't exist
 * 
 * Used for backward compatibility when no API key is provided.
 * Returns the default project that all existing feedback entries use.
 * 
 * @returns {Promise<{ id: string }>} Default project with ID
 */
export async function getDefaultProject(): Promise<{ id: string }> {
  try {
    // Try to find existing default project
    let defaultProject = await prisma.project.findFirst({
      where: {
        name: "Default Project",
      },
      select: {
        id: true,
      },
    });

    // If no default project exists, create one
    if (!defaultProject) {
      // Generate a secure random API key for default project
      const { randomBytes } = await import("crypto");
      const apiKey = randomBytes(16).toString("hex");

      // Find first user to assign default project to (for backward compatibility)
      const firstUser = await prisma.user.findFirst({
        select: { id: true },
      });

      if (!firstUser) {
        throw new Error("No users found. Please create a user account first.");
      }

      defaultProject = await prisma.project.create({
        data: {
          userId: firstUser.id, // Assign to first user for backward compatibility
          name: "Default Project",
          domain: "https://localhost:3000",
          apiKey: apiKey,
          description: "Default project for existing feedback entries",
          isActive: true,
        },
        select: {
          id: true,
        },
      });
    }

    return defaultProject;
  } catch (error) {
    console.error("Error getting default project:", error);
    throw error;
  }
}

