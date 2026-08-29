"use client";

import { useMemo, useState, Fragment } from "react";
import { useGetVendors, useGetVendorAssignments } from "@/feature/vendors/api/useVendorHooks";
import { Users, MapPin, ChevronDown, ChevronRight } from "lucide-react";
import PageLoader from "@/components/shared/PageLoader";
import StatsCardGrid from "@/components/shared/StatsCardGrid";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import TableWraper from "@/components/shared/TableWraper";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  UPCOMING: { label: "Upcoming", className: "bg-brand-info-light text-brand-info" },
  ONGOING: { label: "In Progress", className: "bg-brand-warning-light text-brand-warning" },
  COMPLETED: { label: "Completed", className: "bg-brand-success-light text-brand-success" },
  CANCELLED: { label: "Cancelled", className: "bg-brand-danger-light text-brand-danger" },
};

export default function TravellerBookingServiceClient() {
  const { vendors = [] } = useGetVendors();
  const { assignments = [], isLoading } = useGetVendorAssignments();

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const vendorsById = useMemo(() => {
    const map = new Map<number, any>();
    vendors.forEach((v: any) => map.set(v.id, v));
    return map;
  }, [vendors]);

  // Stats
  const stats = useMemo(() => {
    const totalCities = new Set<string>();
    const totalVendors = new Set<number>();
    const totalTravellers = new Set<number>();
    let totalAmount = 0;

    assignments.forEach((a: any) => {
      totalVendors.add(a.vendorId);
      totalTravellers.add(a.travellerId);
      totalAmount += Number(a.totalAmount || 0);
      const details = a.serviceWiseDetails;
      if (details && typeof details === "object") {
        Object.values(details).forEach((svcData: any) => {
          if (Array.isArray(svcData)) {
            svcData.forEach((c: any) => { if (c.city) totalCities.add(c.city); });
          } else if (svcData?.city) {
            totalCities.add(svcData.city);
          }
        });
      }
    });

    return {
      totalAssignments: assignments.length,
      totalCities: totalCities.size,
      totalVendors: totalVendors.size,
      totalTravellers: totalTravellers.size,
      totalAmount,
    };
  }, [assignments, vendorsById]);

  // Helper to extract city entries from serviceWiseDetails for a service
  const getCityEntries = (details: any, svc: string): any[] => {
    if (!details?.[svc]) return [];
    return Array.isArray(details[svc]) ? details[svc] : [details[svc]];
  };

  // Helper to extract all unique cities from an assignment
  const getAllCities = (a: any): string[] => {
    const cities: string[] = [];
    const details = a.serviceWiseDetails;
    if (details && typeof details === "object") {
      Object.values(details).forEach((svcData: any) => {
        if (Array.isArray(svcData)) {
          svcData.forEach((c: any) => { if (c.city && !cities.includes(c.city)) cities.push(c.city); });
        } else if (svcData?.city && !cities.includes(svcData.city)) {
          cities.push(svcData.city);
        }
      });
    }
    return cities;
  };

  return (
    <div className="space-y-6">
      <PrivatePageHeading
        icon={Users}
        title="Traveller Booking Service"
        description="Track traveller assignments by city, vendor, and service"
      />

      <StatsCardGrid
        items={[
          { label: "Travellers", value: stats.totalTravellers, icon: Users },
          { label: "Vendors", value: stats.totalVendors, icon: Users },
          { label: "Total Amount", value: `₹${stats.totalAmount.toLocaleString()}`, icon: Users },
        ]}
        columns={3}
        size="sm"
      />

      {/* Table */}
      {isLoading ? (
        <PageLoader size="section" text="Loading assignments..." />
      ) : (
        <TableWraper variant="brand">
          {assignments.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-brand-neutral-border">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={28} className="text-brand-500" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">No Assignments Found</h3>
              <p className="text-brand-neutral-muted text-sm mt-1">No vendor assignments have been created yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead>
                  <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
                   <th className="tbl-th w-8"></th>
                   {["Traveller", "Vendor", "Services", "Cities", "Amount", "Status", "Assigned Date"].map((h) => (
                     <th key={h} className="tbl-th">{h}</th>
                  ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-neutral-light">
                {assignments.map((a: any) => {
                  const statusCfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.UPCOMING;
                  const vendor = vendorsById.get(a.vendorId) || a.vendor;
                  const isExpanded = expandedId === a.id;
                  const allCities = getAllCities(a);
                  const details = a.serviceWiseDetails;

                  return (
                    <Fragment key={a.id}>
                      <tr
                        className="hover:bg-brand-neutral-light/50 transition-colors cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : a.id)}
                      >
                        <td className="py-3 px-3 text-gray-400">
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-gray-900">{a.traveller?.name || "-"}</p>
                          <p className="text-[10px] text-gray-400">{a.traveller?.travellerId}</p>
                        </td>
                        <td className="py-3 px-3 font-medium text-gray-900 text-xs">{vendor?.vendarCompanyName || vendor?.vendarName || a.vendor?.vendarCompanyName || a.vendor?.vendarName || "-"}</td>
                        <td className="py-3 px-3 text-xs">
                          {(a.services || []).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {a.services.map((s: string) => (
                                <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  s === "Hotel" ? "bg-brand-info-light text-brand-info" :
                                  s === "Car" ? "bg-brand-success-light text-brand-success" :
                                  "bg-brand-warning-light text-brand-warning"
                                }`}>{s}</span>
                              ))}
                            </div>
                          ) : <span className="text-gray-400">-</span>}
                        </td>
                        <td className="py-3 px-3 text-xs">
                          {allCities.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {allCities.map((c) => (
                                <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-primary-light text-brand-primary font-medium flex items-center gap-0.5">
                                  <MapPin size={8} /> {c}
                                </span>
                              ))}
                            </div>
                          ) : <span className="text-gray-400">-</span>}
                        </td>
                        <td className="py-3 px-3 text-xs font-semibold text-brand-neutral">₹{Number(a.totalAmount || 0).toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusCfg.className}`}>{statusCfg.label}</span>
                        </td>
                        <td className="py-3 px-3 text-xs text-brand-neutral-muted whitespace-nowrap">
                          {a.assignedDate ? new Date(a.assignedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                        </td>
                      </tr>

                       {/* Expanded Row - Service Breakdown */}
                       {isExpanded && (
                         <tr>
                           <td colSpan={7} className="px-4 py-3 bg-brand-neutral-light/80">
                             <table className="w-full text-xs">
                               <thead>
                                 <tr className="border-b border-brand-neutral-border">
<th className="tbl-th-sm py-1.5 px-2">Service</th>
                                      <th className="tbl-th-sm py-1.5 px-2">City</th>
                                      <th className="tbl-th-sm py-1.5 px-2">Check-in</th>
                                      <th className="tbl-th-sm py-1.5 px-2">Check-out</th>
                                      <th className="tbl-th-sm py-1.5 px-2">Duration</th>
                                      <th className="tbl-th-sm text-right py-1.5 px-2">Amount</th>
                                 </tr>
                               </thead>
                                <tbody className="divide-y divide-brand-neutral-light">
                                 {(a.services || []).flatMap((svc: string) => {
                                   const entries = getCityEntries(details, svc);
                                   const svcAmount = a.serviceWiseAmount?.[svc] || 0;

                                   if (entries.length === 0) {
                                     return [{
                                       svc, city: "-", startDate: "-", endDate: "-", duration: "-",
                                       amount: svcAmount, isFirst: true, entryCount: 0, entryIdx: 0,
                                     }];
                                   }

                                   return entries.map((entry: any, idx: number) => ({
                                     svc,
                                     city: entry.city || "-",
                                     startDate: entry.startDate
                                       ? new Date(entry.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                       : "-",
                                     endDate: entry.endDate
                                       ? new Date(entry.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                       : "-",
                                     duration: entry.nights != null
                                       ? `${entry.nights} Night${entry.nights > 1 ? "s" : ""}`
                                       : entry.days != null
                                         ? `${entry.days} Day${entry.days > 1 ? "s" : ""}`
                                         : "-",
                                     amount: idx === 0 ? svcAmount : 0,
                                     isFirst: idx === 0,
                                     entryCount: entries.length,
                                     entryIdx: idx,
                                   }));
                                 }).map((row: any, idx: number) => (
                                   <tr key={idx} className="hover:bg-white/50">
                                     <td className="py-1.5 px-2 font-semibold text-brand-neutral">
                                       {row.isFirst ? (
                                         <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                           row.svc === "Hotel" ? "bg-brand-info-light text-brand-info" :
                                           row.svc === "Car" ? "bg-brand-success-light text-brand-success" :
                                           "bg-brand-warning-light text-brand-warning"
                                         }`}>{row.svc}</span>
                                       ) : ""}
                                     </td>
                                     <td className="py-1.5 px-2 text-brand-neutral flex items-center gap-1">
                                       {row.city !== "-" && <MapPin size={10} className="text-indigo-400" />}
                                       {row.city}
                                     </td>
                                     <td className="py-1.5 px-2 text-brand-neutral">{row.startDate}</td>
                                     <td className="py-1.5 px-2 text-brand-neutral">{row.endDate}</td>
                                     <td className="py-1.5 px-2">
                                       {row.duration !== "-" && (
                                         <span className="px-1.5 py-0.5 rounded bg-gray-100 text-brand-neutral font-semibold">{row.duration}</span>
                                       )}
                                     </td>
                                     <td className="py-1.5 px-2 text-right font-semibold text-brand-neutral">
                                       {row.amount > 0 ? `₹${Number(row.amount).toLocaleString()}` : ""}
                                     </td>
                                   </tr>
                                 ))}
                               </tbody>
                               <tfoot>
                                  <tr className="border-t border-brand-neutral-border bg-brand-neutral-light/50">
                                   <td colSpan={5} className="py-2 px-2 text-[11px] font-bold text-brand-neutral uppercase">Total</td>
                                   <td className="py-2 px-2 text-right text-sm font-bold text-gray-900">₹{Number(a.totalAmount || 0).toLocaleString()}</td>
                                 </tr>
                               </tfoot>
                             </table>

                             {a.notes && (
                               <p className="text-[11px] text-brand-neutral-muted mt-2 italic">Notes: {a.notes}</p>
                             )}
                           </td>
                         </tr>
                       )}
                    </Fragment>
                  );
                })}
                </tbody>
              </table>
            </div>
          )}
        </TableWraper>
      )}
    </div>
  );
}
