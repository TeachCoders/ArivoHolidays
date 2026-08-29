"use client";
import { useState } from "react";
import { useDocument } from "../api/useDocument";

interface FormData {
  booking_id: string;
  passport_url: string;
  govt_id_url: string;
  payment_screenshot_url: string;
}

const EMPTY: FormData = {
  booking_id: "",
  passport_url: "",
  govt_id_url: "",
  payment_screenshot_url: "",
};

const DOC_FIELDS: {
  key: keyof Omit<FormData, "booking_id">;
  label: string;
  icon: string;
  description: string;
  placeholder: string;
}[] = [
  {
    key: "passport_url",
    label: "Passport",
    icon: "🛂",
    description: "Clear scan of bio-data page — JPG, PNG, or PDF",
    placeholder: "https://storage.example.com/passport.pdf",
  },
  {
    key: "govt_id_url",
    label: "Government ID",
    icon: "🪪",
    description: "Aadhaar, PAN, Driver's Licence, or National ID",
    placeholder: "https://storage.example.com/aadhaar.jpg",
  },
  {
    key: "payment_screenshot_url",
    label: "Payment Screenshot",
    icon: "💳",
    description: "Bank transfer proof, UPI confirmation, or receipt",
    placeholder: "https://storage.example.com/payment.png",
  },
];

function isValidUrl(val: string) {
  return val.startsWith("http://") || val.startsWith("https://");
}

export default function DocumentUploadPage() {
  const [data, setData] = useState<FormData>(EMPTY);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const { uploadDocuments } = useDocument();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const payload = {
        passport_url: data.passport_url || undefined,
        govt_id_url: data.govt_id_url || undefined,
        payment_screenshot_url: data.payment_screenshot_url || undefined,
      };
      const json = await uploadDocuments(data.booking_id, payload);
      if (json.success) { setStatus("done"); setData(EMPTY); }
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const filledCount = DOC_FIELDS.filter((f) => isValidUrl(data[f.key])).length;

  return (
    <main className="min-h-screen bg-[#0d0d16] px-4 py-12">
      <div className="w-full max-w-lg mx-auto">

        {/* Page Header */}
        <div className="mb-10">
          <span className="inline-block text-[11px] font-bold tracking-[0.35em] uppercase text-amber-400 mb-3">
            ✦ Document Upload
          </span>
          <h1 className="h3 text-white">
            Upload Your <span className="text-amber-400">Docs</span>
          </h1>
          <p className="text-white/40 text-sm mt-3 leading-relaxed">
            Paste the public URL of each document. Upload your files to cloud storage first, then link them here.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Booking ID ───────────────────────────── */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/30">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">🔖</span>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Booking Reference</h2>
              <div className="flex-1 h-px bg-white/8 ml-2" />
            </div>
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
                placeholder="e.g. TRV-1712345678901"
                className="w-full bg-white/5 border border-white/12 rounded-lg px-4 py-3 text-white text-sm
                  placeholder-white/20 focus:outline-none focus:border-amber-400 focus:ring-1
                  focus:ring-amber-400/50 transition-all duration-150"
              />
            </div>
          </div>

          {/* ── Document Fields ───────────────────────── */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/30 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📎</span>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Documents</h2>
              <div className="flex-1 h-px bg-white/8 ml-2" />
              <span className="text-white/30 text-xs">{filledCount}/{DOC_FIELDS.length} linked</span>
            </div>

            {/* Progress bar */}
            <div className="flex gap-1.5">
              {DOC_FIELDS.map((f) => (
                <div
                  key={f.key}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                    isValidUrl(data[f.key]) ? "bg-amber-400" : "bg-white/10"
                  }`}
                />
              ))}
            </div>

            {DOC_FIELDS.map((field) => {
              const val = data[field.key];
              const filled = isValidUrl(val);
              return (
                <div
                  key={field.key}
                  className={`rounded-xl border p-4 transition-all duration-200 ${
                    filled
                      ? "border-amber-400/35 bg-amber-400/5"
                      : "border-white/8 bg-white/2"
                  }`}
                >
                  {/* Doc header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{field.icon}</span>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-white/80">
                          {field.label}
                        </p>
                        <p className="text-white/30 text-xs mt-0.5">{field.description}</p>
                      </div>
                    </div>
                    {filled && (
                      <span className="shrink-0 text-[10px] bg-amber-400 text-black font-black px-2 py-0.5 rounded-full">
                        ✓ LINKED
                      </span>
                    )}
                  </div>

                  {/* URL input */}
                  <input
                    type="url"
                    name={field.key}
                    value={val}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className={`w-full rounded-lg px-3 py-2.5 text-sm text-white transition-all duration-150
                      placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-amber-400/50
                      ${filled
                        ? "bg-amber-400/5 border border-amber-400/30 focus:border-amber-400"
                        : "bg-black/30 border border-white/10 focus:border-amber-400"
                      }`}
                  />

                  {/* Preview link */}
                  {filled && (
                    <a
                      href={val}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      ↗ Preview document
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feedback */}
          {status === "done" && (
            <Banner type="success" msg="Documents linked to your booking successfully!" />
          )}
          {status === "error" && (
            <Banner type="error" msg="Upload failed. Check the Booking ID and URLs, then try again." />
          )}

          {/* ── Submit Button ─────────────────────────── */}
          <button
            type="submit"
            disabled={status === "loading" || !data.booking_id.trim()}
            className="w-full bg-amber-400 hover:bg-amber-300 active:scale-[0.98]
              disabled:opacity-40 disabled:cursor-not-allowed
              text-black font-black text-sm uppercase tracking-widest
              py-4 rounded-xl transition-all duration-150 shadow-lg shadow-amber-400/20"
          >
            {status === "loading"
              ? "Uploading…"
              : filledCount > 0
              ? `Submit ${filledCount} Document${filledCount > 1 ? "s" : ""} →`
              : "Submit Documents →"}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-8">
          Documents are stored securely and used only for your booking verification.
        </p>
      </div>
    </main>
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
