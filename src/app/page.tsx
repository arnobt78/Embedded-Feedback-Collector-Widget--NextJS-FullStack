/**
 * Home Page Component
 *
 * The main landing page of the application.
 * Redirects to sign-in page for authentication.
 *
 * This is a Server Component that redirects unauthenticated users to the sign-in page.
 */

import { redirect } from "next/navigation";

/**
 * Home Page
 *
 * Redirects to the sign-in page.
 * Authenticated users will be redirected to dashboard by middleware.
 *
 * @returns {never} Always redirects
 */
export default function Home() {
  redirect("/auth/signin");
}
