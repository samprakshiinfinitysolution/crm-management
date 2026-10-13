import React from "react";

import { User } from "lucide-react";

interface RegisterFieldsProps {
  fullName: string;
  onFullNameChange: (val: string) => void;
}

export default function RegisterFields({
  fullName,
  onFullNameChange,
}: RegisterFieldsProps) {
  return (
    <div className="flex flex-col gap-3.5">
      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-crm-primary flex items-center gap-1">
          <span>Official Full Name</span>
          <span className="text-rose-500">*</span>
        </label>
        <div className="relative flex items-center">
          <User className="w-4 h-4 text-crm-muted absolute left-3 pointer-events-none" />
          <input
            required
            type="text"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            placeholder="e.g. Rachel Sterling"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-crm-subtle border border-crm-subtle text-crm-primary placeholder:text-crm-muted text-sm focus:bg-card focus:outline-none focus:border-(--crm-brand-primary) focus:ring-2 focus:ring-blue-500/15 transition-all shadow-2xs"
          />
        </div>
      </div>
    </div>
  );
}
