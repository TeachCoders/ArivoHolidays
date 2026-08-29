"use client";
import ReusableTable, { Column } from "@/components/shared/ReusableTable";
import { SelectDropDown } from "@/components/shared/select-dropDown";
import React, { useState, useMemo, useEffect } from "react";
import { PastDateRangePicker } from "@/components/shared/pastDateRangePicker";
import AssignLeadDialog from "@/feature/leads/components/assign-lead-dialog";
import { Button } from "@/components/ui/button";
import { useFetchAllLeads } from "@/feature/leads/api/useLeeds";
import { useGetTeam } from "@/feature/teams/api/useTeam";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Briefcase,
  Clock,
  CheckCircle,
  TrendingUp,
  Filter,
  X,
  Calendar,
  Tag,
  CreditCard,
  User,
  ChevronRight,
} from "lucide-react";
import PageLoader from "@/components/shared/PageLoader";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";

type LeadRow = {
  id: number;
  travellerId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  createdAt: string;
  status?: string;
  tourBookings?: any[];
  vehicleBookings?: any[];
  payments?: any[];
  assignedTo?: { id: number; name: string };
  assignedAt?: string;
  workingStartedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  travelDate?: string;
  cancellationReason?: string;
  followupNotes?: any[];
};

// ── Helper functions ──
const getLeadType = (lead: LeadRow): string => {
  if (lead.tourBookings && lead.tourBookings.length > 0) return "tour";
  if (lead.vehicleBookings && lead.vehicleBookings.length > 0) return "vehicle";
  return "contact";
};

const isPaid = (lead: LeadRow): boolean => !!(lead.payments && lead.payments.length > 0);

const getBookingBadge = (lead: LeadRow) => {
  const type = getLeadType(lead);
  if (type === "tour")
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700">
        🗺 Tour
      </span>
    );
  if (type === "vehicle")
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-brand-success-light text-brand-success">
        🚗 Vehicle
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-brand-info-light text-brand-info">
      📋 Contact
    </span>
  );
};

const getPaymentBadge = (lead: LeadRow) => {
  if (isPaid(lead))
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-brand-success-light text-brand-success">
        ✓ Paid
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-brand-warning-light text-brand-warning">
      ✕ Unpaid
    </span>
  );
};

const getLeadStatus = (lead: any) => {
  if (lead.bookingStatus) {
    if (lead.bookingStatus === "pending") return "UPCOMING";
    if (lead.bookingStatus === "working") return "ONGOING";
    if (lead.bookingStatus === "confirmed") return "COMPLETED";
    if (lead.bookingStatus === "cancelled") return "CANCELLED";
  }
  const bookings = [...(lead.tourBookings || []), ...(lead.vehicleBookings || [])];
  if (bookings.some((b: any) => b.status === "CANCELLED")) return "CANCELLED";
  if (bookings.some((b: any) => b.status === "COMPLETED")) return "COMPLETED";
  if (bookings.some((b: any) => b.status === "ONGOING")) return "ONGOING";
  if (bookings.some((b: any) => b.status === "UPCOMING")) return "UPCOMING";
  return "NONE";
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  CANCELLED: { label: "Cancelled", cls: "bg-brand-danger-light text-brand-danger" },
  COMPLETED: { label: "Confirmed", cls: "bg-brand-success-light text-brand-success" },
  ONGOING: { label: "Ongoing", cls: "bg-brand-info-light text-brand-info" },
  UPCOMING: { label: "Pending", cls: "bg-brand-warning-light text-brand-warning" },
  NONE: { label: "New", cls: "bg-brand-neutral-light text-brand-neutral" },
};

const ActionCell = ({ lead }: { lead: LeadRow }) => {
  const isAssigned = !!lead.assignedTo?.id;
  if (isAssigned)
    return (
      <Link href={`/dashboard/sales/followup/${lead.id}`}>
        <Button variant="outline" size="sm" className="text-brand-600 border-brand-200 hover:bg-brand-50 flex items-center gap-1">
          Followup <ChevronRight size={13} />
        </Button>
      </Link>
    );
  return (
    <AssignLeadDialog leadId={lead.id}>
      <Button variant="outline" size="sm">
        Assign
      </Button>
    </AssignLeadDialog>
  );
};

