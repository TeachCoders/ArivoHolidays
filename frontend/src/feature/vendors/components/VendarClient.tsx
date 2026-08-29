"use client";

import { useMemo, useState, useEffect, Fragment } from "react";
import { useSearchParams } from "next/navigation";
import { ReusableModel } from "@/components/shared/reusableModel";
import { User2, Users, IndianRupee, Clock, TrendingUp, Plus, Trash2, Building2, PenLine, ChevronDown, ChevronRight, MapPin, FileText, CheckCircle } from "lucide-react";
import StatsCardGrid from "@/components/shared/StatsCardGrid";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import PrivateButton from "@/components/shared/PrivateButton";
import PageLoader from "@/components/shared/PageLoader";
import EmptyState from "@/components/shared/EmptyState";
import { useGetVendors, useCreateVendorAssignment, useGetVendorAssignments, useUpdateVendorAssignment } from "@/feature/vendors/api/useVendorHooks";
import { useGetVendorAssignmentStats } from "@/feature/vendors/api/useVendorHooks";
import { VendorForm } from "@/feature/vendors/components/VendorForm";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import { successToast, errorToast } from "@/components/shared/tost";

export default function VendarClient() {
  const searchParams = useSearchParams();
  const vendorIdFromUrl = searchParams.get("vendorId");
  const leadIdFromUrl = searchParams.get("leadId");

  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedGroupType, setSelectedGroupType] = useState<string | undefined>(undefined);
  const [expandedVendorId, setExpandedVendorId] = useState<number | null>(null);

  // URL se vendorId mila toh auto-expand karo
  useEffect(() => {
    if (vendorIdFromUrl) {
      setExpandedVendorId(Number(vendorIdFromUrl));
    }
  }, [vendorIdFromUrl]);

  const { user } = useGetCurrentUser();
  const normalizedRole = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = normalizedRole.includes("super") && normalizedRole.includes("admin");
  const isVendorOps = user?.team?.name?.toLowerCase().includes("vendor")
    && user?.team?.name?.toLowerCase().includes("operations");
  const canManageVendors = isSuperAdmin || isVendorOps;

  const { vendors = [] } = useGetVendors();

  // URL se leadId mila toh us lead ke vendor ko auto-expand karo
  useEffect(() => {
    if (!leadIdFromUrl || !vendors || vendors.length === 0) return;
    const leadNumId = Number(leadIdFromUrl);
    // Find a vendor that has invoice items for this lead's traveller
    const matchedVendor = vendors.find((v: any) =>
      (v.invoiceItems || []).some((item: any) => item.invoice?.traveller?.id === leadNumId)
    );
    if (matchedVendor) {
      setExpandedVendorId(matchedVendor.id);
    }
  }, [leadIdFromUrl, vendors]);

  const { stats } = useGetVendorAssignmentStats();
  const { mutate: createAssignment, isPending: isBookingPending } = useCreateVendorAssignment();
  const { mutate: updateAssignment, isPending: isUpdating } = useUpdateVendorAssignment();
  const { assignments = [] } = useGetVendorAssignments();

  // Build a Set of booked "vendorId-travellerId-city" keys from existing assignments
  const bookedKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const a of assignments) {
      const details = a.serviceWiseDetails || {};
      for (const service of Object.keys(details)) {
        const entries = Array.isArray(details[service]) ? details[service] : [details[service]];
        for (const entry of entries) {
          if (entry?.city) {
            keys.add(`${a.vendorId}-${a.travellerId}-${entry.city}`);
          }
        }
      }
    }
    return keys;
  }, [assignments]);

  // vendor actual price map: "vendorId-travellerId-city-serviceName" → { unitPrice, startDate, endDate, assignmentId, service }
  const vendorPriceMap = useMemo(() => {
    const map: Record<string, { unitPrice: number; startDate: string; endDate: string; assignmentId: number; service: string; originalEntry: any }> = {};
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
              originalEntry: entry,
            };
          }
        }
      }
    }
    return map;
  }, [assignments]);

  // Inline edit state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ startDate: string; endDate: string; unitPrice: number }>({ startDate: "", endDate: "", unitPrice: 0 });

  // Booking form state
  const [bookingCity, setBookingCity] = useState<{
    vendorId: number;
    vendorName: string;
    travellerId: number;
    travellerName: string;
    service: string;
    city: string;
    qty: number;
    checkIn: string;
    checkOut: string;
  } | null>(null);
  const [unitPrice, setUnitPrice] = useState("");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PrivatePageHeading
          icon={Building2}
          title="Vendor Management"
          description="Manage vendors and assign services to travellers"
        />
        <PrivateButton
          icon={Plus}
          size="md"
          onClick={() => { setEditingVendor(null); setSelectedGroupId(null); setSelectedGroupType(undefined); setIsVendorModalOpen(true); }}
        >
          Create Vendor
        </PrivateButton>
      </div>

      <StatsCardGrid
        items={[
          { label: "Total Assigned Leads", value: stats?.totalAssigned ?? 0, icon: Users },
          { label: "Active Vendors", value: stats?.activeVendors ?? vendors.filter((v: any) => v.vendarIsActive).length, icon: User2 },
          { label: "Total Earnings", value: `₹${Number(stats?.totalEarnings ?? 0).toLocaleString()}`, icon: TrendingUp },
          { label: "Pending Payments", value: `₹${Number(stats?.pendingPayments ?? 0).toLocaleString()}`, icon: Clock },
        ]}
        columns={4}
        size="md"
      />

      {/* Vendors List */}
      <div className="bg-white rounded-2xl border border-brand-neutral-border shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Building2 size={16} /> Vendors
        </h2>

        <div className="overflow-x-auto">
          {vendors.length === 0 ? (
            <EmptyState 
              title="No vendors found" 
              description="Start by creating a new vendor to manage assignments." 
              icon={Building2} 
              className="border-0 shadow-none bg-transparent py-16" 
            />
          ) : (
            <table className="tbl">
              <thead>
                <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
                  <th className="tbl-th w-8"></th>
                  <th className="tbl-th">Company</th>
                  <th className="tbl-th">Contact Person</th>
                  <th className="tbl-th">Type</th>
                  <th className="tbl-th">Working Areas</th>
                  <th className="tbl-th">Quotations</th>
                  <th className="tbl-th">Status</th>
                  {canManageVendors && <th className="tbl-th">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-neutral-light">
                {vendors.map((v: any) => {
                  const typeLabel = v.vendarServiceType === "HOTEL" ? "Hotel" : v.vendarServiceType === "GUIDE_VENDOR" ? "Guide" : v.vendarServiceType === "ALL" ? "All Services" : v.vendarServiceType || "—";
                  const isExpanded = expandedVendorId === v.id;
                  const vendorItems = v.invoiceItems || [];
                  const groupedByTraveller: Record<string, any[]> = {};
                  for (const item of vendorItems) {
                    const tName = item.invoice?.traveller?.name || "Unknown";
                    if (!groupedByTraveller[tName]) groupedByTraveller[tName] = [];
                    groupedByTraveller[tName].push(item);
                  }

                  // Check if ALL cities for this vendor are booked
                  let allCitiesBooked = vendorItems.length > 0;
                  for (const tName of Object.keys(groupedByTraveller)) {
                    const tItems = groupedByTraveller[tName];
                    const grouped: Record<string, any[]> = {};
                    for (const item of tItems) {
                      const city = item.location || "N/A";
                      if (!grouped[city]) grouped[city] = [];
                      grouped[city].push(item);
                    }
                    for (const city of Object.keys(grouped)) {
                      const tId = grouped[city][0]?.invoice?.traveller?.id;
                      if (!tId || !bookedKeys.has(`${v.id}-${tId}-${city}`)) {
                        allCitiesBooked = false;
                        break;
                      }
                    }
                    if (!allCitiesBooked) break;
                  }
                  return (
                    <Fragment key={v.id}>
                      <tr
                        className={`transition-colors ${isExpanded ? "bg-brand-primary-light/40" : "hover:bg-brand-neutral-light/50"} ${vendorItems.length > 0 && !allCitiesBooked ? "cursor-pointer" : ""}`}
                        onClick={() => vendorItems.length > 0 && !allCitiesBooked && setExpandedVendorId(isExpanded ? null : v.id)}
                      >
                        <td className="px-4 py-3 text-center">
                          {vendorItems.length > 0 ? (
                            allCitiesBooked ? (
                              <CheckCircle size={14} className="text-green-500" />
                            ) : isExpanded ? (
                              <ChevronDown size={14} className="text-indigo-500" />
                            ) : (
                              <ChevronRight size={14} className="text-gray-400" />
                            )
                          ) : (
                            <span className="text-gray-300">·</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {v.vendarProfileImage ? (
                              <img src={v.vendarProfileImage} className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-[10px] font-bold">{v.vendarCompanyName?.charAt(0) || v.vendarName?.charAt(0)}</div>
                            )}
                            <span className="font-semibold text-gray-900">{v.vendarCompanyName || "-"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-brand-neutral">{v.vendarName || "-"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${v.vendarServiceType === "HOTEL" ? "bg-brand-info-light text-brand-info" : v.vendarServiceType === "GUIDE_VENDOR" ? "bg-brand-warning-light text-brand-warning" : "bg-teal-100 text-teal-700"}`}>
                            {typeLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(v.vendarWorkingAreas || []).length > 0
                              ? v.vendarWorkingAreas.slice(0, 3).map((area: string) => (
                                  <span key={area} className="text-[10px] px-1.5 py-0.5 rounded bg-brand-primary-light text-brand-primary font-medium">{area}</span>
                                ))
                              : <span className="text-gray-400 text-xs">—</span>
                            }
                            {(v.vendarWorkingAreas || []).length > 3 && (
                              <span className="text-[10px] text-gray-400">+{v.vendarWorkingAreas.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {vendorItems.length > 0 ? (
                            allCitiesBooked ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-success-light text-brand-success font-bold flex items-center gap-1 w-fit">
                                <CheckCircle size={10} /> Booked
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">{vendorItems.length} item{vendorItems.length > 1 ? "s" : ""}</span>
                            )
                          ) : (
                            <span className="text-gray-400 text-[10px]">No quotations yet</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${v.vendarIsActive ? "bg-brand-success-light text-brand-success" : "bg-gray-100 text-brand-neutral-muted"}`}>
                            {v.vendarIsActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        {canManageVendors && (
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <PrivateButton
                                href={`/dashboard/vendors/${v.id}`}
                                variant="outline"
                                size="xs"
                              >
                                Details
                              </PrivateButton>
                              <PrivateButton
                                variant="ghost"
                                size="xs"
                                onClick={() => { setEditingVendor(v); setIsVendorModalOpen(true); }}
                              >
                                Edit
                              </PrivateButton>
                            </div>
                          </td>
                        )}
                      </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="px-4 pb-4 pt-2 bg-brand-primary-light/30">
                          <div className="border border-indigo-100 rounded-xl overflow-hidden bg-white shadow-sm">
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5 border-b border-amber-200">
                              <div className="flex items-center gap-2">
                                <FileText size={14} className="text-brand-warning" />
                                <span className="text-xs font-bold text-amber-800">Quotation / Bill Summary — {v.vendarCompanyName || v.vendarName}</span>
                              </div>
                            </div>
                            <div className="p-4 space-y-4">
                              {Object.entries(groupedByTraveller).map(([travellerName, items]) => {
                                const grouped: Record<string, any[]> = {};
                                for (const item of items) {
                                  const city = item.location || "N/A";
                                  if (!grouped[city]) grouped[city] = [];
                                  grouped[city].push(item);
                                }
                                const total = items.reduce((sum: number, it: any) => sum + (Number(it.TotalPrice) || 0), 0);
                                const travellerId = items[0]?.invoice?.traveller?.id;
                                const travelDate = items[0]?.invoice?.travelDate || "";
                                // Hide if travel complete + all payments paid
                                const matchedAssignment = travellerId ? assignments.find((a: any) => a.vendorId === v.id && a.travellerId === travellerId) : null;
                                let isTravelComplete = false;
                                if (matchedAssignment?.serviceWiseDetails) {
                                  let latestEnd = "";
                                  for (const svc of Object.values(matchedAssignment.serviceWiseDetails) as any[]) {
                                    const entries = Array.isArray(svc) ? svc : [svc];
                                    for (const e of entries) { if (e?.endDate && e.endDate > latestEnd) latestEnd = e.endDate; }
                                  }
                                  isTravelComplete = !!latestEnd && new Date(latestEnd) < new Date();
                                }
                                const isFullyPaid = matchedAssignment?.payments?.length > 0 && matchedAssignment.payments.every((p: any) => p.paymentStatus === "PAID");
                                if (isTravelComplete && isFullyPaid) return null;
                                return (
                                  <div key={travellerName} className="border border-brand-neutral-border rounded-lg overflow-hidden">
                                    <div className="bg-slate-50 px-3 py-2 border-b border-brand-neutral-border flex items-center justify-between">
                                      <span className="text-xs font-bold text-brand-neutral">
                                        <Users size={12} className="inline mr-1 text-indigo-500" />{travellerName}
                                      </span>
                                      <span className="text-[10px] font-bold text-brand-neutral-muted">Total: ₹{total.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="p-3 space-y-3">
                                      {Object.entries(grouped).map(([city, cityItems]) => {
                                        const isBooking = bookingCity
                                          && bookingCity.vendorId === v.id
                                          && bookingCity.travellerId === travellerId
                                          && bookingCity.city === city;
                                        const isCityBooked = travellerId && bookedKeys.has(`${v.id}-${travellerId}-${city}`);
                                        const services = [...new Set(cityItems.map((ci: any) => ci.ServiceName?.trim()).filter(Boolean))];
                                        const totalQty = cityItems.reduce((sum: number, ci: any) => sum + (ci.ServcieQty || 0), 0);
                                        const unitPriceNum = Number(unitPrice) || 0;
                                        const totalPrice = unitPriceNum * totalQty;
                                        const maxUnitPrice = Math.max(...cityItems.map((ci: any) => Number(ci.UnitPrice) || 0), 0);
                                        return (
                                          <div key={city} className={`border rounded-lg overflow-hidden ${isCityBooked ? "border-green-200 bg-green-50/30" : "border-brand-neutral-border"}`}>
                                            <div className={`px-3 py-1.5 border-b flex items-center justify-between ${isCityBooked ? "bg-green-50 border-green-100" : "bg-brand-neutral-light border-brand-neutral-border"}`}>
                                              <span className="text-[11px] font-bold text-brand-neutral flex items-center gap-1">
                                                <MapPin size={11} className={isCityBooked ? "text-green-500" : "text-indigo-500"} /> {city}
                                                <span className="text-[10px] text-gray-400 font-normal ml-1">({services.join(", ")})</span>
                                                {isCityBooked && (
                                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-success-light text-brand-success font-bold ml-1 flex items-center gap-0.5">
                                                    <CheckCircle size={8} /> Booked
                                                  </span>
                                                )}
                                              </span>
                                              {!isBooking && !isCityBooked && travellerId && (
                                                <PrivateButton
                                                  icon={CheckCircle}
                                                  size="xs"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    const firstItem = cityItems[0] || {};
                                                    const itemStart = firstItem.startDate ? new Date(firstItem.startDate).toISOString().split("T")[0] : "";
                                                    const itemEnd = firstItem.endDate ? new Date(firstItem.endDate).toISOString().split("T")[0] : "";
                                                    setBookingCity({
                                                      vendorId: v.id,
                                                      vendorName: v.vendarCompanyName || v.vendarName,
                                                      travellerId,
                                                      travellerName,
                                                      service: services[0] || "Hotel",
                                                      city,
                                                      qty: totalQty,
                                                      checkIn: itemStart || (travelDate ? new Date(travelDate).toISOString().split("T")[0] : ""),
                                                      checkOut: itemEnd || "",
                                                    });
                                                    setUnitPrice("");
                                                  }}
                                                >
                                                  Book
                                                </PrivateButton>
                                              )}
                                              {isBooking && (
                                                <PrivateButton
                                                  variant="ghost"
                                                  size="xs"
                                                  onClick={(e) => { e.stopPropagation(); setBookingCity(null); setUnitPrice(""); }}
                                                >
                                                  Cancel
                                                </PrivateButton>
                                              )}
                                            </div>
                                            <table className="tbl">
                                              <thead>
                                                <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
<th className="tbl-th px-3 py-1">Service</th>
                                                    <th className="tbl-th px-3 py-1">Name</th>
                                                    <th className="tbl-th-center px-3 py-1">Qty</th>
                                                    <th className="tbl-th-center px-3 py-1">Check-in</th>
                                                    <th className="tbl-th-center px-3 py-1">Check-out</th>
                                                    <th className="tbl-th-right px-3 py-1">Quotation (Traveler)</th>
                                                    <th className="tbl-th-right px-3 py-1">Booked (Vendor)</th>
                                                    <th className="tbl-th-right px-3 py-1">Total ₹</th>
                                                    <th className="tbl-th-center px-3 py-1">Status</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {cityItems.map((item: any, idx: number) => {
                                                  const qtyLabel = item.ServcieQty
                                                    ? (item.ServiceName?.toLowerCase().includes("hotel")
                                                        ? `${item.ServcieQty}N`
                                                        : `${item.ServcieQty}D`)
                                                    : "-";
                                                  const bookKey = `${v.id}-${travellerId}-${item.location}-${item.ServiceName?.trim()}`;
                                                  const vendorData = vendorPriceMap[bookKey];
                                                  const vendorUnitPrice = vendorData?.unitPrice || 0;
                                                  const isBooked = bookedKeys.has(`${v.id}-${travellerId}-${item.location}`);
                                                  const isEditing = editingKey === bookKey;
                                                  const displayUnitPrice = isBooked && vendorUnitPrice > 0 ? vendorUnitPrice : 0;
                                                  const displayTotalPrice = isBooked && vendorUnitPrice > 0 ? vendorUnitPrice * (item.ServcieQty || 1) : 0;
                                                  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—";
                                                  const nights = editForm.startDate && editForm.endDate ? Math.ceil((new Date(editForm.endDate).getTime() - new Date(editForm.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                                                  return (
                                                    <tr
                                                      key={idx}
                                                      className={`border-b border-brand-neutral-light last:border-0 ${isBooked && !isEditing ? "cursor-pointer hover:bg-brand-primary-light/50" : ""}`}
                                                      onClick={() => {
                                                        if (isBooked && !isEditing && vendorData) {
                                                          setEditingKey(bookKey);
                                                          setEditForm({ startDate: vendorData.startDate, endDate: vendorData.endDate, unitPrice: vendorData.unitPrice });
                                                        }
                                                      }}
                                                    >
                                                      <td className="px-3 py-1 font-semibold text-brand-neutral">{item.ServiceName}</td>
                                                      <td className="px-3 py-1 text-brand-neutral">
                                                        {item.hotelName || item.carName || "-"}
                                                        {(item.hotelType || item.carType) && (
                                                          <span className="text-gray-400 ml-1">({item.hotelType || item.carType})</span>
                                                        )}
                                                      </td>
                                                      <td className="px-3 py-1 text-center font-medium text-brand-neutral">{qtyLabel}</td>
                                                      <td className="px-3 py-1 text-center">
                                                        {isEditing ? (
                                                          <input type="date" value={editForm.startDate} onClick={(e) => e.stopPropagation()} onChange={(e) => setEditForm((p) => ({ ...p, startDate: e.target.value }))} className="w-full text-[10px] border border-brand-neutral-border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                                                        ) : (
                                                          <span className="text-brand-neutral">{isBooked ? fmtDate(vendorData?.startDate || "") : <span className="text-gray-400">—</span>}</span>
                                                        )}
                                                      </td>
                                                      <td className="px-3 py-1 text-center">
                                                        {isEditing ? (
                                                          <input type="date" value={editForm.endDate} onClick={(e) => e.stopPropagation()} onChange={(e) => setEditForm((p) => ({ ...p, endDate: e.target.value }))} className="w-full text-[10px] border border-brand-neutral-border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                                                        ) : (
                                                          <span className="text-brand-neutral">{isBooked ? fmtDate(vendorData?.endDate || "") : <span className="text-gray-400">—</span>}</span>
                                                        )}
                                                      </td>
                                                      <td className="px-3 py-1 text-right">
                                                        <span className="text-[10px] text-brand-neutral-muted">₹{Number(item.UnitPrice || 0).toLocaleString("en-IN")}</span>
                                                      </td>
                                                      <td className="px-3 py-1 text-right">
                                                        {isEditing ? (
                                                          <input type="number" min="0" max={item.UnitPrice || undefined} value={editForm.unitPrice} onClick={(e) => e.stopPropagation()} onChange={(e) => { const val = Number(e.target.value);                                                         if ((item.UnitPrice || 0) > 0 && val > (item.UnitPrice || 0)) { errorToast(`Max ₹${Number(item.UnitPrice).toLocaleString("en-IN")} (quotation price)`); return; } setEditForm((p) => ({ ...p, unitPrice: val })); }} className="w-20 text-[10px] border border-brand-neutral-border rounded px-1 py-0.5 text-right focus:outline-none focus:ring-1 focus:ring-brand-500" />
                                                        ) : (
                                                          <span className="text-brand-neutral">
                                                            {isBooked && vendorUnitPrice > 0 ? (
                                                              <>
                                                                ₹{Number(displayUnitPrice).toLocaleString("en-IN")}
                                                                {vendorUnitPrice < (item.UnitPrice || 0) && <span className="text-[9px] text-green-600 ml-1">✓</span>}
                                                              </>
                                                            ) : (
                                                              <span className="text-gray-400">—</span>
                                                            )}
                                                          </span>
                                                        )}
                                                      </td>
                                                      <td className="px-3 py-1 text-right font-semibold text-gray-800">
                                                        {isEditing ? (
                                                          <span className="text-[10px]">₹{(editForm.unitPrice * (nights || item.ServcieQty || 1)).toLocaleString("en-IN")}</span>
                                                        ) : (
                                                          isBooked && displayTotalPrice > 0 ? `₹${Number(displayTotalPrice).toLocaleString("en-IN")}` : <span className="text-gray-400">—</span>
                                                        )}
                                                      </td>
                                                      <td className="px-3 py-1 text-center">
                                                        {isEditing ? (
                                                          <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                              <button
                                                                onClick={() => {
                                                                   if (!editForm.startDate || !editForm.endDate) { errorToast("Please enter check-in and check-out dates"); return; }
                                                                   if (new Date(editForm.endDate) <= new Date(editForm.startDate)) { errorToast("Check-out must be after check-in"); return; }
                                                                  const aId = vendorData?.assignmentId;
                                                                  const oldDetails = assignments.find((a: any) => a.id === aId)?.serviceWiseDetails || {};
                                                                  const svcName = vendorData?.service || "";
                                                                  const svcEntries = Array.isArray(oldDetails[svcName]) ? [...oldDetails[svcName]] : [oldDetails[svcName]];
                                                                  const entryIdx = svcEntries.findIndex((e: any) => e?.city === item.location);
                                                                  if (entryIdx >= 0) {
                                                                    svcEntries[entryIdx] = { ...svcEntries[entryIdx], startDate: editForm.startDate, endDate: editForm.endDate, unitPrice: editForm.unitPrice, totalPrice: editForm.unitPrice * (nights || item.ServcieQty || 1) };
                                                                  }
                                                                  updateAssignment({ id: aId, payload: { serviceWiseDetails: { ...oldDetails, [svcName]: svcEntries } } }, {
                                                                    onSuccess: () => { setEditingKey(null); successToast("Updated successfully"); },
                                                                    onError: () => errorToast("Something went wrong. Please try again."),
                                                                  });
                                                                }}
                                                                disabled={isUpdating}
                                                                className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded hover:bg-green-600 font-bold disabled:opacity-50"
                                                              >{isUpdating ? <PageLoader size="inline" /> : "Save"}</button>
                                                            <button onClick={() => setEditingKey(null)} className="text-[9px] bg-gray-200 text-brand-neutral px-1.5 py-0.5 rounded hover:bg-gray-300 font-bold">Cancel</button>
                                                          </div>
                                                        ) : isBooked ? (
                                                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-success-light text-brand-success font-bold flex items-center gap-0.5 w-fit mx-auto">
                                                            <CheckCircle size={8} /> Booked
                                                          </span>
                                                        ) : (
                                                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-warning-light text-brand-warning font-bold">Pending</span>
                                                        )}
                                                      </td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>

                                            {/* Inline Booking Form */}
                                            {isBooking && (
                                              <div className="bg-brand-primary-light border-t border-indigo-100 p-3 space-y-3">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                  <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-brand-neutral-muted uppercase">Check-in</label>
                                                    <input
                                                      type="date"
                                                      value={bookingCity?.checkIn || ""}
                                                      onChange={(e) => setBookingCity((prev) => prev ? { ...prev, checkIn: e.target.value } : null)}
                                                      className="w-full text-xs border border-brand-neutral-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-brand-neutral-muted uppercase">Check-out</label>
                                                    <input
                                                      type="date"
                                                      value={bookingCity?.checkOut || ""}
                                                      onChange={(e) => setBookingCity((prev) => prev ? { ...prev, checkOut: e.target.value } : null)}
                                                      className="w-full text-xs border border-brand-neutral-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-brand-neutral-muted uppercase">Unit Price (₹)</label>
                                                    <input
                                                      type="number"
                                                      value={unitPrice}
                                                      onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        if (maxUnitPrice > 0 && val > maxUnitPrice) {
                                                          errorToast(`Max ₹${maxUnitPrice.toLocaleString("en-IN")} (quotation price)`);
                                                          return;
                                                        }
                                                        setUnitPrice(e.target.value);
                                                      }}
                                                      min="0"
                                                      max={maxUnitPrice > 0 ? maxUnitPrice : undefined}
                                                      placeholder={`0 (Max: ₹${maxUnitPrice.toLocaleString("en-IN")})`}
                                                      className="w-full text-xs border border-brand-neutral-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-bold"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-brand-neutral-muted uppercase">Total (₹)</label>
                                                    <div className="flex items-center h-[30px] px-2 bg-white border border-brand-neutral-border rounded-lg">
                                                      <span className="text-xs font-bold text-gray-800">₹{totalPrice.toLocaleString("en-IN")}</span>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                  <span className="text-[10px] text-gray-400">
                                                    {bookingCity?.qty} {bookingCity?.service?.toLowerCase() === "hotel" ? "Nights" : "Days"} × ₹{unitPriceNum.toLocaleString("en-IN")} = ₹{totalPrice.toLocaleString("en-IN")}
                                                  </span>
                                                  <PrivateButton
                                                    icon={CheckCircle}
                                                    size="sm"
                                                    isLoading={isBookingPending}
                                                    disabled={!unitPriceNum || !bookingCity?.checkIn || !bookingCity?.checkOut}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      if (!unitPriceNum || !bookingCity?.checkIn || !bookingCity?.checkOut) {
                                                        errorToast("Please fill check-in, check-out and unit price");
                                                        return;
                                                      }
                                                      if (new Date(bookingCity.checkOut) <= new Date(bookingCity.checkIn)) {
                                                        errorToast("Check-out date must be after check-in date");
                                                        return;
                                                      }
                                                      const nightsDays = Math.ceil(
                                                        (new Date(bookingCity.checkOut).getTime() - new Date(bookingCity.checkIn).getTime()) / (1000 * 60 * 60 * 24)
                                                      );
                                                      const isHotel = bookingCity.service?.toLowerCase() === "hotel";
                                                      const payload = {
                                                        travellerId: bookingCity.travellerId,
                                                        vendorId: bookingCity.vendorId,
                                                        services: [bookingCity.service],
                                                        packageType: "INDIVIDUAL",
                                                        totalAmount: totalPrice,
                                                        serviceWiseAmount: { [bookingCity.service]: totalPrice },
                                                        serviceWiseDetails: {
                                                          [bookingCity.service]: [{
                                                            city: bookingCity.city,
                                                            startDate: bookingCity.checkIn,
                                                            endDate: bookingCity.checkOut,
                                                            unitPrice: unitPriceNum,
                                                            totalPrice,
                                                            ...(isHotel ? { nights: nightsDays } : { days: nightsDays }),
                                                          }],
                                                        },
                                                        assignedDate: new Date().toISOString().split("T")[0],
                                                        status: "UPCOMING",
                                                      };
                                                      createAssignment(payload, {
                                                        onSuccess: () => {
                                                          setBookingCity(null);
                                                          setUnitPrice("");
                                                        },
                                                      });
                                                    }}
                                                  >
                                                    Confirm Booking
                                                  </PrivateButton>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                              {vendorItems.length === 0 && (
                                <p className="text-xs text-gray-400 text-center py-4">No quotations assigned yet</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Create / Edit Vendor Modal */}
      <ReusableModel
        open={isVendorModalOpen}
        onOpenChange={(open) => { setIsVendorModalOpen(open); if (!open) { setEditingVendor(null); setSelectedGroupId(null); setSelectedGroupType(undefined); } }}
        title={editingVendor ? "Update Vendor" : "Create New Vendor"}
        description="Manage vendor details."
        contentClassName="sm:max-w-[720px]"
      >
        <div className="py-2 max-h-[75vh] overflow-y-auto px-1">
          <VendorForm vendorGroupId={selectedGroupId} vendorGroupType={selectedGroupType} initialData={editingVendor} onSuccess={() => setIsVendorModalOpen(false)} />
        </div>
      </ReusableModel>

    </div>
  );
}
