"use client";

import React, { useState } from "react";
import { CircleHelp, Check, EyeOff } from "lucide-react";
import {
  useUnanswered,
  useAnswerUnanswered,
  useDeleteUnanswered,
  ChatUnanswered,
  FaqLinkType,
} from "@/feature/chat/api/useChat";
import { LinkPicker, LinkState, emptyLink } from "@/feature/chat/components/LinkPicker";
import PageLoader from "@/components/shared/PageLoader";
import EmptyState from "@/components/shared/EmptyState";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";

const TABS = [
  { key: "open", label: "Open" },
  { key: "answered", label: "Answered" },
] as const;

const timeAgo = (iso: string): string => {
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

const AnswerBox: React.FC<{ item: ChatUnanswered; onDone: () => void }> = ({ item, onDone }) => {
  const { answer, isAnswering } = useAnswerUnanswered();
  const [text, setText] = useState("");
  const [link, setLink] = useState<LinkState>(emptyLink);

  const submit = async () => {
    if (!text.trim()) return;
    await answer({
      id: item.id,
      answer: text.trim(),
      linkType: link.linkType === "" ? null : (link.linkType as FaqLinkType | null),
      linkEntityId: link.linkEntityId,
      linkTitle: link.linkTitle || null,
      linkUrl: link.linkUrl || null,
    });
    onDone();
  };

  return (
    <div className="mt-3 bg-teal-50/60 border border-teal-100 rounded-xl p-3 space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type the bot's answer — this will create a new FAQ and the bot will use it automatically..."
        rows={3}
        className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2E8B8B] resize-y"
        maxLength={2000}
      />
      <LinkPicker value={link} onChange={setLink} />
      <div className="flex items-center gap-2">
        <button
          onClick={submit}
          disabled={isAnswering || !text.trim()}
          className="inline-flex items-center gap-1.5 bg-[#2E8B8B] hover:bg-[#26807f] disabled:opacity-50 text-white text-sm font-semibold rounded-xl px-4 py-1.5 transition-colors"
        >
          <Check className="w-4 h-4" />
          {isAnswering ? "Saving..." : "Answer + Train bot"}
        </button>
        <button
          onClick={onDone}
          className="text-sm text-zinc-500 hover:text-zinc-700 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export const UnansweredReview: React.FC = () => {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("open");
  const { items, isLoading } = useUnanswered(tab);
  const { deleteUnansweredById, isDeleting } = useDeleteUnanswered();
  const [answeringId, setAnsweringId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const counts: Record<string, number> = {};
  for (const t of TABS) counts[t.key] = 0;

  const totalItems = (items || []).length;

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <PrivatePageHeading
          icon={CircleHelp}
          title="Unanswered Questions"
          description="These are questions the bot could not answer. Write an answer → a new FAQ will be created → the bot will learn it."
        />
      </div>

      <div className="flex items-center gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-[#2E8B8B] text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-zinc-400">{totalItems} shown</span>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3">{error}</p>
      )}

      <div className="flex-1 overflow-y-auto space-y-3">
        {isLoading && <PageLoader size="sm" />}
        {!isLoading && (!items || items.length === 0) && (
          <EmptyState 
            title={tab === "open" ? "No unanswered questions" : "Nothing here"}
            description={tab === "open" ? "The bot understands everything!" : ""}
            icon={CircleHelp}
            className="border-0 shadow-none bg-transparent py-16"
          />
        )}

        {(items || []).map((item) => (
          <div key={item.id} className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-800">{item.raw}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#2E8B8B]/10 text-[#2E8B8B] text-[10px] font-bold">
                    {item.count}× asked
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.source === "flow_rejected"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {item.source === "flow_rejected" ? "Flow junk" : "No FAQ match"}
                  </span>
                  {item.destination && (
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px]">
                      📍 {item.destination}
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-400">{timeAgo(item.updatedAt)}</span>
                </div>
              </div>
              {tab === "open" && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setAnsweringId(answeringId === item.id ? null : item.id)}
                    className="inline-flex items-center gap-1 bg-[#2E8B8B] hover:bg-[#26807f] text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Answer
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to delete this question?")) {
                        try {
                          await deleteUnansweredById(item.id);
                        } catch {
                          setError("Could not delete. Please try again.");
                        }
                      }
                    }}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                    title="Delete this question (the bot will never learn it)"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {answeringId === item.id && (
              <AnswerBox item={item} onDone={() => setAnsweringId(null)} />
            )}

            {tab === "answered" && item.answeredFaq && (
              <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                <p className="text-[11px] font-bold text-emerald-700 mb-1">Bot's new answer:</p>
                <p className="text-sm text-zinc-700 whitespace-pre-line">{item.answeredFaq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnansweredReview;
