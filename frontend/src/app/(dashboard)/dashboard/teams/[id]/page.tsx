"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useGetMemberDetail } from "@/feature/teams/api/useTeam";
import Link from "next/link";
import {
  ArrowLeft, Users, CheckCircle, XCircle, Clock, IndianRupee,
  FileText, AlertTriangle, MessageSquare, ChevronRight, Phone, Mail,
} from "lucide-react";
import PageLoader from "@/components/shared/PageLoader";
import StatsCardGrid from "@/components/shared/StatsCardGrid";

const STATUS_BADGE: Record<string, { label: string; cls: string; dot: string }> = {
  COMPLETED: { label: "Confirmed", cls: "bg-brand-success-light text-brand-success border-brand-success-border", dot: "bg-brand-success" },
  ONGOING: { label: "Ongoing", cls: "bg-brand-info-light text-brand-info border-brand-info-border", dot: "bg-brand-info" },
  PENDING: { label: "Pending", cls: "bg-brand-warning-light text-brand-warning border-brand-warning-border", dot: "bg-brand-warning" },
  CANCELLED: { label: "Cancelled", cls: "bg-brand-danger-light text-brand-danger border-brand-danger-border", dot: "bg-brand-danger" },
};

const PAY_STATUS: Record<string, { label: string; cls: string }> = {
  full: { label: "Fully Paid", cls: "bg-brand-success-light text-brand-success" },
  partial: { label: "Partial", cls: "bg-brand-warning-light text-brand-warning" },
  unpaid: { label: "Unpaid", cls: "bg-brand-danger-light text-brand-danger" },
  none: { label: "No Invoice", cls: "bg-brand-neutral-light text-brand-neutral-muted" },
};

