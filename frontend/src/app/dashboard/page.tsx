"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAppSelector, useGetAdminDashboardMetricsQuery } from "@/store";
import { UserRole } from "@/types/api.types";
import {
  useGetTLDashboardMetricsQuery,
  useGetSEDashboardMetricsQuery,
} from "@/store";
import {
  Plus,
  Download,
  MoreHorizontal,
  ArrowUpRight,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Layers,
} from "lucide-react";
import {
  ChartCard,
  AreaChart,
  PieChart,
  BarChart,
} from "@/components/ui/charts";
import { PageHeader } from "@/components/shared/PageHeader";

export default function DashboardOverviewPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isTL = user?.role === UserRole.TEAM_LEADER;
  const isAdmin = user?.role === UserRole.ADMIN;
  const isSE = user?.role === UserRole.SALES_EXECUTIVE;

  // Admin Metrics Query (GET /reports/dashboard-metrics/admin)
  const { data: adminResponse, isLoading: isAdminLoading } =
    useGetAdminDashboardMetricsQuery(undefined, {
      skip: !isAdmin,
      pollingInterval: 30000,
    });

  // TL Metrics Query (GET /reports/dashboard-metrics/team-lead)
  const { data: tlResponse, isLoading: isTLLoading } =
    useGetTLDashboardMetricsQuery(undefined, {
      skip: !isTL,
      pollingInterval: 30000,
    });

  // Sales Executive Metrics Query (GET /reports/dashboard-metrics/sales-executive)
  const { data: seMetricsRes, isLoading: isSEMetricsLoading } =
    useGetSEDashboardMetricsQuery(undefined, {
      skip: !isSE,
      pollingInterval: 30000,
    });

  const isLoading = isAdmin ? isAdminLoading : isTL ? isTLLoading : isSE ? isSEMetricsLoading : false;

  const adminData = adminResponse?.data;
  const tlData = tlResponse?.data;
  const seMetrics = seMetricsRes?.data;
  const recentLeads = useMemo(() => {
    return (
      (isAdmin ? adminData?.recentLeads : isTL ? tlData?.recentLeads : seMetrics?.recentLeads) || []
    );
  }, [isAdmin, isTL, adminData, tlData, seMetrics]);

  // Monthly Sales Array from API
  const monthlySalesData = useMemo(() => {
    const apiMonthly = isAdmin
      ? adminData?.monthlySales
      : isTL
      ? tlData?.monthlySales
      : seMetrics?.monthlySales;
    if (apiMonthly && apiMonthly.length > 0) {
      return apiMonthly.map((m) => ({
        month: m.month,
        height: m.height,
        value: m.formattedValue,
        totalLeads: m.totalLeads,
        wonLeads: m.wonLeads,
        grossAmount: m.grossAmount,
        netAmount: m.netAmount,
      }));
    }
    return [];
  }, [isAdmin, isTL, adminData, tlData, seMetrics]);

  // Area Chart Data Points (Gross vs Net Spline)
  const areaChartData = useMemo(() => {
    return monthlySalesData.slice(0, 7).map((m) => ({
      label: m.month,
      value: m.grossAmount || m.totalLeads || 0,
      secondaryValue: m.netAmount || m.wonLeads || 0,
      formattedValue: m.value,
    }));
  }, [monthlySalesData]);

  // Bar Chart Data Points (Historical Volume)
  const barChartData = useMemo(() => {
    return monthlySalesData.map((m) => ({
      label: m.month,
      value: m.totalLeads || 0,
      formattedValue: m.value,
    }));
  }, [monthlySalesData]);

  // Category Breakdown Array from API
  const categoryData = useMemo(() => {
    const apiCats = isAdmin
      ? adminData?.categoryBreakdown
      : isTL
      ? tlData?.categoryBreakdown
      : seMetrics?.categoryBreakdown;
    if (apiCats && apiCats.length > 0) {
      return apiCats;
    }
    return [];
  }, [isAdmin, isTL, adminData, tlData, seMetrics]);

  // Donut Pie Chart Segments
  const pieSegments = useMemo(() => {
    return categoryData.map((cat) => ({
      label: cat.label,
      count: cat.count,
      percentage: cat.percentage,
      color: cat.color || "#2563eb",
      dotColor: cat.dotColor,
    }));
  }, [categoryData]);

  // Total Category Count for Donut Center
  const totalCategoryCount = useMemo(() => {
    const sum = categoryData.reduce((acc, c) => acc + c.count, 0);
    if (sum > 0) return sum;
    if (isAdmin) return adminData?.overview?.totalLeads ?? adminData?.pipelineHealth?.totalPool?.value ?? 0;
    if (isTL) return tlData?.pipelineHealth?.totalPool?.value ?? 0;
    return seMetrics?.totalAssigned ?? 0;
  }, [categoryData, isAdmin, isTL, adminData, tlData, seMetrics]);

  // Top Deals List from API
  const topDeals = useMemo(() => {
    const apiDeals =
      (isAdmin ? adminData?.topDeals : isTL ? tlData?.topDeals : seMetrics?.topDeals) || recentLeads;
    if (apiDeals && apiDeals.length > 0) {
      return apiDeals.slice(0, 4).map((d) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        amount: d.amount,
        dotColor: d.dotColor || "bg-blue-500",
        href: `/dashboard/leads/${d.id}`,
      }));
    }
    return [];
  }, [isAdmin, isTL, adminData, tlData, seMetrics, recentLeads]);

  return (
    <div className="flex flex-col gap-3 pb-8 select-none text-slate-800 dark:text-slate-200 ">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR */}
      {/* ========================================================================= */}
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.name || "User"} • Real-time pipeline operations`}
        actions={
          <>
            <Link
              href="/dashboard/reports"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Export</span>
            </Link>

            <Link
              href={isAdmin || isTL ? "/dashboard/leads/create" : "/dashboard/my-leads"}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAdmin || isTL ? "Create leads" : "My Leads"}</span>
            </Link>
          </>
        }
      />

      {/* ========================================================================= */}
      {/* 2. TOP ROW: 4 SUMMARY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Card 1: Total Leads */}
        <div className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              {isAdmin ? "Total System Leads" : isTL ? "Total Leads" : "Total Assigned Leads"}
            </span>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            {isLoading ? (
              <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
            ) : (
              <>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {isAdmin
                    ? (adminData?.pipelineHealth?.totalPool?.formattedValue ??
                       (adminData?.overview?.totalLeads !== undefined
                         ? adminData.overview.totalLeads.toLocaleString("en-IN")
                         : "0"))
                    : isTL
                    ? (tlData?.pipelineHealth.totalPool.formattedValue ?? "0")
                    : seMetrics?.formattedPipelineValue ||
                      `${seMetrics?.totalAssigned ?? 0}`}
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200/50 dark:border-emerald-800/50">
                  <ArrowUpRight className="w-3 h-3" />
                  {isAdmin
                    ? (adminData?.pipelineHealth?.totalPool?.change ??
                       (adminData?.overview?.leadGrowthRateWoW !== undefined
                         ? `${adminData.overview.leadGrowthRateWoW >= 0 ? "+" : ""}${adminData.overview.leadGrowthRateWoW}%`
                         : "+10%"))
                    : isTL
                    ? (tlData?.pipelineHealth.totalPool.change ?? "+10%")
                    : "+12%"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Active Leads */}
        <div className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Active In-Flight Leads
            </span>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            {isLoading ? (
              <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
            ) : (
              <>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {isAdmin
                    ? (adminData?.pipelineHealth?.activeInFlight?.value ??
                       adminData?.overview?.activeLeads ??
                       0)
                    : isTL
                    ? (tlData?.pipelineHealth.activeInFlight.value ?? 0)
                    : (seMetrics?.activeCount ?? 0)}
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200/50 dark:border-emerald-800/50">
                  <ArrowUpRight className="w-3 h-3" />
                  {isAdmin
                    ? `${adminData?.pipelineHealth?.activeInFlight?.callsToday ?? adminData?.followUps?.dueToday ?? 0} today`
                    : isTL
                    ? `${tlData?.pipelineHealth.activeInFlight.callsToday ?? 0} today`
                    : "Active"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Card 3: Closed Won Deals */}
        <div className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Closed Won Deals
            </span>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            {isLoading ? (
              <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
            ) : (
              <>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {isAdmin
                    ? (adminData?.pipelineHealth?.wonARR?.wonCount ??
                       adminData?.overview?.wonLeads ??
                       0)
                    : isTL
                    ? (tlData?.pipelineHealth.wonARR.wonCount ?? 0)
                    : (seMetrics?.wonCount ?? 0)}
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200/50 dark:border-emerald-800/50">
                  <ArrowUpRight className="w-3 h-3" />
                  {isAdmin
                    ? (adminData?.pipelineHealth?.wonARR?.formattedValue ??
                       adminData?.overview?.formattedWonRevenue ??
                       "₹0")
                    : isTL
                    ? (tlData?.pipelineHealth.wonARR.formattedValue ?? "₹0")
                    : (seMetrics?.formattedWonValue ?? "₹0")}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Card 4: Conversion Rate */}
        <div className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Conversion Rate
            </span>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            {isLoading ? (
              <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
            ) : (
              <>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {isAdmin
                    ? `${adminData?.pipelineHealth?.wonARR?.conversionRate ?? adminData?.overview?.conversionRate ?? 0}%`
                    : isTL
                    ? `${tlData?.pipelineHealth.wonARR.conversionRate ?? 0}%`
                    : `${seMetrics?.conversionRate ?? 0}%`}
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-[11px] font-semibold border border-blue-200/50 dark:border-blue-800/50">
                  {isAdmin
                    ? (adminData?.pipelineHealth?.slaAdherence?.formattedValue ??
                       `${adminData?.followUps?.slaComplianceRate ?? 95}%`)
                    : isTL
                    ? (tlData?.pipelineHealth.slaAdherence.formattedValue ??
                       "95%")
                    : "SLA 98%"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE ROW: REUSABLE AREA CHART (LEFT) + REUSABLE PIE/DONUT CHART (RIGHT) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Reusable Spline Area Chart */}
        <div className="lg:col-span-7">
          <ChartCard
            title="Balance Analytics"
            subtitle="Monthly Gross vs Net Pipeline Volume"
            icon={<TrendingUp className="w-4 h-4" />}
            className="min-h-[320px]"
          >
            <AreaChart
              data={areaChartData}
              height={220}
              primaryLabel="Gross Pipeline"
              secondaryLabel="Net Closed"
              primaryColor="#2563eb"
              secondaryColor="#f59e0b"
              isLoading={isLoading}
            />
          </ChartCard>
        </div>

        {/* Right: Reusable Pie / Donut Chart */}
        <div className="lg:col-span-5">
          <ChartCard
            title="Channel & Source Share"
            subtitle="Distribution by Inbound Channels"
            icon={<PieChartIcon className="w-4 h-4" />}
            className="min-h-[320px]"
          >
            <PieChart
              data={pieSegments}
              totalLabel="TOTAL"
              totalValue={totalCategoryCount}
              variant="donut"
              isLoading={isLoading}
            />
          </ChartCard>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ROW: REUSABLE BAR CHART (LEFT) + TOP DEALS (RIGHT) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Reusable Bar Chart */}
        <div className="lg:col-span-7">
          <ChartCard
            title="Total Volume"
            subtitle="12-Month Historical Pipeline Volume"
            icon={<BarChart3 className="w-4 h-4" />}
            className="min-h-[300px]"
          >
            <BarChart
              data={barChartData}
              height={180}
              barColor="#2563eb"
              showValuesOnTop
              isLoading={isLoading}
            />
          </ChartCard>
        </div>

        {/* Right: Priority Deals List */}
        <div className="lg:col-span-5">
          <ChartCard
            title="Top Deals & Priority Leads"
            subtitle="Highest value accounts in pipeline"
            icon={<Layers className="w-4 h-4" />}
            action={
              <Link
                href="/dashboard/leads"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                View all &rarr;
              </Link>
            }
            className="min-h-[300px]"
          >
            {isLoading ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 flex flex-col animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="py-3 flex items-center justify-between px-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                      <div className="flex flex-col gap-1.5">
                        <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                      </div>
                    </div>
                    <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                ))}
              </div>
            ) : topDeals.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
                <p className="text-xs">No active priority deals recorded</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {topDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={deal.href}
                    className="py-3.5 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${deal.dotColor} shrink-0`}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {deal.name}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          {deal.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {deal.amount}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
