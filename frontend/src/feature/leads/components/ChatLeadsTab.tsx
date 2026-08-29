"use client";
import React from "react";
import { MessageSquare, UserCog, Trash2 } from "lucide-react";
import PageLoader from "@/components/shared/PageLoader";
import TableWraper from "@/components/shared/TableWraper";
import AssignLeadDialog from "@/feature/leads/components/assign-lead-dialog";
import { getLeadStatus } from "./myLeadsHelpers";

interface ChatLeadsTabProps {
  chatLoading: boolean;
  chatLeads: any[];
  user: any;
  highlightId: string | null;
  onDeleteModal: (lead: any) => void;
}

export function ChatLeadsTab({ chatLoading, chatLeads, user, highlightId, onDeleteModal }: ChatLeadsTabProps) {
  if (chatLoading) return <PageLoader size="section" />;

  return (
    <TableWraper
      title="Chat Inquiries"
      icon={MessageSquare}
      count={chatLeads.length}
      subtitle="Leads that came through the chat bot"
    >
      {chatLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-brand-neutral-muted gap-3">
          <MessageSquare size={32} className="opacity-40" />
          <p className="text-sm">No chat leads yet</p>
          <p className="text-xs">Leads from the chat widget will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-slate-800">
                <th className="!text-white px-5 py-3.5 text-xs font-semibold first:rounded-tl-lg">Traveller</th>
                <th className="!text-white px-5 py-3.5 text-xs font-semibold">Phone</th>
                <th className="!text-white px-5 py-3.5 text-xs font-semibold">Destination</th>
                <th className="!text-white px-5 py-3.5 text-xs font-semibold">Status</th>
                <th className="!text-white px-5 py-3.5 text-xs font-semibold">Assigned To</th>
                <th className="!text-white px-5 py-3.5 text-xs font-semibold">Date</th>
                <th className="!text-white px-5 py-3.5 text-xs font-semibold text-right last:rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {chatLeads.map((lead: any) => {
                const badge = getLeadStatus(lead);
                const statusCls = badge === "CONFIRMED" || badge === "COMPLETED"
                  ? "bg-emerald-100 text-emerald-800"
                  : badge === "ONGOING"
                    ? "bg-blue-100 text-blue-800"
                    : badge === "CANCELLED"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800";
                return (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-brand-50/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold uppercase text-sm shrink-0">
                          {lead.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{lead.name}</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs text-brand-neutral-muted">{lead.travellerId}</p>
                            {highlightId && lead.travellerId === highlightId && (
                              <span className="text-[9px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">
                                NEW
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{lead.phone || "—"}</td>
                    <td className="px-5 py-3 text-gray-700 font-medium">{lead.destination || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCls}`}>
                        {badge?.replace("_", " ") || "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {lead.assignedTo?.name || <span className="text-brand-neutral-muted italic">Unassigned</span>}
                    </td>
                    <td className="px-5 py-3 text-xs text-brand-neutral-muted whitespace-nowrap">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <AssignLeadDialog leadId={lead.id}>
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm">
                            <UserCog size={13} />
                            Assign
                          </button>
                        </AssignLeadDialog>
                        {user?.role === "super_admin" && (
                          <button
                            onClick={() => onDeleteModal(lead)}
                            className="px-2.5 py-1.5 rounded-lg border border-red-200 text-brand-danger hover:bg-brand-danger-light font-bold text-[10px] transition-all flex items-center gap-1"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </TableWraper>
  );
}
