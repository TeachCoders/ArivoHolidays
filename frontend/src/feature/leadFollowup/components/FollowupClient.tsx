"use client";
import { useState } from "react";
import { errorToast } from "@/components/shared/tost";
import AssignLeadDialog from "@/feature/leads/components/assign-lead-dialog";
import AddFollowupNote from "./AddFollowupNote";
import ConversationHistory from "./ConversationHistory";
import InvoiceSection from "./InvoiceSection";
import TravellerDetailsCards from "./TravellerDetailsCards";
import TravellerRequirementsForm from "./TravellerRequirementsForm";
import TravellerDocumentTab from "./TravellerDocumentTab";
import TravellerPaymentTab from "./TravellerPaymentTab";
import CarQuotationSection from "./CarQuotationSection";
import CarRequirementsForm from "./CarRequirementsForm";
import PageLoader from "@/components/shared/PageLoader";
import { useUpdateLeadStatusMutation, useGetTravellerLead } from "../api/useLeadFollowup";
import { formatLocalDateTime } from "@/lib/dateUtils";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Phone, Mail, MessageCircle,
  CheckCircle2, UserCheck, XCircle, ChevronDown
} from "lucide-react";

const STATUSES = [
  { value: "pending", label: "Pending", dot: "bg-gray-400", badge: "bg-gray-100 text-brand-neutral border-gray-300" },
  { value: "working", label: "Working", dot: "bg-amber-400", badge: "bg-brand-warning-light text-brand-warning border-amber-300" },
  { value: "confirmed", label: "Confirmed", dot: "bg-emerald-500", badge: "bg-brand-success-light text-brand-success border-emerald-300" },
  { value: "cancelled", label: "Cancelled", dot: "bg-red-500", badge: "bg-brand-danger-light text-brand-danger border-red-300" },
];

