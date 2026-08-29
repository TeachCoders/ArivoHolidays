"use client";
import React from "react";
import { Users, IndianRupee, CheckCircle, AlertTriangle, ChevronRight, ChevronDown, Filter, UserPlus, Building2, UsersRound, Mail, Phone, ArrowRight, Trash2, User, Globe, MessageSquare } from "lucide-react";
import StatsCardGrid from "@/components/shared/StatsCardGrid";
import FilterBox from "@/components/shared/FilterBox";
import TableWraper from "@/components/shared/TableWraper";
import PageSizeSelect from "@/components/shared/PageSizeSelect";
import AssignLeadDialog from "@/feature/leads/components/assign-lead-dialog";
import { STATUS_BADGE, PAYMENT_BADGE, getLeadStatus, getAssignedType, getAssignedPerson, getVendorInfo, getInvoiceTotal, getPaymentPaid } from "./myLeadsHelpers";
import { LeadExpandedDetail } from "./LeadExpandedDetail";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeadsTableProps {
  searchedLeads: any[];
  precomputedMap: Map<number, any>;
  precomputedAllMap: Map<number, any>;
  agentPerformance: any[];
  dateFilteredLeads: any[];
  dynamicStats: any;
  page: number;
  setPage: (n: number | ((prev: number) => number)) => void;
  pageSize: number;
  setPageSize: (n: number) => void;
  totalPages: number;
  expandedRowId: number | null;
  toggleExpand: (id: number) => void;
  expandedTab: "traveller" | "vendor";
  setExpandedTab: (t: "traveller" | "vendor") => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  assignedTypeFilter: string;
  setAssignedTypeFilter: (v: string) => void;
  sourceFilter: string;
  setSourceFilter: (v: any) => void;
  selectedAgent: string;
  setSelectedAgent: (v: string) => void;
  uniqueAgents: { id: string; name: string }[];
  searchText: string;
  setSearchText: (v: string) => void;
  user: any;
  highlightId: string | null;
  isSuperAdmin: boolean;
  onDeleteModal: (lead: any) => void;
  vendors: any[];
  assignments: any[];
  vendorPriceMap: Record<string, any>;
  bookedKeys: Set<string>;
  editingKey: string | null;
  setEditingKey: (k: string | null) => void;
  editForm: { startDate: string; endDate: string; unitPrice: number };
  setEditForm: (fn: any) => void;
  updateAssignment: any;
  isUpdating: boolean;
  setUnassignedVendorModal: (v: boolean) => void;
  setUnassignedService: (v: string) => void;
  setUnassignedCity: (v: string) => void;
  setUnassignedManualName: (v: string) => void;
  serverPagination: any;
  tabCounts: { all: number, sales: number, vendor: number, none: number };
}

