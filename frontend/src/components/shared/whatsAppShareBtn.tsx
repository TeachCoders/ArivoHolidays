import { MessageCircle } from "lucide-react";

interface WhatsAppShareBtnProps {
  phone: string;
  message: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export default function WhatsAppShareBtn({ phone, message, label = "Share on WhatsApp", className = "", disabled = false, onClick }: WhatsAppShareBtnProps) {
  const cleanedPhone = phone?.replace(/\D/g, "");
  if (!cleanedPhone) return null;

  const waUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={disabled ? undefined : waUrl}
      target={disabled ? undefined : "_blank"}
      rel="noopener noreferrer"
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
        } else if (onClick) {
          onClick();
        }
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
        disabled
          ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
          : "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
      } ${className}`}
    >
      <MessageCircle className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}
