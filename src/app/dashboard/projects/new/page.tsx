/**
 * New Project Page
 *
 * Page for creating a new project.
 * Uses the reusable ProjectForm component.
 */

"use client";

import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProjectForm } from "@/components/dashboard/project-form";
import { useCreateProject } from "@/hooks/use-projects";
import type { CreateProjectInput } from "@/types";
import { toast } from "sonner";

/**
 * New Project Page
 *
 * @returns {JSX.Element} New project page
 */
export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useCreateProject();

  const handleSubmit = async (data: CreateProjectInput) => {
    const project = await createProject.mutateAsync(data);
    toast.success(`Project "${project.name}" created successfully`);
    router.push("/dashboard/projects");
  };

  return (
    <DashboardLayout
      title="New Project"
      description="Create a new project to start collecting feedback"
    >
      <div className="max-w-7xl mx-auto">
        <ProjectForm
          onSubmit={handleSubmit}
          isLoading={createProject.isPending}
          submitLabel="Create Project"
        />
      </div>
    </DashboardLayout>
  );
}