const columns: Column<LeadRow>[] = [
  {
    header: "Lead ID",
    accessor: (lead) => (
      <span className="font-mono text-xs font-semibold text-brand-neutral-muted bg-brand-neutral-light px-2 py-1 rounded">
        {lead.travellerId}
      </span>
    ),
  },
  {
    header: "Traveller",
    accessor: (lead) => (
      <div>
        <div className="font-semibold text-gray-900 text-sm">{lead.name}</div>
        <div className="text-gray-400 text-xs mt-0.5">{lead.email}</div>
        <div className="text-gray-400 text-xs">{lead.phone} • {lead.country}</div>
      </div>
    ),
  },
  { header: "Type", accessor: (lead) => getBookingBadge(lead) },
  { header: "Payment", accessor: (lead) => getPaymentBadge(lead) },
  {
    header: "Status",
    accessor: (lead) => {
      const s = getLeadStatus(lead);
      const cfg = STATUS_BADGE[s] || STATUS_BADGE.NONE;
      return (
        <div className="flex flex-col gap-1">
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold w-fit ${cfg.cls}`}>{cfg.label}</span>
          {lead.cancellationReason && s === "CANCELLED" && (
            <span className="text-red-400 text-[10px] max-w-[140px] truncate">{lead.cancellationReason}</span>
          )}
        </div>
      );
    },
  },
  {
    header: "Assigned To",
    accessor: (lead) => {
      if (lead.assignedTo?.name)
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="font-semibold text-gray-800 text-xs truncate max-w-[140px]">{lead.assignedTo.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">Internal Team</span>
          </div>
        );
      return <span className="text-gray-400 text-xs italic">Unassigned</span>;
    },
  },
  {
    header: "Actions",
    accessor: (lead) => <ActionCell lead={lead} />,
  },
];

export default function SalesLeadClient() {
  const { leads, isLoading, isError } = useFetchAllLeads();
  const { teams = [] } = useGetTeam();
  const { user } = useGetCurrentUser();

  const normalizedRole = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = normalizedRole.includes("super") && normalizedRole.includes("admin");
  const isTeamMemberOrVendor = !isSuperAdmin && user?.role === "team_member";
  const h1Title = isTeamMemberOrVendor ? "My Assigned Leads" : "Sales Leads & Inquiries";

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Filter State ──
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all"); // all | team | vendor | user_X | vendor_X
  const [customRange, setCustomRange] = useState<any>({});

  const hasActiveFilters =
    typeFilter !== "all" || paymentFilter !== "all" || periodFilter !== "all" || statusFilter !== "all" || assignmentFilter !== "all";

  const clearFilters = () => {
    setTypeFilter("all");
    setPaymentFilter("all");
    setPeriodFilter("all");
    setStatusFilter("all");
    setAssignmentFilter("all");
    setCustomRange({});
    setPage(1);
  };

  // ── Assignment options (agents + vendors) ──
  const assignmentOptions = useMemo(() => {
    const options: { label: string; value: string }[] = [
      { label: "All Assignments", value: "all" },
      { label: "Team Assigned", value: "team" },
      { label: "Unassigned", value: "unassigned" },
    ];
    if (leads && leads.length > 0) {
      const map = new Map<string, string>();
      leads.forEach((l: any) => {
        if (l.assignedTo?.id) map.set(`user_${l.assignedTo.id}`, l.assignedTo.name || `User ${l.assignedTo.id}`);
      });
      if (teams.length > 0) {
        const salesTeam = teams.find((t: any) => t.name === "salesTeam" || t.name === "Sales");
        if (salesTeam?.users) {
          salesTeam.users.forEach((u: any) => {
            if (!map.has(`user_${u.id}`)) map.set(`user_${u.id}`, u.name);
          });
        }
      }
      map.forEach((name, key) => options.push({ label: name, value: key }));
    }
    return options;
  }, [leads, teams]);

  // ── Date helpers ──
  const isToday = (d: Date) => {
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  };
  const isInCurrentWeek = (d: Date) => {
    const now = new Date();
    const start = new Date(now.setDate(now.getDate() - now.getDay()));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return d >= start && d <= end;
  };
  const isInCurrentMonth = (d: Date) => {
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };
  const isInCustomRange = (d: Date) => {
    if (!customRange.from) return true;
    const from = new Date(customRange.from);
    from.setHours(0, 0, 0, 0);
    const to = new Date(customRange.to ?? customRange.from);
    to.setHours(23, 59, 59, 999);
    return d >= from && d <= to;
  };

  // ── Filtered Leads ──
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    let result = [...leads];

    if (typeFilter !== "all") result = result.filter((l: LeadRow) => getLeadType(l) === typeFilter);

    if (paymentFilter === "paid") result = result.filter((l: LeadRow) => isPaid(l));
    else if (paymentFilter === "unpaid") result = result.filter((l: LeadRow) => !isPaid(l));

    if (statusFilter !== "all") {
      if (statusFilter === "assigned") {
        result = result.filter((l: LeadRow) => !!l.assignedTo?.id && l.status !== "CANCELLED" && l.status !== "COMPLETED");
      } else if (statusFilter === "unassigned") {
        result = result.filter((l: LeadRow) => !l.assignedTo?.id && l.status !== "CANCELLED" && l.status !== "COMPLETED");
      } else {
        result = result.filter((l: LeadRow) => getLeadStatus(l) === statusFilter);
      }
    }

    if (assignmentFilter !== "all") {
      if (assignmentFilter === "team") result = result.filter((l: LeadRow) => !!l.assignedTo?.id);
      else if (assignmentFilter === "unassigned") result = result.filter((l: LeadRow) => !l.assignedTo?.id);
      else result = result.filter((l: LeadRow) => `user_${l.assignedTo?.id}` === assignmentFilter);
    }

    if (periodFilter !== "all") {
      result = result.filter((l: LeadRow) => {
        const d = new Date(l.createdAt);
        if (periodFilter === "today") return isToday(d);
        if (periodFilter === "week") return isInCurrentWeek(d);
        if (periodFilter === "month") return isInCurrentMonth(d);
        if (periodFilter === "custom") return isInCustomRange(d);
        return true;
      });
    }

    return result;
  }, [leads, typeFilter, paymentFilter, statusFilter, assignmentFilter, periodFilter, customRange]);

  const totalPages = Math.ceil(filteredLeads.length / pageSize);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(1);
  }, [filteredLeads, totalPages, page]);

  if (isLoading)
    return (
      <PageLoader size="section" text="Loading Sales Leads..." />
    );

  if (isError)
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-brand-danger bg-brand-danger-light px-4 py-3 rounded-lg border border-red-100">
          Error fetching leads. Please make sure you have the correct permissions.
        </div>
      </div>
    );

  // Stats
  const totalLeads = leads?.length || 0;
  const teamAssigned = leads?.filter((l: any) => !!l.assignedTo?.id).length || 0;
  const unassigned = leads?.filter((l: any) => !l.assignedTo?.id).length || 0;
  const confirmed = leads?.filter((l: any) => l.bookingStatus === "confirmed" || getLeadStatus(l) === "COMPLETED").length || 0;

  const statCards = [
    { label: "Total Leads", value: totalLeads, icon: Users, gradient: "from-indigo-500 to-blue-600" },
    { label: "Team Assigned", value: teamAssigned, icon: UserCheck, gradient: "from-violet-500 to-purple-600" },
    { label: "Unassigned", value: unassigned, icon: Clock, gradient: "from-amber-500 to-orange-600" },
    { label: "Confirmed", value: confirmed, icon: CheckCircle, gradient: "from-emerald-500 to-green-600" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PrivatePageHeading
          icon={TrendingUp}
          title={h1Title}
          description="Manage all incoming travel inquiries, tour bookings, and vehicle requests."
        />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {statCards.map(({ label, value, icon: Icon, gradient }) => (
          <div key={label} className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold opacity-80 leading-tight">{label}</p>
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Icon size={14} />
              </div>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Unified Filter Bar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Status */}
          <div className="flex-1 min-w-[160px]">
            <label className="flex items-center gap-1 text-xs font-semibold text-brand-neutral-muted uppercase tracking-wider mb-1.5">
              <Filter size={11} /> Query Status
            </label>
            <SelectDropDown
              data={[
                { label: "All Queries", value: "all" },
                { label: "Assigned", value: "assigned" },
                { label: "Unassigned", value: "unassigned" },
                { label: "⏳ Pending", value: "UPCOMING" },
                { label: "🔵 Ongoing", value: "ONGOING" },
                { label: "✅ Confirmed", value: "COMPLETED" },
                { label: "❌ Cancelled", value: "CANCELLED" },
              ]}
              placeholderText="All Queries"
              selectedValue={statusFilter}
              onChangeHandler={(v) => { setStatusFilter(v); setPage(1); }}
            />
          </div>

          {/* Assignment */}
          <div className="flex-1 min-w-[160px]">
            <label className="flex items-center gap-1 text-xs font-semibold text-brand-neutral-muted uppercase tracking-wider mb-1.5">
              <User size={11} /> Assigned To
            </label>
            <SelectDropDown
              data={assignmentOptions}
              placeholderText="All Assignments"
              selectedValue={assignmentFilter}
              onChangeHandler={(v) => { setAssignmentFilter(v); setPage(1); }}
            />
          </div>

          {/* Lead Type */}
          <div className="flex-1 min-w-[140px]">
            <label className="flex items-center gap-1 text-xs font-semibold text-brand-neutral-muted uppercase tracking-wider mb-1.5">
              <Tag size={11} /> Lead Type
            </label>
            <SelectDropDown
              data={[
                { label: "All Types", value: "all" },
                { label: "🗺 Tour Booking", value: "tour" },
                { label: "🚗 Vehicle Booking", value: "vehicle" },
                { label: "📋 Contact Lead", value: "contact" },
              ]}
              placeholderText="All Types"
              selectedValue={typeFilter}
              onChangeHandler={(v) => { setTypeFilter(v); setPage(1); }}
            />
          </div>

          {/* Payment */}
          <div className="flex-1 min-w-[140px]">
            <label className="flex items-center gap-1 text-xs font-semibold text-brand-neutral-muted uppercase tracking-wider mb-1.5">
              <CreditCard size={11} /> Payment
            </label>
            <SelectDropDown
              data={[
                { label: "All Payments", value: "all" },
                { label: "✓ Paid", value: "paid" },
                { label: "✕ Unpaid", value: "unpaid" },
              ]}
              placeholderText="All Payments"
              selectedValue={paymentFilter}
              onChangeHandler={(v) => { setPaymentFilter(v); setPage(1); }}
            />
          </div>

          {/* Date Range */}
          <div className="flex-1 min-w-[140px]">
            <label className="flex items-center gap-1 text-xs font-semibold text-brand-neutral-muted uppercase tracking-wider mb-1.5">
              <Calendar size={11} /> Registration
            </label>
            <SelectDropDown
              data={[
                { label: "All Time", value: "all" },
                { label: "Today", value: "today" },
                { label: "This Week", value: "week" },
                { label: "This Month", value: "month" },
                { label: "Custom Range", value: "custom" },
              ]}
              placeholderText="All Time"
              selectedValue={periodFilter}
              onChangeHandler={(v) => { setPeriodFilter(v); setPage(1); if (v !== "custom") setCustomRange({}); }}
            />
          </div>

          {/* Custom Range Picker */}
          {periodFilter === "custom" && (
            <div className="flex-shrink-0">
              <label className="block text-xs font-semibold text-brand-neutral-muted uppercase tracking-wider mb-1.5">&nbsp;</label>
              <PastDateRangePicker
                value={customRange}
                onChange={(range) => { setCustomRange(range); setPage(1); }}
              />
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex-shrink-0">
              <label className="block text-xs font-semibold text-transparent uppercase tracking-wider mb-1.5">Clear</label>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-danger bg-brand-danger-light border border-red-200 rounded-lg hover:bg-brand-danger-light transition-colors"
              >
                <X size={14} /> Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Results Summary + Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <p className="text-sm text-brand-neutral-muted">
            Showing{" "}
            <span className="font-semibold text-gray-800">{filteredLeads.length}</span>{" "}
            of <span className="font-semibold text-gray-800">{totalLeads}</span> leads
          </p>
          {hasActiveFilters && (
            <span className="text-xs bg-brand-50 text-brand-700 font-semibold px-2.5 py-1 rounded-full border border-brand-200">
              Filters Active
            </span>
          )}
        </div>

        {filteredLeads.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-brand-neutral-light rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">No leads found</h3>
            <p className="text-brand-neutral-muted text-sm mt-1">Try adjusting your filters to see more results.</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-4 text-sm text-brand-600 font-medium hover:underline flex items-center gap-1 mx-auto">
                <X size={14} /> Clear all filters
              </button>
            )}
          </div>
        ) : (
          <ReusableTable
            columns={columns}
            data={filteredLeads}
            expandable={true}
            renderExpandedRow={(lead) => {
              const fmt = (date: any) =>
                new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
              const fmtDay = (date: any) =>
                new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
              return (
                <div className="p-4 bg-brand-neutral-light/80 flex gap-3 overflow-x-auto text-sm border-y border-gray-100 shadow-inner">
                  <TimelineChip label="Generated On" value={fmt(lead.createdAt)} color="gray" />
                  {lead.travelDate && <TimelineChip label="Travel Date" value={fmtDay(lead.travelDate)} color="blue" />}
                  {lead.assignedAt && <TimelineChip label="Assigned On" value={fmt(lead.assignedAt)} color="indigo" />}
                  {lead.workingStartedAt && <TimelineChip label="Working Started" value={fmt(lead.workingStartedAt)} color="amber" />}
                  {lead.completedAt && <TimelineChip label="Completed On" value={fmt(lead.completedAt)} color="emerald" />}
                  {lead.cancelledAt && <TimelineChip label="Cancelled On" value={fmt(lead.cancelledAt)} color="red" />}
                </div>
              );
            }}
            getRowId={(item) => item.id}
            pagination={{
              currentPage: page,
              totalPages,
              onPageChange: setPage,
              pageSize,
              onPageSizeChange: (size) => {
                setPageSize(size);
                setPage(1);
              },
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── Small timeline chip component ──
function TimelineChip({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    gray: "border-gray-100 bg-white",
    blue: "border-blue-100 bg-brand-info-light",
    indigo: "border-indigo-100 bg-brand-primary-light",
    amber: "border-amber-100 bg-brand-warning-light",
    emerald: "border-emerald-100 bg-emerald-50",
    red: "border-red-100 bg-brand-danger-light",
  };
  const textMap: Record<string, string> = {
    gray: "text-brand-neutral-muted",
    blue: "text-blue-500",
    indigo: "text-indigo-500",
    amber: "text-amber-500",
    emerald: "text-brand-success",
    red: "text-brand-danger",
  };
  const valueMap: Record<string, string> = {
    gray: "text-gray-800",
    blue: "text-brand-info",
    indigo: "text-brand-primary",
    amber: "text-brand-warning",
    emerald: "text-brand-success",
    red: "text-brand-danger",
  };
  return (
    <div className={`${colorMap[color]} border rounded-xl p-3 min-w-[155px] shrink-0`}>
      <p className={`text-[10px] ${textMap[color]} uppercase tracking-wider font-bold mb-1`}>{label}</p>
      <p className={`text-xs font-semibold ${valueMap[color]}`}>{value}</p>
    </div>
  );
}