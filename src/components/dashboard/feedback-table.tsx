/**
 * FeedbackTable Component
 * 
 * Reusable data table component for displaying feedback entries.
 * Uses TanStack React Table for advanced table features.
 * 
 * Features:
 * - Sorting by columns
 * - Column visibility toggle
 * - Responsive design
 * - Type-safe data
 * 
 * Usage:
 * ```tsx
 * <FeedbackTable data={feedbackData} />
 * ```
 */

"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Feedback } from "@/types";
import { format } from "date-fns";
import { ChevronUp, ChevronDown, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FeedbackTableFilters } from "./feedback-table-filters";
import { downloadCSV } from "@/lib/export-utils";
import { Download } from "lucide-react";
import { toast } from "sonner";

/**
 * Table column definitions for feedback data
 */
const columns: ColumnDef<Feedback>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Date
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div className="font-medium">{format(date, "PPp")}</div>;
    },
  },
  {
    accessorKey: "project.name",
    header: "Project",
    cell: ({ row }) => {
      const project = row.original.project;
      return (
        <div className="font-medium">{project?.name ?? "No Project"}</div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string | null;
      return <div>{name ?? "-"}</div>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string | null;
      return <div>{email ?? "-"}</div>;
    },
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => {
      const message = row.getValue("message") as string;
      const id = row.original.id;
      return (
        <Link
          href={`/dashboard/feedback/${id}`}
          className="max-w-md truncate text-primary hover:underline block"
          title={message}
        >
          {message}
        </Link>
      );
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Rating
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number | null;
      return (
        <div className="font-medium">{rating ? `${rating}/5 ⭐` : "-"}</div>
      );
    },
  },
];

interface FeedbackTableProps {
  data: Feedback[];
  isLoading?: boolean;
  projects?: Array<{ id: string; name: string }>;
  onProjectFilter?: (projectId: string | null) => void;
  onRatingFilter?: (rating: number | null) => void;
}

/**
 * FeedbackTable Component
 * 
 * Displays feedback data in a sortable, filterable table.
 * 
 * @param {FeedbackTableProps} props - Component props
 * @param {Feedback[]} props.data - Array of feedback entries
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element} Feedback table component
 */
export function FeedbackTable({
  data,
  isLoading,
  projects = [],
  onProjectFilter,
  onRatingFilter,
}: FeedbackTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [selectedRating, setSelectedRating] = React.useState<number | null>(null);

  // Apply filters to data
  const filteredData = React.useMemo(() => {
    let filtered = data;

    // Filter by project
    if (selectedProjectId) {
      filtered = filtered.filter((item) => item.projectId === selectedProjectId);
    }

    // Filter by rating
    if (selectedRating) {
      filtered = filtered.filter((item) => item.rating === selectedRating);
    }

    // Filter by search query (message)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        item.message.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [data, selectedProjectId, selectedRating, searchQuery]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading feedback...</div>;
  }

  const handleProjectFilter = (projectId: string | null) => {
    setSelectedProjectId(projectId);
    onProjectFilter?.(projectId);
  };

  const handleRatingFilter = (rating: number | null) => {
    setSelectedRating(rating);
    onRatingFilter?.(rating);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedProjectId(null);
    setSelectedRating(null);
    onProjectFilter?.(null);
    onRatingFilter?.(null);
  };

  const handleExportCSV = () => {
    try {
      const exportData = filteredData.map((item) => ({
        Date: format(new Date(item.createdAt), "yyyy-MM-dd HH:mm:ss"),
        Project: item.project?.name ?? "No Project",
        Name: item.name ?? "",
        Email: item.email ?? "",
        Message: item.message,
        Rating: item.rating ? `${item.rating}/5` : "",
      }));

      const timestamp = new Date().toISOString().split("T")[0];
      downloadCSV(exportData, `feedback-export-${timestamp}`);
      toast.success(`Exported ${exportData.length} feedback entries to CSV`);
    } catch (error) {
      toast.error("Failed to export feedback data");
      console.error("Export error:", error);
    }
  };

  /**
   * Format column ID to human-readable name
   * Examples: "createdAt" -> "Created At", "project.name" -> "Project Name"
   */
  const formatColumnName = (columnId: string): string => {
    // Handle nested properties like "project.name"
    if (columnId.includes(".")) {
      return columnId
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    }
    // Handle camelCase like "createdAt"
    return columnId
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="space-y-4">
      {/* Filters and Column Visibility Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <FeedbackTableFilters
          projects={projects}
          selectedProjectId={selectedProjectId}
          selectedRating={selectedRating}
          searchQuery={searchQuery}
          onProjectChange={handleProjectFilter}
          onRatingChange={handleRatingFilter}
          onSearchChange={setSearchQuery}
          onClearFilters={handleClearFilters}
        />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="w-full sm:w-auto border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm shadow-[0_10px_30px_rgba(16,185,129,0.15)]"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline"
                className="w-full sm:w-auto border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm shadow-[0_10px_30px_rgba(139,92,246,0.15)]"
              >
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover/50 backdrop-blur-sm border-white/10 text-white">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                      className="text-white/80 hover:text-white hover:bg-white/10"
                    >
                      {formatColumnName(column.id)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[20px] border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-white/5 backdrop-blur-sm shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No feedback found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-muted-foreground break-words">
          Showing {table.getRowModel().rows.length} of {filteredData.length}{" "}
          entries
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="sm:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="hidden sm:flex"
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="hidden sm:flex"
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="sm:hidden"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

