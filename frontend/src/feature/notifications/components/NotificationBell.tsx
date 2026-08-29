"use client";
import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, IndianRupee, UserPlus, Clock, CreditCard, Users, AlertTriangle } from "lucide-react";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "../api/useNotifications";
import { useRouter } from "next/navigation";

const NOTIF_CONFIG: Record<string, { icon: React.ElementType; gradient: string; badge: string; label: string; labelBg: string }> = {
  PAYMENT_APPROVAL: {
    icon: CreditCard,
    gradient: "from-amber-400 to-orange-500",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    label: "Payment",
    labelBg: "bg-amber-100 text-amber-600",
  },
  NEW_LEAD: {
    icon: Users,
    gradient: "from-blue-400 to-indigo-500",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    label: "New Lead",
    labelBg: "bg-blue-100 text-blue-600",
  },
};

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function parseMessage(message: string) {
  const parts = message.split("|").map((s: string) => s.trim());
  return {
    name: parts[0] || "",
    phone: parts[1] || "",
    source: parts[2] || "",
    country: parts[3] || "",
    extra: parts[4] || "",
  };
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const router = useRouter();

  const { data: notifData } = useNotifications();
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();

  const notifications = (notifData?.notifications || []).filter((n: any) => !n.read && (n.type === "NEW_LEAD" || n.type === "PAYMENT_APPROVAL"));
  const unreadCount = notifications.length;

  const updatePosition = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const dropdownWidth = 340;
      // Open to the right of the button; if it goes off-screen, flip left
      let left = rect.right + 8;
      if (left + dropdownWidth > window.innerWidth - 8) {
        left = rect.left - dropdownWidth - 8;
      }
      setPos({ top: rect.bottom + 8, left: Math.max(8, left) });
    }
  };

  // Close only when clicking OUTSIDE both the button AND the dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsideBtn = btnRef.current?.contains(target);
      const clickedInsideDropdown = dropdownRef.current?.contains(target);
      if (!clickedInsideBtn && !clickedInsideDropdown) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleDropdown = () => {
    if (!open) updatePosition();
    setOpen((prev) => !prev);
  };

  const handleClick = (notif: any) => {
    if (!notif.read) markRead.mutate(notif.id);
    setOpen(false);
    if (notif.link) {
      const parsed = parseMessage(notif.message);
      const travellerId = parsed.extra?.includes("—") ? parsed.extra.split("—")[0].trim() : (parsed.extra || "");
      const url = travellerId ? `${notif.link}?highlight=${encodeURIComponent(travellerId)}` : notif.link;
      router.push(url);
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggleDropdown}
        className={`relative p-2 rounded-lg transition-all cursor-pointer ${
          unreadCount > 0
            ? "text-orange-500 bg-orange-50 hover:bg-orange-100 shadow-sm"
            : "text-slate-400 bg-slate-100 hover:bg-slate-200 hover:text-slate-600"
        }`}
      >
        {/* Pulsing ring — visible only when there are unread notifications */}
        {unreadCount > 0 && (
          <span className="absolute inset-0 rounded-lg animate-ping bg-orange-400 opacity-30 pointer-events-none" />
        )}
        <Bell
          size={20}
          className={unreadCount > 0 ? "animate-bounce" : ""}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-black rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 shadow-sm ring-1 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="fixed w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden"
          style={{ top: pos.top, left: pos.left }}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllRead.mutate();
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors cursor-pointer"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Bell size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-400">No notifications yet</p>
                <p className="text-[11px] text-gray-300 mt-1">You&apos;re all caught up!</p>
              </div>
            ) : (
              notifications.map((notif: any) => {
                const cfg = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.NEW_LEAD;
                const Icon = cfg.icon;
                const parsed = parseMessage(notif.message);
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-gray-50/80 transition-all cursor-pointer border-b border-gray-50 last:border-0 group ${
                      !notif.read ? "bg-brand-50/40 border-l-[3px] border-l-brand-500" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div className={`relative p-2.5 rounded-xl bg-gradient-to-br ${cfg.gradient} text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                      <Icon size={16} />
                      {!notif.read && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-xs font-bold ${!notif.read ? "text-gray-900" : "text-gray-600"}`}>
                          {parsed.name || notif.title}
                        </p>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${cfg.labelBg}`}>
                          {cfg.label}
                        </span>
                      </div>
                      {parsed.phone && (
                        <p className="text-[11px] text-gray-700 mt-0.5 font-medium">{parsed.phone}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1">
                        {parsed.source && (
                          <span className="text-[10px] text-gray-400 font-medium">{parsed.source}</span>
                        )}
                        {parsed.source && parsed.country && (
                          <span className="text-gray-300">·</span>
                        )}
                        {parsed.country && (
                          <span className="text-[10px] text-gray-400 font-medium">{parsed.country}</span>
                        )}
                        <span className="text-gray-300">·</span>
                        <Clock size={10} className="text-gray-300" />
                        <p className="text-[10px] text-gray-400 font-medium">
                          {timeAgo(notif.createdAt)}
                        </p>
                      </div>
                      {notif.link && (
                        <p className="text-[10px] text-brand-500 font-semibold mt-1 group-hover:underline">
                          Click to view →
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
}
