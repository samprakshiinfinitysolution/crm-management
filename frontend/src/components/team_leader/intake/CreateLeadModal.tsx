"use client";

import React, { useState } from "react";
import { X, UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateLeadMutation } from "@/store";
import { PriorityLevel } from "@/types/api.types";
import { handleApiError } from "@/lib/errorHandler";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateLeadModal: React.FC<CreateLeadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [createLead, { isLoading }] = useCreateLeadMutation();

  const [formData, setFormData] = useState({
    customerName: "",
    mobile: "",
    email: "",
    city: "",
    requirement: "",
    budget: "",
    source: "MANUAL_ENTRY",
    priority: PriorityLevel.MEDIUM,
    notes: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.mobile.trim()) {
      toast.error("Customer name and mobile number are required");
      return;
    }

    try {
      await createLead({
        customerName: formData.customerName.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim() || undefined,
        city: formData.city.trim() || undefined,
        requirement: formData.requirement.trim() || undefined,
        budget: formData.budget.trim() || undefined,
        source: formData.source,
        priority: formData.priority,
        notes: formData.notes.trim() || undefined,
      }).unwrap();

      toast.success("Lead created and added to unassigned pool!");
      setFormData({
        customerName: "",
        mobile: "",
        email: "",
        city: "",
        requirement: "",
        budget: "",
        source: "MANUAL_ENTRY",
        priority: PriorityLevel.MEDIUM,
        notes: "",
      });
      onClose();
    } catch (err: unknown) {
      handleApiError(err, "Failed to create lead");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-lg bg-slate-900 border border-white/10 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Create New Lead
              </h3>
              <p className="text-xs text-slate-400">
                Add a single lead manually to the intake pool
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-card/5 hover:bg-card/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Kumar"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className="w-full px-3 py-2 bg-card/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Mobile Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98765 43210"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                className="w-full px-3 py-2 bg-card/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. customer@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 bg-card/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                City / Location
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai, Maharashtra"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-3 py-2 bg-card/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Requirement / Product
              </label>
              <input
                type="text"
                placeholder="e.g. Enterprise Cloud Plan"
                value={formData.requirement}
                onChange={(e) =>
                  setFormData({ ...formData, requirement: e.target.value })
                }
                className="w-full px-3 py-2 bg-card/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Estimated Budget / Value
              </label>
              <input
                type="text"
                placeholder="e.g. ₹1,20,000"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                className="w-full px-3 py-2 bg-card/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Lead Source
              </label>
              <Select
                value={formData.source}
                onValueChange={(val) => {
                  if (val) setFormData({ ...formData, source: val });
                }}
              >
                <SelectTrigger className="w-full h-9 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer">
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border border-slate-700 text-white">
                  <SelectItem value="MANUAL_ENTRY">Manual Entry</SelectItem>
                  <SelectItem value="DIRECT_CALL">Direct Inbound Call</SelectItem>
                  <SelectItem value="WEBSITE">Website Organic</SelectItem>
                  <SelectItem value="CAMPAIGN">Marketing Campaign</SelectItem>
                  <SelectItem value="REFERRAL">Partner Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Priority
              </label>
              <Select
                value={formData.priority}
                onValueChange={(val) => {
                  if (val)
                    setFormData({
                      ...formData,
                      priority: val as PriorityLevel,
                    });
                }}
              >
                <SelectTrigger className="w-full h-9 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border border-slate-700 text-white">
                  <SelectItem value={PriorityLevel.LOW}>Low</SelectItem>
                  <SelectItem value={PriorityLevel.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={PriorityLevel.HIGH}>High</SelectItem>
                  <SelectItem value={PriorityLevel.URGENT}>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Initial Note / Context
            </label>
            <textarea
              rows={2}
              placeholder="Customer notes, specific preferences..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 bg-card/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-card/5 hover:bg-card/10 border border-white/10 text-xs font-medium text-slate-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>
                {isLoading ? "Creating Lead..." : "Save & Add to Pool"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
