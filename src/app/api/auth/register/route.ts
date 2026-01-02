/**
 * Registration API Route
 *
 * Handles user registration with email/password.
 * Creates a new user account with hashed password.
 *
 * Route: POST /api/auth/register
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * POST Handler - Register New User
 *
 * Creates a new user account with email and password.
 * Passwords are hashed using bcrypt before storage.
 *
 * Request Body:
 * - email: User email (required, must be unique)
 * - password: User password (required, minimum 8 characters)
 * - name: User name (optional)
 *
 * @param {Request} request - The incoming HTTP request with JSON body
 * @returns {NextResponse} JSON response with created user or error
 *
 * Status Codes:
 * - 201: Successfully created
 * - 400: Validation error (missing fields, invalid email, weak password)
 * - 409: Email already exists
 * - 500: Database/server error
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validation: email and password are required
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validation: password minimum length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Validation: email format (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        name: name?.trim() || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}

