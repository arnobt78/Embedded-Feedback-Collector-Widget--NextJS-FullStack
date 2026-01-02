/**
 * ProjectForm Component
 *
 * Reusable form component for creating and editing projects.
 * Uses React Hook Form for form state management and validation.
 *
 * Features:
 * - Form validation with Zod
 * - Create and edit modes
 * - Loading states
 * - Error handling
 * - Type-safe form data
 *
 * Usage:
 * ```tsx
 * <ProjectForm onSubmit={handleSubmit} defaultValues={project} />
 * ```
 */

"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CreateProjectInput, UpdateProjectInput, Project } from "@/types";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Form validation schema
 */
const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  domain: z
    .string()
    .min(1, "Domain is required")
    .url("Please enter a valid URL (e.g., https://example.com)"),
  description: z
    .string()
    .max(500, "Description is too long")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  onSubmit: (
    data: CreateProjectInput | UpdateProjectInput
  ) => void | Promise<void>;
  defaultValues?: Partial<Project>;
  isLoading?: boolean;
  submitLabel?: string;
}

/**
 * ProjectForm Component
 *
 * @param {ProjectFormProps} props - Component props
 * @param {(data: CreateProjectInput | UpdateProjectInput) => void | Promise<void>} props.onSubmit - Form submission handler
 * @param {Partial<Project>} props.defaultValues - Default form values (for edit mode)
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.submitLabel - Submit button label
 * @returns {JSX.Element} Project form component
 */
export function ProjectForm({
  onSubmit,
  defaultValues,
  isLoading = false,
  submitLabel = "Create Project",
}: ProjectFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      domain: defaultValues?.domain ?? "",
      description: defaultValues?.description ?? undefined,
      isActive: defaultValues?.isActive ?? true,
    },
  });

  const handleFormSubmit = async (data: ProjectFormData) => {
    await onSubmit(data);
  };

  const handleCancel = () => {
    router.push("/dashboard/projects");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{defaultValues ? "Edit Project" : "New Project"}</CardTitle>
        <CardDescription>
          {defaultValues
            ? "Update project details"
            : "Create a new project to start collecting feedback"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Project Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="My Awesome Project"
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Domain */}
          <div className="space-y-2">
            <Label htmlFor="domain">
              Domain/URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="domain"
              type="url"
              {...register("domain")}
              placeholder="https://example.com"
              aria-invalid={errors.domain ? "true" : "false"}
            />
            {errors.domain && (
              <p className="text-sm text-destructive">
                {errors.domain.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of your project..."
              rows={3}
              aria-invalid={errors.description ? "true" : "false"}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <>
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 backdrop-blur-sm accent-sky-500 focus:ring-sky-500/50 focus:ring-2"
                  />
                  <Label
                    htmlFor="isActive"
                    className="cursor-pointer text-white"
                  >
                    Active (can receive feedback)
                  </Label>
                </>
              )}
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
