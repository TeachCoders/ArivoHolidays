"use client";

import React, { useState } from "react";
import { useGetVendorPortal } from "@/feature/vendors/api/useVendorHooks";
import { useGetVendors } from "@/feature/vendors/api/useVendorHooks";
import { User2, Briefcase, IndianRupee, Clock, CheckCircle, ChevronDown } from "lucide-react";
import PageLoader from "@/components/shared/PageLoader";

const statusConfig: Record<string, { label: string; className: string }> = {
  UPCOMING: { label: "Upcoming", className: "bg-blue-100 text-brand-info" },
  ONGOING: { label: "In Progress", className: "bg-amber-100 text-brand-warning" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
};

export function VendorPortalTab() {
  const { vendors, isLoading: vendorsLoading } = useGetVendors();
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const { portalData, isLoading: portalLoading } = useGetVendorPortal(selectedVendorId);

  if (vendorsLoading) {
    return <PageLoader size="section" text="Loading vendors..." />;
  }

  return (
    <div className="space-y-6">
      {/* Vendor Selector */}
      <div className="bg-white rounded-2xl border border-brand-neutral-border shadow-sm p-5">
        <p className="text-sm font-semibold text-brand-neutral mb-2">Preview Vendor Portal</p>
        <div className="relative">
          <select
            value={selectedVendorId ?? ""}
            onChange={(e) => setSelectedVendorId(e.target.value ? Number(e.target.value) : null)}
            className="flex h-11 w-full max-w-sm rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none pr-10"
          >
            <option value="">-- Select a Vendor to Preview --</option>
            {vendors.map((v: any) => (
              <option key={v.id} value={v.id}>{v.vendarCompanyName || v.vendarName}{v.vendarName && v.vendarCompanyName ? ` (${v.vendarName})` : ""}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {!selectedVendorId && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-12 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User2 size={28} className="text-brand-primary" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Vendor Portal Preview</h3>
          <p className="text-brand-neutral-muted text-sm mt-2">Select a vendor above to preview their portal dashboard</p>
        </div>
      )}

      {selectedVendorId && portalLoading && (
        <PageLoader size="section" text="Loading portal data..." />
      )}

      {selectedVendorId && portalData && (
        <div className="space-y-5">
          {/* Vendor Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
                  {(portalData.vendor?.vendarCompanyName || portalData.vendor?.vendarName)?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm opacity-80">Welcome back,</p>
                  <h2 className="h6">{portalData.vendor?.vendarCompanyName || portalData.vendor?.vendarName}</h2>
                  <p className="text-sm opacity-70">{portalData.vendor?.vendarCompanyName}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${portalData.vendor?.vendarIsActive ? "bg-green-400/30 text-green-100" : "bg-red-400/30 text-red-100"}`}>
                  {portalData.vendor?.vendarIsActive ? "Active" : "Inactive"}
                </span>
                <p className="text-sm mt-2 opacity-80">{portalData.vendor?.engagementModel === "COMMISSION" ? `Commission: ${portalData.vendor?.defaultCommission ?? 0}%` : "Service Based"}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Active Assignments", value: portalData.stats?.activeAssignments ?? 0, icon: Briefcase, color: "bg-brand-info-light text-brand-info", iconColor: "text-blue-500" },
              { label: "Total Earnings", value: `₹${Number(portalData.stats?.totalEarnings ?? 0).toLocaleString()}`, icon: IndianRupee, color: "bg-brand-success-light text-brand-success", iconColor: "text-emerald-500" },
              { label: "Pending Payments", value: `₹${Number(portalData.stats?.pendingPayments ?? 0).toLocaleString()}`, icon: Clock, color: "bg-brand-warning-light text-brand-warning", iconColor: "text-amber-500" },
              { label: "Completed Services", value: portalData.stats?.completedServices ?? 0, icon: CheckCircle, color: "bg-purple-50 text-purple-700", iconColor: "text-purple-500" },
            ].map(({ label, value, icon: Icon, color, iconColor }) => (
              <div key={label} className={`${color} rounded-2xl p-4 border border-current/10`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold opacity-80">{label}</p>
                  <Icon size={16} className={iconColor} />
                </div>
                <p className="text-xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          {/* Assignments Table */}
          <div className="bg-white rounded-2xl border border-brand-neutral-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="font-semibold text-gray-900">My Assignments</h3>
            </div>
            {portalData.assignments?.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No assignments yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead>
                    <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
                      {["Traveller", "Services", "Total Amt", "Status", "Assigned Date"].map((h) => (
                        <th key={h} className="tbl-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-neutral-light">
                    {portalData.assignments.map((a: any) => {
                      const cfg = statusConfig[a.status] || statusConfig.UPCOMING;
                      return (
                        <tr key={a.id} className="hover:bg-brand-neutral-light/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{a.traveller?.name}</p>
                            <p className="text-xs text-gray-400">{a.traveller?.phone}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {(a.services || []).map((s: string) => (
                                <span key={s} className="text-[10px] bg-brand-primary-light text-brand-primary px-2 py-0.5 rounded-full font-medium">{s}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">₹{Number(a.totalAmount || 0).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${cfg.className}`}>{cfg.label}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-brand-neutral-muted">{new Date(a.assignedDate).toLocaleDateString("en-IN")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
