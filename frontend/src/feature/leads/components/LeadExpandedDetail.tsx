"use client";
import React from "react";
import { CheckCircle, XCircle, ArrowRight, Building2, AlertTriangle, Plus, UserPlus, FileText, Briefcase, Mail, Phone } from "lucide-react";
import Link from "next/link";
import PageLoader from "@/components/shared/PageLoader";
import { getAssignedPerson, getAssignedType, getVendorInfo } from "./myLeadsHelpers";

interface LeadExpandedDetailProps {
  lead: any;
  expandedTab: "traveller" | "vendor";
  setExpandedTab: (t: "traveller" | "vendor") => void;
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
  user: any;
}

export function LeadExpandedDetail({
  lead, expandedTab, setExpandedTab, vendors, assignments,
  vendorPriceMap, bookedKeys, editingKey, setEditingKey, editForm,
  setEditForm, updateAssignment, isUpdating, setUnassignedVendorModal,
  setUnassignedService, setUnassignedCity, setUnassignedManualName, user,
}: LeadExpandedDetailProps) {
  const req = lead.requirement;
  const requiredServices = new Set<string>();
  if (req) {
    if (req.serviceType) {
      req.serviceType.split(",").forEach((t: string) => {
        const trimmed = t.trim();
        if (trimmed) requiredServices.add(trimmed);
      });
    }
    if (req.needGuide) requiredServices.add("Guide");
    if (req.needActivities) requiredServices.add("Activity");
  }

  const bookedServices = new Set<string>();
  if (lead.vendorAssignments) {
    lead.vendorAssignments.forEach((va: any) => {
      if (va.services) va.services.forEach((s: string) => bookedServices.add(s));
    });
  }
  const reqArray = Array.from(requiredServices);
  const hasUnbookedServices = reqArray.some(s => !bookedServices.has(s));
  const hasVendorOps = reqArray.length > 0 || (lead.invoices && lead.invoices.length > 0) || (lead.vendorAssignments && lead.vendorAssignments.length > 0);

  const SERVICE_LABELS: Record<string, string> = { oneway: "One-Way Transfer", roundway: "Round Trip", pickup_drop: "Pick-up & Drop", sightseeing: "Sightseeing" };

  return (
    <tr>
      <td colSpan={9} width="100%" className="p-0 border-t border-brand-neutral-border">
        <div className="bg-brand-neutral-light px-6 py-5">
          {/* Tabs Header */}
          <div className="flex items-center gap-1 mb-5 border-b border-slate-200">
            <button
              onClick={(e) => { e.stopPropagation(); setExpandedTab("traveller"); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                expandedTab === "traveller"
                  ? "border-brand-primary text-brand-primary bg-white"
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Traveller & Pipeline
            </button>
            {hasVendorOps && (
              <button
                onClick={(e) => { e.stopPropagation(); setExpandedTab("vendor"); }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  expandedTab === "vendor"
                    ? "border-brand-primary text-brand-primary bg-white"
                    : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Vendor Operations
                {hasUnbookedServices && (
                  <span className="ml-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[8px] font-bold flex items-center justify-center">
                    {reqArray.filter(s => !bookedServices.has(s)).length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* TAB: Traveller & Pipeline */}
          {expandedTab === "traveller" && (
            <div className="space-y-5">
              <SalesPipeline lead={lead} />
              <TravellerInfoTable lead={lead} SERVICE_LABELS={SERVICE_LABELS} />
              <PaymentsTable lead={lead} />
            </div>
          )}

          {/* TAB: Vendor Operations */}
          {expandedTab === "vendor" && hasVendorOps && (
            <div className="space-y-5">
              
              {reqArray.length > 0 && (
                <ServiceFulfillment
                  reqArray={reqArray}
                  bookedServices={bookedServices}
                  hasUnbookedServices={hasUnbookedServices}
                  leadId={lead.id}
                />
              )}
              <QuotationDetails
                lead={lead}
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
              />
              <VendorServicesTable lead={lead} />
            </div>
          )}

          {/* Followup Notes */}
          {lead.followupNotes && lead.followupNotes.length > 0 && (
            <div className="mt-5">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Follow-up Notes</p>
              <div className="bg-white rounded-lg border border-brand-neutral-border overflow-hidden max-h-56 overflow-y-auto">
                <table className="tbl">
                  <thead className="sticky top-0">
                    <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
                      <th className="tbl-th text-left whitespace-nowrap">Date & Time</th>
                      <th className="tbl-th text-left whitespace-nowrap">Channel</th>
                      <th className="tbl-th text-left">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-neutral-light">
                    {lead.followupNotes.map((note: any) => (
                      <tr key={note.id} className="hover:bg-brand-neutral-light">
                        <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{new Date(note.createdAt).toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-xs uppercase text-brand-neutral-muted whitespace-nowrap">{note.channel}</td>
                        <td className="px-4 py-3 text-brand-neutral italic">&quot;{note.note}&quot;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function SalesPipeline({ lead }: { lead: any }) {
  const step1Done = !!lead.requirement;
  const step2Done = !!lead.requirement;
  const step3Done = lead.invoices && lead.invoices.length > 0;
  const step4Done = lead.invoices && lead.invoices.some((inv: any) => inv.status === "SENT");
  const step5Done = lead.payments && lead.payments.some((p: any) => p.approvedAt || p.status === "COMPLETED");
  const steps = [
    { label: "Req. Created", desc: step1Done ? `${new Date(lead.requirement.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}` : "Pending", done: step1Done },
    { label: "Req. Sent", desc: step2Done ? "Auto-sent" : "Not sent", done: step2Done },
    { label: "Quotation", desc: step3Done ? `${lead.invoices.length} version(s)` : "Not created", done: step3Done },
    { label: "Quote Sent", desc: step4Done ? "Emailed" : "Not sent", done: step4Done },
    { label: "Payment", desc: step5Done ? "Received" : "Awaited", done: step5Done },
  ];
  const completedCount = steps.filter(s => s.done).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sales Pipeline</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${completedCount === steps.length ? "bg-brand-success-light text-brand-success" : completedCount === 0 ? "bg-slate-100 text-slate-400" : "bg-brand-warning-light text-brand-warning"}`}>
          {completedCount}/{steps.length} Complete
        </span>
      </div>
      <div className="bg-white rounded-lg border border-brand-neutral-border px-4 py-3">
        <div className="flex items-center">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 min-w-[70px]">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step.done ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-300 text-slate-400"}`}>
                  {step.done ? "✓" : i + 1}
                </div>
                <span className={`text-[9px] font-bold text-center leading-tight ${step.done ? "text-brand-success" : "text-slate-400"}`}>{step.label}</span>
                <span className={`text-[8px] text-center leading-tight ${step.done ? "text-emerald-500" : "text-slate-300"}`}>{step.desc}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mb-5 mx-0.5 transition-all ${steps[i + 1].done ? "bg-emerald-400" : step.done ? "bg-gradient-to-r from-emerald-400 to-slate-200" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TravellerInfoTable({ lead, SERVICE_LABELS }: { lead: any; SERVICE_LABELS: Record<string, string> }) {
  const tour = lead.tourBookings?.[0] || null;
  const car = lead.vehicleBookings?.[0] || null;
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Lead ID", value: <span key="lid" className="font-mono text-xs">{lead.travellerId || "---"}</span> },
    { label: "Page Reference", value: lead.pageReference ? <a key="pref" href={lead.pageReference} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline break-all text-xs">{lead.pageReference}</a> : "---" },
    { label: "IP Address", value: lead.countryId ? <a key="ip" href={`https://ipinfo.io/${lead.countryId}/json`} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline font-mono text-xs">{lead.countryId}</a> : "---" },
    { label: "Traveller Name", value: lead.name || "---" },
    { label: "Traveller Email", value: lead.email || "---" },
    { label: "Traveller Mobile", value: lead.phone || "---" },
    { label: "Traveller Country", value: lead.country || "---" },
    ...(tour ? [
      { label: "Journey Dates", value: (
        <span key="jd" className="text-xs whitespace-nowrap">
          {new Date(tour.travelStartDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          {tour.travelEndDate && <> → {new Date(tour.travelEndDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</>}
        </span>
      ) },
      { label: "No. of Adults", value: `${tour.noOfPersons ?? "---"}` },
      { label: "No. of Children", value: tour.noOfChildren != null ? `${tour.noOfChildren}` : "---" },
      { label: "Hotel Type", value: tour.hotelCategory || "---" },
    ] : []),
    ...(car ? [
      { label: "Vehicle Name", value: car.vehicleName || "---" },
      { label: "Car Service Type", value: SERVICE_LABELS[car.serviceType] || car.serviceType || "---" },
    ] : []),
    { label: "Traveller Message", value: (tour?.travellerMessage || car?.travellerMessage) ? <span key="msg" className="italic text-brand-neutral-muted">{tour?.travellerMessage || car?.travellerMessage}</span> : "---" },
  ];

  return (
    <div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <span className="w-1 h-4 bg-indigo-400 rounded-full inline-block" />Traveller Details
      </p>
      <div className="bg-white rounded-lg border border-brand-neutral-border overflow-hidden">
        <table className="w-full text-[11px]">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`${i % 2 === 0 ? "bg-brand-neutral-light" : "bg-white"} ${i < rows.length - 1 ? "border-b border-slate-100" : ""}`}>
                <td className="px-4 py-2 text-brand-neutral w-[350px]">{row.label}</td>
                <td className="px-4 py-2 text-brand-neutral font-medium">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsTable({ lead }: { lead: any }) {
  if (!lead.payments || lead.payments.length === 0) return null;
  return (
    <div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Payments</p>
      <div className="bg-white rounded-lg border border-brand-neutral-border overflow-hidden">
        <table className="tbl">
          <thead>
            <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
              <th className="tbl-th text-left">Transaction ID</th>
              <th className="tbl-th text-left">Detail</th>
              <th className="tbl-th text-right">Amount</th>
              <th className="tbl-th text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-neutral-light">
            {lead.payments.map((pay: any) => (
              <tr key={pay.id}>
                <td className="px-4 py-3 text-brand-neutral font-medium">{pay.transactionId || "N/A"}</td>
                <td className="px-4 py-3 text-brand-neutral-muted text-xs">{pay.transactionDetail || "—"}</td>
                <td className="px-4 py-3 text-brand-success font-bold text-right">₹{Number(pay.amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${pay.status === "COMPLETED" ? "bg-brand-success-light text-brand-success" : "bg-brand-warning-light text-brand-warning"}`}>
                    {pay.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ServiceFulfillment({ reqArray, bookedServices, hasUnbookedServices, leadId }: {
  reqArray: string[];
  bookedServices: Set<string>;
  hasUnbookedServices: boolean;
  leadId: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Service Fulfillment</p>
        {hasUnbookedServices && (
          <Link href={`/dashboard/vendors?leadId=${leadId}`}>
            <button className="text-[10px] bg-brand-primary-light text-brand-primary hover:bg-indigo-200 px-2.5 py-1 rounded-full font-bold transition-colors flex items-center gap-1">
              Book Services <ArrowRight size={10} />
            </button>
          </Link>
        )}
      </div>
      <div className="bg-white rounded-lg border border-brand-neutral-border overflow-hidden p-4">
        <div className="flex flex-wrap gap-4">
          {reqArray.map(service => {
            const isBooked = bookedServices.has(service);
            return (
              <div key={service} className="flex items-center gap-2 px-3 py-2 border border-slate-100 rounded-lg bg-brand-neutral-light">
                {isBooked ? <CheckCircle size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-brand-danger" />}
                <span className={`text-xs font-bold ${isBooked ? 'text-brand-neutral-dark' : 'text-brand-neutral'}`}>{service}</span>
                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${isBooked ? 'bg-brand-success-light text-brand-success' : 'bg-brand-danger-light text-brand-danger'}`}>
                  {isBooked ? 'Booked' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function QuotationDetails({ lead, vendors, assignments, vendorPriceMap, bookedKeys, editingKey, setEditingKey, editForm, setEditForm, updateAssignment, isUpdating, setUnassignedVendorModal, setUnassignedService, setUnassignedCity, setUnassignedManualName }: any) {
  if (!lead.invoices || lead.invoices.length === 0 || !lead.invoices.some((inv: any) => inv.items && inv.items.length > 0)) return null;

  return (
    <div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Quotation / Package Details</p>
      <div className="space-y-3">
        {lead.invoices.filter((inv: any) => inv.items && inv.items.length > 0).map((inv: any) => {
          const vendorGroups: Record<string, any[]> = {};
          for (const item of inv.items) {
            let vendorName = item.vendor?.vendarCompanyName || item.vendor?.vendarName;
            if (!vendorName) {
              const manualName = item.hotelName || item.carName || item.guideName || "";
              vendorName = manualName ? `Unassigned (${manualName})` : "Unassigned";
            }
            if (!vendorGroups[vendorName]) vendorGroups[vendorName] = [];
            vendorGroups[vendorName].push(item);
          }
          return (
            <div key={inv.id} className="bg-white rounded-lg border border-brand-neutral-border overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 border-b border-brand-neutral-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={12} className="text-indigo-500" />
                  <span className="text-[11px] font-bold text-brand-neutral">{inv.packageName || inv.quotationNo || `Invoice #${inv.id}`}</span>
                  {inv.travelDate && (
                    <span className="text-[10px] text-slate-400">• Travel: {new Date(inv.travelDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  )}
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${inv.status === "SENT" ? "bg-brand-info-light text-brand-info" : inv.status === "APPROVED" ? "bg-brand-success-light text-brand-success" : "bg-slate-100 text-brand-neutral-muted"}`}>
                  {inv.status}
                </span>
              </div>
              <div className="p-3 space-y-3">
                {Object.entries(vendorGroups).map(([vendorName, items]) => {
                  let vendorTotal = 0;
                  const vendorId = items[0]?.vendor?.id;
                  const isUnassigned = vendorName.startsWith("Unassigned");
                  const groupServices = [...new Set(items.map((i: any) => i.ServiceName).filter(Boolean))];
                  const groupCities = [...new Set(items.map((i: any) => i.location).filter(Boolean))];
                  const groupService = groupServices.length === 1 ? groupServices[0] : "";
                  const groupCity = groupCities.length === 1 ? groupCities[0] : "";
                  const hasCreatedVendor = isUnassigned && vendors.some((v: any) =>
                    v.vendarIsActive &&
                    v.vendarWorkingAreas?.some((a: string) => a.toLowerCase() === groupCity.toLowerCase()) &&
                    (groupService === "" || groupService === "Hotel" ? ["HOTEL", "HOTEL_VENDOR", "ALL"].includes(v.vendarServiceType) :
                     groupService === "Car" ? ["CAB_OPERATOR", "TRANSPORT_VENDOR", "ALL"].includes(v.vendarServiceType) :
                     groupService === "Guide" ? ["GUIDE_VENDOR", "ALL"].includes(v.vendarServiceType) : true)
                  );
                  const matchedAssignment = !isUnassigned && vendorId ? lead.vendorAssignments?.find((va: any) => va.vendorId === vendorId) : null;
                  const isTravelComplete = lead.requirement?.endDate && new Date(lead.requirement.endDate) < new Date();
                  const isFullyPaid = matchedAssignment?.payments?.length > 0 && matchedAssignment.payments.every((p: any) => p.paymentStatus === "PAID");
                  if (!isUnassigned && isTravelComplete && isFullyPaid) return null;

                  return (
                    <div key={vendorName} className={`border rounded-lg overflow-hidden ${isUnassigned ? "border-orange-200" : "border-slate-100"}`}>
                      <div className={`px-3 py-1.5 border-b flex items-center justify-between ${isUnassigned ? "bg-orange-50 border-orange-200" : "bg-brand-primary-light border-slate-100"}`}>
                        <span className="text-[11px] font-bold text-brand-neutral flex items-center gap-1">
                          <Building2 size={11} className={isUnassigned ? "text-orange-500" : "text-indigo-500"} /> {vendorName}
                          {isUnassigned && <AlertTriangle size={10} className="text-orange-500 ml-1" />}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">{items.length} item{items.length > 1 ? "s" : ""}</span>
                          {isUnassigned ? (
                            <>
                              {!hasCreatedVendor && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setUnassignedService(groupService); setUnassignedCity(groupCity); const match = vendorName.match(/\((.+)\)/); setUnassignedManualName(match ? match[1] : ""); setUnassignedVendorModal(true); }}
                                  className="text-[10px] bg-orange-600 text-white px-2.5 py-0.5 rounded-md hover:bg-orange-700 transition font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus size={10} /> Create Vendor
                                </button>
                              )}
                              <Link href={`/dashboard/vendors?leadId=${lead.id}`}>
                                <button onClick={(e) => e.stopPropagation()} className="text-[10px] bg-green-600 text-white px-2.5 py-0.5 rounded-md hover:bg-green-700 transition font-bold flex items-center gap-1 cursor-pointer">
                                  <UserPlus size={10} /> Assign Existing
                                </button>
                              </Link>
                            </>
                          ) : (
                            vendorId && (
                              <Link href={`/dashboard/vendors?vendorId=${vendorId}&leadId=${lead.id}`}>
                                <button className="btn-primary text-[10px] px-2.5 py-0.5 rounded-md transition font-bold flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <Briefcase size={10} /> Assign Service
                                </button>
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                      <QuotationItemTable items={items} leadId={lead.id} vendorPriceMap={vendorPriceMap} bookedKeys={bookedKeys} editingKey={editingKey} setEditingKey={setEditingKey} editForm={editForm} setEditForm={setEditForm} updateAssignment={updateAssignment} isUpdating={isUpdating} vendorTotal={vendorTotal} />
                    </div>
                  );
                })}
                {inv.grandTotal > 0 && (
                  <div className="flex justify-end pt-2 border-t border-brand-neutral-border">
                    <span className="text-[11px] font-bold text-brand-neutral">Grand Total: ₹{Number(inv.grandTotal).toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuotationItemTable({ items, leadId, vendorPriceMap, bookedKeys, editingKey, setEditingKey, editForm, setEditForm, updateAssignment, isUpdating, vendorTotal: _vendorTotal }: any) {
  let runningTotal = 0;
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—";
  const nights = editForm.startDate && editForm.endDate ? Math.ceil((new Date(editForm.endDate).getTime() - new Date(editForm.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <>
      <table className="tbl">
        <thead>
          <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
            <th className="tbl-th text-left">City</th>
            <th className="tbl-th text-left">Service</th>
            <th className="tbl-th text-left">Name</th>
            <th className="tbl-th text-center">Qty</th>
            <th className="tbl-th text-center">Check-in</th>
            <th className="tbl-th text-center">Check-out</th>
            <th className="tbl-th text-right">Quotation (Traveler)</th>
            <th className="tbl-th text-right">Booked (Vendor)</th>
            <th className="tbl-th text-right">Total ₹</th>
            <th className="tbl-th text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, idx: number) => {
            runningTotal += Number(item.TotalPrice) || 0;
            const qtyLabel = item.ServcieQty
              ? (item.ServiceName?.toLowerCase().includes("hotel") ? `${item.ServcieQty}N` : `${item.ServcieQty}D`)
              : "-";
            const itemVendorId = item.vendor?.id || item.vendorId;
            const bookKey = itemVendorId && item.location ? `${itemVendorId}-${leadId}-${item.location}-${item.ServiceName?.trim()}` : "";
            const vendorData = bookKey ? vendorPriceMap[bookKey] : null;
            const isBooked = itemVendorId && item.location ? bookedKeys.has(`${itemVendorId}-${leadId}-${item.location}`) : false;
            const isEditing = editingKey === bookKey;
            const vendorUnitPrice = vendorData?.unitPrice || 0;
            const displayTotalPrice = isBooked && vendorUnitPrice > 0 ? vendorUnitPrice * (item.ServcieQty || 1) : 0;

            return (
              <tr key={idx} className={`border-b border-slate-50 last:border-0 ${isBooked && !isEditing ? "hover:bg-brand-neutral-light cursor-pointer" : ""}`}
                onClick={() => {
                  if (isBooked && !isEditing && vendorData) {
                    setEditingKey(bookKey);
                    setEditForm({ startDate: vendorData.startDate, endDate: vendorData.endDate, unitPrice: vendorData.unitPrice });
                  }
                }}
              >
                <td className="px-3 py-1.5 text-brand-neutral">{item.location || "-"}</td>
                <td className="px-3 py-1.5 font-semibold text-brand-neutral">{item.ServiceName}</td>
                <td className="px-3 py-1.5 text-brand-neutral">
                  {item.hotelName || item.carName || item.guideName || "-"}
                  {(item.hotelType || item.carType) && <span className="text-slate-400 ml-1">({item.hotelType || item.carType})</span>}
                </td>
                <td className="px-3 py-1.5 text-center font-medium text-brand-neutral">{qtyLabel}</td>
                <td className="px-3 py-1.5 text-center">
                  {isEditing ? (
                    <input type="date" value={editForm.startDate} onClick={(e) => e.stopPropagation()} onChange={(e) => setEditForm((p: any) => ({ ...p, startDate: e.target.value }))} className="w-full text-[10px] border border-brand-neutral-border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                  ) : (
                    <span className="text-brand-neutral">{isBooked ? fmtDate(vendorData?.startDate || "") : <span className="text-slate-400">—</span>}</span>
                  )}
                </td>
                <td className="px-3 py-1.5 text-center">
                  {isEditing ? (
                    <input type="date" value={editForm.endDate} onClick={(e) => e.stopPropagation()} onChange={(e) => setEditForm((p: any) => ({ ...p, endDate: e.target.value }))} className="w-full text-[10px] border border-brand-neutral-border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                  ) : (
                    <span className="text-brand-neutral">{isBooked ? fmtDate(vendorData?.endDate || "") : <span className="text-slate-400">—</span>}</span>
                  )}
                </td>
                <td className="px-3 py-1.5 text-right text-brand-neutral-muted">
                  <span className="text-[10px]">₹{Number(item.UnitPrice || 0).toLocaleString("en-IN")}</span>
                </td>
                <td className="px-3 py-1.5 text-right">
                  {isEditing ? (
                    <input type="number" min="0" max={item.UnitPrice || undefined} value={editForm.unitPrice} onClick={(e) => e.stopPropagation()} onChange={(e) => { const val = Number(e.target.value); if ((item.UnitPrice || 0) > 0 && val > (item.UnitPrice || 0)) { return; } setEditForm((p: any) => ({ ...p, unitPrice: val })); }} className="w-20 text-[10px] border border-brand-neutral-border rounded px-1 py-0.5 text-right focus:outline-none focus:ring-1 focus:ring-brand-500" />
                  ) : (
                    <span className="text-brand-neutral">
                      {isBooked && vendorUnitPrice > 0 ? (
                        <>
                          ₹{vendorUnitPrice.toLocaleString("en-IN")}
                          {vendorUnitPrice < (item.UnitPrice || 0) && <span className="text-[9px] text-brand-success ml-1">✓</span>}
                        </>
                      ) : <span className="text-slate-400">—</span>}
                    </span>
                  )}
                </td>
                <td className="px-3 py-1.5 text-right font-semibold text-brand-neutral-dark">
                  {isEditing ? (
                    <span className="text-[10px]">₹{(editForm.unitPrice * (nights || item.ServcieQty || 1)).toLocaleString("en-IN")}</span>
                  ) : (
                    isBooked && displayTotalPrice > 0 ? `₹${displayTotalPrice.toLocaleString("en-IN")}` : <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-3 py-1.5 text-center">
                  {isEditing ? (
                    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          if (!editForm.startDate || !editForm.endDate) return;
                          if (new Date(editForm.endDate) <= new Date(editForm.startDate)) return;
                          const aId = vendorData?.assignmentId;
                          if (!aId) return;
                          const oldDetails = {} as any;
                          const svcName = vendorData?.service || "";
                          const svcEntries = Array.isArray(oldDetails[svcName]) ? [...oldDetails[svcName]] : [oldDetails[svcName]];
                          const entryIdx = svcEntries.findIndex((e: any) => e?.city === item.location);
                          if (entryIdx >= 0) {
                            svcEntries[entryIdx] = { ...svcEntries[entryIdx], startDate: editForm.startDate, endDate: editForm.endDate, unitPrice: editForm.unitPrice, totalPrice: editForm.unitPrice * (nights || item.ServcieQty || 1) };
                          }
                          updateAssignment({ id: aId, payload: { serviceWiseDetails: { ...oldDetails, [svcName]: svcEntries } } }, {
                            onSuccess: () => { setEditingKey(null); },
                            onError: () => {},
                          });
                        }}
                        disabled={isUpdating}
                        className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded hover:bg-green-600 font-bold disabled:opacity-50"
                      >{isUpdating ? "..." : "Save"}</button>
                      <button onClick={() => setEditingKey(null)} className="text-[9px] bg-slate-200 text-brand-neutral px-1.5 py-0.5 rounded hover:bg-slate-300 font-bold">Cancel</button>
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
      <div className="px-3 py-1.5 bg-brand-neutral-light border-t border-slate-100 text-right">
        <span className="text-[10px] font-bold text-brand-neutral-muted">Total: ₹{runningTotal.toLocaleString("en-IN")}</span>
      </div>
    </>
  );
}

function VendorServicesTable({ lead }: { lead: any }) {
  if (!lead.vendorAssignments || lead.vendorAssignments.length === 0) return null;
  const isTravelComplete = lead.requirement?.endDate && new Date(lead.requirement.endDate) < new Date();
  const visibleAssignments = lead.vendorAssignments.filter((va: any) => {
    const isFullyPaid = va.payments?.length > 0 && va.payments.every((p: any) => p.paymentStatus === "PAID");
    return !(isTravelComplete && isFullyPaid);
  });
  if (visibleAssignments.length === 0) return null;

  return (
    <div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Vendor Services</p>
      <div className="bg-white rounded-lg border border-brand-neutral-border overflow-hidden">
        <table className="tbl">
          <thead>
            <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
              <th className="tbl-th text-left">Vendor</th>
              <th className="tbl-th text-left">Mobile</th>
              <th className="tbl-th text-left">Services</th>
              <th className="tbl-th text-left">Amount Breakdown</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-neutral-light">
            {visibleAssignments.map((va: any) => {
              const swa = va.serviceWiseAmount || {};
              return (
                <tr key={va.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-brand-neutral-dark">{va.vendor?.vendarCompanyName || va.vendor?.vendarName || "—"}</p>
                    <p className="text-xs text-slate-400">{va.vendor?.vendarEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-brand-neutral text-xs">{va.vendor?.vendarMobile || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(va.services || []).map((s: string) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 bg-brand-primary-light text-brand-primary rounded font-bold">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-neutral space-x-3">
                    {Object.keys(swa).length > 0
                      ? Object.entries(swa).map(([s, a]: [string, any]) => (
                        <span key={s}><span className="text-slate-400">{s}:</span> ₹{Number(a).toLocaleString()}</span>
                      ))
                      : <span className="text-slate-400">—</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
