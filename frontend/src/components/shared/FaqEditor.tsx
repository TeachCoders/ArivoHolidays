"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface FaqData {
  ques: string;
  ans: string;
}

interface FaqEditorProps {
  faqs: FaqData[];
  setFaqs: (faqs: FaqData[] | ((prev: FaqData[]) => FaqData[])) => void;
}

export default function FaqEditor({ faqs, setFaqs }: FaqEditorProps) {
  const removeFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFaq = (index: number, key: "ques" | "ans", value: string) => {
    setFaqs((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [key]: value } : f))
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">
            Frequently Asked Questions
          </Label>
          <p className="text-xs text-slate-500 mt-1">
            Add SEO-friendly questions and answers specific to this page.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100 relative group"
          >
            <button
              type="button"
              onClick={() => removeFaq(index)}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
              title="Remove FAQ"
            >
              <Trash2 size={16} />
            </button>
            <div className="pr-8">
              <Input
                placeholder="Question (e.g. What is the best time to visit?)"
                value={faq.ques}
                onChange={(e) => updateFaq(index, "ques", e.target.value)}
                className="font-medium bg-white"
              />
            </div>
            <div>
              <textarea
                placeholder="Answer"
                value={faq.ans}
                onChange={(e) => updateFaq(index, "ans", e.target.value)}
                className="w-full text-sm min-h-[80px] p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-y bg-white"
              />
            </div>
          </div>
        ))}

        {faqs.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4 border border-dashed border-slate-300 rounded-lg">
            No FAQs added yet.
          </p>
        )}

        <button
          type="button"
          onClick={() => setFaqs((prev) => [...prev, { ques: "", ans: "" }])}
          className="flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors py-2"
        >
          <Plus size={16} />
          Add FAQ
        </button>
      </div>
    </div>
  );
}
