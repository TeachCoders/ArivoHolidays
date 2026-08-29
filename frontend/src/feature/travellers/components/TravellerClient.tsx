"use client";

import React, { useMemo, useState } from "react";
import { ReusableModel } from "@/components/shared/reusableModel";
import {
  Users, IndianRupee, Clock, TrendingUp, UserCheck, Plane, CreditCard,
  ChevronRight, Eye, FileText, CheckCircle, AlertCircle, X, Pencil,
} from "lucide-react";
import Link from "next/link";
import { useFetchAllLeads } from "@/feature/leads/api/useLeeds";
import { useGetTravellerPayments, useGetTravellerPaymentStats, useUpdateTravellerPaymentStatus } from "@/feature/payments/api/usePaymentsHooks";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import StatsCardGrid from "@/components/shared/StatsCardGrid";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import FilterBox from "@/components/shared/FilterBox";
import { errorToast } from "@/components/shared/tost";
import PageLoader from "@/components/shared/PageLoader";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  UPCOMING: { label: "Pending Approval", className: "bg-brand-warning-light text-brand-warning" },
  ONGOING: { label: "Processing", className: "bg-brand-info-light text-brand-info" },
  COMPLETED: { label: "Approved", className: "bg-brand-success-light text-brand-success" },
  CANCELLED: { label: "Rejected", className: "bg-brand-danger-light text-brand-danger" },
};

