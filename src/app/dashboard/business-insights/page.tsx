/**
 * Business Insights Page
 *
 * Page for viewing business insights and statistics.
 * Displays charts and graphs showing feedback trends.
 *
 * Features:
 * - Rating distribution chart
 * - Feedback by project chart
 * - Recent feedback trends
 * - Key statistics
 *
 * Note: Renamed from 'analytics' to avoid browser extension blocking
 */

"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useAnalytics } from "@/hooks/use-analytics";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartContainer } from "@/components/dashboard/chart-container";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { BarChart3, TrendingUp, MessageSquare, Star } from "lucide-react";

/**
 * Color palette for charts
 */
const CHART_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
  "#ff8042",
];

/**
 * Business Insights Page
 *
 * @returns {JSX.Element} Business insights page
 */
export default function BusinessInsightsPage() {
  const { data: analytics, isLoading } = useAnalytics();

  // Prepare data for rating distribution chart
  const ratingData =
    analytics?.ratingDistribution.map((item) => ({
      rating: `${item.rating} ⭐`,
      count: item.count,
    })) ?? [];

  // Prepare data for feedback by project chart (create mutable copy to avoid read-only errors)
  const projectData = analytics?.feedbackByProject
    ? [...analytics.feedbackByProject]
    : [];

  return (
    <DashboardLayout
      title="Business Insights"
      description="View business insights and statistics for your feedback"
    >
      <div className="space-y-6">
        {/* Key Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Feedback"
            value={analytics?.totalFeedback ?? 0}
            description="All time feedback submissions"
            icon={MessageSquare}
            isLoading={isLoading}
            colorVariant="sky"
          />
          <StatCard
            title="Average Rating"
            value={analytics?.averageRating.toFixed(1) ?? "0.0"}
            description={`Based on ${
              analytics?.ratedFeedbackCount ?? 0
            } ratings`}
            icon={Star}
            isLoading={isLoading}
            colorVariant="amber"
          />
          <StatCard
            title="Last 7 Days"
            value={analytics?.recent7Days ?? 0}
            description="Recent feedback submissions"
            icon={TrendingUp}
            isLoading={isLoading}
            colorVariant="emerald"
          />
          <StatCard
            title="Last 30 Days"
            value={analytics?.recent30Days ?? 0}
            description="Recent feedback submissions"
            icon={BarChart3}
            isLoading={isLoading}
            colorVariant="violet"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Rating Distribution Chart */}
          <ChartContainer
            title="Rating Distribution"
            description="Distribution of feedback ratings (1-5 stars)"
            isLoading={isLoading}
            isEmpty={ratingData.length === 0}
            emptyMessage="No rating data available"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Feedback Count" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Feedback by Project Chart */}
          <ChartContainer
            title="Feedback by Project"
            description="Distribution of feedback across projects"
            isLoading={isLoading}
            isEmpty={projectData.length === 0}
            emptyMessage="No project data available"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectData}
                  dataKey="count"
                  nameKey="projectName"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {projectData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Additional Analytics Charts */}
        {projectData.length > 0 && (
          <ChartContainer
            title="Feedback by Project (Bar Chart)"
            description="Compare feedback counts across projects"
            isLoading={isLoading}
            isEmpty={projectData.length === 0}
            emptyMessage="No project data available"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[...projectData].sort((a, b) => b.count - a.count)}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="projectName"
                  type="category"
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Feedback Count" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}

        {/* Rating Trend Area Chart */}
        {ratingData.length > 0 && (
          <ChartContainer
            title="Rating Distribution (Area Chart)"
            description="Visual representation of rating distribution"
            isLoading={isLoading}
            isEmpty={ratingData.length === 0}
            emptyMessage="No rating data available"
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="Feedback Count"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </DashboardLayout>
  );
}