export default function MemberDetailPage() {
  const params = useParams();
  const userId = Number(params.id);
  const { memberDetail, isLoading, error } = useGetMemberDetail(userId || null);

  if (isLoading) {
    return (
      <PageLoader size="page" text="Loading member details..." />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center bg-white px-8 py-6 rounded-xl border border-brand-danger-border shadow-sm">
          <AlertTriangle size={28} className="text-brand-danger mx-auto mb-3" />
          <p className="text-brand-danger font-semibold text-sm mb-1">Failed to load member details</p>
          <Link href="/dashboard/teams" className="mt-4 inline-block text-xs text-brand-600 hover:underline font-medium">Go Back</Link>
        </div>
      </div>
    );
  }

  if (!memberDetail?.user) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center bg-white px-8 py-6 rounded-xl border border-brand-neutral-border shadow-sm">
          <AlertTriangle size={28} className="text-brand-neutral-muted mx-auto mb-3" />
          <p className="text-brand-neutral-muted text-sm">Member not found.</p>
          <Link href="/dashboard/teams" className="mt-4 inline-block text-xs text-brand-600 hover:underline font-medium">Go Back</Link>
        </div>
      </div>
    );
  }

  const { user, leads, stats } = memberDetail;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-brand-neutral-border shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard/teams" className="p-2 rounded-xl bg-brand-neutral-light hover:bg-brand-neutral-border transition">
            <ArrowLeft size={16} className="text-brand-neutral" />
          </Link>
          <div>
            <h1 className="h6 text-brand-neutral-dark">{user.name}</h1>
            <p className="text-brand-neutral-muted text-xs">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="px-3 py-1 rounded-full font-bold bg-brand-50 text-brand-700">{user.role?.replace(/_/g, " ")}</span>
          {user.team && (
            <span className="px-3 py-1 rounded-full font-bold bg-brand-primary-light text-brand-primary">{user.team.name} Team</span>
          )}
          <span className={`px-3 py-1 rounded-full font-bold ${user.isActive ? "bg-brand-success-light text-brand-success" : "bg-brand-neutral-light text-brand-neutral-muted"}`}>
            {user.isActive ? "Active" : "Inactive"}
          </span>
          {user.mobile && (
            <span className="flex items-center gap-1 text-brand-neutral-muted"><Phone size={12} /> {user.mobile}</span>
          )}
        </div>
      </div>

      <StatsCardGrid
        items={[
          { label: "Total Leads", value: stats.totalLeads, icon: Users },
          { label: "Confirmed", value: stats.confirmed, icon: CheckCircle },
          { label: "Cancelled", value: stats.cancelled, icon: XCircle },
          { label: "Ongoing", value: stats.ongoing, icon: Clock },
        ]}
        columns={4}
        size="md"
      />

      <StatsCardGrid
        items={[
          { label: "Conversations", value: stats.totalConversations, icon: MessageSquare },
          { label: "Invoiced", value: `Rs. ${stats.totalInvoiced.toLocaleString()}`, icon: FileText },
          { label: "Paid", value: `Rs. ${stats.totalPaid.toLocaleString()}`, icon: IndianRupee },
          { label: "Due", value: `Rs. ${stats.dueAmount.toLocaleString()}`, icon: AlertTriangle },
        ]}
        columns={4}
        size="md"
      />

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-brand-neutral-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-neutral-border">
          <h3 className="font-bold text-brand-neutral-dark text-sm flex items-center gap-2">
            <Users size={16} className="text-brand-600" />
            Assigned Leads ({leads.length})
          </h3>
        </div>
        {leads.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={28} className="text-brand-neutral-muted mx-auto mb-3" />
            <p className="text-brand-neutral-muted text-sm">No leads assigned to this member yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
                  <th className="tbl-th">Traveller</th>
                  <th className="tbl-th">Contact</th>
                  <th className="tbl-th">Status</th>
                  <th className="tbl-th">Conversations</th>
                  <th className="tbl-th">Vendor</th>
                  <th className="tbl-th">Invoiced</th>
                  <th className="tbl-th">Paid</th>
                  <th className="tbl-th">Payment</th>
                  <th className="tbl-th">Action</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-brand-neutral-light">
                {leads.map((lead: any) => {
                  const st = lead.status || "PENDING";
                  const badge = STATUS_BADGE[st] || STATUS_BADGE.PENDING;
                  const invoiced = (lead.invoices || [])
                    .filter((inv: any) => inv.status !== "CANCELLED")
                    .reduce((sum: number, inv: any) => sum + (inv.grandTotal || 0), 0);
                  const paid = (lead.payments || [])
                    .filter((p: any) => p.status === "COMPLETED")
                    .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
                  const due = Math.max(0, invoiced - paid);
                  const paySt = invoiced === 0 && paid === 0 ? "none" : paid >= invoiced && invoiced > 0 ? "full" : paid > 0 ? "partial" : "unpaid";
                  const payBadge = PAY_STATUS[paySt];

                  return (
                    <tr key={lead.id} className="hover:bg-brand-neutral-light/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] font-bold text-brand-neutral-muted bg-brand-neutral-light px-2 py-0.5 rounded inline-block mb-0.5">{lead.travellerId}</span>
                        <p className="font-bold text-brand-neutral-dark text-sm">{lead.name}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-brand-neutral">
                        <p>{lead.phone}</p>
                        <p className="text-brand-neutral-muted">{lead.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${badge.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />{badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-brand-neutral">
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare size={12} className="text-violet-500" />
                          {(lead.followupNotes || []).length}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-brand-neutral">{lead.vendor?.vendarCompanyName || lead.vendor?.vendarName || "—"}</td>
                      <td className="px-4 py-3 text-xs font-bold text-brand-neutral">Rs. {invoiced.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-bold text-brand-success">Rs. {paid.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${payBadge.cls}`}>{payBadge.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/sales/followup/${lead.id}`} className="text-[10px] font-medium bg-brand-50 border border-brand-200 text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition inline-flex items-center gap-1">
                          Followup <ChevronRight size={11} />
                        </Link>
                      </td>
                    </tr>
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
