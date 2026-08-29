"use client";

import React, { useMemo, useState } from "react";
import { ClipboardList, Search, Users, ChevronRight, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import { useGetTeam } from "@/feature/teams/api/useTeam";
import { useFetchAllLeads } from "@/feature/leads/api/useLeeds";
import PageLoader from "@/components/shared/PageLoader";
import StatsCardGrid from "@/components/shared/StatsCardGrid";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-brand-success-light text-brand-success",
  working: "bg-brand-info-light text-brand-info",
  cancelled: "bg-brand-danger-light text-brand-danger",
  pending: "bg-brand-warning-light text-brand-warning",
};

export default function SalesLeadsTrackingPage() {
  const { teams = [], isLoading: teamsLoading } = useGetTeam();
  const { leads = [], isLoading: leadsLoading } = useFetchAllLeads();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMember, setExpandedMember] = useState<number | null>(null);

  // Get sales team members
  const salesTeam = teams.find((t: any) => t.name?.toLowerCase() === "sales");
  const salesMembers = salesTeam?.users || [];

  // Group leads by sales member (assignedTo)
  const leadsByMember = useMemo(() => {
    const map = new Map<number, { member: any; leads: any[] }>();

    // Initialize with all sales members
    for (const member of salesMembers) {
      map.set(member.id, { member, leads: [] });
    }

    // Assign leads to members
    for (const lead of leads) {
      const assigneeId = lead.assignedTo?.id;
      if (assigneeId && map.has(assigneeId)) {
        map.get(assigneeId)!.leads.push(lead);
      }
    }

    return Array.from(map.values());
  }, [leads, salesMembers]);

  // Filter by search
  const filtered = leadsByMember.filter(({ member, leads: memberLeads }) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = member.name?.toLowerCase().includes(q);
    const leadMatch = memberLeads.some(
      (l: any) =>
        l.name?.toLowerCase().includes(q) ||
        l.travellerId?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q)
    );
    return nameMatch || leadMatch;
  });

  const isLoading = teamsLoading || leadsLoading;

  // Stats
  const totalAssigned = leadsByMember.reduce((sum, m) => sum + m.leads.length, 0);
  const confirmedCount = leads.filter((l: any) => l.bookingStatus === "confirmed").length;
  const pendingCount = leads.filter((l: any) => l.bookingStatus === "pending" || l.bookingStatus === "working").length;

  if (isLoading) {
    return <PageLoader size="section" text="Loading..." />;
  }

  return (
    <div className="space-y-6">
      <PrivatePageHeading
        icon={ClipboardList}
        title="Sales Lead Tracking"
        description="Track which leads are assigned to which sales member"
      />

      {/* Stats */}
      <StatsCardGrid
        items={[
          { label: "Total Assigned", value: totalAssigned, icon: ClipboardList },
          { label: "Confirmed", value: confirmedCount, icon: CheckCircle },
          { label: "Pending / Ongoing", value: pendingCount, icon: Clock },
          { label: "Sales Members", value: salesMembers.length, icon: Users },
        ]}
        columns={4}
        size="md"
      />

      {/* Search */}
      <div className="bg-white rounded-2xl border border-brand-neutral-border shadow-sm p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-neutral-muted" />
          <input
            type="text"
            placeholder="Search by member or traveller name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-brand-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* Members & Their Leads */}
      <div className="bg-white rounded-2xl border border-brand-neutral-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-neutral-border">
          <h3 className="font-bold text-brand-neutral-dark text-sm">Sales Members & Assigned Leads</h3>
        </div>
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={28} className="text-brand-neutral-muted mx-auto mb-3" />
            <p className="text-brand-neutral-muted text-sm">No sales members found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
                  <th className="w-8 px-4 py-3"></th>
                  <th className="tbl-th">Sales Member</th>
                  <th className="tbl-th">Total Leads</th>
                  <th className="tbl-th">Confirmed</th>
                  <th className="tbl-th">Pending</th>
                  <th className="tbl-th">Cancelled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-neutral-light">
                {filtered.map(({ member, leads: memberLeads }) => {
                  const isExpanded = expandedMember === member.id;
                  const confirmed = memberLeads.filter((l: any) => l.bookingStatus === "confirmed").length;
                  const pending = memberLeads.filter((l: any) => l.bookingStatus === "pending" || l.bookingStatus === "working").length;
                  const cancelled = memberLeads.filter((l: any) => l.bookingStatus === "cancelled").length;

                  return (
                    <React.Fragment key={member.id}>
                      <tr
                        onClick={() => setExpandedMember(isExpanded ? null : member.id)}
                        className="hover:bg-brand-neutral-light/50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <ChevronRight
                            size={16}
                            className={`text-brand-neutral-muted transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-900 font-bold text-xs shrink-0">
                              {member.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-brand-neutral-dark">{member.name}</p>
                              <p className="text-[11px] text-brand-neutral-muted">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-brand-neutral-dark">{memberLeads.length}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center justify-center min-w-8 text-xs font-bold px-2.5 py-1 rounded-full ${confirmed > 0 ? 'bg-brand-success-light text-brand-success' : 'bg-slate-100 text-slate-500'}`}>
                            {confirmed}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center justify-center min-w-8 text-xs font-bold px-2.5 py-1 rounded-full ${pending > 0 ? 'bg-brand-warning-light text-brand-warning' : 'bg-slate-100 text-slate-500'}`}>
                            {pending}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center justify-center min-w-8 text-xs font-bold px-2.5 py-1 rounded-full ${cancelled > 0 ? 'bg-brand-danger-light text-brand-danger' : 'bg-slate-100 text-slate-500'}`}>
                            {cancelled}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Leads */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="p-0">
                            <div className="bg-brand-primary-light/70 border-t-2 border-brand-primary px-6 py-3">
                              {memberLeads.length === 0 ? (
                                <p className="text-sm text-brand-neutral-muted py-3 text-center">No leads assigned yet.</p>
                              ) : (
                                <table className="tbl-xs">
                                  <thead>
                                    <tr className="tbl-row-header text-brand-primary">
                                      <th className="text-left py-2 px-3">Traveller</th>
                                      <th className="text-left py-2 px-3">Email</th>
                                      <th className="text-left py-2 px-3">Phone</th>
                                      <th className="text-left py-2 px-3">Status</th>
                                      <th className="text-right py-2 px-3">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-brand-primary">
                                    {memberLeads.map((lead: any) => (
                                      <tr key={lead.id} className="tbl-nested-row">
                                        <td className="py-2.5 px-3">
                                          <span className="font-semibold text-brand-neutral-dark">{lead.name}</span>
                                          <p className="text-[10px] text-brand-neutral-muted">{lead.travellerId}</p>
                                        </td>
                                        <td className="py-2.5 px-3 text-brand-neutral">{lead.email || "—"}</td>
                                        <td className="py-2.5 px-3 text-brand-neutral">{lead.phone || "—"}</td>
                                        <td className="py-2.5 px-3">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[lead.bookingStatus] || "bg-brand-neutral-light text-brand-neutral-muted"}`}>
                                            {lead.bookingStatus || "—"}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                          <Link
                                            href={`/dashboard/sales/followup/${lead.id}`}
                                            className="text-[11px] font-medium bg-brand-50 border border-brand-200 text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition inline-flex items-center gap-1"
                                          >
                                            <Eye size={11} /> View
                                          </Link>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
