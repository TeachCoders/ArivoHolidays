"use client";
import { useState } from "react";
import { useUpdatePaymentStatus } from "../api/useLeeds";

interface FormData {
  booking_id: string;
  payment_screenshot_url: string;
  transaction_id: string;
  transaction_detail: string;
}

const EMPTY: FormData = {
  booking_id: "",
  payment_screenshot_url: "",
  transaction_id: "",
  transaction_detail: "",
};

const STATUS_OPTIONS = [
  { value: "pending",   label: "Pending",   icon: "⏳", ring: "border-yellow-400 text-yellow-400 bg-yellow-400/10"  },
  { value: "completed", label: "Completed", icon: "✅", ring: "border-emerald-400 text-emerald-400 bg-emerald-400/10" },
  { value: "failed",    label: "Failed",    icon: "❌", ring: "border-rose-400 text-rose-400 bg-rose-400/10"          },
  { value: "refunded",  label: "Refunded",  icon: "↩️", ring: "border-sky-400 text-sky-400 bg-sky-400/10"             },
];

export default function PaymentStatusUpdatePage() {
  const [data, setData] = useState<FormData>(EMPTY);
  const [paymentStatus, setPaymentStatus] = useState("");
  const { updatePaymentStatus, isLoading } = useUpdatePaymentStatus();
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentStatus) return;

    updatePaymentStatus(
      { bookingId: data.booking_id, payment_status: paymentStatus, ...data },
      {
        onSuccess: () => {
          setStatus("done");
          setData(EMPTY);
          setPaymentStatus("");
        },
        onError: () => {
          setStatus("error");
        },
      }
    );
  };

  const canSubmit = data.booking_id.trim() && paymentStatus && !isLoading;

  return (
    <main className="min-h-screen bg-[#0d0d16] px-4 py-12">
      <div className="w-full max-w-lg mx-auto">

        {/* Page Header */}
        <div className="mb-10">
          <span className="inline-block text-[11px] font-bold tracking-[0.35em] uppercase text-amber-400 mb-3">
            ✦ Admin · Payments
          </span>
          <h1 className="h3 text-white">
            Update Payment<br />
            <span className="text-amber-400">Status</span>
          </h1>
          <p className="text-white/40 text-sm mt-3 leading-relaxed">
            Select a booking and mark the current payment state with transaction proof.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Section 1: Booking ID ─────────────────── */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/30">
            <SectionHeader icon="🔖" title="Booking Reference" />
            <div>
              <label htmlFor="booking_id" className="block text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1.5">
                Booking ID <span className="text-rose-400">*</span>
              </label>
              <input
                id="booking_id"
                type="text"
                name="booking_id"
                value={data.booking_id}
                onChange={handleChange}
                required
                placeholder="e.g. BKG-20240601-001"
                className="w-full bg-white/5 border border-white/12 rounded-lg px-4 py-3 text-white text-sm
                  placeholder-white/20 focus:outline-none focus:border-amber-400 focus:ring-1
                  focus:ring-amber-400/50 transition-all duration-150"
              />
            </div>
          </div>

          {/* ── Section 2: Status Selector ────────────── */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/30">
            <SectionHeader icon="🔄" title="Payment Status" />
            <div className="grid grid-cols-2 gap-3">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPaymentStatus(opt.value)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 font-bold text-sm
                    transition-all duration-150 ${
                    paymentStatus === opt.value
                      ? opt.ring + " scale-[1.03] shadow-lg"
                      : "border-white/10 text-white/40 bg-transparent hover:border-white/20 hover:text-white/60"
                  }`}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span>{opt.label}</span>
                  {paymentStatus === opt.value && (
                    <span className="ml-auto text-xs">●</span>
                  )}
                </button>
              ))}
            </div>
            {!paymentStatus && (
              <p className="text-white/25 text-xs mt-3">Please select a status to proceed.</p>
            )}
          </div>

          {/* ── Section 3: Transaction Details ────────── */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/30">
            <SectionHeader icon="🧾" title="Transaction Details" subtitle="optional" />
            <div className="space-y-4">
              <TextField
                label="Transaction ID"
                name="transaction_id"
                type="text"
                value={data.transaction_id}
                onChange={handleChange}
                placeholder="Bank ref / UPI ref / Stripe ID"
              />
              <TextField
                label="Payment Screenshot URL"
                name="payment_screenshot_url"
                type="url"
                value={data.payment_screenshot_url}
                onChange={handleChange}
                placeholder="https://your-storage.com/receipt.jpg"
              />
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1.5">
                  Transaction Detail
                </label>
                <textarea
                  name="transaction_detail"
                  value={data.transaction_detail}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Amount, payment method, bank name, additional notes…"
                  className="w-full bg-white/5 border border-white/12 rounded-lg px-4 py-3 text-white text-sm
                    placeholder-white/20 focus:outline-none focus:border-amber-400 focus:ring-1
                    focus:ring-amber-400/50 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Feedback */}
          {status === "done" && (
            <Banner type="success" msg="Payment status updated successfully!" />
          )}
          {status === "error" && (
            <Banner type="error" msg="Update failed. Please verify the Booking ID and try again." />
          )}

          {/* ── Submit Button ─────────────────────────── */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-amber-400 hover:bg-amber-300 active:scale-[0.98]
              disabled:opacity-40 disabled:cursor-not-allowed
              text-black font-black text-sm uppercase tracking-widest
              py-4 rounded-xl transition-all duration-150 shadow-lg shadow-amber-400/20"
          >
            {isLoading
              ? "Updating…"
              : paymentStatus
              ? `Mark as ${STATUS_OPTIONS.find(s => s.value === paymentStatus)?.label} →`
              : "Select a Status First"}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-8">
          Changes are logged and attributed to your admin account.
        </p>
      </div>
    </main>
  );
}

/* ── Helpers ────────────────────────────────────── */

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="text-xl">{icon}</span>
      <h2 className="text-sm font-black uppercase tracking-widest text-white">{title}</h2>
      {subtitle && <span className="text-white/30 text-xs">({subtitle})</span>}
      <div className="flex-1 h-px bg-white/8 ml-2" />
    </div>
  );
}

function TextField({
  label, name, type, value, onChange, placeholder, required,
}: {
  label: string; name: string; type: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1.5">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      <input
        id={name} type={type} name={name} value={value}
        onChange={onChange} placeholder={placeholder} required={required}
        className="w-full bg-white/5 border border-white/12 rounded-lg px-4 py-3 text-white text-sm
          placeholder-white/20 focus:outline-none focus:border-amber-400 focus:ring-1
          focus:ring-amber-400/50 transition-all duration-150"
      />
    </div>
  );
}

function Banner({ type, msg }: { type: "success" | "error"; msg: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium border
      ${type === "success"
        ? "text-emerald-400 bg-emerald-400/8 border-emerald-400/20"
        : "text-rose-400 bg-rose-400/8 border-rose-400/20"
      }`}
    >
      <span>{type === "success" ? "✓" : "✕"}</span>
      <span>{msg}</span>
    </div>
  );
}
