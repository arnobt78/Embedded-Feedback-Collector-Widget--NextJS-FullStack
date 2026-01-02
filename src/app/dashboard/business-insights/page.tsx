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
 * Tooltip content props type for Recharts
 */
interface TooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    payload?: {
      fill?: string;
    };
  }>;
  label?: string | number;
}

/**
 * Custom Tooltip Content for Rating Charts
 * Displays rating and count in a single line
 */
const RatingTooltipContent = ({
  active,
  payload,
  label,
}: TooltipContentProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div
        className="bg-black/80 border border-white/20 rounded-lg px-3 py-2 text-white text-sm whitespace-nowrap"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "8px",
          padding: "8px 12px",
          whiteSpace: "nowrap",
        }}
      >
        <span>
          {label} {data.name}: {data.value}
        </span>
      </div>
    );
  }
  return null;
};

/**
 * Custom Tooltip Content for Project Bar Chart
 * Displays project name and count in a single line
 */
const ProjectTooltipContent = ({
  active,
  payload,
  label,
}: TooltipContentProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div
        className="bg-black/80 border border-white/20 rounded-lg px-3 py-2 text-white text-sm whitespace-nowrap"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "8px",
          padding: "8px 12px",
          whiteSpace: "nowrap",
        }}
      >
        <span>
          {label} {data.name}: {data.value}
        </span>
      </div>
    );
  }
  return null;
};

/**
 * Custom Tooltip Content for Project Pie Chart
 * Displays project name and count in a single line with slice color
 */
const ProjectPieTooltipContent = ({ active, payload }: TooltipContentProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const sliceColor = data.payload?.fill || data.color || "#8884d8";
    return (
      <div
        className="border border-white/20 rounded-lg px-3 py-2 text-white text-sm whitespace-nowrap"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          border: `1px solid ${sliceColor}`,
          borderRadius: "8px",
          padding: "8px 12px",
          whiteSpace: "nowrap",
          boxShadow: `0 0 8px ${sliceColor}40`,
        }}
      >
        <span>
          {data.name}: {data.value}
        </span>
      </div>
    );
  }
  return null;
};

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
          <div className="overflow-x-auto">
            <ChartContainer
              title="Rating Distribution"
              description="Distribution of feedback ratings (1-5 stars)"
              isLoading={isLoading}
              isEmpty={ratingData.length === 0}
              emptyMessage="No rating data available"
            >
              <div className="min-w-[600px] md:min-w-0">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ratingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip content={<RatingTooltipContent />} />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Feedback Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
          </div>

          {/* Feedback by Project Chart */}
          <div className="overflow-x-auto">
            <ChartContainer
              title="Feedback by Project"
              description="Distribution of feedback across projects"
              isLoading={isLoading}
              isEmpty={projectData.length === 0}
              emptyMessage="No project data available"
            >
              <div className="min-w-[600px] md:min-w-0">
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
                    <Tooltip content={<ProjectPieTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
          </div>
        </div>

        {/* Additional Analytics Charts */}
        {projectData.length > 0 && (
          <div className="overflow-x-auto">
            <ChartContainer
              title="Feedback by Project (Bar Chart)"
              description="Compare feedback counts across projects"
              isLoading={isLoading}
              isEmpty={projectData.length === 0}
              emptyMessage="No project data available"
            >
              <div className="min-w-[600px] md:min-w-0">
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
                    <Tooltip content={<ProjectTooltipContent />} />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" name="Feedback Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
          </div>
        )}

        {/* Rating Trend Area Chart */}
        {ratingData.length > 0 && (
          <div className="overflow-x-auto">
            <ChartContainer
              title="Rating Distribution (Area Chart)"
              description="Visual representation of rating distribution"
              isLoading={isLoading}
              isEmpty={ratingData.length === 0}
              emptyMessage="No rating data available"
            >
              <div className="min-w-[600px] md:min-w-0">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={ratingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip content={<RatingTooltipContent />} />
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
              </div>
            </ChartContainer>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
