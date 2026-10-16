"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  User,
  Tag,
  CalendarPlus,
  RefreshCw,
  AlertCircle,
  FileText,
  Activity,
  RotateCcw,
  UserCheck,
  MessageSquare,
  Send,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetLeadByIdQuery,
  useUpdateLeadStatusMutation,
  useAddLeadNoteMutation,
  useAppSelector,
} from "@/store";
import {
  LeadStatus,
  UserRole,
  type LeadItem,
  type LeadNoteItem,
} from "@/types/api.types";
import dynamic from "next/dynamic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Code splitting: Modals are only loaded on-demand when user clicks actions
const ScheduleFollowUpModal = dynamic(
  () => import("@/components/sales_executive/ScheduleFollowUpModal"),
  { ssr: false }
);

const RecallLeadModal = dynamic(
  () => import("@/components/team_leader/RecallLeadModal"),
  { ssr: false }
);

const ReassignLeadModal = dynamic(
  () => import("@/components/team_leader/ReassignLeadModal"),
  { ssr: false }
);

export interface ExtendedLeadDetail extends Omit<LeadItem, "notes"> {
  notes?: LeadNoteItem[] | string | null;
  notesList?: LeadNoteItem[];
  followUps?: Array<{
    id: string;
    type: string;
    scheduledAt: string;
    status: string;
  }>;
  activities?: Array<{
    id: string;
    description: string;
    createdAt: string;
  }>;
}

export interface LeadDetailViewProps {
  leadId?: string;
  backHref?: string;
}

