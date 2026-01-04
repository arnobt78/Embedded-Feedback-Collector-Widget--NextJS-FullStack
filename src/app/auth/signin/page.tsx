/**
 * Sign In Page
 *
 * Authentication page for user sign-in.
 * Displays email/password form with test credentials dropdown and OAuth options.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthForm, type AuthFormData } from "@/components/auth/auth-form";
import { toast } from "sonner";
import Link from "next/link";
import Widget from "@/components/Widget";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle email/password sign-in
   */
  const handleSignIn = async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        toast.error("Sign in failed. Please check your credentials.");
      } else {
        // Extract username from email for welcome message
        const emailUsername = data.email.split("@")[0];
        const capitalizedUsername =
          emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
        toast.success(`Welcome back, ${capitalizedUsername}! 👋`, {
          description: "You've been signed in successfully",
        });
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      toast.error("Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle OAuth sign-in
   */
  const handleOAuthSignIn = async (provider: "google") => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (err) {
      toast.error(`Sign in with ${provider} failed. Please try again.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.12),transparent_65%)]">
      {/* Background overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05),transparent_60%)]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <article className="group rounded-[28px] border border-sky-400/30 bg-gradient-to-br from-sky-500/25 via-sky-500/10 to-sky-500/5 p-8 shadow-[0_30px_80px_rgba(2,132,199,0.35)] backdrop-blur-sm transition hover:border-sky-300/50">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold text-white">Welcome Back</h1>
            <p className="mt-2 text-sm text-white/70">
              Sign in to your account to continue
            </p>
          </div>

          {/* Auth Form */}
          <AuthForm
            isSignIn={true}
            onSubmit={handleSignIn}
            isLoading={isLoading}
            error={error}
            onOAuthSignIn={handleOAuthSignIn}
          />

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm text-white/70">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-sky-400 hover:text-sky-300 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </article>
      </div>

      {/* Feedback Widget Demo - Bottom Right */}
      <Widget />
    </div>
  );
}
