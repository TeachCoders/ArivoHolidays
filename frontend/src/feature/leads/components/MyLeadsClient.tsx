"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMyAssignedLeads, useFetchAllLeads, useUpdateLeadStatusMutation, useDeleteLeadMutation, useFetchChatLeads } from "@/feature/leads/api/useLeeds";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import { useGetVendors, useGetVendorAssignments, useUpdateVendorAssignment } from "@/feature/vendors/api/useVendorHooks";
import { successToast, errorToast } from "@/components/shared/tost";
import PageLoader from "@/components/shared/PageLoader";
import { getLeadStatus, getAssignedType, getAssignedPerson, getInvoiceTotal, getPaymentPaid } from "./myLeadsHelpers";
import { MyLeadsHeader } from "./MyLeadsHeader";
import { LeadsTable } from "./LeadsTable";
import { CancelLeadModal, DeleteLeadModal, UnassignedVendorModal } from "./MyLeadsModals";

type DateRange = { from?: Date; to?: Date };

export default function MyLeadsClient() {
  const { user } = useGetCurrentUser();
  const normalizedRole = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = normalizedRole.includes("super") && normalizedRole.includes("admin");
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");

  useEffect(() => {
    if (highlightId) {
      const url = new URL(window.location.href);
      url.searchParams.delete("highlight");
      window.history.replaceState({}, "", url.toString());
    }
  }, [highlightId]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sourceFilter, setSourceFilter] = useState<"all" | "website" | "chat">("all");

  const { leads: myLeads = [], isLoading: myLoading, isError: myError, refetch: myRefetch, pagination: myPagination } = useMyAssignedLeads(1, 200);
  const { leads: allLeads = [], isLoading: allLoading, refetch: allRefetch, pagination: allPagination } = useFetchAllLeads(isSuperAdmin, 1, 200);
  const { leads: chatLeads = [], isLoading: chatLoading, refetch: chatRefetch } = useFetchChatLeads(1, 200);

  const leads = isSuperAdmin ? allLeads : myLeads;
  const bookingFormLeads = useMemo(() => leads.filter((l: any) => l.source !== "chat"), [leads]);
  const isLoading = isSuperAdmin ? allLoading : myLoading;
  const isError = isSuperAdmin ? false : myError;
  const refetch = isSuperAdmin ? allRefetch : myRefetch;
  const serverPagination = isSuperAdmin ? allPagination : myPagination;

  const { mutate: updateStatus, isPending: updatingStatus } = useUpdateLeadStatusMutation();

  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedTypeFilter, setAssignedTypeFilter] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [cancelModal, setCancelModal] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelCharges, setCancelCharges] = useState("");
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [expandedTab, setExpandedTab] = useState<"traveller" | "vendor">("traveller");
  const [deleteModal, setDeleteModal] = useState<any>(null);
  const deleteLeadMutation = useDeleteLeadMutation();
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  const [unassignedVendorModal, setUnassignedVendorModal] = useState(false);
  const [unassignedService, setUnassignedService] = useState("");
  const [unassignedCity, setUnassignedCity] = useState("");
  const [unassignedManualName, setUnassignedManualName] = useState("");
  const { vendors } = useGetVendors();
  const { assignments = [] } = useGetVendorAssignments();
  const { mutate: updateAssignment, isPending: isUpdating } = useUpdateVendorAssignment();

  const vendorPriceMap = useMemo(() => {
    const map: Record<string, { unitPrice: number; startDate: string; endDate: string; assignmentId: number; service: string }> = {};
    for (const a of assignments) {
      const details = a.serviceWiseDetails || {};
      for (const [service, val] of Object.entries(details)) {
        const entries = Array.isArray(val) ? val : [val];
        for (const entry of entries) {
          if (entry?.city) {
            map[`${a.vendorId}-${a.travellerId}-${entry.city}-${service}`] = {
              unitPrice: Number(entry.unitPrice) || 0,
              startDate: entry.startDate || "",
              endDate: entry.endDate || "",
              assignmentId: a.id,
              service,
            };
          }
        }
      }
    }
    return map;
  }, [assignments]);

  const bookedKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const a of assignments) {
      const details = a.serviceWiseDetails || {};
      for (const service of Object.keys(details)) {
        const entries = Array.isArray(details[service]) ? details[service] : [details[service]];
        for (const entry of entries) {
          if (entry?.city) keys.add(`${a.vendorId}-${a.travellerId}-${entry.city}`);
        }
      }
    }
    return keys;
  }, [assignments]);

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ startDate: string; endDate: string; unitPrice: number }>({ startDate: "", endDate: "", unitPrice: 0 });

  const activeLeadsSource = useMemo(() => {
    const all = [...bookingFormLeads, ...chatLeads];
    if (sourceFilter === "website") return bookingFormLeads;
    if (sourceFilter === "chat") return chatLeads;
    return all;
  }, [sourceFilter, chatLeads, bookingFormLeads]);

  const dateFilteredLeads = useMemo(() => {
    const { from, to } = dateRange;
    if (!from) return activeLeadsSource;
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    const end = to ? new Date(to) : new Date(from);
    end.setHours(23, 59, 59, 999);
    return activeLeadsSource.filter((l: any) => {
      // For chat leads without a travelDate, we can optionally use createdAt to filter by date
      const dateToCompare = l.travelDate ? new Date(l.travelDate) : new Date(l.createdAt);
      if (isNaN(dateToCompare.getTime())) return false;
      return dateToCompare >= start && dateToCompare <= end;
    });
  }, [activeLeadsSource, dateRange]);

  const statusFilteredLeads = useMemo(() => {
    if (statusFilter === "all") return dateFilteredLeads;
    return dateFilteredLeads.filter((l: any) => {
      const status = getLeadStatus(l).toLowerCase();
      if (statusFilter === "confirmed") return status === "confirmed" || status === "completed";
      if (statusFilter === "ongoing") return status === "ongoing" || status === "working";
      return status === statusFilter;
    });
  }, [dateFilteredLeads, statusFilter]);

  const finalFilteredLeads = useMemo(() => {
    if (assignedTypeFilter === "all") return statusFilteredLeads;
    return statusFilteredLeads.filter((l: any) => getAssignedType(l) === assignedTypeFilter);
  }, [statusFilteredLeads, assignedTypeFilter]);

  const uniqueAgents = useMemo(() => {
    const agentMap = new Map<string, { id: string; name: string }>();
    for (const l of dateFilteredLeads) {
      const person = getAssignedPerson(l);
      const type = getAssignedType(l);
      if (person.name) {
        const key = `${type}-${person.name}`;
        if (!agentMap.has(key)) {
          agentMap.set(key, { id: key, name: `${person.name} (${type === "sales" ? "Sales" : "Vendor"})` });
        }
      }
    }
    return Array.from(agentMap.values());
  }, [dateFilteredLeads]);

  const agentFilteredLeads = useMemo(() => {
    if (selectedAgent === "all") return finalFilteredLeads;
    return finalFilteredLeads.filter((l: any) => {
      const person = getAssignedPerson(l);
      const type = getAssignedType(l);
      return `${type}-${person.name}` === selectedAgent;
    });
  }, [finalFilteredLeads, selectedAgent]);

  const searchedLeads = useMemo(() => {
    if (!searchText.trim()) return agentFilteredLeads;
    const q = searchText.toLowerCase();
    return agentFilteredLeads.filter((l: any) => {
      const travellerName = l.name || l.primaryTraveller?.name || l.traveller?.name || "";
      const leadId = l.travellerId || l.leadId || "";
      return travellerName.toLowerCase().includes(q) || leadId.toLowerCase().includes(q);
    });
  }, [agentFilteredLeads, searchText]);

  const precomputedMap = useMemo(() => {
    const map = new Map<number, { id: number; status: string; invoiced: number; paid: number; paymentStatus: string; assignedType: "sales" | "vendor" | "both" | "none" }>();
    for (const l of searchedLeads) {
      const status = getLeadStatus(l);
      const invoiced = getInvoiceTotal(l);
      const paid = getPaymentPaid(l);
      let paymentStatus = "none";
      if (invoiced === 0 && paid === 0) paymentStatus = "none";
      else if (paid >= invoiced && invoiced > 0) paymentStatus = "full";
      else if (paid > 0) paymentStatus = "partial";
      else paymentStatus = "unpaid";
      const assignedType = getAssignedType(l);
      map.set(l.id, { id: l.id, status, invoiced, paid, paymentStatus, assignedType });
    }
    return map;
  }, [searchedLeads]);

  const precomputedAllMap = useMemo(() => {
    const map = new Map<number, { status: string; invoiced: number; paid: number; assignedType: "sales" | "vendor" | "both" | "none" }>();
    for (const l of dateFilteredLeads) {
      map.set(l.id, { status: getLeadStatus(l), invoiced: getInvoiceTotal(l), paid: getPaymentPaid(l), assignedType: getAssignedType(l) });
    }
    return map;
  }, [dateFilteredLeads]);

  const totalPages = Math.ceil(searchedLeads.length / pageSize);

  useEffect(() => { if (totalPages > 0 && page > totalPages) setPage(1); }, [searchedLeads, totalPages, page]);
  useEffect(() => { setPage(1); }, [statusFilter, assignedTypeFilter, selectedAgent, dateRange]);

  const dateFilteredAllLeads = useMemo(() => {
    const all = [...bookingFormLeads, ...chatLeads];
    const { from, to } = dateRange;
    if (!from) return all;
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    const end = to ? new Date(to) : new Date(from);
    end.setHours(23, 59, 59, 999);
    return all.filter((l: any) => {
      const dateToCompare = l.travelDate ? new Date(l.travelDate) : new Date(l.createdAt);
      if (isNaN(dateToCompare.getTime())) return false;
      return dateToCompare >= start && dateToCompare <= end;
    });
  }, [bookingFormLeads, chatLeads, dateRange]);

  const agentPerformance = useMemo(() => {
    const perfMap = new Map<string, { name: string; totalLeads: number; websiteLeads: number; chatLeads: number; confirmed: number; cancelled: number; totalPaid: number; totalInvoiced: number }>();
    for (const l of dateFilteredAllLeads) {
      const person = getAssignedPerson(l);
      const type = getAssignedType(l);
      const name = person.name || "Unassigned";
      const key = `${type}-${name}`;
      if (!perfMap.has(key)) perfMap.set(key, { name: `${name} (${type === "sales" ? "Sales" : "None"})`, totalLeads: 0, websiteLeads: 0, chatLeads: 0, confirmed: 0, cancelled: 0, totalPaid: 0, totalInvoiced: 0 });
      const perf = perfMap.get(key)!;
      perf.totalLeads++;
      if (l.source === "chat") {
        perf.chatLeads++;
      } else {
        perf.websiteLeads++;
      }
      const pc = precomputedAllMap.get(l.id);
      if (pc) {
        if (pc.status === "COMPLETED") perf.confirmed++;
        if (pc.status === "CANCELLED") perf.cancelled++;
        perf.totalPaid += pc.paid;
        perf.totalInvoiced += pc.invoiced;
      }
    }
    return Array.from(perfMap.values()).sort((a, b) => b.totalLeads - a.totalLeads);
  }, [dateFilteredAllLeads, precomputedAllMap]);

  const dynamicStats = useMemo(() => {
    let totalLeads = searchedLeads.length, salesLeads = 0, vendorLeads = 0, unassignedLeads = 0;
    let confirmed = 0, ongoing = 0, pending = 0, cancelled = 0, totalInvoiced = 0, totalPaid = 0;
    for (const lead of searchedLeads) {
      const pc = precomputedMap.get(lead.id);
      if (!pc) continue;
      const status = lead.bookingStatus || "pending";
      if (status === "confirmed") confirmed++;
      else if (status === "working") ongoing++;
      else if (status === "cancelled") cancelled++;
      else pending++;
      if (pc.assignedType === "sales") salesLeads++;
      if (pc.assignedType === "vendor") vendorLeads++;
      if (pc.assignedType === "none") unassignedLeads++;
      totalInvoiced += pc.invoiced;
      totalPaid += pc.paid;
    }
    const totalPending = totalInvoiced - totalPaid;
    return { totalLeads, salesLeads, vendorLeads, unassignedLeads, confirmed, ongoing, pending, cancelled, totalInvoiced: Math.round(totalInvoiced), totalPaid: Math.round(totalPaid), totalPending: Math.round(totalPending > 0 ? totalPending : 0) };
  }, [searchedLeads, precomputedMap]);

  const tabCounts = useMemo(() => {
    let all = statusFilteredLeads.length, sales = 0, vendor = 0, none = 0;
    for (const lead of statusFilteredLeads) {
      const pc = precomputedAllMap.get(lead.id);
      if (!pc) continue;
      if (pc.assignedType === "sales" || pc.assignedType === "both") sales++;
      if (pc.assignedType === "vendor" || pc.assignedType === "both") vendor++;
      if (pc.assignedType === "none") none++;
    }
    return { all, sales, vendor, none };
  }, [statusFilteredLeads, precomputedAllMap]);

  const handleCancel = () => {
    if (!cancelModal || !cancelReason.trim()) return;
    const reason = cancelCharges ? `${cancelReason} | Cancellation Charges: ₹${cancelCharges}` : cancelReason;
    updateStatus({ leadId: cancelModal.id, status: "CANCELLED", cancellationReason: reason }, {
      onSuccess: () => { successToast("Lead cancelled successfully"); setCancelModal(null); setCancelReason(""); setCancelCharges(""); refetch(); },
      onError: (err: any) => errorToast("Failed to cancel lead. Please try again."),
    });
  };

  const handleDeleteLead = () => {
    if (!deleteModal) return;
    deleteLeadMutation.mutate(deleteModal.id, {
      onSuccess: () => { successToast("Lead deleted successfully"); setDeleteModal(null); refetch(); },
      onError: (err: any) => errorToast("Failed to delete lead. Please try again."),
    });
  };

  const resetAllFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setStatusFilter("all");
    setAssignedTypeFilter("all");
    setSelectedAgent("all");
  };

  const toggleExpand = (id: number) => setExpandedRowId((prev) => (prev === id ? null : id));

  useEffect(() => {
    if (searchedLeads.length > 0 && expandedRowId === null) {
      const bookedLead = searchedLeads.find((l: any) => l.vendorAssignments && l.vendorAssignments.length > 0);
      if (bookedLead) setExpandedRowId(bookedLead.id);
    }
  }, [searchedLeads]);

  if (isLoading) return <PageLoader size="page" text="Loading your assigned leads..." />;

  if (isError) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="text-brand-danger bg-brand-danger-light px-6 py-4 rounded-xl border border-red-100">
        Error loading assigned leads. Please contact support.
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <MyLeadsHeader
        user={user} dateRange={dateRange} setDateRange={setDateRange}
        setAssignedTypeFilter={setAssignedTypeFilter} setStatusFilter={setStatusFilter}
        isSuperAdmin={isSuperAdmin}
        chatLeadsCount={chatLeads.length} websiteLeadsCount={bookingFormLeads.length} statusFilter={statusFilter}
        assignedTypeFilter={assignedTypeFilter} resetAllFilters={resetAllFilters} refetch={refetch}
        dynamicStats={dynamicStats}
      />

      <LeadsTable
        searchedLeads={searchedLeads} precomputedMap={precomputedMap} precomputedAllMap={precomputedAllMap}
        agentPerformance={agentPerformance} dateFilteredLeads={dateFilteredLeads}
        dynamicStats={dynamicStats} page={page} setPage={setPage} pageSize={pageSize}
        setPageSize={setPageSize} totalPages={totalPages} expandedRowId={expandedRowId}
        toggleExpand={toggleExpand} expandedTab={expandedTab} setExpandedTab={setExpandedTab}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        assignedTypeFilter={assignedTypeFilter} setAssignedTypeFilter={setAssignedTypeFilter}
        sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
        selectedAgent={selectedAgent} setSelectedAgent={setSelectedAgent}
        uniqueAgents={uniqueAgents}
        searchText={searchText} setSearchText={setSearchText} user={user}
        highlightId={highlightId} isSuperAdmin={isSuperAdmin} onDeleteModal={setDeleteModal}
        vendors={vendors} assignments={assignments} vendorPriceMap={vendorPriceMap}
        bookedKeys={bookedKeys} editingKey={editingKey} setEditingKey={setEditingKey}
        editForm={editForm} setEditForm={setEditForm} updateAssignment={updateAssignment}
        isUpdating={isUpdating} setUnassignedVendorModal={setUnassignedVendorModal}
        setUnassignedService={setUnassignedService} setUnassignedCity={setUnassignedCity}
        setUnassignedManualName={setUnassignedManualName} serverPagination={serverPagination}
        tabCounts={tabCounts}
      />

      <CancelLeadModal cancelModal={cancelModal} setCancelModal={setCancelModal} cancelReason={cancelReason} setCancelReason={setCancelReason} cancelCharges={cancelCharges} setCancelCharges={setCancelCharges} handleCancel={handleCancel} updatingStatus={updatingStatus} />
      <DeleteLeadModal deleteModal={deleteModal} setDeleteModal={setDeleteModal} handleDeleteLead={handleDeleteLead} isPending={deleteLeadMutation.isPending} />
      <UnassignedVendorModal open={unassignedVendorModal} onOpenChange={setUnassignedVendorModal} city={unassignedCity} service={unassignedService} manualName={unassignedManualName} />
    </div>
  );
}
