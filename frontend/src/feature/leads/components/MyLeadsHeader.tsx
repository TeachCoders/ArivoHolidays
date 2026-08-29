"use client";
import React from "react";
import { ShieldCheck, RefreshCw, Undo2, MessageSquare } from "lucide-react";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import { UnrestrictedDateRangePicker } from "@/components/shared/unrestrictedDateRangePicker";

interface MyLeadsHeaderProps {
  user: any;
  dateRange: { from?: Date; to?: Date };
  setDateRange: (r: any) => void;
  setAssignedTypeFilter: (v: string) => void;
  setStatusFilter: (v: string) => void;
  isSuperAdmin: boolean;
  activeTab?: "all" | "chat-leads";
  setActiveTab?: (t: "all" | "chat-leads") => void;
  chatLeadsCount: number;
  statusFilter: string;
  assignedTypeFilter: string;
  resetAllFilters: () => void;
  refetch: () => void;
  dynamicStats?: any;
  websiteLeadsCount?: number;
}

export function MyLeadsHeader({
  user, dateRange, setDateRange,
  setAssignedTypeFilter, setStatusFilter, isSuperAdmin,
  statusFilter, assignedTypeFilter,
  resetAllFilters, refetch, dynamicStats,
}: MyLeadsHeaderProps) {
  return (
    <>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6 flex-wrap">
          <PrivatePageHeading
            icon={ShieldCheck}
            title="My Leads"
            description={`Logged in as ${user?.name} (${user?.role}) • Manage leads, payments & followup.`}
          />
        </div>
        {dynamicStats && (
          <div className="hidden xl:flex items-center gap-4">
            <div className="flex flex-col items-start px-5 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-w-[130px]">
              <span className="text-[10px] font-semibold text-slate-500 tracking-wide uppercase mb-1">Total Leads</span>
              <span className="text-xl font-black text-slate-800 leading-none">{dynamicStats.totalLeads}</span>
            </div>
            <div className="flex flex-col items-start px-5 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-w-[130px]">
              <span className="text-[10px] font-semibold text-slate-500 tracking-wide uppercase mb-1">Confirmed</span>
              <span className="text-xl font-black text-slate-800 leading-none">{dynamicStats.confirmed}</span>
            </div>
            <div className="flex flex-col items-start px-5 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-w-[150px]">
              <span className="text-[10px] font-semibold text-slate-500 tracking-wide uppercase mb-1">Payments</span>
              <span className="text-xl font-black text-slate-800 leading-none">₹{dynamicStats.totalPaid?.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-start px-5 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-w-[130px]">
              <span className="text-[10px] font-semibold text-slate-500 tracking-wide uppercase mb-1">Dues</span>
              <span className="text-xl font-black text-slate-800 leading-none">₹{dynamicStats.totalPending?.toLocaleString()}</span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2.5 shrink-0">
          <UnrestrictedDateRangePicker value={dateRange} onChange={(range) => setDateRange(range)} />

          {(dateRange.from || statusFilter !== "all" || assignedTypeFilter !== "all") && (
            <button
              onClick={resetAllFilters}
              title="Reset Filters"
              className="p-2.5 border border-brand-neutral-border rounded-xl bg-brand-neutral-light text-brand-neutral-muted hover:text-rose-600 transition-all hover:bg-rose-50 shadow-sm"
            >
              <Undo2 size={15} />
            </button>
          )}
        </div>
      </div>



    </>
  );
}
