/**
 * useProjects Hook
 * 
 * React Query hook for fetching and managing projects.
 * Provides queries and mutations for project operations.
 * 
 * Features:
 * - Infinite cache (data cached until invalidated)
 * - Automatic refetch on mutations
 * - Type-safe API calls
 * - Error handling
 * 
 * Usage:
 * ```tsx
 * const { data: projects, isLoading } = useProjects();
 * ```
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Project, CreateProjectInput, UpdateProjectInput } from "@/types";

/**
 * Fetch all projects from the API.
 * 
 * @returns {Promise<Project[]>} Array of projects
 */
async function fetchProjects(): Promise<Project[]> {
  const response = await fetch("/api/projects");
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  return response.json();
}

/**
 * Fetch a single project by ID.
 * 
 * @param {string} id - Project ID
 * @returns {Promise<Project>} Project data
 */
async function fetchProject(id: string): Promise<Project> {
  const response = await fetch(`/api/projects/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch project");
  }
  return response.json();
}

/**
 * Create a new project.
 * 
 * @param {CreateProjectInput} data - Project data
 * @returns {Promise<Project>} Created project
 */
async function createProject(data: CreateProjectInput): Promise<Project> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create project");
  }
  return response.json();
}

/**
 * Update an existing project.
 * 
 * @param {string} id - Project ID
 * @param {UpdateProjectInput} data - Updated project data
 * @returns {Promise<Project>} Updated project
 */
async function updateProject(
  id: string,
  data: UpdateProjectInput
): Promise<Project> {
  const response = await fetch(`/api/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update project");
  }
  return response.json();
}

/**
 * Delete a project.
 * 
 * @param {string} id - Project ID
 * @returns {Promise<void>}
 */
async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete project");
  }
}

/**
 * React Query Keys
 * 
 * Centralized query keys for consistent cache management.
 */
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: () => [...projectKeys.lists()] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

/**
 * useProjects Hook
 * 
 * Fetches all projects.
 * 
 * @returns {UseQueryResult<Project[]>} React Query result
 */
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: fetchProjects,
    staleTime: Infinity, // Use cache until invalidated
    gcTime: Infinity, // Keep in cache indefinitely
  });
}

/**
 * useProject Hook
 * 
 * Fetches a single project by ID.
 * 
 * @param {string} id - Project ID
 * @returns {UseQueryResult<Project>} React Query result
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetchProject(id),
    enabled: !!id, // Only fetch if ID is provided
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/**
 * useCreateProject Hook
 * 
 * Mutation hook for creating a new project.
 * 
 * @returns {UseMutationResult} React Query mutation result
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create project");
    },
  });
}

/**
 * useUpdateProject Hook
 * 
 * Mutation hook for updating a project.
 * 
 * @returns {UseMutationResult} React Query mutation result
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectInput }) =>
      updateProject(id, data),
    onSuccess: (data) => {
      // Invalidate projects list and specific project
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.id) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update project");
    },
  });
}

/**
 * useDeleteProject Hook
 * 
 * Mutation hook for deleting a project.
 * 
 * @returns {UseMutationResult} React Query mutation result
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete project");
    },
  });
}

