"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useGetVendorDetail } from "@/feature/vendors/api/useVendorHooks";
import Link from "next/link";
import {
  ArrowLeft, Users, CheckCircle, XCircle, Clock, IndianRupee,
  FileText, AlertTriangle, Briefcase, Phone, Mail,
  ChevronDown, ChevronRight, CreditCard, Landmark, Wallet,
  MapPin,
} from "lucide-react";
import PageLoader from "@/components/shared/PageLoader";
import StatsCardGrid from "@/components/shared/StatsCardGrid";

const STATUS_BADGE: Record<string, { label: string; cls: string; dot: string }> = {
  COMPLETED: { label: "Completed", cls: "bg-brand-success-light text-brand-success border-brand-success-border", dot: "bg-brand-success" },
  ONGOING: { label: "Ongoing", cls: "bg-brand-info-light text-brand-info border-brand-info-border", dot: "bg-brand-info" },
  UPCOMING: { label: "Upcoming", cls: "bg-brand-warning-light text-brand-warning border-brand-warning-border", dot: "bg-brand-warning" },
  CANCELLED: { label: "Cancelled", cls: "bg-brand-danger-light text-brand-danger border-brand-danger-border", dot: "bg-brand-danger" },
};

const METHOD_LABELS: Record<string, string> = {
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
  CASH: "Cash",
  CHEQUE: "Cheque",
};

