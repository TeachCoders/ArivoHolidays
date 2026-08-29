"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Phone, ArrowLeft, XCircle, RotateCcw, AlertTriangle } from "lucide-react";
import {
  useConversations,
  useConversation,
  useReply,
  useAvailability,
  useUpdateAvailability,
  useCloseConversation,
} from "@/feature/chat/api/useChat";
import PageLoader from "@/components/shared/PageLoader";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";

const timeAgo = (iso: string | null): string => {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

/** Session active = last message within 10 minutes */
const isSessionActive = (lastMessageAt: string | null): boolean => {
  if (!lastMessageAt) return false;
  return Date.now() - new Date(lastMessageAt).getTime() < 10 * 60 * 1000;
};

/** Inactive for > 1 hour — agent should follow up */
const isInactiveWarning = (lastMessageAt: string | null): boolean => {
  if (!lastMessageAt) return false;
  return Date.now() - new Date(lastMessageAt).getTime() > 60 * 60 * 1000;
};

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const BRAND_SHORT = "ariv";

export const ChatInboxClient: React.FC = () => {
  const { conversations, isLoading } = useConversations();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { conversation } = useConversation(selectedId);
  const { sendReply, isSending } = useReply();
  const { availability } = useAvailability();
  const { setAvailable, isUpdating } = useUpdateAvailability();
  const { updateStatus, isUpdating: isClosing } = useCloseConversation();
  const [draft, setDraft] = useState("");

  const selectedConv = (conversations || []).find((c) => c.id === selectedId);
  const sessionActive = selectedConv ? isSessionActive(selectedConv.lastMessageAt) : false;

  const select = (id: number) => {
    setSelectedId(id);
    setDraft("");
  };

  const submitReply = async () => {
    const body = draft.trim();
    if (!body || selectedId === null) return;
    setDraft("");
    try {
      await sendReply({ id: selectedId, body });
    } catch {
      setDraft(body);
    }
  };

  const submitButton = async (value: string) => {
    if (selectedId === null) return;
    try {
      await sendReply({ id: selectedId, body: value });
    } catch {
      // Keep the message thread as-is on failure
    }
  };

  const handleClose = async () => {
    if (selectedId === null) return;
    const currentStatus = selectedConv?.status;
    const newStatus = currentStatus === "CLOSED" ? "ACTIVE" : "CLOSED";
    try {
      await updateStatus({ id: selectedId, status: newStatus });
    } catch {
      // ignore
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <PrivatePageHeading
          icon={MessageSquare}
          title="Chat Inbox"
          description="Tourist chats appear here — reply as soon as a message arrives. (Your availability status is never shown to tourists)"
        />
        <div className="ml-auto flex items-center gap-2 bg-white border border-brand-neutral-border rounded-full px-3 py-1.5 mt-1">
          <span className={`w-2.5 h-2.5 rounded-full ${availability?.chatAvailable ? "bg-emerald-500" : "bg-zinc-300"}`} />
          <button
            onClick={() => setAvailable(!availability?.chatAvailable)}
            disabled={isUpdating}
            className="text-sm font-semibold text-zinc-700 hover:text-[#2E8B8B] disabled:opacity-50 transition-colors"
          >
            {availability?.chatAvailable ? "Available" : "Go Unavailable"}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 min-h-0">
        {/* Conversation list */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-700">Conversations</p>
            <span className="text-xs text-zinc-400">{conversations?.length ?? 0}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading && <PageLoader size="sm" />}
            {!isLoading && (!conversations || conversations.length === 0) && (
              <p className="p-6 text-center text-sm text-zinc-400">
                No chats yet. When a tourist starts a chat on the website, it will appear here.
              </p>
            )}
            {(conversations || []).map((c) => {
              const active = isSessionActive(c.lastMessageAt);
              return (
                <button
                  key={c.id}
                  onClick={() => select(c.id)}
                  className={`w-full text-left px-4 py-3 border-b border-zinc-50 flex items-start gap-3 hover:bg-zinc-50 transition-colors ${
                    selectedId === c.id ? "bg-[#2E8B8B]/5" : ""
                  }`}
                >
                  {/* Avatar with active dot */}
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm ${active ? "bg-gradient-to-br from-[#3730a3] to-[#2E8B8B]" : "bg-zinc-300"}`}>
                      {c.touristName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${active ? "bg-emerald-500" : "bg-zinc-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-semibold truncate ${active ? "text-zinc-800" : "text-zinc-400"}`}>{c.touristName}</p>
                      {c.status === "CLOSED" ? (
                        <span className="text-[10px] shrink-0 font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">Closed</span>
                      ) : (
                        <span className={`text-[10px] shrink-0 font-bold px-2 py-0.5 rounded-full ${active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                          {active ? "Active" : "Inactive"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {c.phone}
                    </p>
                    {c.destination && (
                      <p className="text-[11px] text-[#2E8B8B] font-medium mt-0.5">📍 {c.destination}</p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-zinc-400">{timeAgo(c.lastMessageAt)}</p>
                      {!active && c.status === "ACTIVE" && isInactiveWarning(c.lastMessageAt) && (
                        <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> Follow up
                        </span>
                      )}
                    </div>
                  </div>
                  {c.unread > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {c.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Thread */}
        <div className="bg-[#f5f5f5] border border-zinc-200 rounded-2xl flex flex-col min-h-0 overflow-hidden">
          {selectedId === null ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-300">
              <MessageSquare className="w-12 h-12 mb-2" />
              <p className="text-sm text-zinc-400">Select a conversation from the left to get started</p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="px-4 py-3 bg-white border-b border-zinc-100 flex items-center gap-3">
                <button
                  onClick={() => setSelectedId(null)}
                  className="md:hidden text-zinc-400 hover:text-zinc-700"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-zinc-800">{conversation?.touristName}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sessionActive ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                      {sessionActive ? "● Active" : "● Inactive"}
                    </span>
                    {selectedConv?.status === "CLOSED" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">Closed</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {conversation?.phone}
                    {conversation?.travellerId ? ` · TRV#${conversation.travellerId}` : ""}
                  </p>
                </div>
                {/* Inactive warning banner */}
                {!sessionActive && selectedConv?.status === "ACTIVE" && isInactiveWarning(selectedConv?.lastMessageAt) && (
                  <div className="hidden md:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Follow up
                  </div>
                )}
                {/* Close / Reopen button */}
                <button
                  onClick={handleClose}
                  disabled={isClosing}
                  title={selectedConv?.status === "CLOSED" ? "Reopen conversation" : "Close conversation"}
                  className={`p-2 rounded-lg transition-colors ${
                    selectedConv?.status === "CLOSED"
                      ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                  } disabled:opacity-50`}
                >
                  {selectedConv?.status === "CLOSED" ? <RotateCcw className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </button>
              </div>

              {/* Messages — ChatWidget style */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
                {(conversation?.messages || []).map((m) => (
                  <div key={m.id} className={`flex flex-col ${m.direction === "out" ? "items-start" : "items-end"}`}>
                    <div className={`flex items-end gap-2 max-w-[80%] ${m.direction === "in" ? "flex-row-reverse" : ""}`}>

                      {/* Bot/Agent logo — left side */}
                      {m.direction === "out" && (
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow border border-zinc-100">
                          <span className="text-[10px] font-extrabold text-[#d94838] italic tracking-tighter">ariv</span>
                        </div>
                      )}

                      {/* Tourist avatar — right side */}
                      {m.direction === "in" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3730a3] to-[#2E8B8B] text-white flex items-center justify-center shrink-0 shadow text-sm font-bold">
                          {conversation?.touristName?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}

                      <div className={`rounded-2xl px-4 py-2.5 text-sm break-words whitespace-pre-wrap leading-relaxed shadow-sm overflow-hidden ${
                        m.direction === "out"
                          ? "bg-white border border-zinc-200 rounded-tl-none"
                          : "bg-[#0066ff] rounded-tr-none"
                      }`}>
                        <p
                          className="break-words font-medium"
                          style={{ color: m.direction === "in" ? "#ffffff" : "#1f2937" }}
                        >{m.body}</p>
                        <p
                          className="text-[11px] mt-1 font-normal"
                          style={{ color: m.direction === "in" ? "rgba(255,255,255,0.8)" : "#9ca3af" }}
                        >{formatTime(m.createdAt)}</p>
                      </div>

                      {/* Quick-reply buttons on bot messages — partner can trigger them too */}
                      {m.direction === "out" && (m.buttons?.length ?? 0) > 0 && (
                        <div className="flex flex-col items-start gap-1.5 mt-1.5 w-full">
                          {m.buttons!.map((b, i) => (
                            <button
                              key={i}
                              onClick={() => submitButton(b.value)}
                              className="text-[12px] font-semibold text-[#2E8B8B] bg-teal-50 border border-teal-100 rounded-full px-3 py-1.5 hover:bg-teal-100 transition-colors text-left leading-tight"
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {conversation && conversation.messages.length === 0 && (
                  <p className="text-center text-xs text-zinc-400 py-8">No messages yet</p>
                )}
              </div>

              {/* Reply box — always available */}
              <div className="p-3 border-t border-zinc-100 bg-white flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitReply();
                    }
                  }}
                  placeholder="Reply to tourist... (Enter to send)"
                  className="flex-1 bg-zinc-50 border border-zinc-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#2E8B8B]"
                  maxLength={2000}
                />
                <button
                  onClick={submitReply}
                  disabled={isSending || !draft.trim()}
                  aria-label="Send reply"
                  className="w-10 h-10 shrink-0 rounded-full bg-[#2E8B8B] hover:bg-[#26807f] disabled:opacity-50 flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInboxClient;
