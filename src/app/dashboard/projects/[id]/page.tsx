/**
 * Project Detail/Edit Page
 *
 * Page for viewing and editing a project.
 * Uses the reusable ProjectForm component for editing.
 */

"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProjectForm } from "@/components/dashboard/project-form";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { UpdateProjectInput } from "@/types";
import { useState } from "react";

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Project Detail Page
 *
 * @param {ProjectDetailPageProps} props - Component props
 * @returns {JSX.Element} Project detail page
 */
export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: project, isLoading } = useProject(id);
  const updateProject = useUpdateProject();
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (data: UpdateProjectInput) => {
    const updatedProject = await updateProject.mutateAsync({ id, data });
    toast.success(`Project "${updatedProject.name}" updated successfully`);
    router.push("/dashboard/projects");
  };

  const handleCopyApiKey = async () => {
    if (project?.apiKey) {
      try {
        await navigator.clipboard.writeText(project.apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Show checkmark for 2 seconds
        toast.success("API key copied to clipboard");
      } catch {
        toast.error("Failed to copy API key");
      }
    }
  };

  const handleRegenerateApiKey = async () => {
    if (
      !confirm(
        "Are you sure you want to regenerate the API key? The old key will no longer work."
      )
    ) {
      return;
    }

    await updateProject.mutateAsync({
      id,
      data: {
        name: project!.name,
        domain: project!.domain,
        description: project!.description ?? "",
        isActive: project!.isActive,
        regenerateApiKey: true,
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="Project Details"
        description="Loading project details..."
      >
        <div className="max-w-2xl space-y-4">
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout
        title="Project Not Found"
        description="The project you're looking for doesn't exist"
      >
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Project not found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/dashboard/projects")}
            >
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const maskedApiKey = `${project.apiKey.substring(
    0,
    8
  )}...${project.apiKey.substring(project.apiKey.length - 4)}`;

  return (
    <DashboardLayout
      title="Edit Project"
      description="Update project details and settings"
    >
      <div className="max-w-7xl mx-auto space-y-4">
        {/* API Key Card */}
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2 text-white">API Key</h3>
                <p className="text-sm text-white/70 mb-3">
                  Use this API key to authenticate feedback submissions from
                  your project.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <code className="w-full sm:flex-1 px-3 py-2 border border-white/10 bg-gradient-to-r from-white/5 via-white/5 to-white/5 backdrop-blur-sm rounded-xl text-sm font-mono text-white shadow-lg break-all">
                    {showApiKey ? project.apiKey : maskedApiKey}
                  </code>
                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="flex-shrink-0"
                    >
                      {showApiKey ? "Hide" : "Show"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyApiKey}
                      className="flex-shrink-0"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateApiKey}
                  disabled={updateProject.isPending}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate API Key
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Form */}
        <ProjectForm
          onSubmit={handleSubmit}
          defaultValues={project}
          isLoading={updateProject.isPending}
          submitLabel="Update Project"
        />
      </div>
    </DashboardLayout>
  );
}
