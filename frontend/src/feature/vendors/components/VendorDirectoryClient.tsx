"use client";

import React, { useMemo, useState } from "react";
import { useGetVendors } from "@/feature/vendors/api/useVendorHooks";
import {
  Search, Phone, MessageCircle, Mail, MapPin, Filter,
  AlertTriangle, Truck, Hotel, Compass, Briefcase, ArrowUpDown,
} from "lucide-react";
import PageLoader from "@/components/shared/PageLoader";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import TableWraper from "@/components/shared/TableWraper";
import EmptyState from "@/components/shared/EmptyState";

const SERVICE_CONFIG: Record<string, { label: string; cls: string }> = {
  HOTEL: { label: "Hotel", cls: "bg-brand-info-light text-brand-info" },
  GUIDE_VENDOR: { label: "Guide", cls: "bg-brand-warning-light text-brand-warning" },
  ALL: { label: "All Services", cls: "bg-teal-100 text-teal-700" },
};

export default function VendorDirectoryClient() {
  const { vendors = [], isLoading, error } = useGetVendors();
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<"name" | "company" | "service">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const allCities = useMemo(() => {
    const citySet = new Set<string>();
    vendors.forEach((v: any) => {
      (v.vendarWorkingAreas || []).forEach((city: string) => citySet.add(city));
    });
    return Array.from(citySet).sort();
  }, [vendors]);

  const filtered = useMemo(() => {
    let list = vendors.filter((v: any) => {
      const query = search.toLowerCase();
      const matchSearch =
        !query ||
        (v.vendarCompanyName || v.vendarName)?.toLowerCase().includes(query) ||
        v.vendarCompanyName?.toLowerCase().includes(query) ||
        v.vendarEmail?.toLowerCase().includes(query) ||
        v.vendarMobile?.includes(query) ||
        (v.vendarWorkingAreas || []).some((c: string) => c.toLowerCase().includes(query));

      const matchCity =
        cityFilter === "ALL" || (v.vendarWorkingAreas || []).includes(cityFilter);

      const matchService =
        serviceFilter === "ALL" ||
        v.vendarServiceType === serviceFilter ||
        v.vendarServiceType === "ALL";

      return matchSearch && matchCity && matchService;
    });

    list.sort((a: any, b: any) => {
      let cmp = 0;
      if (sortKey === "name") cmp = (a.vendarCompanyName || a.vendarName || "").localeCompare(b.vendarCompanyName || b.vendarName || "");
      else if (sortKey === "company") cmp = (a.vendarCompanyName || "").localeCompare(b.vendarCompanyName || "");
      else if (sortKey === "service") cmp = (a.vendarServiceType || "").localeCompare(b.vendarServiceType || "");
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [vendors, search, cityFilter, serviceFilter, sortKey, sortDir]);

  const toggleSort = (key: "name" | "company" | "service") => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  if (isLoading) {
    return (
      <PageLoader size="page" text="Loading vendor directory..." />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center bg-white px-8 py-6 rounded-xl border border-red-100 shadow-sm">
          <AlertTriangle size={28} className="text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-semibold text-sm">Failed to load vendors</p>
        </div>
      </div>
    );
  }

  const SortIcon = ({ col }: { col: string }) => (
    <ArrowUpDown size={12} className={`inline ml-1 ${sortKey === col ? "text-brand-600" : "text-slate-300"}`} />
  );

  return (
    <div className="space-y-6">
      <PrivatePageHeading
        icon={Truck}
        title="Vendor Directory"
        description="Find and contact vendors by city and service type"
      />

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-brand-neutral-border p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, company, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-brand-neutral-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-brand-neutral-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition appearance-none"
            >
              <option value="ALL">All Cities</option>
              {allCities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-brand-neutral-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition appearance-none"
            >
              <option value="ALL">All Services</option>
              <option value="HOTEL">Hotel</option>
              <option value="GUIDE_VENDOR">Guide</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Showing <span className="font-bold text-brand-neutral">{filtered.length}</span> of {vendors.length} vendors
          </p>
          {(search || cityFilter !== "ALL" || serviceFilter !== "ALL") && (
            <button
              onClick={() => { setSearch(""); setCityFilter("ALL"); setServiceFilter("ALL"); }}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <TableWraper variant="brand" className="overflow-x-auto">
        {filtered.length === 0 ? (
          <EmptyState 
            title="No vendors found" 
            description="Try adjusting your search or filters" 
            icon={Truck} 
            className="border-0 shadow-none bg-transparent py-16" 
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
                <th
                  className="tbl-th cursor-pointer hover:text-brand-600 transition select-none"
                  onClick={() => toggleSort("name")}
                >
                  Name <SortIcon col="name" />
                </th>
                <th
                  className="tbl-th cursor-pointer hover:text-brand-600 transition select-none"
                  onClick={() => toggleSort("company")}
                >
                  Company <SortIcon col="company" />
                </th>
                <th
                  className="tbl-th cursor-pointer hover:text-brand-600 transition select-none"
                  onClick={() => toggleSort("service")}
                >
                  Service Type <SortIcon col="service" />
                </th>
                <th className="tbl-th">Working Areas</th>
                <th className="tbl-th">Phone</th>
                <th className="tbl-th">Email</th>
                <th className="tbl-th">Status</th>
                <th className="tbl-th-center">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-neutral-light">
              {filtered.map((v: any) => {
                const svc = SERVICE_CONFIG[v.vendarServiceType] || SERVICE_CONFIG.ALL;
                const phone = v.vendarMobile?.replace(/[^0-9]/g, "");
                return (
                  <tr key={v.id} className="hover:bg-brand-neutral-light/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {v.vendarProfileImage ? (
                          <img src={v.vendarProfileImage} className="w-8 h-8 rounded-full object-cover border border-brand-neutral-border" />
                        ) : (
                          <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold border border-brand-50 shrink-0">
                            {(v.vendarCompanyName || v.vendarName)?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 text-xs leading-tight">{v.vendarCompanyName || v.vendarName}</p>
                          <p className="text-[10px] text-gray-400">{v.vendarMobile || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-brand-neutral">{v.vendarCompanyName || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-bold ${svc.cls}`}>
                        {svc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(v.vendarWorkingAreas || []).slice(0, 3).map((city: string) => (
                          <span key={city} className="text-[10px] px-1.5 py-0.5 rounded bg-brand-primary-light text-brand-primary font-medium">{city}</span>
                        ))}
                        {(v.vendarWorkingAreas || []).length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-neutral-light text-brand-neutral-muted font-medium">+{v.vendarWorkingAreas.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-brand-neutral font-medium whitespace-nowrap">{v.vendarMobile || "—"}</td>
                    <td className="px-4 py-3 text-xs text-brand-neutral-muted max-w-[180px] truncate" title={v.vendarEmail}>{v.vendarEmail || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${v.vendarIsActive ? "bg-brand-success-light text-brand-success" : "bg-gray-100 text-brand-neutral-muted"}`}>
                        {v.vendarIsActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={phone ? `tel:+91${phone}` : "#"}
                          className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-brand-success-light border border-green-200 transition"
                          title="Call"
                        >
                          <Phone size={13} />
                        </a>
                        <a
                          href={phone ? `https://wa.me/91${phone}` : "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md bg-brand-success-light text-brand-success hover:bg-brand-success-light border border-emerald-200 transition"
                          title="WhatsApp"
                        >
                          <MessageCircle size={13} />
                        </a>
                        <a
                          href={v.vendarEmail ? `mailto:${v.vendarEmail}` : "#"}
                          className="p-1.5 rounded-md bg-brand-info-light text-brand-info hover:bg-brand-info-light border border-blue-200 transition"
                          title="Email"
                        >
                          <Mail size={13} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </TableWraper>
    </div>
  );
}