export default function VendorDetailPage() {
  const params = useParams();
  const vendorId = Number(params.id);
  const { vendorDetail, isLoading, error } = useGetVendorDetail(vendorId || null);
  const [expandedTravellerId, setExpandedTravellerId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <PageLoader size="page" text="Loading vendor details..." />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center bg-white px-8 py-6 rounded-xl border border-brand-danger-border shadow-sm">
          <AlertTriangle size={28} className="text-brand-danger mx-auto mb-3" />
          <p className="text-brand-danger font-semibold text-sm mb-1">Failed to load vendor details</p>
          <Link href="/dashboard/vendors" className="mt-4 inline-block text-xs text-brand-600 hover:underline font-medium">Go Back</Link>
        </div>
      </div>
    );
  }

  if (!vendorDetail?.vendor) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center bg-white px-8 py-6 rounded-xl border border-brand-neutral-border shadow-sm">
          <AlertTriangle size={28} className="text-brand-neutral-muted mx-auto mb-3" />
          <p className="text-brand-neutral-muted text-sm">Vendor not found.</p>
          <Link href="/dashboard/vendors" className="mt-4 inline-block text-xs text-brand-600 hover:underline font-medium">Go Back</Link>
        </div>
      </div>
    );
  }

  const { vendor, assignments, invoiceItems = [], stats } = vendorDetail;
  const isCommission = vendor.engagementModel === "COMMISSION";

  // Group assignments by traveller
  const travellerGroups: Record<number, { traveller: any; assignments: any[]; totalAmount: number; totalPaid: number; totalPending: number }> = {};
  for (const a of assignments) {
    const tId = a.traveller?.id;
    if (!tId) continue;
    if (!travellerGroups[tId]) {
      travellerGroups[tId] = { traveller: a.traveller, assignments: [], totalAmount: 0, totalPaid: 0, totalPending: 0 };
    }
    travellerGroups[tId].assignments.push(a);
    const payments = a.payments || [];
    const paid = payments.reduce((sum: number, p: any) => sum + (p.paidAmount || 0), 0);
    travellerGroups[tId].totalAmount += a.totalAmount || 0;
    travellerGroups[tId].totalPaid += paid;
    travellerGroups[tId].totalPending += Math.max(0, (a.totalAmount || 0) - paid);
  }
  const travellerList = Object.values(travellerGroups);

  // Build a map of travellerId -> invoiceItems for hotel/car/guide names
  const travellerInvoiceItems: Record<number, any[]> = {};
  for (const item of invoiceItems) {
    const tId = item.invoice?.traveller?.id;
    if (!tId) continue;
    if (!travellerInvoiceItems[tId]) travellerInvoiceItems[tId] = [];
    travellerInvoiceItems[tId].push(item);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-brand-neutral-border shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard/vendors" className="p-2 rounded-xl bg-brand-neutral-light hover:bg-brand-neutral-border transition">
            <ArrowLeft size={16} className="text-brand-neutral" />
          </Link>
          <div>
            <h1 className="h6 text-brand-neutral-dark">{vendor.vendarCompanyName || vendor.vendarName}</h1>
            <p className="text-brand-neutral-muted text-xs">{vendor.vendarCompanyName}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className={`px-3 py-1 rounded-full font-bold ${isCommission ? "bg-purple-100 text-purple-700" : "bg-teal-100 text-teal-700"}`}>
            {isCommission ? "Full Package (Commission)" : "Individual Service"}
          </span>
          {isCommission && vendor.defaultCommission != null && (
            <span className="px-3 py-1 rounded-full font-bold bg-purple-50 text-purple-600">{vendor.defaultCommission}% Commission</span>
          )}
          <span className={`px-3 py-1 rounded-full font-bold ${vendor.vendarIsActive ? "bg-brand-success-light text-brand-success" : "bg-brand-neutral-light text-brand-neutral-muted"}`}>
            {vendor.vendarIsActive ? "Active" : "Inactive"}
          </span>
          {vendor.vendarMobile && (
            <span className="flex items-center gap-1 text-brand-neutral-muted"><Phone size={12} /> {vendor.vendarMobile}</span>
          )}
          {vendor.vendarEmail && (
            <span className="flex items-center gap-1 text-brand-neutral-muted"><Mail size={12} /> {vendor.vendarEmail}</span>
          )}
        </div>
      </div>

      <StatsCardGrid
        items={[
          { label: "Total Assignments", value: stats.totalAssignments, icon: Briefcase, gradient: "from-indigo-600 to-indigo-800" },
          { label: "Completed", value: stats.completedAssignments, icon: CheckCircle },
          { label: "Upcoming", value: stats.upcomingAssignments, icon: Clock },
          { label: "Ongoing", value: stats.ongoingAssignments, icon: Users },
        ]}
        columns={4}
        size="md"
      />

      <StatsCardGrid
        items={[
          { label: "Total Earnings", value: `Rs. ${(stats.totalEarnings || 0).toLocaleString()}`, icon: IndianRupee },
          { label: "Pending Payments", value: `Rs. ${(stats.pendingVendorPayments || 0).toLocaleString()}`, icon: AlertTriangle },
          { label: "Payment Records", value: stats.vendorPaymentRecords || 0, icon: FileText },
        ]}
        columns={3}
        size="md"
      />

      {/* Traveller-wise Assignments Table */}
      <div className="bg-white rounded-2xl border border-brand-neutral-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-neutral-border">
          <h3 className="font-bold text-brand-neutral-dark text-sm flex items-center gap-2">
            <Briefcase size={16} className="text-brand-600" />
            Service Assignments ({travellerList.length} traveller{travellerList.length !== 1 ? "s" : ""})
          </h3>
        </div>
        {travellerList.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase size={28} className="text-brand-neutral-muted mx-auto mb-3" />
            <p className="text-brand-neutral-muted text-sm">No service assignments for this vendor yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
                  <th className="w-8 px-4 py-3"></th>
                  <th className="tbl-th">Traveller</th>
                  <th className="tbl-th">Services</th>
                  <th className="tbl-th">Bookings</th>
                  <th className="tbl-th">Amount</th>
                  <th className="tbl-th">Paid</th>
                  <th className="tbl-th">Pending</th>
                  <th className="tbl-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-neutral-light">
                {travellerList.map(({ traveller, assignments: tAssignments, totalAmount, totalPaid, totalPending }) => {
                  const isExpanded = expandedTravellerId === traveller.id;

                  // Collect all services across assignments
                  const allServices = [...new Set(tAssignments.flatMap((a: any) => a.services || []))];

                  // Collect all cities from serviceWiseDetails
                  const allCities: string[] = [];
                  for (const a of tAssignments) {
                    const details = a.serviceWiseDetails && typeof a.serviceWiseDetails === "object" ? a.serviceWiseDetails : {};
                    for (const svc of Object.keys(details)) {
                      const entries = Array.isArray(details[svc]) ? details[svc] : [details[svc]];
                      for (const entry of entries) {
                        if (entry?.city && !allCities.includes(entry.city)) {
                          allCities.push(entry.city);
                        }
                      }
                    }
                  }

                  // Determine overall status (most recent assignment status)
                  const statusPriority: Record<string, number> = { ONGOING: 3, UPCOMING: 2, COMPLETED: 4, CANCELLED: 1 };
                  let overallStatus = "UPCOMING";
                  for (const a of tAssignments) {
                    if ((statusPriority[a.status] || 0) > (statusPriority[overallStatus] || 0)) {
                      overallStatus = a.status;
                    }
                  }
                  const badge = STATUS_BADGE[overallStatus] || STATUS_BADGE.UPCOMING;

                  // Get invoice items for this traveller (for hotel/car/guide names)
                  const tInvoiceItems = travellerInvoiceItems[traveller.id] || [];

                  return (
                    <React.Fragment key={traveller.id}>
                    <tr
                      className={`transition-colors cursor-pointer ${isExpanded ? "bg-brand-primary-light/40" : "hover:bg-brand-neutral-light/50"}`}
                        onClick={() => setExpandedTravellerId(isExpanded ? null : traveller.id)}
                      >
                        <td className="px-4 py-3">
                          {isExpanded ? <ChevronDown size={14} className="text-brand-primary" /> : <ChevronRight size={14} className="text-brand-neutral-muted" />}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[10px] font-bold text-brand-neutral-muted bg-brand-neutral-light px-2 py-0.5 rounded inline-block mb-0.5">{traveller.travellerId}</span>
                          <p className="font-bold text-brand-neutral-dark text-sm">{traveller.name || "—"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {allServices.map((s: string) => (
                              <span key={s} className="text-[10px] bg-brand-primary-light text-brand-primary px-2 py-0.5 rounded-full font-medium">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                            {tAssignments.length} booking{tAssignments.length > 1 ? "s" : ""} · {allCities.length} cit{allCities.length > 1 ? "ies" : "y"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-brand-neutral-dark">Rs. {totalAmount.toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold text-brand-success">Rs. {totalPaid.toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold text-brand-warning">Rs. {totalPending.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${badge.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />{badge.label}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded: City-wise Booking Table + Payments */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="px-0 pb-0">
                            <div className="bg-gradient-to-r from-brand-neutral-light to-brand-neutral-light border-t border-brand-neutral-border px-6 py-4 space-y-4">

                              {/* City-wise Booking Table */}
                              <div className="bg-white rounded-xl border border-brand-neutral-border overflow-hidden">
                                <div className="bg-brand-neutral-light px-4 py-2 border-b border-brand-neutral-border">
                                  <h4 className="text-xs font-bold text-brand-neutral uppercase tracking-wider flex items-center gap-1.5">
                                    <MapPin size={12} className="text-brand-primary" />
                                    Booking Details — {traveller.name}
                                  </h4>
                                </div>
                                <table className="w-full text-[11px]">
                                  <thead>
                                    <tr className="border-b border-brand-neutral-border">
                                      <th className="text-left px-4 py-2 font-semibold text-brand-neutral-muted">City</th>
                                      <th className="text-left px-4 py-2 font-semibold text-brand-neutral-muted">Service</th>
                                      <th className="text-left px-4 py-2 font-semibold text-brand-neutral-muted">Hotel / Car / Guide</th>
                                      <th className="text-center px-4 py-2 font-semibold text-brand-neutral-muted">Qty</th>
                                      <th className="text-right px-4 py-2 font-semibold text-brand-neutral-muted">Unit Price</th>
                                      <th className="text-right px-4 py-2 font-semibold text-brand-neutral-muted">Total</th>
                                      <th className="text-left px-4 py-2 font-semibold text-brand-neutral-muted">Dates</th>
                                      <th className="text-left px-4 py-2 font-semibold text-brand-neutral-muted">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {tAssignments.map((a: any) => {
                                      const details = a.serviceWiseDetails && typeof a.serviceWiseDetails === "object" ? a.serviceWiseDetails : {};
                                      const aBadge = STATUS_BADGE[a.status] || STATUS_BADGE.UPCOMING;
                                      const rows: { city: string; service: string; name: string; qty: string; unitPrice: number; totalPrice: number; dates: string }[] = [];

                                      for (const svc of Object.keys(details)) {
                                        const entries = Array.isArray(details[svc]) ? details[svc] : [details[svc]];
                                        for (const entry of entries) {
                                          if (!entry) continue;
                                          const city = entry.city || "—";
                                          const nights = entry.nights;
                                          const days = entry.days;
                                          const qtyLabel = nights != null ? `${nights}N` : days != null ? `${days}D` : "—";
                                          const dateRange = entry.startDate && entry.endDate
                                            ? `${new Date(entry.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} → ${new Date(entry.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`
                                            : "—";

                                          // Try to find matching invoice item for hotel/car/guide name
                                          const matchingItem = tInvoiceItems.find((ii: any) => {
                                            const iCity = ii.location || "";
                                            const iSvc = ii.ServiceName?.trim().toLowerCase() || "";
                                            return iCity === city && iSvc === svc.toLowerCase();
                                          });
                                          const itemName = matchingItem?.hotelName || matchingItem?.carName || matchingItem?.guideName || "—";

                                          rows.push({
                                            city,
                                            service: svc,
                                            name: itemName,
                                            qty: qtyLabel,
                                            unitPrice: Number(entry.unitPrice) || 0,
                                            totalPrice: Number(entry.totalPrice) || 0,
                                            dates: dateRange,
                                          });
                                        }
                                      }

                                      return (
                                        <React.Fragment key={a.id}>
                                          {rows.length > 0 ? rows.map((row, idx) => (
                                            <tr key={`${a.id}-${idx}`} className="border-b border-brand-neutral-light last:border-0 hover:bg-brand-neutral-light/50">
                                              <td className="px-4 py-2 font-semibold text-brand-neutral">
                                                <span className="flex items-center gap-1">
                                                  <MapPin size={10} className="text-brand-primary" /> {row.city}
                                                </span>
                                              </td>
                                              <td className="px-4 py-2">
                                                <span className="text-[10px] bg-brand-primary-light text-brand-primary px-2 py-0.5 rounded-full font-medium">{row.service}</span>
                                              </td>
                                              <td className="px-4 py-2 font-medium text-brand-neutral">{row.name}</td>
                                              <td className="px-4 py-2 text-center font-medium text-brand-neutral">{row.qty}</td>
                                              <td className="px-4 py-2 text-right text-brand-neutral">₹{row.unitPrice.toLocaleString("en-IN")}</td>
                                              <td className="px-4 py-2 text-right font-bold text-brand-neutral-dark">₹{row.totalPrice.toLocaleString("en-IN")}</td>
                                              <td className="px-4 py-2 text-[10px] text-brand-neutral-muted">{row.dates}</td>
                                              <td className="px-4 py-2">
                                                <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${aBadge.cls}`}>
                                                  <span className={`w-1 h-1 rounded-full ${aBadge.dot}`} />{aBadge.label}
                                                </span>
                                              </td>
                                            </tr>
                                          )) : (
                                            <tr key={`${a.id}-empty`} className="border-b border-brand-neutral-light">
                                              <td colSpan={8} className="px-4 py-2 text-center text-[10px] text-brand-neutral-muted italic">No city details in this assignment</td>
                                            </tr>
                                          )}
                                        </React.Fragment>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {/* Payment/Installment History */}
                              <div>
                                <h4 className="text-xs font-bold text-brand-neutral uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <CreditCard size={12} />
                                  Payment History ({tAssignments.flatMap((a: any) => a.payments || []).length} record{tAssignments.flatMap((a: any) => a.payments || []).length !== 1 ? "s" : ""})
                                </h4>
                                {tAssignments.flatMap((a: any) => a.payments || []).length === 0 ? (
                                  <p className="text-xs text-brand-neutral-muted italic">No payments recorded yet.</p>
                                ) : (
                                  <div className="space-y-3">
                                    {tAssignments.flatMap((a: any) => a.payments || []).map((pay: any) => {
                                      const payPct = pay.amount > 0 ? Math.min(100, (pay.paidAmount / pay.amount) * 100) : 0;
                                      const installments = pay.installments || [];

                                      return (
                                        <div key={pay.id} className="bg-white rounded-xl border border-brand-neutral-border p-4">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                              <span className="font-mono text-[10px] font-bold text-brand-neutral-muted bg-brand-neutral-light px-2 py-0.5 rounded">{pay.invoiceNo}</span>
                                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${pay.paymentStatus === "PAID" ? "bg-brand-success-light text-brand-success" : pay.paymentStatus === "PARTIAL" ? "bg-brand-info-light text-brand-info" : "bg-brand-warning-light text-brand-warning"}`}>
                                                {pay.paymentStatus}
                                              </span>
                                            </div>
                                              <span className="text-[10px] text-brand-neutral-muted">{METHOD_LABELS[pay.paymentMethod] || pay.paymentMethod}</span>
                                          </div>
                                          <div className="grid grid-cols-3 gap-3 text-center mb-2">
                                            <div>
                                              <p className="text-[10px] text-brand-neutral-muted font-bold">TOTAL</p>
                                              <p className="text-sm font-bold text-brand-neutral-dark">₹{pay.amount?.toLocaleString()}</p>
                                            </div>
                                            <div>
                                              <p className="text-[10px] text-brand-success font-bold">PAID</p>
                                              <p className="text-sm font-bold text-brand-success">₹{pay.paidAmount?.toLocaleString()}</p>
                                            </div>
                                            <div>
                                              <p className="text-[10px] text-brand-warning font-bold">PENDING</p>
                                              <p className="text-sm font-bold text-brand-warning">₹{pay.pendingAmount?.toLocaleString()}</p>
                                            </div>
                                          </div>
                                          <div className="h-1.5 bg-brand-neutral-border rounded-full overflow-hidden mb-3">
                                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${payPct}%` }} />
                                          </div>

                                          {/* Installments */}
                                          {installments.length > 0 && (
                                            <div className="mt-2">
                                              <p className="text-[10px] font-bold text-brand-neutral-muted uppercase mb-1">Installments</p>
                                              <div className="space-y-1">
                                                {installments.map((inst: any, idx: number) => (
                                                  <div key={inst.id} className="flex items-center gap-3 text-[11px] py-1 border-b border-brand-neutral-light last:border-0">
                                                    <span className="text-brand-neutral-muted w-4">{idx + 1}.</span>
                                                    <span className="font-medium text-brand-neutral">{inst.paymentDate ? new Date(inst.paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}</span>
                                                    <span className="font-bold text-brand-success">₹{inst.amount?.toLocaleString()}</span>
                                                    <span className="text-brand-neutral-muted">{METHOD_LABELS[inst.paymentMethod] || inst.paymentMethod}</span>
                                                    {inst.transactionId && <span className="font-mono text-brand-neutral-muted">{inst.transactionId}</span>}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
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