const getStatus = (v: string) => STATUSES.find(s => s.value === v) || STATUSES[0];
const formatDateTime = (date: any) => date ? formatLocalDateTime(date, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null;

export default function FollowupClient({ id }: { id: string }) {
  const router = useRouter();

  // ✅ ALL hooks must be here — before any return
  const { lead, isLoading, isError } = useGetTravellerLead(id);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const { mutate: updateStatusMutation, isPending: updatingStatus } = useUpdateLeadStatusMutation();
  const st = getStatus(lead?.bookingStatus || "pending");

  // ✅ Early returns AFTER all hooks
  if (isLoading) return <PageLoader size="page" />;

  if (isError || !lead) return (
    <div className="p-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-brand-neutral-muted hover:text-gray-800 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="bg-brand-danger-light border border-red-200 rounded-xl p-5 text-brand-danger text-sm">
        Lead not found or you don&apos;t have permission to view it.
      </div>
    </div>
  );

  // ✅ Derived values after hooks + early returns
  const tourBooking = lead.tourBookings?.[0];
  const vehicleBooking = lead.vehicleBookings?.[0];
  const isCarOnly = !!vehicleBooking && !tourBooking;
  const notes: any[] = lead.followupNotes || [];
  // ... rest of component


  // Clear confirm date if lead is cancelled, and cancelled date if not cancelled
  const displayCompletedAt = lead.bookingStatus === "cancelled" ? null : lead.completedAt;

  const displayCancelledAt = lead.bookingStatus !== "cancelled" ? null : lead.cancelledAt;
  // Auto-generate working started date based on the first conversation note if workingStartedAt is null
  let displayWorkingStartedAt = lead.workingStartedAt;
  if (!displayWorkingStartedAt && notes.length > 0) {
    const sortedNotes = [...notes].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    displayWorkingStartedAt = sortedNotes[0].createdAt;
  }

  const updateStatus = () => {
    if (!newStatus) return;
    if (newStatus === "CANCELLED" && !cancelReason.trim()) return errorToast("Please provide cancellation reason.");
    updateStatusMutation(
      { leadId: lead.id, status: newStatus, cancellationReason: cancelReason },
      {
        onSuccess: () => {
          setStatusModal(false);
          setCancelReason("");
        },
      }
    );
  };

  return (
    <div className="min-h-screen">

      {/* ── TOP BAR ── */}
      <div className="bg-white border-b border-brand-neutral-border sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100 transition-colors shrink-0">
              <ArrowLeft className="h-4 w-4 text-brand-neutral-muted" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-sm truncate">{lead.name}</span>
                <span className="hidden sm:inline font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{id}</span>
                <button
                  onClick={() => { setNewStatus(lead.bookingStatus || "pending"); setStatusModal(true); }}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${st.badge}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                  {st.label} <ChevronDown className="h-2.5 w-2.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Generated {formatLocalDateTime(lead.createdAt, { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              <Phone className="h-3 w-3" /> Call
            </a>
            <a href={`https://wa.me/${lead.phone?.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
              <MessageCircle className="h-3 w-3" /> WhatsApp
            </a>
            <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-brand-neutral-border text-brand-neutral hover:bg-brand-neutral-light transition-colors">
              <Mail className="h-3 w-3" /> Email
            </a>
            {lead.bookingStatus !== "cancelled" && (
              <AssignLeadDialog leadId={lead.id}>
                <button className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-brand-primary bg-brand-primary-light text-brand-primary hover:bg-indigo-100 transition-colors ${st.badge}`}>
                  <UserCheck className="h-3 w-3" />
                  {lead.assignedTo ? lead.assignedTo.name : "Assign"}
                </button>
              </AssignLeadDialog>
            )}
          </div>
        </div>
      </div>

      <div className="py-4 space-y-4 px-4 max-w-full mx-auto">
        {/* ── SALES PIPELINE TRACKER ── */}
        {!isCarOnly && (() => {
          const step1Done = !!lead.requirement;
          const step2Done = !!lead.requirement;
          const step3Done = lead.invoices && lead.invoices.length > 0;
          const step4Done = lead.invoices && lead.invoices.some((inv: any) => inv.status === "SENT");
          const step5Done = lead.payments && lead.payments.some((p: any) => p.approvedAt || p.status === "COMPLETED");
          const steps = [
            { label: "Req. Created", desc: step1Done ? `${new Date(lead.requirement.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}` : "Pending", done: step1Done },
            { label: "Req. Sent", desc: step2Done ? "Auto-sent" : "Not sent", done: step2Done },
            { label: "Quotation", desc: step3Done ? `${lead.invoices.length} version(s)` : "Not created", done: step3Done },
            { label: "Quote Sent", desc: step4Done ? "Emailed" : "Not sent", done: step4Done },
            { label: "Payment", desc: step5Done ? "Received" : "Awaited", done: step5Done },
          ];
          const completedCount = steps.filter(s => s.done).length;
          return (
            <div className="bg-white border border-brand-neutral-border rounded-xl p-4 shadow-sm w-full">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sales Pipeline Progress</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${completedCount === steps.length ? "bg-brand-success-light text-brand-success" : completedCount === 0 ? "bg-slate-100 text-slate-400" : "bg-brand-warning-light text-brand-warning"}`}>
                  {completedCount}/{steps.length} Complete
                </span>
              </div>
              <div className="flex items-center">
                {steps.map((step, i) => (
                  <div key={step.label} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shadow-sm ${step.done ? "bg-emerald-500 border-emerald-500 text-white" : "bg-brand-neutral-light border-brand-neutral-border text-slate-400"}`}>
                        {step.done ? "✓" : i + 1}
                      </div>
                      <span className={`text-[10px] font-bold text-center leading-tight ${step.done ? "text-brand-success" : "text-brand-neutral-muted"}`}>{step.label}</span>
                      <span className={`text-[9px] text-center leading-tight ${step.done ? "text-emerald-500" : "text-slate-400"}`}>{step.desc}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-1 mb-6 mx-2 rounded-full transition-all ${steps[i + 1].done ? "bg-emerald-400" : step.done ? "bg-gradient-to-r from-emerald-400 to-slate-200" : "bg-slate-100"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── TOP METRICS & TIMELINE (Always on Top) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 bg-white border border-brand-neutral-border rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Lead Lifecycle Timeline</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Lead Created Date", date: lead.createdAt, color: "border-brand-neutral-border bg-brand-neutral-light text-brand-neutral" },
                { label: "Lead Assigned Date", date: lead.assignedAt, color: "border-indigo-100 bg-brand-primary-light/30 text-brand-primary" },
                { label: "Working Started Date", date: displayWorkingStartedAt, color: "border-amber-100 bg-brand-warning-light/30 text-brand-warning" },
                { label: "Lead Confirm Date", date: displayCompletedAt, color: "border-emerald-100 bg-brand-success-light/30 text-brand-success" },
                { label: "Lead Cancelled Date", date: displayCancelledAt, color: "border-red-100 bg-brand-danger-light/30 text-brand-danger" },
              ].map(({ label, date, color }) => (
                <div key={label} className={`border rounded-xl p-3 text-xs font-semibold ${color}`}>
                  <span className="opacity-60 font-bold uppercase tracking-wider text-[10px] block">{label}</span>
                  <span className="mt-1.5 block font-mono text-xs">
                    {date ? formatDateTime(date) : <span className="text-slate-400 italic font-sans">null</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 grid grid-cols-2 gap-2">
            {[
              { label: "Follow-ups", value: notes.length, color: "text-brand-primary" },
              { label: "Days Active", value: Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000), color: "text-brand-info" },
              { label: "Bookings", value: (lead.tourBookings?.length || 0) + (lead.vehicleBookings?.length || 0), color: "text-brand-success" },
              { label: "Payments", value: lead.payments?.length || 0, color: "text-brand-warning" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white border border-brand-neutral-border rounded-xl p-3 text-center shadow-sm flex flex-col justify-center">
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
            {/* Due amount card */}
            {(() => {
              const invoices = lead?.invoices || [];
              const payments = lead?.payments || [];
              const invoiced = invoices.reduce((s: number, i: any) => s + (i.grandTotal || 0), 0);
              const paid = payments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
              const due = Math.max(0, invoiced - paid);
              if (invoiced === 0) return null;
              return (
                <div className="bg-white border border-brand-neutral-border rounded-xl p-3 text-center shadow-sm flex flex-col justify-center col-span-2">
                  <p className={`text-2xl font-black ${due > 0 ? 'text-rose-600' : 'text-brand-success'}`}>
                    ₹{due.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Due Amount</p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── TAB NAVIGATION ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-brand-neutral-border hide-scrollbar">
          {(isCarOnly ? [
            { id: "details", label: "Traveller Information" },
            { id: "requirements", label: "Requirements" },
            { id: "car-quotation", label: "Quotation" },
            { id: "payment", label: "Payment" },
            { id: "notes", label: "Follow-up Note" },
          ] : [
            { id: "details", label: "Traveller Information" },
            { id: "requirements", label: "Requirements" },
            { id: "tour-package", label: "Tour Package" },
            { id: "payment", label: "Payment" },
            { id: "document", label: "Documents" },
            { id: "notes", label: "Follow-up Note" },
            { id: "history", label: "Activity Log" },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-t-lg text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id
                ? "border-brand-primary text-brand-primary bg-white"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        <div className="pt-2">
          {activeTab === "details" && (
            <div className="space-y-4">
              <TravellerDetailsCards  lead={lead} />

              {lead.bookingStatus === "cancelled" && (
                <div className="flex gap-3 bg-brand-danger-light border border-red-200 rounded-xl p-4">
                  <XCircle className="h-5 w-5 text-brand-danger shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-brand-danger">Lead Cancelled</p>
                    <p className="text-xs text-brand-danger mt-0.5">on {formatDateTime(displayCancelledAt)}</p>
                    <p className="text-sm text-brand-danger mt-2 border-t border-red-200 pt-2">{lead.cancellationReason}</p>
                  </div>
                </div>
              )}

              {lead.bookingStatus === "confirmed" && (
                <div className="flex gap-3 bg-brand-success-light border border-emerald-200 rounded-xl p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-brand-success">Booking Confirmed</p>
                    <p className="text-xs text-emerald-500 mt-0.5">on {formatDateTime(displayCompletedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "payment" && (
            <TravellerPaymentTab lead={lead} />
          )}

          {activeTab === "document" && !isCarOnly && (
            <TravellerDocumentTab lead={lead} />
          )}

          {activeTab === "requirements" && isCarOnly && (
            <CarRequirementsForm leadId={lead.id} lead={lead} />
          )}

          {!isCarOnly && (
            <div className={activeTab === "requirements" ? "" : "hidden"}>
              <TravellerRequirementsForm leadId={lead.id} lead={lead} />
            </div>
          )}

          {activeTab === "notes" && (
            <div className="max-w-4xl">
              {lead.bookingStatus !== "cancelled" ? (
                <AddFollowupNote leadId={lead.id} />
              ) : (
                <div className="p-8 text-center bg-white border border-brand-neutral-border rounded-xl">
                  <p className="text-brand-neutral-muted font-medium">Cannot add notes to a cancelled lead.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && !isCarOnly && (
            <div className="w-full">
              <ConversationHistory notes={notes} />
            </div>
          )}

          {activeTab === "tour-package" && !isCarOnly && (
            <InvoiceSection leadId={id} leadStatus={lead.bookingStatus} clientName={lead.name} clientEmail={lead.email} clientPhone={lead.phone} cityNames={lead?.requirement?.cityNames} lead={lead} />
          )}

          {activeTab === "car-quotation" && isCarOnly && (
            <CarQuotationSection leadId={id} leadStatus={lead.bookingStatus} clientName={lead.name} clientEmail={lead.email} clientPhone={lead.phone} vehicleBooking={vehicleBooking} lead={lead} />
          )}
        </div>
      </div>

      {/* ── STATUS MODAL ── */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">Change Lead Status</h2>
            <div className="space-y-2 mb-4">
              {STATUSES.map(s => (
                <button key={s.value} onClick={() => setNewStatus(s.value)}
                  className={`w-full flex items-center gap-2.5 text-left px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${newStatus === s.value ? `${s.badge} ring-2 ring-offset-1` : "bg-brand-neutral-light border-brand-neutral-border text-brand-neutral hover:bg-slate-100"
                    }`}>
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  {s.label}
                </button>
              ))}
            </div>
            {newStatus === "CANCELLED" && (
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (required)..."
                rows={3}
                className="w-full text-sm border border-red-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-red-400 mb-4 text-brand-neutral-dark placeholder-slate-400"
              />
            )}
            <div className="flex gap-2">
              <button onClick={() => setStatusModal(false)}
                className="flex-1 py-2.5 border border-brand-neutral-border rounded-xl text-sm font-semibold text-brand-neutral hover:bg-brand-neutral-light">
                Cancel
              </button>
              <button onClick={updateStatus} disabled={updatingStatus}
                className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                 {updatingStatus && <PageLoader size="inline" />}
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
