"use client";

import React from "react";
import {
  X,
  Mail,
  Calendar,
  Briefcase,
  CheckCircle2,
  Clock,
  Phone,
  Building,
  MapPin,
  Search,
  Layers,
  ListTodo,
  History,
  Loader2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { handleApiError } from "@/lib/errorHandler";
import {
  useAppDispatch,
  useAppSelector,
  setSelectedExecutiveId,
  setDetailTab,
  setLeadSearchQuery,
  setLeadStatusFilter,
  useGetSalesExecutiveByIdQuery,
  useToggleExecutiveStatusMutation,
} from "@/store";
import { PriorityLevel, LeadStatus, FollowUpStatus } from "@/types/api.types";
import { Pagination } from "@/components/ui/Pagination";
import { useDebounce } from "@/lib/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ExecutiveDetailDrawer() {
  const dispatch = useAppDispatch();
  const { selectedExecutiveId, detailTab, leadSearchQuery, leadStatusFilter } =
    useAppSelector((state) => state.executive);

  const debouncedLeadSearchQuery = useDebounce(leadSearchQuery, 300);

  const [leadPage, setLeadPage] = React.useState<number>(1);
  const [leadPageSize, setLeadPageSize] = React.useState<number>(10);

  const {
    data: execRes,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetSalesExecutiveByIdQuery(selectedExecutiveId || "", {
    skip: !selectedExecutiveId,
  });

  const [toggleStatus, { isLoading: isToggling }] =
    useToggleExecutiveStatusMutation();

  const contentScrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0;
    }
  }, [detailTab]);

  if (!selectedExecutiveId) return null;

  const executive = execRes?.data;

  const handleClose = () => {
    dispatch(setSelectedExecutiveId(null));
  };

  const handleToggle = async () => {
    if (!executive) return;
    try {
      const res = await toggleStatus({
        id: executive.id,
        isActive: !executive.isActive,
      }).unwrap();
      toast.success(
        res.message ||
          `Executive status set to ${!executive.isActive ? "Active" : "Inactive"}`,
      );
      refetch();
    } catch (err: unknown) {
      handleApiError(err, "Failed to update executive status");
    }
  };

  // Filter assigned leads by search and status
  const filteredLeads = (executive?.leads || []).filter((lead) => {
    if (leadStatusFilter !== "ALL" && lead.status !== leadStatusFilter) {
      return false;
    }
    if (debouncedLeadSearchQuery.trim()) {
      const q = debouncedLeadSearchQuery.toLowerCase();
      const matchCode = lead.leadCode.toLowerCase().includes(q);
      const matchName = lead.customerName.toLowerCase().includes(q);
      const matchMobile = lead.mobile.toLowerCase().includes(q);
      const matchCompany = (lead.companyName || "").toLowerCase().includes(q);
      const matchReq = lead.requirement.toLowerCase().includes(q);
      if (
        !matchCode &&
        !matchName &&
        !matchMobile &&
        !matchCompany &&
        !matchReq
      ) {
        return false;
      }
    }
    return true;
  });

  const getPriorityBadgeClass = (priority: PriorityLevel) => {
    switch (priority) {
      case PriorityLevel.URGENT:
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      case PriorityLevel.HIGH:
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case PriorityLevel.MEDIUM:
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      default:
        return "bg-card text-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  const getStatusBadgeClass = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.WON_SOLD:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case LeadStatus.LOST:
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      case LeadStatus.QUALIFIED:
      case LeadStatus.PROPOSAL_QUOTATION:
      case LeadStatus.NEGOTIATION:
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case LeadStatus.INTERESTED:
      case LeadStatus.FOLLOW_UP:
        return "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800";
      default:
        return "bg-card text-slate-800 dark:text-slate-200 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  const tabs: {
    id: "leads" | "pipeline" | "followups" | "activities";
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      id: "leads",
      label: "Assigned Leads",
      icon: <Briefcase className="w-3.5 h-3.5" />,
      count: executive?.totalAssignedLeads || 0,
    },
    {
      id: "pipeline",
      label: "Pipeline Stages",
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: "followups",
      label: "Follow-Up Queue",
      icon: <ListTodo className="w-3.5 h-3.5" />,
      count: executive?.followUpsPending || 0,
    },
    {
      id: "activities",
      label: "Activity Logs",
      icon: <History className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in">
      {/* Slide-over Container */}
      <div className="w-full max-w-4xl bg-card dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200/90 dark:border-slate-800 animate-slide-in-right overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0 border border-slate-700">
              {executive?.name
                ? executive.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "SE"}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {executive?.name || "Loading Executive..."}
                </h2>
                {executive && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      executive.isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : "bg-card dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {executive.isActive ? "Active Staff" : "Inactive"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>{executive?.email}</span>
                </span>
                {executive?.createdAt && (
                  <span className="hidden sm:flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Joined{" "}
                      {new Date(executive.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard/distributions/create"
              className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold hidden sm:flex items-center gap-1.5 transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Distribute Leads</span>
            </Link>

            {executive && (
              <button
                type="button"
                onClick={handleToggle}
                disabled={isToggling}
                className={`h-9 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  executive.isActive
                    ? "bg-card dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 border-slate-200 dark:border-slate-700"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                }`}
              >
                {isToggling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {executive.isActive ? "Pause Status" : "Activate Staff"}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-card dark:bg-slate-800 hover:bg-card dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isLoading || isFetching ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Retrieving executive performance dossier & assigned leads...
            </p>
          </div>
        ) : error || !executive ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3 text-center">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Failed to load executive details
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 bg-slate-900 dark:bg-card text-white dark:text-slate-900 rounded-lg text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Top KPI Ribbon (Pinned) */}
            <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/90 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              <div className="bg-card dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200/90 dark:border-slate-700 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Active Pipeline
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {executive.activeLeads}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  of {executive.totalAssignedLeads} total assigned
                </div>
              </div>

              <div className="bg-card dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200/90 dark:border-slate-700 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Closed (Won)
                </div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {executive.convertedLeads} Deals
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {executive.conversionRate}% Win Rate
                </div>
              </div>

              <div className="bg-card dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200/90 dark:border-slate-700 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Follow-Up Health
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {executive.followUpsPending} Tasks
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                  {executive.followUpsOverdue > 0
                    ? `${executive.followUpsOverdue} Overdue`
                    : "All on schedule"}
                </div>
              </div>

              <div className="bg-card dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200/90 dark:border-slate-700 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Pipeline Value
                </div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                  ₹{Number(executive.totalPipelineValue || 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {executive.lostLeads} Lost / Disqualified
                </div>
              </div>
            </div>

            {/* Navigation Tabs (Pinned - Always Visible) */}
            <div className="h-12 min-h-12 shrink-0 px-4 sm:px-5 border-b border-slate-200/90 dark:border-slate-800 flex items-center gap-2 overflow-x-auto bg-card dark:bg-slate-900 z-10">
              {tabs.map((tab) => {
                const isActive = detailTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => dispatch(setDetailTab(tab.id))}
                    className={`h-full px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "border-blue-600 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                            : "bg-card dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents (Scrollable Area) */}
            <div
              ref={contentScrollRef}
              className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/40"
            >
              {/* TAB 1: ASSIGNED LEADS */}
              {detailTab === "leads" && (
                <div className="flex flex-col gap-3">
                  {/* Lead Filters */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={leadSearchQuery}
                        onChange={(e) =>
                          dispatch(setLeadSearchQuery(e.target.value))
                        }
                        placeholder="Search lead code, name, phone, company..."
                        className="w-full h-9 pl-8 pr-8 rounded-lg bg-card dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {leadSearchQuery && (
                        <button
                          type="button"
                          onClick={() => dispatch(setLeadSearchQuery(""))}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={leadStatusFilter}
                        onValueChange={(val) => {
                          if (val) dispatch(setLeadStatusFilter(val));
                        }}
                      >
                        <SelectTrigger className="h-9 px-3 rounded-lg bg-card dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          <SelectItem value="ALL">All Statuses</SelectItem>
                          {Object.values(LeadStatus).map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {(Boolean(leadSearchQuery.trim() || leadStatusFilter !== "ALL")) && (
                        <button
                          type="button"
                          onClick={() => {
                            dispatch(setLeadSearchQuery(""));
                            dispatch(setLeadStatusFilter("ALL"));
                            setLeadPage(1);
                          }}
                          className="h-9 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
                          title="Reset lead filters"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Leads Table */}
                  {filteredLeads.length === 0 ? (
                    <div className="bg-card dark:bg-slate-800/80 rounded-lg border border-slate-200/90 dark:border-slate-700 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                      No leads match the current filters.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="bg-card dark:bg-slate-800/80 rounded-lg border border-slate-200/90 dark:border-slate-700 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200/90 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th className="py-2.5 px-3">Lead Code</th>
                                <th className="py-2.5 px-3">
                                  Customer Profile
                                </th>
                                <th className="py-2.5 px-3">Requirement</th>
                                <th className="py-2.5 px-3">Priority</th>
                                <th className="py-2.5 px-3">Status</th>
                                <th className="py-2.5 px-3 text-right">
                                  Budget
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
                              {filteredLeads
                                .slice(
                                  (Math.min(
                                    leadPage,
                                    Math.max(
                                      1,
                                      Math.ceil(
                                        filteredLeads.length / leadPageSize,
                                      ),
                                    ),
                                  ) -
                                    1) *
                                    leadPageSize,
                                  Math.min(
                                    leadPage,
                                    Math.max(
                                      1,
                                      Math.ceil(
                                        filteredLeads.length / leadPageSize,
                                      ),
                                    ),
                                  ) * leadPageSize,
                                )
                                .map((lead) => (
                                  <tr
                                    key={lead.id}
                                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                                  >
                                    <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px]">
                                      {lead.leadCode}
                                    </td>
                                    <td className="py-3 px-3">
                                      <div className="flex flex-col">
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                          {lead.customerName}
                                        </span>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                          <span className="flex items-center gap-0.5">
                                            <Phone className="w-2.5 h-2.5" />
                                            <span>{lead.mobile}</span>
                                          </span>
                                          {lead.companyName && (
                                            <span className="flex items-center gap-0.5 truncate max-w-30">
                                              <Building className="w-2.5 h-2.5" />
                                              <span>{lead.companyName}</span>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 px-3 max-w-50">
                                      <p
                                        className="text-[11px] text-slate-600 dark:text-slate-300 truncate"
                                        title={lead.requirement}
                                      >
                                        {lead.requirement}
                                      </p>
                                      {lead.city && (
                                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                                          <MapPin className="w-2.5 h-2.5" />
                                          <span>{lead.city}</span>
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-3">
                                      <span
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${getPriorityBadgeClass(
                                          lead.priority,
                                        )}`}
                                      >
                                        {lead.priority}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeClass(
                                          lead.status,
                                        )}`}
                                      >
                                        {lead.status.replace(/_/g, " ")}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 text-right font-semibold text-slate-900 dark:text-white">
                                      {lead.budget
                                        ? `₹${Number(lead.budget).toLocaleString()}`
                                        : "—"}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {filteredLeads.length > 0 && (
                        <div className="pt-1">
                          <Pagination
                            currentPage={Math.min(
                              leadPage,
                              Math.max(
                                1,
                                Math.ceil(filteredLeads.length / leadPageSize),
                              ),
                            )}
                            totalPages={Math.max(
                              1,
                              Math.ceil(filteredLeads.length / leadPageSize),
                            )}
                            totalItems={filteredLeads.length}
                            pageSize={leadPageSize}
                            onPageChange={setLeadPage}
                            onPageSizeChange={(size) => {
                              setLeadPageSize(size);
                              setLeadPage(1);
                            }}
                            className="bg-transparent dark:bg-transparent border-0 px-0 py-0"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PIPELINE STAGES BREAKDOWN */}
              {detailTab === "pipeline" && (
                <div className="bg-card dark:bg-slate-800/80 rounded-lg border border-slate-200/90 dark:border-slate-700 p-5 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Pipeline Stage Funnel & Velocity
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Total: {executive.totalAssignedLeads || 0} Leads
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {Object.values(LeadStatus).map((status) => {
                      const statusBreakdown = executive.statusBreakdown || {};
                      const count = statusBreakdown[status] || 0;
                      const percentage =
                        executive.totalAssignedLeads > 0
                          ? Math.round(
                              (count / executive.totalAssignedLeads) * 100,
                            )
                          : 0;

                      return (
                        <div
                          key={status}
                          className="flex flex-col gap-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {status.replace(/_/g, " ")}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 font-mono">
                              {count} leads ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-card dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                status === LeadStatus.WON_SOLD
                                  ? "bg-emerald-500"
                                  : status === LeadStatus.LOST
                                    ? "bg-rose-400"
                                    : "bg-blue-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: FOLLOW-UP QUEUE */}
              {detailTab === "followups" && (
                <div className="flex flex-col gap-3">
                  {executive.upcomingFollowUps.length === 0 ? (
                    <div className="bg-card dark:bg-slate-800/80 rounded-lg border border-slate-200/90 dark:border-slate-700 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                      No follow-up tasks currently scheduled.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/60 bg-card dark:bg-slate-800/80 rounded-lg border border-slate-200/90 dark:border-slate-700 shadow-xs overflow-hidden">
                      {executive.upcomingFollowUps.map((task) => {
                        const isOverdue =
                          task.status === FollowUpStatus.PENDING &&
                          new Date(task.scheduledAt) < new Date();

                        return (
                          <div
                            key={task.id}
                            className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/30"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isOverdue
                                    ? "bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400"
                                    : "bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                                }`}
                              >
                                <Clock className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-xs text-slate-900 dark:text-white">
                                    {task.type} with{" "}
                                    {task.lead?.customerName || "Lead"}
                                  </span>
                                  {task.lead?.leadCode && (
                                    <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                                      ({task.lead.leadCode})
                                    </span>
                                  )}
                                  {isOverdue && (
                                    <span className="px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[9px] uppercase">
                                      Overdue
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  Scheduled for:{" "}
                                  {new Date(task.scheduledAt).toLocaleString()}
                                </span>
                                {task.notes && (
                                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                    &ldquo;{task.notes}&rdquo;
                                  </p>
                                )}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                task.status === FollowUpStatus.COMPLETED
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                  : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: RECENT ACTIVITIES */}
              {detailTab === "activities" && (
                <div className="flex flex-col gap-3">
                  {executive.recentActivities.length === 0 ? (
                    <div className="bg-card dark:bg-slate-800/80 rounded-lg border border-slate-200/90 dark:border-slate-700 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                      No activity records recorded yet.
                    </div>
                  ) : (
                    <div className="bg-card dark:bg-slate-800/80 rounded-lg border border-slate-200/90 dark:border-slate-700 p-4 shadow-xs">
                      <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 pl-4 space-y-4">
                        {executive.recentActivities.map((act) => (
                          <div key={act.id} className="relative">
                            <span className="absolute -left-5.75 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                            <div className="flex flex-col text-xs">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {act.actionType.replace(/_/g, " ")}
                              </span>
                              <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                                {act.description}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(act.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
