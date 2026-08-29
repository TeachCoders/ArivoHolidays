import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

type Props = { searchParams: Promise<{ ref?: string }> };

export default async function ThankYouPage({ searchParams }: Props) {
  const { ref } = await searchParams;
  const reference = ref ? decodeURIComponent(ref) : "";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16 font-sans">
      <div className="w-full max-w-lg text-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-xl shadow-slate-200/60">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4561A]/10 mb-5">
            <CheckCircle2 size={36} className="text-[#D4561A]" />
          </span>
          <span className="inline-block text-[10px] font-bold tracking-[0.3em] uppercase text-[#2E8B8B] mb-2">
            Submission Received
          </span>
          <h1 className="text-2xl font-bold text-[#1C1C1C] mb-3">Thank You!</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Your tour enquiry has been submitted successfully. One of our travel experts
            will get back to you within 24 hours to plan your perfect trip.
          </p>

          {reference && (
            <div className="rounded-xl bg-[#FFF4EE] border border-[#D4561A]/15 px-4 py-3 mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4561A] mb-1">
                Enquiry From
              </p>
              <a href={reference} className="text-sm text-[#555] hover:text-[#D4561A] underline break-all">
                {reference}
              </a>
            </div>
          )}

          <Link
            href="/"
            className="btn-primary w-full inline-flex items-center justify-center active:scale-[0.98] font-bold text-sm uppercase tracking-widest py-3 rounded-xl transition-all duration-150"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
