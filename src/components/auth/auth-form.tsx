/**
 * AuthForm Component
 *
 * Reusable authentication form component with email/password fields,
 * test credentials dropdown (for development), and OAuth buttons.
 *
 * Features:
 * - Email/password authentication
 * - Test credentials dropdown (sign-in only)
 * - OAuth providers (Google)
 * - Form validation with Zod
 * - Loading states
 * - Error handling
 *
 * Usage:
 * ```tsx
 * <AuthForm isSignIn={true} onSubmit={handleSignIn} />
 * ```
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

/**
 * Form validation schema
 */
const authSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

export type AuthFormData = z.infer<typeof authSchema>;

/**
 * Test account credentials for development/testing
 */
const testAccounts = {
  "guest-user": {
    email: "test@user.com",
    password: "12345678",
  },
};

interface AuthFormProps {
  /**
   * Whether this is a sign-in form (true) or sign-up form (false)
   */
  isSignIn: boolean;
  /**
   * Form submission handler
   */
  onSubmit: (data: AuthFormData) => Promise<void>;
  /**
   * Loading state
   */
  isLoading?: boolean;
  /**
   * Error message to display
   */
  error?: string | null;
  /**
   * OAuth sign-in handler (for Google, GitHub, etc.)
   */
  onOAuthSignIn?: (provider: "google") => void;
}

/**
 * AuthForm Component
 *
 * @param {AuthFormProps} props - Component props
 * @returns {JSX.Element} Authentication form component
 */
export function AuthForm({
  isSignIn,
  onSubmit,
  isLoading = false,
  error,
  onOAuthSignIn,
}: AuthFormProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  /**
   * Handle test account selection
   */
  const handleRoleSelect = (value: string) => {
    if (value === "clear") {
      setSelectedRole("");
      setValue("email", "");
      setValue("password", "");
    } else {
      setSelectedRole(value);
      const account = testAccounts[value as keyof typeof testAccounts];
      if (account) {
        setValue("email", account.email);
        setValue("password", account.password);
      }
    }
  };

  const handleFormSubmit = async (data: AuthFormData) => {
    await onSubmit(data);
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Test Account Dropdown (Sign-in only) */}
        {isSignIn && (
          <div className="space-y-2">
            <Label className="text-white/90">Test Accounts To Login With</Label>
            <Select
              key={`select-${selectedRole || "empty"}`}
              value={selectedRole || undefined}
              onValueChange={handleRoleSelect}
            >
              <SelectTrigger className="border-white/20 bg-white/5 backdrop-blur-sm text-white">
                <SelectValue placeholder="Select Role Based Test Account" />
              </SelectTrigger>
              <SelectContent className="border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-white/5 backdrop-blur-sm">
                <SelectItem
                  value="guest-user"
                  className="cursor-pointer text-white focus:bg-white/10 focus:text-white"
                >
                  Guest User
                </SelectItem>
                {selectedRole && (
                  <SelectItem
                    value="clear"
                    className="cursor-pointer text-white/80 opacity-90 focus:bg-white/10 focus:text-white"
                  >
                    Clear Selection
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Name Field (Sign-up only) */}
        {!isSignIn && (
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/90">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register("name")}
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/90">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/90">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            aria-invalid={errors.password ? "true" : "false"}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          variant="default"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isSignIn ? "Signing in..." : "Creating account..."}
            </>
          ) : isSignIn ? (
            "Sign In"
          ) : (
            "Sign Up"
          )}
        </Button>
      </form>

      {/* OAuth Section */}
      {onOAuthSignIn && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-white/60">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:text-white"
            onClick={() => onOAuthSignIn("google")}
            disabled={isLoading}
          >
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </>
      )}
    </div>
  );
}