export function LeadsTable({
  searchedLeads, precomputedMap, precomputedAllMap, agentPerformance,
  dateFilteredLeads, dynamicStats, page, setPage, pageSize, setPageSize,
  totalPages, expandedRowId, toggleExpand, expandedTab, setExpandedTab,
  statusFilter, setStatusFilter, assignedTypeFilter, setAssignedTypeFilter,
  sourceFilter, setSourceFilter,
  selectedAgent, setSelectedAgent, uniqueAgents,
  searchText, setSearchText, user, highlightId, isSuperAdmin, onDeleteModal,
  vendors, assignments, vendorPriceMap, bookedKeys, editingKey, setEditingKey,
  editForm, setEditForm, updateAssignment, isUpdating, setUnassignedVendorModal,
  setUnassignedService, setUnassignedCity, setUnassignedManualName, serverPagination, tabCounts,
}: LeadsTableProps) {
  const [viewMode, setViewMode] = React.useState<"leads" | "performance">("leads");

  return (
    <>

      {/* <FilterBox
        search={{ value: searchText, onChange: (e) => setSearchText(e.target.value), placeholder: "Search by traveller name or lead ID..." }}
      /> */}

      {(() => {
        const tabsSection = isSuperAdmin && dateFilteredLeads.length > 0 && agentPerformance.length > 0 ? (
          <div className="flex items-center gap-1 mb-[-1px] ml-4 relative z-10">
            <button
              onClick={() => setViewMode("leads")}
              className={`px-5 py-2.5 text-xs font-bold rounded-t-xl border border-b-0 transition-all ${viewMode === "leads" ? "bg-[#D4561A] text-white border-[#D4561A]" : "bg-slate-900 text-slate-300 border-slate-900 hover:text-white"
                }`}
            >
              Active Follow-ups
            </button>
            <button
              onClick={() => setViewMode("performance")}
              className={`px-5 py-2.5 text-xs font-bold rounded-t-xl border border-b-0 transition-all flex items-center gap-2 ${viewMode === "performance" ? "bg-[#D4561A] text-white border-[#D4561A]" : "bg-slate-900 text-slate-300 border-slate-900 hover:text-white"
                }`}
            >
              Assigned Leads followup
            </button>
          </div>
        ) : null;

        if (isSuperAdmin && dateFilteredLeads.length > 0 && agentPerformance.length > 0 && viewMode === "performance") {
          return (
            <div className="flex flex-col">
              {tabsSection}
              <AgentPerformanceTable agentPerformance={agentPerformance} />
            </div>
          );
        }

        const activeFilterLabel = [
          { id: "all", label: "All Leads" },
          { id: "none", label: "Unassigned" },
          { id: "sales", label: "Sales Team" },
          { id: "vendor", label: "Vendor" },
        ].find(t => t.id === assignedTypeFilter)?.label || "All Leads";

        return (
          <div className="flex flex-col">
            {tabsSection}
            <TableWraper
              variant="slate"
            >

                <>
                  <div className="flex items-center justify-between px-5 py-3 bg-white border-y border-slate-100">
                    {/* Left: Legend */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-brand-neutral">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-200" /> This week</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-50 border border-orange-200" /> Last week</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-cyan-50 border border-cyan-200" /> Upcoming</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-white border border-slate-200" /> Older</span>
                    </div>
                    
                    {/* Right: Filters */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Select value={sourceFilter} onValueChange={(val) => setSourceFilter(val)}>
                          <SelectTrigger className="w-[170px] text-xs font-bold text-brand-neutral bg-white border border-slate-200/60 shadow-sm rounded-xl h-8 focus:ring-1 focus:ring-brand-500">
                            <SelectValue placeholder="All Sources" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all" className="text-xs">All Sources</SelectItem>
                            <SelectItem value="website" className="text-xs">Website Leads</SelectItem>
                            <SelectItem value="chat" className="text-xs">Chat Leads</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Select value={assignedTypeFilter} onValueChange={(val) => setAssignedTypeFilter(val)}>
                          <SelectTrigger className="w-[180px] text-xs font-bold text-brand-neutral bg-white border border-slate-200/60 shadow-sm rounded-xl h-8 focus:ring-1 focus:ring-brand-500">
                            <SelectValue placeholder="All Assignments" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { id: "all", label: "All Leads", count: tabCounts?.all || 0 },
                              { id: "none", label: "Unassigned", count: tabCounts?.none || 0 },
                              { id: "sales", label: "Sales Team", count: tabCounts?.sales || 0 },
                              { id: "vendor", label: "Vendor", count: tabCounts?.vendor || 0 },
                            ].map(tab => (
                              <SelectItem key={tab.id} value={tab.id} className="text-xs">
                                {tab.label} ({tab.count})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {isSuperAdmin && (
                          <Select value={selectedAgent} onValueChange={(val) => {
                            setSelectedAgent(val);
                            setAssignedTypeFilter("all");
                            setStatusFilter("all");
                          }}>
                            <SelectTrigger className="w-[140px] text-xs font-bold text-brand-neutral bg-white border border-slate-200/60 shadow-sm rounded-xl h-8 focus:ring-1 focus:ring-brand-500">
                              <SelectValue placeholder="All Agents" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all" className="text-xs">All Agents</SelectItem>
                              {uniqueAgents.map((a) => (
                                <SelectItem key={a.id} value={a.id} className="text-xs">{a.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="tbl">
                      <thead>
                        <tr className="bg-slate-800">
                          <th className="py-3.5 px-4 first:rounded-tl-lg"></th>
                          <th className="!text-white text-left py-3.5 px-4 text-xs font-semibold whitespace-nowrap">Book Date</th>
                          <th className="!text-white text-left py-3.5 px-4 text-xs font-semibold whitespace-nowrap">Traveller</th>
                          <th className="!text-white text-left py-3.5 px-4 text-xs font-semibold whitespace-nowrap">Journey Date</th>
                          <th className="!text-white text-left py-3.5 px-4 text-xs font-semibold whitespace-nowrap">Assigned To</th>
                          <th className="!text-white text-left py-3.5 px-4 text-xs font-semibold whitespace-nowrap">Payments & Billing</th>
                          <th className="text-left py-2 px-2 whitespace-nowrap">
                            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
                              <SelectTrigger className="h-7 w-[120px] bg-white/10 hover:bg-white/20 border-none text-white focus:ring-0 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors">
                                <SelectValue placeholder="Booking Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all" className="text-xs font-bold">All Status</SelectItem>
                                <SelectItem value="confirmed" className="text-xs font-semibold text-brand-success">Confirmed</SelectItem>
                                <SelectItem value="ongoing" className="text-xs font-semibold text-brand-info">Ongoing</SelectItem>
                                <SelectItem value="pending" className="text-xs font-semibold text-brand-warning">Pending</SelectItem>
                                <SelectItem value="cancelled" className="text-xs font-semibold text-rose-600">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </th>
                          <th className="!text-white text-left py-3.5 px-4 text-xs font-semibold whitespace-nowrap last:rounded-tr-lg">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-neutral-light">
                        {searchedLeads.length === 0 ? (
                          <tr>
                            <td colSpan={8}>
                              <div className="p-16 text-center">
                                <Users size={28} className="text-slate-300 mx-auto mb-3" />
                                <h3 className="font-bold text-brand-neutral-dark text-base">No Travelers Found</h3>
                                <p className="text-brand-neutral-muted text-xs mt-1">There are no travelers matching your active filters.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (() => {
                          const startIdx = (page - 1) * pageSize;
                          const paginatedLeads = searchedLeads.slice(startIdx, startIdx + pageSize);
                          return paginatedLeads.map((lead: any) => {
                            const pc = precomputedMap.get(lead.id);
                            const st = pc?.status || "PENDING";
                            const badge = STATUS_BADGE[st] || STATUS_BADGE.PENDING;
                            const invoiced = pc?.invoiced || 0;
                            const paid = pc?.paid || 0;
                            const assignedType = pc?.assignedType || "none";
                            const tourBooking = lead.tourBookings?.[0];
                            const getRowBg = () => {
                              if (!tourBooking?.travelStartDate) return "hover:bg-brand-neutral-light/50";
                              const travelDate = new Date(tourBooking.travelStartDate);
                              travelDate.setHours(0, 0, 0, 0);
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const diffDays = Math.ceil((travelDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                              if (diffDays >= 0 && diffDays <= 7) return "bg-emerald-50/70 hover:bg-emerald-100/60";
                              if (diffDays < 0 && diffDays >= -7) return "bg-orange-50/70 hover:bg-orange-100/60";
                              if (diffDays > 7) return "bg-cyan-50/50 hover:bg-cyan-100/50";
                              return "hover:bg-brand-neutral-light/50";
                            };
                            const assignedPerson = getAssignedPerson(lead);
                            const isExpanded = expandedRowId === lead.id;

                            return (
                              <React.Fragment key={lead.id}>
                                <tr className={`transition-colors align-top cursor-pointer ${getRowBg()}`} onClick={() => toggleExpand(lead.id)}>
                                  <td className="py-4 pl-4 pr-1">
                                    <button className="p-1 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all">
                                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </button>
                                  </td>
                                  <td className="py-4 px-3 text-xs text-brand-neutral-muted whitespace-nowrap">
                                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                                  </td>
                                  <td className="py-4 px-3 min-w-[170px]">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-[10px] font-bold text-brand-neutral-muted bg-slate-100 px-2 py-0.5 rounded inline-block mb-1">{lead.travellerId}</span>
                                      {highlightId && lead.travellerId === highlightId && (
                                        <span className="text-[9px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">NEW</span>
                                      )}
                                    </div>
                                    <p className="font-extrabold text-brand-neutral-dark text-sm">{lead.name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      {lead.source === 'chat' ? (
                                        <span className="flex items-center gap-1 text-[9px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 font-semibold w-fit">
                                          <MessageSquare size={9} /> Chat Lead
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1 text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 font-semibold w-fit">
                                          <Globe size={9} /> Website Lead
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-4 px-3 text-sm font-medium text-brand-neutral whitespace-nowrap">
                                    {tourBooking?.travelStartDate ? (
                                      new Date(tourBooking.travelStartDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                    ) : <span className="text-slate-400 text-xs">-</span>}
                                  </td>
                                  <td className="py-4 px-3 min-w-[200px]">
                                    {assignedPerson.name ? (
                                      <div className="flex items-start gap-3">
                                        {assignedPerson.profileImage ? (
                                          <img src={assignedPerson.profileImage} alt={assignedPerson.name} className="w-8 h-8 rounded-full object-cover shadow-sm shrink-0 border border-slate-200" />
                                        ) : (
                                          <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-brand-primary/20">
                                            {assignedPerson.name.charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                        <div className="flex flex-col">
                                          <p className="font-bold text-brand-neutral-dark text-xs">{assignedPerson.name}</p>
                                          {assignedPerson.mobile && (
                                            <span className="flex items-center gap-1 text-[10px] text-brand-neutral-muted mt-0.5">
                                              <Phone size={10} className="text-slate-400 shrink-0" /> {assignedPerson.mobile}
                                            </span>
                                          )}
                                          {assignedPerson.email && (
                                            <span className="flex items-center gap-1 text-[10px] text-brand-neutral-muted truncate max-w-[150px]">
                                              <Mail size={10} className="text-slate-400 shrink-0" /> {assignedPerson.email}
                                            </span>
                                          )}
                                          {assignedType === "both" && (
                                            <span className="inline-flex items-center gap-1 text-[9px] mt-1 px-1.5 py-0.5 w-fit rounded-full bg-teal-50 text-teal-600 font-semibold">
                                              <Building2 size={8} /> Also assigned to vendor
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ) : assignedType === "vendor" ? (
                                      <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-teal-100">
                                          <Building2 size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                          <p className="font-bold text-brand-neutral-dark text-xs">{getVendorInfo(lead).name || "Unknown Vendor"}</p>
                                          {getVendorInfo(lead).mobile && (
                                            <span className="flex items-center gap-1 text-[10px] text-brand-neutral-muted mt-0.5">
                                              <Phone size={10} className="text-slate-400 shrink-0" /> {getVendorInfo(lead).mobile}
                                            </span>
                                          )}
                                          <span className="inline-flex items-center gap-1 text-[9px] mt-1 px-1.5 py-0.5 w-fit rounded-full bg-teal-50 text-teal-600 font-semibold">
                                            <Building2 size={8} /> Vendor
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shadow-sm border border-slate-200">
                                          <User size={14} />
                                        </div>
                                        <span className="text-slate-400 text-xs italic">Unassigned</span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-4 px-3 text-xs">
                                    <p className="font-bold text-brand-neutral whitespace-nowrap">
                                      ₹{invoiced.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">total</span>
                                    </p>
                                    {invoiced > 0 && (
                                      <p className="text-[10px] mt-1 font-semibold whitespace-nowrap">
                                        <span className="text-brand-success">Paid: ₹{paid.toLocaleString()}</span>
                                        {" • "}
                                        <span className={invoiced - paid > 0 ? "text-rose-600" : "text-brand-success"}>
                                          Due: ₹{Math.max(0, invoiced - paid).toLocaleString()}
                                        </span>
                                      </p>
                                    )}
                                  </td>
                                  <td className="py-4 px-3">
                                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-black whitespace-nowrap ${badge.cls}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                                      {badge.label}
                                    </span>
                                  </td>
                                  <td className="py-4 px-3" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-1.5 flex-wrap min-w-[160px]">
                                      {(user?.role === "team_leader" || user?.role === "super_admin") && (
                                        assignedType === "none" ? (
                                          <AssignLeadDialog leadId={lead.id}>
                                            <button className="px-2.5 py-1.5 rounded-lg border border-indigo-200 text-brand-primary hover:bg-brand-primary-light font-bold text-[10px] transition-all flex items-center gap-1">
                                              <UserPlus size={12} /> Assign
                                            </button>
                                          </AssignLeadDialog>
                                        ) : (
                                          <button disabled className="px-2.5 py-1.5 rounded-lg bg-brand-success-light text-brand-success border border-green-200 font-bold text-[10px] cursor-not-allowed flex items-center gap-1">
                                            Assigned
                                          </button>
                                        )
                                      )}
                                      {!isSuperAdmin && (
                                        <a href={`/dashboard/sales/followup/${lead.id}`}>
                                          <button className="btn-primary px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all shadow-sm flex items-center gap-1">
                                            My Work <ArrowRight size={12} />
                                          </button>
                                        </a>
                                      )}
                                      {user?.role === "super_admin" && (
                                        <button onClick={() => onDeleteModal(lead)} className="px-2.5 py-1.5 rounded-lg border border-red-200 text-brand-danger hover:bg-brand-danger-light font-bold text-[10px] transition-all flex items-center gap-1">
                                          <Trash2 size={12} /> Delete
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <LeadExpandedDetail
                                    lead={lead}
                                    expandedTab={expandedTab}
                                    setExpandedTab={setExpandedTab}
                                    vendors={vendors}
                                    assignments={assignments}
                                    vendorPriceMap={vendorPriceMap}
                                    bookedKeys={bookedKeys}
                                    editingKey={editingKey}
                                    setEditingKey={setEditingKey}
                                    editForm={editForm}
                                    setEditForm={setEditForm}
                                    updateAssignment={updateAssignment}
                                    isUpdating={isUpdating}
                                    setUnassignedVendorModal={setUnassignedVendorModal}
                                    setUnassignedService={setUnassignedService}
                                    setUnassignedCity={setUnassignedCity}
                                    setUnassignedManualName={setUnassignedManualName}
                                    user={user}
                                  />
                                )}
                              </React.Fragment>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <PageSizeSelect value={pageSize} onChange={(size) => { setPageSize(size); setPage(1); }} />
                        <p className="text-xs text-brand-neutral-muted font-semibold">
                          Showing {searchedLeads.length === 0 ? 0 : ((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, searchedLeads.length)} of {searchedLeads.length} leads
                          {serverPagination?.totalCount > 0 && (
                            <span className="ml-2 text-slate-400">({serverPagination.totalCount} total in database)</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-brand-neutral-border text-brand-neutral hover:bg-brand-neutral-light disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                          Prev
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                          .reduce<(number | string)[]>((acc, p, idx, arr) => {
                            if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                            acc.push(p);
                            return acc;
                          }, [])
                          .map((p, idx) =>
                            typeof p === "string" ? (
                              <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400">...</span>
                            ) : (
                              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${page === p ? "bg-brand-navy text-white shadow-sm" : "border border-brand-neutral-border text-brand-neutral hover:bg-brand-neutral-light"}`}>
                                {p}
                              </button>
                            )
                          )}
                        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-brand-neutral-border text-brand-neutral hover:bg-brand-neutral-light disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
            </TableWraper>
          </div>
        );
      })()}
    </>
  );
}

function AgentPerformanceTable({ agentPerformance }: { agentPerformance: any[] }) {
  return (
    <TableWraper
      variant="slate"
    >
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr className="bg-slate-800">
              <th className="!text-white text-left py-3.5 px-5 text-xs font-semibold whitespace-nowrap first:rounded-tl-lg">Agent</th>
              <th className="!text-white text-center py-3.5 px-3 text-xs font-semibold whitespace-nowrap">Total Leads</th>
              <th className="!text-white text-center py-3.5 px-3 text-xs font-semibold whitespace-nowrap">Website</th>
              <th className="!text-white text-center py-3.5 px-3 text-xs font-semibold whitespace-nowrap">Chat</th>
              <th className="!text-white text-center py-3.5 px-3 text-xs font-semibold whitespace-nowrap">Confirmed</th>
              <th className="!text-white text-center py-3.5 px-3 text-xs font-semibold whitespace-nowrap">Cancelled</th>
              <th className="!text-white text-center py-3.5 px-3 text-xs font-semibold whitespace-nowrap">Invoiced</th>
              <th className="!text-white text-center py-3.5 px-3 text-xs font-semibold whitespace-nowrap">Payments Received</th>
              <th className="!text-white text-center py-3.5 px-3 text-xs font-semibold whitespace-nowrap last:rounded-tr-lg">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-neutral-light">
            {agentPerformance.map((agent, idx) => (
              <tr key={idx} className="hover:bg-brand-neutral-light/50 transition-colors">
                <td className="py-3 px-5 text-xs font-semibold text-brand-neutral-dark">{agent.name}</td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-primary-light text-brand-primary font-bold text-xs">{agent.totalLeads}</span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-blue-50 text-blue-600 font-bold text-xs">{agent.websiteLeads}</span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-purple-50 text-purple-600 font-bold text-xs">{agent.chatLeads}</span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-brand-success font-bold text-xs">{agent.confirmed}</span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs ${agent.cancelled > 0 ? "bg-rose-50 text-rose-700" : "bg-brand-neutral-light text-slate-400"}`}>{agent.cancelled}</span>
                </td>
                <td className="py-3 px-3 text-center text-xs font-bold text-brand-neutral">₹{Math.round(agent.totalInvoiced).toLocaleString()}</td>
                <td className="py-3 px-3 text-center text-xs font-bold text-brand-success">₹{Math.round(agent.totalPaid).toLocaleString()}</td>
                <td className="py-3 px-3 text-center text-xs font-bold text-rose-600">₹{Math.max(0, Math.round(agent.totalInvoiced - agent.totalPaid)).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableWraper>
  );
}