export default function TravellerClient() {
  const { user } = useGetCurrentUser();
  const normalizedRole = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = normalizedRole.includes("super") && normalizedRole.includes("admin");

  const { leads = [], isLoading: leadsLoading } = useFetchAllLeads();
  const { payments, isLoading: paymentsLoading } = useGetTravellerPayments();
  const { stats, isLoading: statsLoading } = useGetTravellerPaymentStats();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateTravellerPaymentStatus();

  const [expandedTraveller, setExpandedTraveller] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states for payment review
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [transactionDetail, setTransactionDetail] = useState("");

  // Group payments by traveller
  const groupedPayments = useMemo(() => {
    const map = new Map<number, { traveller: any; payments: any[]; invoiced: number; paid: number; due: number; pendingCount: number }>();
    for (const p of payments) {
      const tid = p.traveller?.id;
      if (!tid) continue;
      if (!map.has(tid)) {
        map.set(tid, { traveller: p.traveller, payments: [], invoiced: 0, paid: 0, due: 0, pendingCount: 0 });
      }
      const group = map.get(tid)!;
      group.payments.push(p);
    }
    for (const [, group] of map) {
      const invoices = group.traveller?.invoices || [];
      group.invoiced = invoices.reduce((sum: number, inv: any) => sum + (inv.grandTotal || 0), 0);
      group.paid = group.payments.reduce((sum: number, p: any) => sum + (p.status === "COMPLETED" ? (p.amount || 0) : 0), 0);
      group.due = Math.max(0, group.invoiced - group.paid);
      group.pendingCount = group.payments.filter((p: any) => p.status === "UPCOMING").length;
    }
    return Array.from(map.values());
  }, [payments]);

  // Traveller list with payment info
  const travellersWithPayments = useMemo(() => {
    return leads.map((lead: any) => {
      const pg = groupedPayments.find((g) => g.traveller?.id === lead.id);
      return {
        ...lead,
        invoiced: pg?.invoiced || 0,
        paid: pg?.paid || 0,
        due: pg?.due || 0,
        paymentCount: pg?.payments?.length || 0,
        pendingCount: pg?.pendingCount || 0,
      };
    });
  }, [leads, groupedPayments]);

  // Filter by search
  const filtered = travellersWithPayments.filter((t: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.travellerId?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.phone?.includes(q)
    );
  });

  const openReviewModal = (pay: any) => {
    setSelectedPayment(pay);
    setTransactionId(pay.transactionId || "");
    setTransactionDetail(pay.transactionDetail || "");
    setIsModalOpen(true);
  };

  const handleApprove = () => {
    if (!selectedPayment) return;
    if (!transactionId.trim()) { errorToast("Transaction ID is required!"); return; }
    if (!transactionDetail.trim()) { errorToast("Notes are required!"); return; }
    updateStatus({ id: selectedPayment.id, payload: { status: "COMPLETED", transactionId: transactionId.trim(), transactionDetail: transactionDetail.trim() } });
    setIsModalOpen(false);
    setSelectedPayment(null);
  };

  const handleReject = () => {
    if (!selectedPayment) return;
    if (!transactionDetail.trim()) { errorToast("Notes are required!"); return; }
    updateStatus({ id: selectedPayment.id, payload: { status: "CANCELLED", transactionDetail: transactionDetail.trim() } });
    setIsModalOpen(false);
    setSelectedPayment(null);
  };

  const handleUpdateTransaction = () => {
    if (!selectedPayment) return;
    if (!transactionId.trim()) { errorToast("Transaction ID is required!"); return; }
    if (!transactionDetail.trim()) { errorToast("Notes are required!"); return; }
    updateStatus({ id: selectedPayment.id, payload: { status: selectedPayment.status, transactionId: transactionId.trim(), transactionDetail: transactionDetail.trim() } });
    setIsModalOpen(false);
    setSelectedPayment(null);
  };

  const formatDate = (d: string | Date) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <PrivatePageHeading
        icon={Users}
        title="Traveller Management"
        description="View all travellers, their leads and payment status"
      />

      <StatsCardGrid
        items={[
          { label: "Total Travellers", value: leads.length, icon: Users },
          { label: "Total Invoiced", value: `₹${Number(stats?.totalInvoicedAmount || 0).toLocaleString()}`, icon: IndianRupee },
          { label: "Payments Recorded", value: stats?.totalPaymentsRecorded || 0, icon: CreditCard },
          { label: "Pending Approval", value: groupedPayments.reduce((sum, g) => sum + g.pendingCount, 0), icon: Clock },
        ]}
        columns={4}
        size="md"
      />

      <FilterBox
        search={{ value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search by name, ID, email, phone..." }}
      />

      {/* Travellers Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-sm">All Travellers</h3>
        </div>
        {leadsLoading ? (
          <PageLoader size="section" text="Loading..." />
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={28} className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No travellers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
                  <th className="tbl-th w-8"></th>
                  <th className="tbl-th">Traveller</th>
                  <th className="tbl-th">Contact</th>
                  <th className="tbl-th">Invoiced</th>
                  <th className="tbl-th">Paid</th>
                  <th className="tbl-th">Due</th>
                  <th className="tbl-th">Payments</th>
                  <th className="tbl-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-neutral-light">
                {filtered.map((t: any) => {
                  const isExpanded = expandedTraveller === t.id;
                  const pg = groupedPayments.find((g) => g.traveller?.id === t.id);
                  return (
                    <React.Fragment key={t.id}>
                      <tr className="hover:bg-brand-neutral-light/50 transition-colors">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setExpandedTraveller(isExpanded ? null : t.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <ChevronRight size={16} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/sales/followup/${t.id}`}
                            className="font-semibold text-brand-600 hover:underline"
                          >
                            {t.name || "-"}
                          </Link>
                          <p className="text-[11px] text-gray-400">{t.travellerId || ""}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          <p>{t.email || "-"}</p>
                          <p className="text-gray-400">{t.phone || ""}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">₹{(t.invoiced || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold text-brand-success">₹{(t.paid || 0).toLocaleString()}</td>
                        <td className={`px-4 py-3 font-semibold ${(t.due || 0) > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                          ₹{(t.due || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          {t.pendingCount > 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-warning-light text-brand-warning">
                              {t.pendingCount} Pending
                            </span>
                          ) : t.paymentCount > 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-success-light text-brand-success">All Clear</span>
                          ) : (
                            <span className="text-[10px] text-gray-400">No payments</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/sales/followup/${t.id}`}
                            className="text-xs bg-brand-50 border border-brand-200 text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition font-medium inline-flex items-center gap-1"
                          >
                            <Eye size={11} /> View
                          </Link>
                        </td>
                      </tr>

                      {/* Expanded Payment Details */}
                      {isExpanded && pg && (
                        <tr>
                          <td colSpan={8} className="p-0">
                            <div className="bg-indigo-50/70 border-t-2 border-indigo-200 px-6 py-3">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                                    <th className="tbl-th-sm">Installment</th>
                                    <th className="tbl-th-sm">Amount</th>
                                    <th className="tbl-th-sm">Date</th>
                                    <th className="tbl-th-sm">Slip</th>
                                    <th className="tbl-th-sm">Status</th>
                                    <th className="tbl-th-sm">Approved On</th>
                                    {isSuperAdmin && <th className="tbl-th-sm text-right">Action</th>}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-indigo-100">
                                  {[...pg.payments].sort((a: any, b: any) => new Date(b.paymentDate || b.createdAt).getTime() - new Date(a.paymentDate || a.createdAt).getTime()).map((pay: any, idx: number) => {
                                    const cfg = STATUS_CONFIG[pay.status] || STATUS_CONFIG.UPCOMING;
                                    return (
                                      <tr key={pay.id} className="hover:bg-white/70 transition-colors">
                                        <td className="py-2.5 px-3 font-bold text-gray-700">#{pg.payments.length - idx}</td>
                                        <td className="py-2.5 px-3 font-semibold text-gray-900">₹{Number(pay.amount || 0).toLocaleString()}</td>
                                        <td className="py-2.5 px-3 text-gray-600">{formatDate(pay.paymentDate)}</td>
                                        <td className="py-2.5 px-3">
                                          {pay.paymentScreenshotUrl ? (
                                            <a href={pay.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-medium hover:underline flex items-center gap-1">
                                              <FileText size={11} /> View
                                            </a>
                                          ) : <span className="text-gray-400">—</span>}
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${cfg.className}`}>{cfg.label}</span>
                                        </td>
                                        <td className="py-2.5 px-3 text-gray-500">{pay.approvedAt ? formatDate(pay.approvedAt) : "—"}</td>
                                        {isSuperAdmin && (
                                          <td className="py-2.5 px-3 text-right">
                                            {pay.status === "UPCOMING" ? (
                                              <button
                                                onClick={() => openReviewModal(pay)}
                                                className="text-[11px] font-medium bg-brand-warning-light border border-brand-warning text-brand-warning px-3 py-1.5 rounded-lg hover:bg-amber-100 transition shadow-sm inline-flex items-center gap-1"
                                              >
                                                <Eye size={11} /> Review
                                              </button>
                                            ) : pay.status === "COMPLETED" ? (
                                              <button
                                                onClick={() => openReviewModal(pay)}
                                                className="text-[11px] font-medium bg-brand-primary-light border border-brand-primary text-brand-primary px-3 py-1.5 rounded-lg hover:bg-brand-primary-light transition shadow-sm inline-flex items-center gap-1"
                                              >
                                                <Pencil size={11} /> Edit
                                              </button>
                                            ) : (
                                              <span className="text-gray-400">—</span>
                                            )}
                                          </td>
                                        )}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                      {isExpanded && !pg && (
                        <tr>
                          <td colSpan={8} className="p-0">
                            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-400">
                              No payment records for this traveller.
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

      {/* Review Modal */}
      <ReusableModel
        open={isModalOpen}
        onOpenChange={(open) => { setIsModalOpen(open); if (!open) setSelectedPayment(null); }}
        title="Review Payment"
        description="Check payment details and approve or reject."
        contentClassName="sm:max-w-[500px]"
      >
        {selectedPayment && (
          <div className="space-y-4">
            {selectedPayment.paymentScreenshotUrl && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Screenshot</p>
                <a href={selectedPayment.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={selectedPayment.paymentScreenshotUrl}
                    alt="Payment screenshot"
                    className="w-full max-h-56 rounded-xl object-cover border border-gray-200 hover:opacity-90 transition-opacity"
                  />
                </a>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-gray-900">₹{Number(selectedPayment.amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Date</span>
                <span className="font-semibold text-gray-700">{formatDate(selectedPayment.paymentDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Traveller</span>
                <span className="font-semibold text-gray-700">{selectedPayment.traveller?.name}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Transaction ID (UTR) *</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter UTR / Transaction ID"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Notes *</label>
              <textarea
                value={transactionDetail}
                onChange={(e) => setTransactionDetail(e.target.value)}
                placeholder="Add any internal notes..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[60px]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              {selectedPayment.status === "COMPLETED" ? (
                <button
                  onClick={handleUpdateTransaction}
                  disabled={isUpdating || !transactionId.trim() || !transactionDetail.trim()}
                  className="btn-primary flex-1 px-4 py-2.5 font-semibold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isUpdating ? <PageLoader size="inline" /> : <CheckCircle className="h-4 w-4" />}
                   {isUpdating ? "Updating..." : "Update"}
                 </button>
               ) : (
                 <>
                   <button
                     onClick={handleApprove}
                     disabled={isUpdating || !transactionId.trim() || !transactionDetail.trim()}
                     className="flex-1 px-4 py-2.5 bg-brand-success text-white font-semibold text-sm rounded-lg hover:bg-brand-success transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                   >
                     {isUpdating ? <PageLoader size="inline" /> : <CheckCircle className="h-4 w-4" />}
                     {isUpdating ? "Processing..." : "Approve"}
                   </button>
                   <button
                     onClick={handleReject}
                     disabled={isUpdating || !transactionDetail.trim()}
                     className="flex-1 px-4 py-2.5 bg-brand-danger text-white font-semibold text-sm rounded-lg hover:bg-brand-danger transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                   >
                     {isUpdating ? <PageLoader size="inline" /> : <X className="h-4 w-4" />}
                    {isUpdating ? "Processing..." : "Reject"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </ReusableModel>
    </div>
  );
}
