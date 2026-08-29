"use client";
import React, { useState } from "react";
import { useAddFollowupNoteMutation } from "../api/useLeadFollowup";
import { Phone, Mail, MessageCircle, AlertCircle, Send } from "lucide-react";
import PageLoader from "@/components/shared/PageLoader";

const CHANNELS = [
  { value: "PHONE", label: "Phone Call", icon: Phone, light: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-400" },
  { value: "EMAIL", label: "Email", icon: Mail, light: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-400" },
  { value: "WHATSAPP", label: "WhatsApp", icon: MessageCircle, light: "bg-green-50 text-green-700 border-green-200 ring-green-400" },
  { value: "OTHER", label: "Other", icon: AlertCircle, light: "bg-gray-50 text-gray-700 border-gray-200 ring-gray-400" },
];

interface AddFollowupNoteProps {
  leadId: number;
}

export const AddFollowupNote: React.FC<AddFollowupNoteProps> = ({ leadId }) => {
  const [noteText, setNoteText] = useState("");
  const [channel, setChannel] = useState("PHONE");
  const { mutate: addNote, isPending: saving } = useAddFollowupNoteMutation();

  const handleSave = () => {
    if (!noteText.trim()) return;
    addNote(
      { leadId, note: noteText.trim(), channel },
      {
        onSuccess: () => {
          setNoteText("");
        },
      }
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <h2 className="text-sm font-bold text-slate-700">Add Follow-up Note</h2>
      </div>
      <div className="p-5 space-y-4">
        {/* Channel Tabs */}
        <div className="flex gap-2 flex-wrap">
          {CHANNELS.map(ch => (
            <button
              key={ch.value}
              onClick={() => setChannel(ch.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                channel === ch.value
                  ? `${ch.light} ring-1 ring-offset-1`
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <ch.icon className="h-3 w-3" />
              {ch.label}
            </button>
          ))}
        </div>
        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          onKeyDown={e => {
            if (e.ctrlKey && e.key === "Enter") handleSave();
          }}
          placeholder="Describe what was discussed... (Ctrl+Enter to save)"
          rows={3}
          className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder-slate-400 text-slate-800"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !noteText.trim()}
            className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? <PageLoader size="inline" /> : <Send className="h-3.5 w-3.5" />}
            {saving ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFollowupNote;
