/**
 * Dashboard Overview Page
 *
 * Main dashboard overview page showing summary statistics and quick actions.
 *
 * This page displays:
 * - Total feedback count
 * - Active projects count
 * - Average rating
 * - Recent feedback (last 7 days)
 * - Quick action cards
 */

"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { useAnalytics } from "@/hooks/use-analytics";
import { useProjects } from "@/hooks/use-projects";
import { MessageSquare, FolderKanban, Star, TrendingUp, Calendar, Award, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Dashboard Overview Page
 *
 * Displays real-time statistics and quick actions.
 *
 * @returns {JSX.Element} Dashboard overview page
 */
export default function DashboardPage() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  const isLoading = analyticsLoading || projectsLoading;
  const activeProjectsCount = projects?.filter((p) => p.isActive).length ?? 0;
  
  // Calculate high ratings (4-5 stars) from rating distribution
  const highRatingsCount = analytics?.ratingDistribution
    ?.filter((item) => item.rating >= 4)
    .reduce((sum, item) => sum + item.count, 0) ?? 0;

  return (
    <DashboardLayout
      title="Dashboard"
      description="View and manage feedback from all your projects"
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Feedback"
            value={analytics?.totalFeedback ?? 0}
            description="All time feedback submissions"
            icon={MessageSquare}
            isLoading={isLoading}
            colorVariant="sky"
          />
          <StatCard
            title="Active Projects"
            value={activeProjectsCount}
            description="Currently active projects"
            icon={FolderKanban}
            isLoading={isLoading}
            colorVariant="emerald"
          />
          <StatCard
            title="Average Rating"
            value={analytics?.averageRating.toFixed(1) ?? "0.0"}
            description="Average feedback rating"
            icon={Star}
            isLoading={isLoading}
            colorVariant="amber"
          />
          <StatCard
            title="Recent Feedback"
            value={analytics?.recent7Days ?? 0}
            description="Last 7 days"
            icon={TrendingUp}
            isLoading={isLoading}
            colorVariant="violet"
          />
        </div>

        {/* Additional Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Last 30 Days"
            value={analytics?.recent30Days ?? 0}
            description="Feedback in the last month"
            icon={Calendar}
            isLoading={isLoading}
            colorVariant="blue"
          />
          <StatCard
            title="Rated Feedback"
            value={analytics?.ratedFeedbackCount ?? 0}
            description="Feedback with star ratings"
            icon={Star}
            isLoading={isLoading}
            colorVariant="rose"
          />
          <StatCard
            title="High Ratings"
            value={highRatingsCount}
            description="4-5 star feedback"
            icon={Award}
            isLoading={isLoading}
            colorVariant="amber"
          />
          <StatCard
            title="Satisfaction Rate"
            value={
              analytics?.ratedFeedbackCount && analytics.ratedFeedbackCount > 0
                ? `${Math.round((highRatingsCount / analytics.ratedFeedbackCount) * 100)}%`
                : "0%"
            }
            description="Percentage of 4-5 star ratings"
            icon={ThumbsUp}
            isLoading={isLoading}
            colorVariant="emerald"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with your feedback management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/dashboard/projects">
                <Button variant="outline" className="w-full justify-start">
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Manage Projects
                </Button>
              </Link>
              <Link href="/dashboard/feedback">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View Feedback
                </Button>
              </Link>
              <Link href="/dashboard/business-insights">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
