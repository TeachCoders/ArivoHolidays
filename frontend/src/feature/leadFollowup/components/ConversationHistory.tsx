"use client";
import React from "react";
import { Phone, Mail, MessageCircle, AlertCircle, Clock } from "lucide-react";
import { formatLocalDateTime } from "@/lib/dateUtils";

const CHANNELS = [
  { value: "PHONE", label: "Phone Call", icon: Phone, bg: "bg-blue-500", light: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "EMAIL", label: "Email", icon: Mail, bg: "bg-amber-500", light: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "WHATSAPP", label: "WhatsApp", icon: MessageCircle, bg: "bg-green-500", light: "bg-green-50 text-green-700 border-green-200" },
  { value: "OTHER", label: "Other", icon: AlertCircle, bg: "bg-gray-400", light: "bg-gray-50 text-gray-700 border-gray-200" },
];

const getChannel = (v: string) => CHANNELS.find(c => c.value === v) || CHANNELS[3];

function groupByDate(notes: any[]) {
  const g: Record<string, any[]> = {};
  notes.forEach(n => {
    const k = formatLocalDateTime(n.createdAt, { day: "numeric", month: "long", year: "numeric" });
    (g[k] = g[k] || []).push(n);
  });
  return g;
}

interface ConversationHistoryProps {
  notes: any[];
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({ notes }) => {
  const groups = groupByDate(notes);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-700">Conversation History</h2>
        <span className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
          {notes.length}
        </span>
      </div>
      <div className="p-5">
        {notes.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No interactions recorded yet.</p>
            <p className="text-xs mt-1">Add the first note above.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groups).map(([day, dayNotes]) => (
              <div key={day}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px flex-1 bg-slate-100" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{day}</span>
                  <span className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="space-y-3">
                  {dayNotes.map((note: any) => {
                    const ch = getChannel(note.channel);
                    return (
                      <div key={note.id} className="flex gap-3">
                        <div className={`shrink-0 w-7 h-7 rounded-full ${ch.bg} flex items-center justify-center mt-0.5`}>
                          <ch.icon className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-700">{note.createdBy}</span>
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${ch.light}`}>
                                <ch.icon className="h-2.5 w-2.5" />
                                via {ch.label}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {formatLocalDateTime(note.createdAt, { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 text-sm text-slate-700 leading-relaxed">
                            {note.note}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationHistory;
