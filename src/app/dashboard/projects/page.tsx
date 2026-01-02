/**
 * Projects Management Page
 *
 * Page for managing projects (list, create, edit, delete).
 * Displays all projects in a table format with actions.
 *
 * Features:
 * - List all projects
 * - Create new project
 * - Edit existing project
 * - Delete project
 * - View project details
 * - Copy API key
 */

"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects, useDeleteProject } from "@/hooks/use-projects";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Copy,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FolderKanban,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

/**
 * Projects Management Page
 *
 * @returns {JSX.Element} Projects management page
 */
export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const deleteProject = useDeleteProject();
  const [visibleApiKeys, setVisibleApiKeys] = useState<Set<string>>(new Set());
  const [copiedApiKeys, setCopiedApiKeys] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  /**
   * Copy API key to clipboard
   */
  const handleCopyApiKey = async (apiKey: string, projectId: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedApiKeys((prev) => new Set(prev).add(projectId));
      setTimeout(() => {
        setCopiedApiKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(projectId);
          return newSet;
        });
      }, 2000); // Show checkmark for 2 seconds
      toast.success("API key copied to clipboard");
    } catch {
      toast.error("Failed to copy API key");
    }
  };

  /**
   * Toggle API key visibility
   */
  const toggleApiKeyVisibility = (projectId: string) => {
    const newVisible = new Set(visibleApiKeys);
    if (newVisible.has(projectId)) {
      newVisible.delete(projectId);
    } else {
      newVisible.add(projectId);
    }
    setVisibleApiKeys(newVisible);
  };

  /**
   * Open delete confirmation dialog
   */
  const openDeleteDialog = (projectId: string, projectName: string) => {
    setProjectToDelete({ id: projectId, name: projectName });
    setDeleteDialogOpen(true);
  };

  /**
   * Handle project deletion
   */
  const handleDelete = async () => {
    if (!projectToDelete) return;

    const projectName = projectToDelete.name;
    deleteProject.mutate(projectToDelete.id, {
      onSuccess: () => {
        toast.success(`Project "${projectName}" deleted successfully`);
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
      },
      onError: () => {
        toast.error("Failed to delete project");
      },
    });
  };

  return (
    <DashboardLayout
      title="Projects"
      description="Manage your connected projects and API keys"
      actions={
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Projects</CardTitle>
            <CardDescription>
              Manage projects that use the feedback widget
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                ))}
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => {
                  const isVisible = visibleApiKeys.has(project.id);
                  const maskedApiKey = `${project.apiKey.substring(
                    0,
                    8
                  )}...${project.apiKey.substring(project.apiKey.length - 4)}`;

                  return (
                    <div
                      key={project.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-white/10 rounded-[20px] bg-gradient-to-br from-white/5 via-white/5 to-white/5 backdrop-blur-sm hover:border-white/20 hover:from-white/10 hover:via-white/10 hover:to-white/10 transition-all"
                    >
                      <div className="flex-1 space-y-1 w-full sm:w-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                          <div className="flex items-center gap-2">
                            <FolderKanban className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <h3 className="font-semibold break-words">
                              {project.name}
                            </h3>
                            {project.isActive ? (
                              <span className="hidden sm:inline text-xs border border-emerald-400/30 bg-gradient-to-r from-emerald-500/25 via-emerald-500/10 to-emerald-500/5 text-white px-2 py-0.5 rounded-md backdrop-blur-sm shadow-[0_10px_30px_rgba(16,185,129,0.2)] w-fit flex-shrink-0">
                                Active
                              </span>
                            ) : (
                              <span className="hidden sm:inline text-xs border border-gray-400/30 bg-gradient-to-r from-gray-500/25 via-gray-500/10 to-gray-500/5 text-white/70 px-2 py-0.5 rounded-md backdrop-blur-sm shadow-[0_10px_30px_rgba(107,114,128,0.2)] w-fit flex-shrink-0">
                                Inactive
                              </span>
                            )}
                          </div>
                          {project.isActive ? (
                            <span className="sm:hidden text-xs border border-emerald-400/30 bg-gradient-to-r from-emerald-500/25 via-emerald-500/10 to-emerald-500/5 text-white px-2 py-0.5 rounded-md backdrop-blur-sm shadow-[0_10px_30px_rgba(16,185,129,0.2)] w-fit">
                              Active
                            </span>
                          ) : (
                            <span className="sm:hidden text-xs border border-gray-400/30 bg-gradient-to-r from-gray-500/25 via-gray-500/10 to-gray-500/5 text-white/70 px-2 py-0.5 rounded-md backdrop-blur-sm shadow-[0_10px_30px_rgba(107,114,128,0.2)] w-fit">
                              Inactive
                            </span>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-sm text-muted-foreground break-words">
                            {project.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground break-all">
                          {project.domain}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground break-all">
                            API Key: {isVisible ? project.apiKey : maskedApiKey}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => toggleApiKeyVisibility(project.id)}
                          >
                            {isVisible ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() =>
                              handleCopyApiKey(project.apiKey, project.id)
                            }
                          >
                            {copiedApiKeys.has(project.id) ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {project._count?.feedbacks ?? 0} feedback entries
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="w-full sm:w-auto"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            openDeleteDialog(project.id, project.name)
                          }
                          disabled={deleteProject.isPending}
                          className="w-full sm:w-auto"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first project to start collecting feedback
                </p>
                <Link href="/dashboard/projects/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{projectToDelete?.name}&rdquo;
              </span>{" "}
              and all associated feedback entries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteProject.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProject.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
