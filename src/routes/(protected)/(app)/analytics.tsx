import { createFileRoute } from "@tanstack/react-router";

import { AnalyticsActivityChart } from "@/components/analytics/analytics-activity-chart";
import { AnalyticsAlluvialDiagram } from "@/components/analytics/analytics-alluvial-diagram";
import { AnalyticsDistributionChart } from "@/components/analytics/analytics-distribution-chart";
import { AnalyticsDotMatrix } from "@/components/analytics/analytics-dot-matrix";
import { AnalyticsFunnelChart } from "@/components/analytics/analytics-funnel-chart";
import { AnalyticsHeatmap } from "@/components/analytics/analytics-heatmap";
import { AnalyticsKpiCards } from "@/components/analytics/analytics-kpi-cards";
import { AnalyticsPriorityChart } from "@/components/analytics/analytics-priority-chart";
import { AnalyticsStatusChart } from "@/components/analytics/analytics-status-chart";
import { AnalyticsTimeline } from "@/components/analytics/analytics-timeline";
import { AnalyticsTrendChart } from "@/components/analytics/analytics-trend-chart";

export const Route = createFileRoute("/(protected)/(app)/analytics")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="font-semibold text-xl">Analytics</h1>
      <AnalyticsKpiCards />
      <div className="grid gap-6 md:grid-cols-2">
        <AnalyticsTrendChart />
        <AnalyticsStatusChart />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <AnalyticsPriorityChart />
        <AnalyticsDistributionChart />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <AnalyticsTimeline />
        <AnalyticsFunnelChart />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <AnalyticsHeatmap />
        <AnalyticsDotMatrix />
      </div>
      <AnalyticsAlluvialDiagram />
      <AnalyticsActivityChart />
    </div>
  );
}
