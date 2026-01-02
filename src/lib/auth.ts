/**
 * NextAuth Configuration and Auth Helper
 *
 * Centralized authentication configuration and exports.
 * This file is separate from the route handler to allow importing `auth` in other files.
 */

import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * NextAuth Configuration
 *
 * Defines authentication providers and callbacks.
 */
const authConfig: NextAuthConfig = {
  // Note: Adapter is not needed when using JWT strategy with credentials provider
  // PrismaAdapter is only needed for database sessions (OAuth providers)
  // For JWT sessions with credentials, we don't use the adapter
  trustHost: true, // Required for NextAuth v5 in development
  providers: [
    // Credentials Provider (Email/Password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        // Return user object (will be stored in session)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        // Extend session user with id property from token
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
};

/**
 * NextAuth Handler
 *
 * Creates the NextAuth handler with the configuration.
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

