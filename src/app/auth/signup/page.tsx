/**
 * Sign Up Page
 *
 * Registration page for creating new user accounts.
 * Displays email/password registration form with OAuth options.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthForm, type AuthFormData } from "@/components/auth/auth-form";
import { toast } from "sonner";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle user registration
   */
  const handleSignUp = async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Register new user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Registration failed");
        toast.error(result.error || "Registration failed. Please try again.");
        return;
      }

      // Auto sign-in after successful registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Registration successful, but sign-in failed. Please sign in manually.");
        toast.success("Account created! Please sign in.");
        router.push("/auth/signin");
      } else {
        toast.success("Account created successfully");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle OAuth sign-up
   */
  const handleOAuthSignIn = async (provider: "google") => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (err) {
      toast.error(`Sign up with ${provider} failed. Please try again.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.12),transparent_65%)]">
      {/* Background overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05),transparent_60%)]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <article className="group rounded-[28px] border border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 via-emerald-500/10 to-emerald-500/5 p-8 shadow-[0_30px_80px_rgba(16,185,129,0.3)] backdrop-blur-sm transition hover:border-emerald-300/50">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold text-white">Create Account</h1>
            <p className="mt-2 text-sm text-white/70">
              Sign up to get started with your feedback dashboard
            </p>
          </div>

          {/* Auth Form */}
          <AuthForm
            isSignIn={false}
            onSubmit={handleSignUp}
            isLoading={isLoading}
            error={error}
            onOAuthSignIn={handleOAuthSignIn}
          />

          {/* Sign In Link */}
          <div className="mt-6 text-center text-sm text-white/70">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}

