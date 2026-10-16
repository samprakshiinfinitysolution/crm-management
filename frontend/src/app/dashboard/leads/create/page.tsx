"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  ChevronRight,
  Info,
  User,
  Package,
  Layers,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole, PriorityLevel } from "@/types/api.types";
import { useCreateLeadMutation } from "@/store";
import { handleApiError } from "@/lib/errorHandler";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

const INITIAL_FORM_DATA = {
  customerName: "",
  mobile: "",
  alternateMobile: "",
  email: "",
  companyName: "",
  city: "",
  state: "",
  requirement: "",
  productService: "",
  budget: "",
  leadSource: "Direct",
  priority: PriorityLevel.MEDIUM,
};

export default function CreateLeadPage() {
  const router = useRouter();
  const [createLead, { isLoading }] = useCreateLeadMutation();

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    handleFieldChange(name, value);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    toast.info("Form reset to defaults");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!formData.mobile.trim()) {
      toast.error("Mobile number is required");
      return;
    }
    if (!formData.requirement.trim()) {
      toast.error("Requirement details are required");
      return;
    }

    try {
      const payload = {
        ...formData,
        budget: formData.budget ? Number(formData.budget) : undefined,
      };

      const res = await createLead(payload).unwrap();
      toast.success(res.message || "Listing registered successfully in pool!");
      router.push("/dashboard/leads");
    } catch (err) {
      handleApiError(err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
      <div className="space-y-4 animate-in fade-in duration-150 select-none pb-12">
        {/* Breadcrumb Navigation matching CRM Management Hub */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/dashboard"
            className="text-[#2874f0] hover:underline font-medium"
          >
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link
            href="/dashboard/leads"
            className="text-[#2874f0] hover:underline font-medium"
          >
            Leads Management
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            Add New Lead
          </span>
        </div>

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0e0e0] dark:border-slate-800 pb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Add New Lead
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Register a customer inquiry or lead listing directly into the
              central intake pool
            </p>
          </div>

          <Link
            href="/dashboard/leads"
            className="h-8 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Listings</span>
          </Link>
        </div>

        {/* Marketplace Guidance Notice Banner */}
        <div className="px-4 py-3 bg-[#eaf4fe] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-sm flex items-start gap-3 text-xs">
          <Info className="w-4 h-4 text-[#2874f0] shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-slate-700 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">
              Listing Registration Guidelines
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Verify contact phone numbers and client requirements accurately.
              Registered listings are instantly available in the unassigned pool
              for supervisor assignment or manual allocation.
            </p>
          </div>
        </div>

        {/* Main Form Formatted in Seller Central Modular Panels */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card 1: Customer Contact Information */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between pb-2.5 mb-4 border-b border-[#e0e0e0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#2874f0]" />
                  <span>Customer Contact Details</span>
                </h2>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">
                Fields marked with{" "}
                <span className="text-rose-500 font-bold">*</span> are mandatory
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number (Primary){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alternate Mobile (Optional)
                </label>
                <input
                  type="tel"
                  name="alternateMobile"
                  value={formData.alternateMobile}
                  onChange={handleChange}
                  placeholder="e.g. 9811122233"
                  className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. rahul.sharma@example.com"
                  className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Innovations Pvt Ltd"
                  className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai"
                    className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Maharashtra"
                    className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Product & Deal Requirements */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between pb-2.5 mb-4 border-b border-[#e0e0e0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#2874f0]" />
                  <span>Product & Inquiry Specifications</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Requirement / Inquiry Description{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  name="requirement"
                  value={formData.requirement}
                  onChange={handleChange}
                  placeholder="Detail the customer's specific needs, specifications, and project scope..."
                  className="w-full p-3 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Product / Offering
                </label>
                <input
                  type="text"
                  name="productService"
                  value={formData.productService}
                  onChange={handleChange}
                  placeholder="e.g. Enterprise Cloud Suite"
                  className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Budget (₹ INR)
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="e.g. 150000"
                  className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Marketplace Fulfillment & Logistics */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between pb-2.5 mb-4 border-b border-[#e0e0e0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#2874f0]" />
                  <span>Marketplace Allocation & SLA Configuration</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lead Source / Channel
                </label>
                <Select
                  value={formData.leadSource}
                  onValueChange={(value) =>
                    handleFieldChange("leadSource", value || "Direct")
                  }
                >
                  <SelectTrigger className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition-all">
                    <SelectValue placeholder="Select lead source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Direct">Direct</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Campaign">Campaign</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Cold Call">Cold Call</SelectItem>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Priority Level (SLA)
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    handleFieldChange("priority", value || PriorityLevel.MEDIUM)
                  }
                >
                  <SelectTrigger className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition-all">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PriorityLevel.LOW}>LOW</SelectItem>
                    <SelectItem value={PriorityLevel.MEDIUM}>MEDIUM</SelectItem>
                    <SelectItem value={PriorityLevel.HIGH}>HIGH</SelectItem>
                    <SelectItem value={PriorityLevel.URGENT}>URGENT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Form Actions Footer matching Flipkart Seller Central buttons */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="h-8.5 px-3 rounded-sm border border-[#e0e0e0] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Form</span>
            </button>

            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard/leads"
                className="h-8.5 px-4 rounded-sm border border-[#e0e0e0] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold flex items-center transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="h-8.5 px-5 rounded-sm bg-[#2874f0] hover:bg-[#1a5bb8] text-white font-bold text-xs uppercase tracking-wide flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SAVING TO POOL...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>SAVE LISTING TO POOL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
