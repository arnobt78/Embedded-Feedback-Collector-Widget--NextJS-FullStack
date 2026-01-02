/**
 * Header Component
 *
 * Reusable header component for the dashboard.
 * Provides page title, mobile menu trigger, and action buttons.
 *
 * Features:
 * - Responsive design
 * - Mobile menu trigger
 * - Page title display
 * - Action buttons slot for custom actions
 *
 * Usage:
 * Place this component at the top of dashboard pages.
 */

"use client";

import { ReactNode } from "react";
import { MobileSidebar } from "./sidebar";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * Header Component
 *
 * Dashboard header with title, description, and optional actions.
 *
 * @param {HeaderProps} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.description - Optional page description
 * @param {ReactNode} props.actions - Optional action buttons/content
 * @returns {JSX.Element} Header component
 */
export function Header({ title, description, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 w-full border-b border-white/10 bg-background/85 backdrop-blur-2xl shadow-[0_10px_30px_rgba(15,23,42,0.25)]">
      <div className="container flex flex-col sm:flex-row sm:h-16 sm:items-center gap-4 px-4 md:px-6 py-4 sm:py-0">
        {/* Mobile Menu and Title Row */}
        <div className="flex items-center gap-2 sm:flex-1 sm:w-auto">
          {/* Mobile Menu */}
          <MobileSidebar />

          <Separator orientation="vertical" className="hidden md:block h-6" />

          {/* Title and Description */}
          <div className="flex-1 w-auto sm:w-auto">
            <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground hidden md:block">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 w-full sm:w-auto pl-10 sm:pl-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
