/**
 * FeedbackTableFilters Component
 *
 * Reusable filter component for the feedback table.
 * Provides filtering by project, rating, and date range.
 *
 * Features:
 * - Project filter dropdown
 * - Rating filter
 * - Search by message
 * - Column visibility toggle
 *
 * Usage:
 * ```tsx
 * <FeedbackTableFilters
 *   projects={projects}
 *   onProjectChange={setProjectFilter}
 *   onRatingChange={setRatingFilter}
 *   onSearchChange={setSearchQuery}
 * />
 * ```
 */

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, X } from "lucide-react";

interface ProjectOption {
  id: string;
  name: string;
}

interface FeedbackTableFiltersProps {
  projects?: ProjectOption[];
  selectedProjectId?: string | null;
  selectedRating?: number | null;
  searchQuery?: string;
  onProjectChange?: (projectId: string | null) => void;
  onRatingChange?: (rating: number | null) => void;
  onSearchChange?: (query: string) => void;
  onClearFilters?: () => void;
}

/**
 * FeedbackTableFilters Component
 *
 * @param {FeedbackTableFiltersProps} props - Component props
 * @returns {JSX.Element} Filters component
 */
export function FeedbackTableFilters({
  projects = [],
  selectedProjectId,
  selectedRating,
  searchQuery = "",
  onProjectChange,
  onRatingChange,
  onSearchChange,
  onClearFilters,
}: FeedbackTableFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = selectedProjectId || selectedRating || searchQuery;

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      {/* Search Input and Filter Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 sm:flex-initial">
        <Input
          placeholder="Search by message..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full sm:flex-1 sm:max-w-sm bg-white/5 backdrop-blur-sm border-white/20 text-white placeholder:text-white/40 focus-visible:border-sky-400 focus-visible:ring-sky-500/50 shadow-[0_10px_30px_rgba(2,132,199,0.15)]"
        />
        {/* Filter Dropdown */}
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm shadow-[0_10px_30px_rgba(139,92,246,0.15)]"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-popover/50 backdrop-blur-sm border-white/10 text-white"
          >
            <DropdownMenuLabel className="text-white/80">
              Filter by Project
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuCheckboxItem
              checked={!selectedProjectId}
              onCheckedChange={(checked) => {
                if (checked) onProjectChange?.(null);
              }}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              All Projects
            </DropdownMenuCheckboxItem>
            {projects.map((project) => (
              <DropdownMenuCheckboxItem
                key={project.id}
                checked={selectedProjectId === project.id}
                onCheckedChange={(checked) => {
                  onProjectChange?.(checked ? project.id : null);
                }}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                {project.name}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuLabel className="text-white/80">
              Filter by Rating
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuCheckboxItem
              checked={!selectedRating}
              onCheckedChange={(checked) => {
                if (checked) onRatingChange?.(null);
              }}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              All Ratings
            </DropdownMenuCheckboxItem>
            {[5, 4, 3, 2, 1].map((rating) => (
              <DropdownMenuCheckboxItem
                key={rating}
                checked={selectedRating === rating}
                onCheckedChange={(checked) => {
                  onRatingChange?.(checked ? rating : null);
                }}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                {rating} ⭐
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {selectedProject && (
            <div className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-sky-400/30 bg-gradient-to-r from-sky-500/25 via-sky-500/10 to-sky-500/5 text-white rounded-md backdrop-blur-sm shadow-[0_10px_30px_rgba(2,132,199,0.2)]">
              Project: {selectedProject.name}
              <button
                onClick={() => onProjectChange?.(null)}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {selectedRating && (
            <div className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-amber-400/30 bg-gradient-to-r from-amber-500/25 via-amber-500/10 to-amber-500/5 text-white rounded-md backdrop-blur-sm shadow-[0_10px_30px_rgba(245,158,11,0.2)]">
              Rating: {selectedRating} ⭐
              <button
                onClick={() => onRatingChange?.(null)}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {searchQuery && (
            <div className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-violet-400/30 bg-gradient-to-r from-violet-500/25 via-violet-500/10 to-violet-500/5 text-white rounded-md backdrop-blur-sm shadow-[0_10px_30px_rgba(139,92,246,0.2)]">
              Search: &quot;{searchQuery}&quot;
              <button
                onClick={() => onSearchChange?.("")}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {onClearFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-7"
            >
              Clear All
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
