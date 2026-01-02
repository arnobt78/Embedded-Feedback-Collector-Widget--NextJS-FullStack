/**
 * Sidebar Component
 *
 * Reusable sidebar navigation component for the dashboard.
 * Provides navigation links, mobile menu support, and active route highlighting.
 *
 * Features:
 * - Responsive design (collapsible on mobile using Sheet)
 * - Active route highlighting
 * - Navigation menu items
 * - Logo/home link
 *
 * Usage:
 * Wrap dashboard pages with SidebarProvider and use this component.
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  BarChart3,
  Menu,
  Home,
  LogOut,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Navigation items configuration
 *
 * Defines the main navigation links for the dashboard.
 */
const navItems: NavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    href: "/dashboard/projects",
    icon: FolderKanban,
  },
  {
    title: "Feedback",
    href: "/dashboard/feedback",
    icon: MessageSquare,
  },
  {
    title: "Analytics",
    href: "/dashboard/business-insights",
    icon: BarChart3,
  },
];

/**
 * SidebarContent Component
 *
 * Renders the sidebar navigation content.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.mobile - Whether this is the mobile version
 * @returns {JSX.Element} Sidebar content
 */
function SidebarContent({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/auth/signin");
    router.refresh();
  };

  return (
    <div className={cn("flex flex-col h-full", mobile && "overflow-y-auto")}>
      {/* Logo/Home Link */}
      <div className="flex items-center gap-2 p-4 border-b border-white/10 min-h-[4rem]">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-white hover:opacity-80 transition-opacity"
        >
          <Home className="h-5 w-5" />
          <span>Feedback Widget</span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className={cn("flex-1 p-4 space-y-1", mobile && "pb-4")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2",
                  isActive && "bg-secondary"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Logout Button */}
      <div className={cn("p-4 space-y-2", mobile && "pb-4")}>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-white/80 hover:text-white hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </Button>
        <div className="text-sm text-white/60">Dashboard v1.0.0</div>
      </div>
    </div>
  );
}

/**
 * Sidebar Component (Desktop)
 *
 * Desktop sidebar that's always visible.
 *
 * @returns {JSX.Element} Desktop sidebar
 */
export function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-white/10 md:bg-background/50 md:backdrop-blur-xl">
      <SidebarContent />
    </aside>
  );
}

/**
 * MobileSidebar Component
 *
 * Mobile sidebar that uses Sheet component for overlay menu.
 *
 * @returns {JSX.Element} Mobile sidebar with Sheet
 */
export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Main navigation menu for dashboard pages
        </SheetDescription>
        <SidebarContent mobile />
      </SheetContent>
    </Sheet>
  );
}
