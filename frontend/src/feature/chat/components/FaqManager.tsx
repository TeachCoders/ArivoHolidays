"use client";

import React, { useState } from "react";
import { successToast, confirmToast } from "@/components/shared/tost";
import { BookOpen, Plus, Pencil, Power, Check, Link2, Search, Trash2, ArrowUp, ArrowDown, Eye } from "lucide-react";
import {
  useFaqs,
  useCreateFaq,
  useUpdateFaq,
  useDeleteFaq,
  useReorderFaqs,
  useFaqPreview,
  ChatFaq,
  FaqLinkType,
} from "@/feature/chat/api/useChat";
import { LinkPicker, LinkState, fromFaq } from "@/feature/chat/components/LinkPicker";
import { LinkedText } from "@/feature/chat/components/LinkedText";
import { usePermissions } from "@/hooks/usePermissions";
import PageLoader from "@/components/shared/PageLoader";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";

const FaqForm: React.FC<{
  initial?: ChatFaq;
  submitting: boolean;
  onSubmit: (payload: {
    question: string;
    answer: string;
    keywords?: string[];
    linkType?: FaqLinkType | null;
    linkEntityId?: number | null;
    linkTitle?: string | null;
    linkUrl?: string | null;
  }) => void;
  onCancel: () => void;
}> = ({ initial, submitting, onSubmit, onCancel }) => {
  const [question, setQuestion] = useState(initial?.question || "");
  const [keywords, setKeywords] = useState(initial?.keywords?.join(", ") || "");
  const [answer, setAnswer] = useState(initial?.answer || "");
  const [link, setLink] = useState<LinkState>(fromFaq(initial));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    const kw = keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    onSubmit({
      question: question.trim(),
      answer: answer.trim(),
      keywords: kw,
      linkType: link.linkType === "" ? null : link.linkType,
      linkEntityId: link.linkEntityId,
      linkTitle: link.linkTitle || null,
      linkUrl: link.linkUrl || null,
    });
  };

  return (
    <form onSubmit={submit} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
      <div>
        <label className="text-xs font-semibold text-zinc-600">Question</label>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Tourist's question..."
          className="mt-1 w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2E8B8B]"
          maxLength={300}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-zinc-600">
          Keywords <span className="text-zinc-400">(comma-separated — leave blank to auto-derive)</span>
        </label>
        <input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="honeymoon, honeymoon trip, couple"
          className="mt-1 w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2E8B8B]"
          maxLength={400}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-zinc-600">Answer</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Bot's answer (never include price/number — show tourists only a custom quote)..."
          rows={3}
          className="mt-1 w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2E8B8B] resize-y"
          maxLength={2000}
        />
        <p className="text-[11px] text-zinc-400 mt-1">
          When a link is set, the bot automatically attaches the page's live data (title, days, price, best time).
        </p>
      </div>
      <LinkPicker value={link} onChange={setLink} />
      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting || !question.trim() || !answer.trim()}
          className="btn-primary inline-flex items-center gap-1.5 disabled:opacity-50 text-sm px-4 py-2 shadow-sm"
        >
          <Check className="w-4 h-4" />
          {submitting ? "Saving..." : initial ? "Update FAQ" : "Add FAQ"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-zinc-500 hover:text-zinc-700 font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export const FaqManager: React.FC = () => {
  const { faqs, isLoading } = useFaqs();
  const { create, isCreating, error: createError, reset: resetCreateError } = useCreateFaq();
  const { update, isUpdating } = useUpdateFaq();
  const { deleteFaqById, isDeleting } = useDeleteFaq();
  const { reorder, isReordering, reorderError } = useReorderFaqs();
  const { preview, previewData, isPreviewing } = useFaqPreview();
  const { isSuperAdmin } = usePermissions();

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState<number | null>(null);

  const activeCount = (faqs || []).filter((f) => f.isActive).length;

  const filtered = (faqs || []).filter((f) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q) ||
      (f.keywords || []).some((k) => k.toLowerCase().includes(q)) ||
      (f.linkTitle || "").toLowerCase().includes(q)
    );
  });

  const handleToggle = async (faq: ChatFaq) => {
    await update({ id: faq.id, payload: { isActive: !faq.isActive } });
  };

  const handleMove = async (faq: ChatFaq, dir: -1 | 1) => {
    const index = filtered.findIndex((f) => f.id === faq.id);
    const target = filtered[index + dir];
    if (!target) return;
    const orderedIds = (faqs || []).map((f) => f.id);
    const a = orderedIds.indexOf(faq.id);
    const b = orderedIds.indexOf(target.id);
    [orderedIds[a], orderedIds[b]] = [orderedIds[b], orderedIds[a]];
    await reorder(orderedIds);
  };

  const openPreview = (id: number) => {
    setPreviewId(id);
    preview(id);
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex flex-wrap items-start gap-3 mb-4">
        <PrivatePageHeading
          icon={BookOpen}
          title="Bot FAQs"
          description={`Bot answers these automatically. ${activeCount} active / ${(faqs || []).length} total — new FAQ goes live within 1 min.${isSuperAdmin ? " (Only you can add/edit)" : " (Add/edit by Super Admin only)"}`}
        />
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-[#2E8B8B]"
          />
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => {
              setShowAdd((v) => !v);
              resetCreateError();
            }}
            className="btn-primary inline-flex items-center gap-1.5 text-sm px-4 py-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {showAdd && (
          <FaqForm
            submitting={isCreating}
            onSubmit={async (payload) => {
              await create(payload);
              setShowAdd(false);
            }}
            onCancel={() => setShowAdd(false)}
          />
        )}
        {createError && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {(createError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
              "Failed to add FAQ. Please try again."}
          </p>
        )}

        {isLoading && <PageLoader size="sm" />}
        {!isLoading && (!filtered || filtered.length === 0) && (
          <p className="p-6 text-center text-sm text-zinc-400">
            {search ? "No FAQs found matching your search." : "No FAQs yet."}
          </p>
        )}

        {filtered.map((faq, i) => {
          const first = i === 0;
          const last = i === filtered.length - 1;
          return (
          <div key={faq.id} className="bg-white border border-zinc-200 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-800">{faq.question}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {(faq.keywords || []).slice(0, 6).map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 rounded-full bg-teal-50 text-[#2E8B8B] text-[10px] font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                  {faq.linkUrl && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold inline-flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      LINKED
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openPreview(faq.id)}
                  disabled={isPreviewing}
                  className="text-zinc-400 hover:text-[#2E8B8B] transition-colors disabled:opacity-40"
                  title="How it appears in the bot — preview"
                  aria-label="Preview FAQ"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    faq.isActive ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {faq.isActive ? "ACTIVE" : "OFF"}
                </span>
                {isSuperAdmin && (
                  <>
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => handleMove(faq, -1)}
                        disabled={first || isReordering}
                        className="text-zinc-400 hover:text-[#2E8B8B] transition-colors disabled:opacity-30"
                        title="Move up (shown first by the bot)"
                        aria-label="Move FAQ up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMove(faq, 1)}
                        disabled={last || isReordering}
                        className="-mt-1 text-zinc-400 hover:text-[#2E8B8B] transition-colors disabled:opacity-30"
                        title="Move down"
                        aria-label="Move FAQ down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => setEditingId(editingId === faq.id ? null : faq.id)}
                      className="text-zinc-400 hover:text-[#2E8B8B] transition-colors"
                      title="Edit FAQ"
                      aria-label="Edit FAQ"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(faq)}
                      disabled={isUpdating}
                      className={`transition-colors ${faq.isActive ? "text-emerald-500 hover:text-red-500" : "text-zinc-400 hover:text-emerald-600"}`}
                      title={faq.isActive ? "Deactivate (bot will not answer this)" : "Activate"}
                      aria-label="Toggle FAQ"
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        const confirmed = await confirmToast("Are you sure you want to delete?");
                        if (!confirmed) return;
                        await deleteFaqById(faq.id);
                        successToast("FAQ deleted successfully!");
                      }}
                      disabled={isDeleting}
                      className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Delete FAQ permanently"
                      aria-label="Delete FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-zinc-600 mt-2 whitespace-pre-line">{faq.answer}</p>
            {faq.linkUrl && (
              <a
                href={faq.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <Link2 className="w-3.5 h-3.5" />
                {faq.linkTitle || faq.linkUrl}
              </a>
            )}
            {editingId === faq.id && isSuperAdmin && (
              <div className="mt-3">
                <FaqForm
                  initial={faq}
                  submitting={isUpdating}
                  onSubmit={async (payload) => {
                    await update({ id: faq.id, payload });
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            )}
          </div>
          );
        })}
      </div>

      {reorderError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mt-2">
          Order was not changed. Please try again.
        </p>
      )}

      {previewId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setPreviewId(null)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900">How it appears in the bot</h3>
              <button
                onClick={() => setPreviewId(null)}
                className="text-zinc-400 hover:text-zinc-700"
                aria-label="Close preview"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-zinc-50">
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-zinc-100">
                  <span className="text-[10px] font-bold text-[#d94838] italic tracking-tighter">ariv</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="max-w-[280px] rounded-2xl px-4 py-3 text-[14px] whitespace-pre-line leading-relaxed shadow-sm bg-white border border-zinc-100 text-zinc-800">
                    {isPreviewing && !previewData ? (
                      <span className="text-zinc-400">Loading...</span>
                    ) : (
                      <LinkedText text={previewData?.text || ""} />
                    )}
                  </div>
                  {previewData?.buttons && previewData.buttons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1 max-w-[280px]">
                      {previewData.buttons.map((btn, i) => (
                        <button
                          key={i}
                          className="text-[12px] font-semibold text-[#0066ff] bg-blue-50 border border-blue-100 shadow-sm rounded-full px-3 py-1.5 hover:bg-blue-100 hover:border-blue-200 transition-colors text-left leading-tight"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 mt-4">
                This is exactly how it appears to the tourist in chat — answer, link, and buttons.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaqManager;