export function LeadDetailView({
  leadId: propLeadId,
  backHref,
}: LeadDetailViewProps) {
  const params = useParams();
  const id = propLeadId || (params?.id as string);
  const { user } = useAppSelector((state) => state.auth);

  const isManager =
    user?.role === UserRole.TEAM_LEADER || user?.role === UserRole.ADMIN;
  const defaultBackHref = isManager
    ? user?.role === UserRole.ADMIN
      ? "/admin/leads"
      : "/dashboard/leads"
    : "/dashboard/my-leads";
  const resolvedBackHref = backHref || defaultBackHref;

  const {
    data: leadResponse,
    isLoading,
    isError,
    refetch,
  } = useGetLeadByIdQuery(id, { skip: !id });
  const lead = leadResponse?.data as ExtendedLeadDetail | undefined;

  const [updateLeadStatus, { isLoading: isUpdatingStatus }] =
    useUpdateLeadStatusMutation();
  const [addLeadNoteMutation, { isLoading: isAddingNote }] =
    useAddLeadNoteMutation();

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusNote, setStatusNote] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isRecallModalOpen, setIsRecallModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !lead) return;

    try {
      await addLeadNoteMutation({
        id: lead.id,
        note: newNoteText.trim(),
      }).unwrap();

      toast.success("Note added successfully");
      setNewNoteText("");
      refetch();
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      toast.error(errorObj?.data?.message || "Failed to add note");
    }
  };

  const handleStatusChange = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    try {
      if (!lead) return;
      await updateLeadStatus({
        id: lead.id,
        status: selectedStatus as LeadStatus,
        note: statusNote.trim() || undefined,
      }).unwrap();

      toast.success(`Lead status updated to ${selectedStatus}`);
      setIsStatusModalOpen(false);
      setStatusNote("");
      refetch();
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      toast.error(errorObj?.data?.message || "Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 h-[90dvh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2874f0]" />
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Loading listing record details...
        </span>
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-sm p-6 text-center flex flex-col items-center gap-3 shadow-2xs">
          <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
          <h2 className="text-sm font-bold text-rose-900 dark:text-rose-200">
            Lead Record Unavailable
          </h2>
          <p className="text-xs text-rose-700 dark:text-rose-400 max-w-md">
            This lead may have been deleted, or you may not have sufficient
            access permissions to view it.
          </p>
          <Link
            href={resolvedBackHref}
            className="h-8.5 px-4 rounded-sm bg-[#2874f0] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#1a5bb8] flex items-center transition-colors shadow-2xs"
          >
            Return to Listings Directory
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-50 text-[#2874f0] border-blue-200";
      case "ASSIGNED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "CONTACTED":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "INTERESTED":
      case "QUALIFIED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "PROPOSAL_QUOTATION":
      case "NEGOTIATION":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "WON_SOLD":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "LOST":
      case "NOT_INTERESTED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "MEDIUM":
        return "bg-blue-100 text-[#2874f0] border-blue-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150 select-none pb-12">
      {/* Breadcrumb Navigation matching CRM Management Hub */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link
          href={resolvedBackHref.includes("admin") ? "/admin" : "/dashboard"}
          className="text-[#2874f0] hover:underline font-medium"
        >
          {resolvedBackHref.includes("admin") ? "Admin Console" : "Home"}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link
          href={resolvedBackHref}
          className="text-[#2874f0] hover:underline font-medium"
        >
          {resolvedBackHref.includes("my-leads")
            ? "My Assigned Leads"
            : "Leads Management"}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-700 dark:text-slate-300 font-medium font-mono">
          {lead.leadCode}
        </span>
      </div>

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0e0e0] dark:border-slate-800 pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {lead.customerName}
            </h1>
            <span className="px-2 py-0.5 rounded-xs text-xs font-mono font-bold bg-[#eaf4fe] text-[#2874f0] border border-blue-200">
              {lead.leadCode}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Source:{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {lead.leadSource || "Direct"}
            </span>{" "}
            · Registered on{" "}
            <span className="font-mono">
              {new Date(lead.createdAt).toLocaleDateString()}
            </span>
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Link
            href={resolvedBackHref}
            className="h-8.5 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Listings</span>
          </Link>

          {isManager && (
            <button
              type="button"
              onClick={() => setIsReassignModalOpen(true)}
              className="h-8.5 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#2874f0]" />
              <span>Reassign</span>
            </button>
          )}

          {isManager && (lead?.assignedTo || lead?.status !== "NEW") && (
            <button
              type="button"
              onClick={() => setIsRecallModalOpen(true)}
              className="h-8.5 px-3 rounded-sm bg-white dark:bg-slate-900 border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recall</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="h-8.5 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-[#2874f0]" />
            <span>Follow-up</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStatus(lead.status);
              setIsStatusModalOpen(true);
            }}
            className="h-8.5 px-4 rounded-sm bg-[#2874f0] hover:bg-[#1a5bb8] text-white text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Update Status</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Strip (Flipkart Order / Listing Overview Strip) */}
      <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="border-r border-[#e0e0e0] dark:border-slate-800 pr-3">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Pipeline Stage
          </span>
          <span
            className={`inline-block mt-1 px-2 py-0.5 rounded-xs font-bold text-[11px] border ${getStatusBadgeClass(
              lead.status,
            )}`}
          >
            {lead.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="border-r border-[#e0e0e0] dark:border-slate-800 pr-3">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Executive Owner
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block mt-1 truncate">
            {lead.assignedTo?.name || "Unassigned Pool"}
          </span>
        </div>

        <div className="border-r border-[#e0e0e0] dark:border-slate-800 pr-3">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Estimated Budget
          </span>
          <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 block mt-1">
            {lead.budget
              ? `₹${Number(lead.budget).toLocaleString("en-IN")}`
              : "Not Specified"}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Priority SLA
          </span>
          <span
            className={`inline-block mt-1 px-2 py-0.5 rounded-xs font-bold text-[11px] border ${getPriorityBadgeClass(
              lead.priority,
            )}`}
          >
            {lead.priority}
          </span>
        </div>
      </div>

      {/* Main Grid: Left Details (2 Cols) + Right Timeline & Status (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Customer, Requirements, Follow-ups, Notes */}
        <div className="lg:col-span-2 space-y-4">
          {/* Card 1: Customer Contact Details */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-[#e0e0e0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#2874f0]" />
                  <span>Customer Contact Details</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-sm bg-slate-50/70 dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800">
                <Phone className="w-4 h-4 text-[#2874f0] shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Primary Phone
                  </span>
                  <a
                    href={`tel:${lead.mobile}`}
                    className="text-xs font-mono font-bold text-[#2874f0] hover:underline"
                  >
                    {lead.mobile}
                  </a>
                </div>
              </div>

              {lead.alternateMobile && (
                <div className="flex items-center gap-3 p-3 rounded-sm bg-slate-50/70 dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Alternate Phone
                    </span>
                    <a
                      href={`tel:${lead.alternateMobile}`}
                      className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 hover:underline"
                    >
                      {lead.alternateMobile}
                    </a>
                  </div>
                </div>
              )}

              {lead.email && (
                <div className="flex items-center gap-3 p-3 rounded-sm bg-slate-50/70 dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800">
                  <Mail className="w-4 h-4 text-[#2874f0] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Work Email
                    </span>
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-xs font-semibold text-[#2874f0] hover:underline truncate"
                    >
                      {lead.email}
                    </a>
                  </div>
                </div>
              )}

              {lead.companyName && (
                <div className="flex items-center gap-3 p-3 rounded-sm bg-slate-50/70 dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Organization
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {lead.companyName}
                    </span>
                  </div>
                </div>
              )}

              {(lead.city || lead.state) && (
                <div className="flex items-center gap-3 p-3 rounded-sm bg-slate-50/70 dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Geographic Location
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {[lead.city, lead.state].filter(Boolean).join(", ")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Deal Requirements & Offering Specifications */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-[#e0e0e0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#2874f0]" />
                  <span>Deal Requirements & Offerings</span>
                </h2>
              </div>
            </div>

            <div className="p-3.5 rounded-sm bg-slate-50/70 dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800 mb-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Detailed Client Requirement
              </span>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {lead.requirement}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-sm bg-slate-50/70 dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Budget
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                  {lead.budget
                    ? `₹${Number(lead.budget).toLocaleString("en-IN")}`
                    : "Not Specified"}
                </span>
              </div>

              <div className="p-3 rounded-sm bg-slate-50/70 dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Target Offering / SKU
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {lead.productService || "General Solution"}
                </span>
              </div>

              <div className="p-3 rounded-sm bg-slate-50/70 dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Priority SLA
                </span>
                <span
                  className={`inline-block mt-0.5 px-2 py-0.5 rounded-xs font-bold text-[11px] border ${getPriorityBadgeClass(
                    lead.priority,
                  )}`}
                >
                  {lead.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Scheduled Follow-up Tasks */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-[#e0e0e0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#2874f0]" />
                  <span>Scheduled Follow-ups</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(true)}
                className="text-xs font-semibold text-[#2874f0] hover:underline cursor-pointer"
              >
                + Schedule New
              </button>
            </div>

            {!lead?.followUps || lead.followUps.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No follow-ups currently scheduled for this listing.
              </div>
            ) : (
              <div className="space-y-2">
                {lead.followUps.map((fu) => (
                  <div
                    key={fu.id}
                    className="p-3 rounded-sm bg-slate-50/70 dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xs bg-[#eaf4fe] text-[#2874f0] flex items-center justify-center font-bold text-xs">
                        {fu.type[0]}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          {fu.type} Follow-up
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(fu.scheduledAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-xs text-[10px] font-bold border ${
                        fu.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : fu.status === "MISSED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {fu.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 4: Notes & Team Discussion */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-[#e0e0e0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#2874f0]" />
                  <span>Notes & Internal Observations</span>
                </h2>
              </div>
            </div>

            {/* Note Composer */}
            <form onSubmit={handleAddNote} className="space-y-2 mb-4">
              <textarea
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Log an internal note, progress updates, or customer interaction notes..."
                className="w-full p-3 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition-all resize-none"
                disabled={isAddingNote}
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {newNoteText.length > 0
                    ? `${newNoteText.length} characters`
                    : "Press submit to commit note to audit log"}
                </span>
                <button
                  type="submit"
                  disabled={isAddingNote || !newNoteText.trim()}
                  className="h-8 px-4 rounded-sm bg-[#2874f0] hover:bg-[#1a5bb8] text-white text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>{isAddingNote ? "SAVING..." : "ADD NOTE"}</span>
                </button>
              </div>
            </form>

            {/* Notes List */}
            {Array.isArray(lead.notes) && lead.notes.length > 0 ? (
              <div className="space-y-2.5 pt-3 border-t border-[#e0e0e0] dark:border-slate-800">
                {lead.notes.map((noteItem) => (
                  <div
                    key={noteItem.id}
                    className="p-3 rounded-sm bg-slate-50/70 dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-xs bg-[#eaf4fe] text-[#2874f0] flex items-center justify-center font-bold text-[10px]">
                          {(noteItem.author?.name || "U")[0].toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {noteItem.author?.name || "Team Member"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(noteItem.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap pl-7 leading-relaxed">
                      {noteItem.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400 border-t border-[#e0e0e0] dark:border-slate-800">
                No notes logged for this listing yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pipeline Stage & Activity Timeline */}
        <div className="space-y-4">
          {/* Card 5: Pipeline Ownership & Allocation */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2.5 mb-1 border-b border-[#e0e0e0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#2874f0]" />
                  <span>Pipeline & Ownership</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-600 dark:text-slate-400">
                Current Status
              </span>
              <span
                className={`px-2 py-0.5 rounded-xs font-bold text-[11px] border ${getStatusBadgeClass(
                  lead.status,
                )}`}
              >
                {lead.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-600 dark:text-slate-400">
                Assigned To
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {lead.assignedTo ? lead.assignedTo.name : "Unassigned Pool"}
              </span>
            </div>

            {lead.assignedAt && (
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-600 dark:text-slate-400">
                  Assigned Date
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">
                  {new Date(lead.assignedAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {isManager && (
              <div className="pt-2 border-t border-[#e0e0e0] dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReassignModalOpen(true)}
                  className="flex-1 h-7.5 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-[#2874f0] hover:bg-blue-50 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Reassign</span>
                </button>
                {lead.assignedTo && (
                  <button
                    type="button"
                    onClick={() => setIsRecallModalOpen(true)}
                    className="flex-1 h-7.5 rounded-sm bg-white dark:bg-slate-800 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Recall</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Card 6: Activity History Timeline */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-[#e0e0e0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#2874f0]" />
                  <span>Activity History</span>
                </h2>
              </div>
            </div>

            {!lead?.activities || lead.activities.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No activity logs recorded yet.
              </div>
            ) : (
              <div className="relative pl-3.5 space-y-3.5 border-l-2 border-blue-200 dark:border-blue-900">
                {lead.activities.map((act) => (
                  <div key={act.id} className="relative">
                    <div className="absolute -left-4.75 top-1 w-2 h-2 rounded-full bg-[#2874f0] ring-3 ring-white dark:ring-slate-900" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {act.description}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
          <form
            onSubmit={handleStatusChange}
            className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-5 max-w-md w-full shadow-lg flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#e0e0e0] dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#2874f0]" />
                <span>Update Listing Pipeline Status</span>
              </h3>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Target Status Stage
              </label>
              <Select
                value={selectedStatus}
                onValueChange={(val) => setSelectedStatus(val || "NEW")}
              >
                <SelectTrigger className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0]">
                  <SelectValue placeholder="Select target status" />
                </SelectTrigger>
                <SelectContent className="border border-[#e0e0e0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md max-h-60">
                  <SelectItem value="NEW" className="text-xs cursor-pointer">
                    NEW
                  </SelectItem>
                  <SelectItem
                    value="ASSIGNED"
                    className="text-xs cursor-pointer"
                  >
                    ASSIGNED
                  </SelectItem>
                  <SelectItem
                    value="CONTACTED"
                    className="text-xs cursor-pointer"
                  >
                    CONTACTED
                  </SelectItem>
                  <SelectItem
                    value="INTERESTED"
                    className="text-xs cursor-pointer"
                  >
                    INTERESTED
                  </SelectItem>
                  <SelectItem
                    value="FOLLOW_UP"
                    className="text-xs cursor-pointer"
                  >
                    FOLLOW_UP
                  </SelectItem>
                  <SelectItem
                    value="QUALIFIED"
                    className="text-xs cursor-pointer"
                  >
                    QUALIFIED
                  </SelectItem>
                  <SelectItem
                    value="PROPOSAL_QUOTATION"
                    className="text-xs cursor-pointer"
                  >
                    PROPOSAL_QUOTATION
                  </SelectItem>
                  <SelectItem
                    value="NEGOTIATION"
                    className="text-xs cursor-pointer"
                  >
                    NEGOTIATION
                  </SelectItem>
                  <SelectItem
                    value="WON_SOLD"
                    className="text-xs cursor-pointer"
                  >
                    WON_SOLD
                  </SelectItem>
                  <SelectItem value="LOST" className="text-xs cursor-pointer">
                    LOST
                  </SelectItem>
                  <SelectItem
                    value="NOT_INTERESTED"
                    className="text-xs cursor-pointer"
                  >
                    NOT_INTERESTED
                  </SelectItem>
                  <SelectItem
                    value="NO_RESPONSE"
                    className="text-xs cursor-pointer"
                  >
                    NO_RESPONSE
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Reason / Audit Log Note (Optional)
              </label>
              <textarea
                rows={3}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Log reason why this lead is moving to the requested stage..."
                className="w-full p-2.5 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e0e0e0] dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="h-8.5 px-3 rounded-sm border border-[#e0e0e0] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingStatus}
                className="h-8.5 px-4 rounded-sm bg-[#2874f0] hover:bg-[#1a5bb8] text-white text-xs font-bold uppercase tracking-wide disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isUpdatingStatus ? "SAVING..." : "COMMIT STATUS"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      {isScheduleModalOpen && (
        <ScheduleFollowUpModal
          leadId={lead.id}
          leadCode={lead.leadCode}
          customerName={lead.customerName}
          open={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            refetch();
          }}
        />
      )}

      {/* Recall Lead to Pool Modal */}
      {isRecallModalOpen && (
        <RecallLeadModal
          open={isRecallModalOpen}
          onClose={() => setIsRecallModalOpen(false)}
          leadIds={[lead.id]}
          leadCodes={[lead.leadCode]}
          assignedExecutiveName={lead.assignedTo?.name}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* Reassign Lead Modal */}
      {isReassignModalOpen && (
        <ReassignLeadModal
          open={isReassignModalOpen}
          onClose={() => setIsReassignModalOpen(false)}
          leadIds={[lead.id]}
          leadCodes={[lead.leadCode]}
          currentAssigneeId={lead.assignedTo?.id || lead.assignedToUserId}
          currentAssigneeName={lead.assignedTo?.name}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
}
