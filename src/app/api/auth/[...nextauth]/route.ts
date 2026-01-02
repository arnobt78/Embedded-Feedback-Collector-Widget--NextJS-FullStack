/**
 * NextAuth API Route Handler
 *
 * Handles all authentication requests (sign in, sign out, session management).
 * Uses NextAuth.js v5 (Auth.js) with Prisma adapter for database sessions.
 *
 * Providers:
 * - Credentials (Email/Password)
 * - Google OAuth
 *
 * Routes:
 * - /api/auth/signin - Sign in page
 * - /api/auth/signout - Sign out endpoint
 * - /api/auth/session - Get current session
 * - /api/auth/callback/google - Google OAuth callback
 */

import { handlers } from "@/lib/auth";

/**
 * GET and POST Handlers
 *
 * NextAuth handles all authentication routes via these handlers.
 */
export const { GET, POST } = handlers;
