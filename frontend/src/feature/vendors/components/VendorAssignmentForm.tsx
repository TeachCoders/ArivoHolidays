"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FormActionButton from "@/components/shared/customBtns";
import { useCreateVendorAssignment, useUpdateVendorAssignment } from "@/feature/vendors/api/useVendorHooks";
import { useGetPackageBuilder } from "@/feature/leadFollowup/api/useLeadFollowup";
import { Hotel, Car, MapPin, IndianRupee, Plus, Trash2, FileText, Briefcase } from "lucide-react";
import PageLoader from "@/components/shared/PageLoader";

interface CityEntry {
  city: string;
  startDate: string;
  endDate: string;
  unitPrice: number;
  totalPrice: number;
}

interface InvoiceItem {
  location: string;
  ServiceName: string;
  ServcieQty: number;
  UnitPrice: number;
  TotalPrice: number;
  hotelName?: string;
  hotelType?: string;
  carName?: string;
  carType?: string;
  vendorId?: number;
}

interface VendorAssignmentFormProps {
  travellers: Array<{ id: number; name: string; travellerId: string; payments?: any[]; requirement?: any }>;
  vendors: Array<{ id: number; vendarName: string; vendarCompanyName?: string; vendarServiceType: string; vendarWorkingAreas: string[] }>;
  initialData?: any;
  invoiceItems?: InvoiceItem[];
  invoiceTravelDate?: string;
  onSuccess?: () => void;
}

const ALL_SERVICE_CHIPS = [
  { key: "Hotel", label: "Hotel", icon: Hotel },
  { key: "Car", label: "Car / Cab", icon: Car },
  { key: "Guide", label: "Guide", icon: MapPin },
];

function getAvailableServices(vendorServiceType: string) {
  switch (vendorServiceType) {
    case "HOTEL":
    case "HOTEL_VENDOR":
      return ALL_SERVICE_CHIPS.filter((s) => s.key === "Hotel");
    case "CAB_OPERATOR":
    case "TRANSPORT_VENDOR":
      return ALL_SERVICE_CHIPS.filter((s) => s.key === "Car");
    case "GUIDE_VENDOR":
      return ALL_SERVICE_CHIPS.filter((s) => s.key === "Guide");
    case "ALL":
    default:
      return ALL_SERVICE_CHIPS;
  }
}

function parseExistingServiceDetails(details: any): Record<string, CityEntry[]> {
  if (!details || typeof details !== "object") return {};
  const result: Record<string, CityEntry[]> = {};
  for (const [svc, val] of Object.entries(details)) {
    if (Array.isArray(val)) {
      result[svc] = val.map((c: any) => ({
        city: c.city || "",
        startDate: c.startDate || "",
        endDate: c.endDate || "",
        unitPrice: Number(c.unitPrice) || 0,
        totalPrice: Number(c.totalPrice) || 0,
      }));
    } else if (val && typeof val === "object") {
      const d = val as any;
      result[svc] = [{
        city: d.city || "",
        startDate: d.startDate || "",
        endDate: d.endDate || "",
        unitPrice: Number(d.unitPrice) || 0,
        totalPrice: Number(d.totalPrice) || 0,
      }];
    }
  }
  return result;
}

export function VendorAssignmentForm({ travellers, vendors, initialData, invoiceItems: propInvoiceItems, invoiceTravelDate: propInvoiceTravelDate, onSuccess }: VendorAssignmentFormProps) {
  const { mutate: createAssignment, isPending: isCreating } = useCreateVendorAssignment();
  const { mutate: updateAssignment, isPending: isUpdating } = useUpdateVendorAssignment();

  const [selectedTravellerId, setSelectedTravellerId] = useState<string>(initialData?.travellerId?.toString() || "");

  // Jab vendor page se assign karte ho (bina invoiceItems prop ke), traveller select hone pe package builder fetch karo
  const fetchLeadId = (!propInvoiceItems || propInvoiceItems.length === 0) && selectedTravellerId ? selectedTravellerId : "";
  const { data: fetchedPackageResponse, isLoading: isLoadingPackage } = useGetPackageBuilder(fetchLeadId);

  // Use prop invoice items if provided, otherwise use fetched data
  const invoiceItems = useMemo(() => {
    if (propInvoiceItems && propInvoiceItems.length > 0) return propInvoiceItems;
    const fetchedItems = fetchedPackageResponse?.data?.[0]?.items;
    return fetchedItems || [];
  }, [propInvoiceItems, fetchedPackageResponse]);

  const invoiceTravelDate = useMemo(() => {
    if (propInvoiceTravelDate) return propInvoiceTravelDate;
    return fetchedPackageResponse?.data?.[0]?.travelDate || "";
  }, [propInvoiceTravelDate, fetchedPackageResponse]);

  const existingServiceAmounts = useMemo(() => {
    if (initialData?.serviceWiseAmount && typeof initialData.serviceWiseAmount === "object") {
      return initialData.serviceWiseAmount;
    }
    return {};
  }, [initialData]);

  const existingServiceDetails = useMemo(() => {
    return parseExistingServiceDetails(initialData?.serviceWiseDetails);
  }, [initialData]);

  // Auto-fill data from invoice items - grouped by service, then by city
  const invoiceAutoFill = useMemo(() => {
    if (!invoiceItems || invoiceItems.length === 0) return null;

    const serviceMap: Record<string, { cities: string[]; totalAmount: number; items: InvoiceItem[] }> = {};

    for (const item of invoiceItems) {
      const serviceName = item.ServiceName?.trim();
      if (!serviceName) continue;

      const key = serviceName === "Hotel" || serviceName === "Hotels" ? "Hotel"
        : serviceName === "Car" || serviceName === "Cars" || serviceName === "Cab" || serviceName === "Transport" ? "Car"
        : serviceName === "Guide" || serviceName === "Guides" ? "Guide"
        : serviceName;

      if (!serviceMap[key]) {
        serviceMap[key] = { cities: [], totalAmount: 0, items: [] };
      }
      serviceMap[key].totalAmount += Number(item.TotalPrice) || 0;
      serviceMap[key].items.push(item);
      if (item.location && !serviceMap[key].cities.includes(item.location)) {
        serviceMap[key].cities.push(item.location);
      }
    }

    return { serviceMap, travelDate: invoiceTravelDate || "" };
  }, [invoiceItems, invoiceTravelDate]);

  const [form, setForm] = useState({
    travellerId: initialData?.travellerId?.toString() || "",
    vendorId: initialData?.vendorId?.toString() || "",
    packageType: "INDIVIDUAL",
    services: (initialData?.services as string[]) || [],
    assignedDate: initialData?.assignedDate
      ? new Date(initialData.assignedDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    notes: initialData?.notes || "",
    status: initialData?.status || "UPCOMING",
  });

  const [serviceAmounts, setServiceAmounts] = useState<Record<string, string>>({
    Hotel: existingServiceAmounts.Hotel?.toString() || "",
    Car: existingServiceAmounts.Car?.toString() || "",
    Guide: existingServiceAmounts.Guide?.toString() || "",
  });

  const [serviceCityEntries, setServiceCityEntries] = useState<Record<string, CityEntry[]>>({
    Hotel: existingServiceDetails.Hotel?.length ? existingServiceDetails.Hotel : [{ city: "", startDate: "", endDate: "", unitPrice: 0, totalPrice: 0 }],
    Car: existingServiceDetails.Car?.length ? existingServiceDetails.Car : [{ city: "", startDate: "", endDate: "", unitPrice: 0, totalPrice: 0 }],
    Guide: existingServiceDetails.Guide?.length ? existingServiceDetails.Guide : [{ city: "", startDate: "", endDate: "", unitPrice: 0, totalPrice: 0 }],
  });

  // Auto-fill from invoice items when modal opens (only if no existing assignment data)
  useEffect(() => {
    if (!invoiceAutoFill || initialData?.id) return;

    const { serviceMap, travelDate } = invoiceAutoFill;
    const serviceKeys = Object.keys(serviceMap);
    if (serviceKeys.length === 0) return;

    setForm((prev) => ({
      ...prev,
      services: serviceKeys,
    }));

    const newAmounts: Record<string, string> = { Hotel: "", Car: "", Guide: "" };
    const newCityEntries: Record<string, CityEntry[]> = {};

    for (const svc of serviceKeys) {
      const data = serviceMap[svc];
      newAmounts[svc] = "0";

      newCityEntries[svc] = data.cities.map((city) => {
        const item = data.items.find((i) => i.location === city);
        const qty = item?.ServcieQty || 0;
        const startDate = travelDate || "";
        let endDate = "";
        if (startDate && qty > 0) {
          const d = new Date(startDate);
          d.setDate(d.getDate() + qty);
          endDate = d.toISOString().split("T")[0];
        }
        return { city, startDate, endDate, unitPrice: 0, totalPrice: 0 };
      });
    }

    setServiceAmounts(newAmounts);
    setServiceCityEntries((prev) => ({
      ...prev,
      ...newCityEntries,
    }));
  }, [invoiceAutoFill, initialData?.id]);

  // Max unit price per city+service from invoice items (quotation price)
  const maxUnitPriceMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!invoiceItems || invoiceItems.length === 0) return map;
    for (const item of invoiceItems) {
      const svcKey = item.ServiceName?.trim() === "Hotel" || item.ServiceName?.trim() === "Hotels" ? "Hotel"
        : item.ServiceName?.trim() === "Car" || item.ServiceName?.trim() === "Cars" || item.ServiceName?.trim() === "Cab" || item.ServiceName?.trim() === "Transport" ? "Car"
        : item.ServiceName?.trim() === "Guide" || item.ServiceName?.trim() === "Guides" ? "Guide"
        : item.ServiceName?.trim();
      const key = `${svcKey}-${item.location}`;
      const currentMax = map[key] || 0;
      if ((Number(item.UnitPrice) || 0) > currentMax) {
        map[key] = Number(item.UnitPrice) || 0;
      }
    }
    return map;
  }, [invoiceItems]);

  // DIRECT auto-fill: jab vendor page se aao aur traveller select karo toh package data se seedha fill karo
  useEffect(() => {
    if (!fetchedPackageResponse?.data || fetchedPackageResponse.data.length === 0) return;
    if (initialData?.id) return; // existing assignment hai toh mat overwrite karo

    const latestInvoice = fetchedPackageResponse.data[0];
    const items = latestInvoice?.items;
    if (!items || items.length === 0) return;

    const travelDate = latestInvoice?.travelDate || "";

    const serviceMap: Record<string, { cities: string[]; totalAmount: number; items: InvoiceItem[] }> = {};
    for (const item of items) {
      const serviceName = item.ServiceName?.trim();
      if (!serviceName) continue;
      const key = serviceName === "Hotel" || serviceName === "Hotels" ? "Hotel"
        : serviceName === "Car" || serviceName === "Cars" || serviceName === "Cab" || serviceName === "Transport" ? "Car"
        : serviceName === "Guide" || serviceName === "Guides" ? "Guide"
        : serviceName;
      if (!serviceMap[key]) serviceMap[key] = { cities: [], totalAmount: 0, items: [] };
      serviceMap[key].totalAmount += Number(item.TotalPrice) || 0;
      serviceMap[key].items.push(item);
      if (item.location && !serviceMap[key].cities.includes(item.location)) {
        serviceMap[key].cities.push(item.location);
      }
    }

    const serviceKeys = Object.keys(serviceMap);
    if (serviceKeys.length === 0) return;

    setForm((prev) => ({ ...prev, services: serviceKeys }));

    const newAmounts: Record<string, string> = { Hotel: "", Car: "", Guide: "" };
    const newCityEntries: Record<string, CityEntry[]> = {};

    for (const svc of serviceKeys) {
      const data = serviceMap[svc];
      newAmounts[svc] = "0";
      newCityEntries[svc] = data.cities.map((city) => {
        const item = data.items.find((i) => i.location === city);
        const qty = item?.ServcieQty || 0;
        const startDate = travelDate || "";
        let endDate = "";
        if (startDate && qty > 0) {
          const d = new Date(startDate);
          d.setDate(d.getDate() + qty);
          endDate = d.toISOString().split("T")[0];
        }
        return { city, startDate, endDate, unitPrice: 0, totalPrice: 0 };
      });
    }

    setServiceAmounts(newAmounts);
    setServiceCityEntries((prev) => ({ ...prev, ...newCityEntries }));
  }, [fetchedPackageResponse, initialData?.id]);

  const selectedVendor = useMemo(() => {
    if (!form.vendorId) return null;
    return vendors.find((v) => v.id === Number(form.vendorId)) || null;
  }, [form.vendorId, vendors]);

  const selectedTraveller = useMemo(() => {
    if (!form.travellerId) return null;
    return travellers.find((t) => t.id === Number(form.travellerId)) || null;
  }, [form.travellerId, travellers]);

  const requiredServices = useMemo(() => {
    const req = selectedTraveller?.requirement;
    if (!req) return [];
    const services: string[] = [];
    if (req.serviceType) {
      req.serviceType.split(",").forEach((s: string) => {
        const trimmed = s.trim();
        if (trimmed) services.push(trimmed);
      });
    }
    if (req.needGuide && !services.includes("Guide")) services.push("Guide");
    if (req.needActivities && !services.includes("Activity")) services.push("Activity");
    return services;
  }, [selectedTraveller]);

  const availableServices = useMemo(() => {
    if (!selectedVendor) return ALL_SERVICE_CHIPS;
    return getAvailableServices(selectedVendor.vendarServiceType);
  }, [selectedVendor]);

  const cityOptions = useMemo(() => {
    const vendorCities = selectedVendor?.vendarWorkingAreas || [];
    const invoiceCities = invoiceItems?.map((i: InvoiceItem) => i.location).filter(Boolean) || [];
    const allCities = [...new Set([...vendorCities, ...invoiceCities])];
    return allCities;
  }, [selectedVendor, invoiceItems]);

  const isLoading = isCreating || isUpdating;

  // Calculate total from city entries (per-city totalPrice sum)
  const calculatedTotal = useMemo(() => {
    let total = 0;
    for (const svc of form.services) {
      const entries = serviceCityEntries[svc] || [];
      for (const entry of entries) {
        total += entry.totalPrice || 0;
      }
    }
    return total;
  }, [form.services, serviceCityEntries]);

  // Calculate per-service total from city entries
  const getServiceTotal = (svc: string): number => {
    const entries = serviceCityEntries[svc] || [];
    return entries.reduce((sum, e) => sum + (e.totalPrice || 0), 0);
  };

  const toggleService = (svc: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(svc)
        ? prev.services.filter((s) => s !== svc)
        : [...prev.services, svc],
    }));
  };

  const handleCityEntryChange = (service: string, index: number, field: keyof CityEntry, value: string | number) => {
    setServiceCityEntries((prev) => {
      const updated = {
        ...prev,
        [service]: (prev[service] || []).map((entry, i) => {
          if (i !== index) return entry;
          const newEntry = { ...entry, [field]: value };
          if (field === "unitPrice" || field === "endDate" || field === "startDate") {
            const nights = calcNightsDays(
              field === "startDate" ? (value as string) : entry.startDate,
              field === "endDate" ? (value as string) : entry.endDate
            );
            if (nights !== null) {
              const price = field === "unitPrice" ? (Number(value) || 0) : entry.unitPrice;
              newEntry.totalPrice = price * nights;
            }
          }
          return newEntry;
        }),
      };
      const svcTotal = updated[service]?.reduce((sum, e) => sum + (e.totalPrice || 0), 0) || 0;
      setServiceAmounts((prevAmt) => ({ ...prevAmt, [service]: svcTotal.toString() }));
      return updated;
    });
  };

  const addCityToService = (service: string) => {
    setServiceCityEntries((prev) => ({
      ...prev,
      [service]: [...(prev[service] || []), { city: "", startDate: "", endDate: "", unitPrice: 0, totalPrice: 0 }],
    }));
  };

  const removeCityFromService = (service: string, index: number) => {
    setServiceCityEntries((prev) => ({
      ...prev,
      [service]: (prev[service] || []).filter((_, i) => i !== index),
    }));
  };

  const calcNightsDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return null;
    const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const serviceWiseAmount: Record<string, number> = {};
    form.services.forEach((svc) => {
      const amt = getServiceTotal(svc);
      if (amt > 0) serviceWiseAmount[svc] = amt;
    });

    const serviceWiseDetails: Record<string, any> = {};
    form.services.forEach((svc) => {
      const entries = serviceCityEntries[svc] || [];
      const validEntries = entries.filter((e) => e.startDate && e.endDate);
      if (validEntries.length > 0) {
        const isHotel = svc === "Hotel";
        serviceWiseDetails[svc] = validEntries.map((entry) => {
          const duration = calcNightsDays(entry.startDate, entry.endDate);
          return {
            city: entry.city || "",
            startDate: entry.startDate,
            endDate: entry.endDate,
            unitPrice: entry.unitPrice,
            totalPrice: entry.totalPrice,
            ...(isHotel ? { nights: duration } : { days: duration }),
          };
        });
      }
    });

    const payload = {
      travellerId: Number(form.travellerId),
      vendorId: Number(form.vendorId),
      packageType: "INDIVIDUAL",
      services: form.services,
      totalAmount: calculatedTotal,
      serviceWiseAmount: Object.keys(serviceWiseAmount).length > 0 ? serviceWiseAmount : undefined,
      serviceWiseDetails: Object.keys(serviceWiseDetails).length > 0 ? serviceWiseDetails : undefined,
      assignedDate: form.assignedDate,
      notes: form.notes,
      status: form.status,
    };

    if (initialData?.id) {
      updateAssignment({ id: initialData.id, payload }, { onSuccess: () => onSuccess?.() });
    } else {
      createAssignment(payload, { onSuccess: () => onSuccess?.() });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Invoice Quotation Preview - Bill Style */}
      {invoiceAutoFill && invoiceItems && invoiceItems.length > 0 && (
        <div className="border border-amber-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border-b border-amber-200 flex items-center gap-2">
            <FileText size={16} className="text-brand-warning" />
            <span className="text-sm font-bold text-amber-800">Quotation / Bill Summary</span>
          </div>
          <div className="p-4 space-y-3">
            {invoiceAutoFill.travelDate && (
              <div className="text-[11px] text-brand-neutral-muted mb-2">
                <span className="font-semibold text-brand-neutral">Travel Date: </span>
                {new Date(invoiceAutoFill.travelDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            )}
            {(() => {
              const grouped: Record<string, Record<string, InvoiceItem[]>> = {};
              for (const item of invoiceItems) {
                const city = item.location || "N/A";
                const svc = item.ServiceName?.trim() || "Other";
                if (!grouped[city]) grouped[city] = {};
                if (!grouped[city][svc]) grouped[city][svc] = [];
                grouped[city][svc].push(item);
              }
              let grandTotal = 0;
              return Object.entries(grouped).map(([city, services]) => (
                <div key={city} className="border border-brand-neutral-border rounded-lg overflow-hidden">
                  <div className="bg-brand-neutral-light px-3 py-1.5 border-b border-brand-neutral-border">
                    <span className="text-xs font-bold text-brand-neutral flex items-center gap-1">
                      <MapPin size={12} className="text-indigo-500" /> {city}
                    </span>
                  </div>
                  <table className="tbl-xs">
                    <thead>
                      <tr className="border-b border-brand-neutral-border">
                        <th className="tbl-th px-3 py-1.5">Service</th>
                        <th className="tbl-th px-3 py-1.5">Name</th>
                        <th className="tbl-th-center px-3 py-1.5">Qty</th>
                        <th className="tbl-th-right px-3 py-1.5">Unit ₹</th>
                        <th className="tbl-th-right px-3 py-1.5">Total ₹</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(services).map(([svcName, items]) =>
                        items.map((item, idx) => {
                          const qtyLabel = item.ServcieQty
                            ? (item.ServiceName?.toLowerCase().includes("hotel")
                                ? `${item.ServcieQty}N`
                                : `${item.ServcieQty}D`)
                            : "-";
                          grandTotal += Number(item.TotalPrice) || 0;
                          return (
                            <tr key={`${svcName}-${idx}`} className="border-b border-brand-neutral-light last:border-0">
                              <td className="px-3 py-1.5 font-semibold text-brand-neutral">{svcName}</td>
                              <td className="px-3 py-1.5 text-brand-neutral">
                                {item.hotelName || item.carName || "-"}
                                {(item.hotelType || item.carType) && (
                                  <span className="text-gray-400 ml-1">({item.hotelType || item.carType})</span>
                                )}
                              </td>
                              <td className="px-3 py-1.5 text-center font-medium text-brand-neutral">{qtyLabel}</td>
                              <td className="px-3 py-1.5 text-right text-brand-neutral">₹{Number(item.UnitPrice).toLocaleString("en-IN")}</td>
                              <td className="px-3 py-1.5 text-right font-semibold text-gray-800">₹{Number(item.TotalPrice).toLocaleString("en-IN")}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              ));
            })()}
            <div className="flex justify-end pt-2 border-t border-amber-200">
              <span className="text-sm font-bold text-amber-700">
                Grand Total: ₹{invoiceItems.reduce((sum: number, item: InvoiceItem) => sum + (Number(item.TotalPrice) || 0), 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Traveller Select */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-brand-neutral">Traveller / Lead</Label>
        <select
          required
          value={form.travellerId}
          onChange={(e) => {
            const tId = e.target.value;
            setForm((p) => ({ ...p, travellerId: tId }));
            setSelectedTravellerId(tId);
          }}
          className="flex h-10 w-full rounded-lg border border-brand-neutral-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
        >
          <option value="">-- Select Confirmed Traveller --</option>
          {travellers.map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.travellerId})</option>
          ))}
        </select>
        {travellers.length === 0 && (
          <p className="text-xs text-brand-warning">No confirmed travellers available (lead must have approved payment)</p>
        )}
        {isLoadingPackage && form.travellerId && (
          <p className="text-xs text-brand-primary flex items-center gap-1.5 mt-1">
            <PageLoader size="inline" /> Loading traveller's quotation...
          </p>
        )}
        {requiredServices.length > 0 && (
          <div className="mt-2 px-3 py-2.5 bg-brand-neutral-light border border-brand-neutral-border rounded-lg space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-brand-neutral-muted uppercase tracking-wider">Traveller Requires:</span>
              {requiredServices.map((svc) => {
                const isSelected = form.services.includes(svc);
                return (
                  <span
                    key={svc}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
                      isSelected
                        ? "bg-brand-success-light text-brand-success border border-emerald-200"
                        : "bg-brand-neutral-light text-brand-neutral-muted border border-brand-neutral-border"
                    }`}
                  >
                    {isSelected ? "✓" : "○"} {svc}
                  </span>
                );
              })}
            </div>
            {(selectedTraveller?.requirement?.startDate || selectedTraveller?.requirement?.endDate) && (
              <div className="flex items-center gap-3 text-[11px] text-brand-neutral">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Travel:</span>
                {selectedTraveller?.requirement?.startDate && (
                  <span className="font-semibold">
                    {new Date(selectedTraveller.requirement.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                )}
                {selectedTraveller?.requirement?.startDate && selectedTraveller?.requirement?.endDate && (
                  <span className="text-slate-400">&rarr;</span>
                )}
                {selectedTraveller?.requirement?.endDate && (
                  <span className="font-semibold">
                    {new Date(selectedTraveller.requirement.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vendor Select */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-brand-neutral">Vendor</Label>
        <select
          required
          value={form.vendorId}
          onChange={(e) => {
            const vendorId = e.target.value;
            setForm((p) => {
              const vendor = vendors.find((v) => v.id === Number(vendorId));
              const available = vendor ? getAvailableServices(vendor.vendarServiceType) : ALL_SERVICE_CHIPS;
              const availableKeys = available.map((s) => s.key);
              return {
                ...p,
                vendorId,
                services: p.services.filter((s) => availableKeys.includes(s)),
              };
            });
          }}
          className="flex h-10 w-full rounded-lg border border-brand-neutral-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
        >
          <option value="">-- Select Vendor --</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>{v.vendarCompanyName ? `${v.vendarCompanyName} (${v.vendarName})` : v.vendarName}</option>
          ))}
        </select>
        {selectedVendor && (
          <p className="text-xs text-brand-neutral-muted">
            Services: <span className="font-semibold text-brand-600">{selectedVendor.vendarServiceType === "ALL" ? "All (Hotel, Car, Guide)" : selectedVendor.vendarServiceType.replace("_", " ")}</span>
            {cityOptions.length > 0 && (
              <> | Cities: <span className="font-semibold text-brand-primary">{cityOptions.join(", ")}</span></>
            )}
          </p>
        )}
      </div>

      <input type="hidden" value="INDIVIDUAL" />

      {/* Service Chips */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-brand-neutral">Select Services</Label>
        {!form.vendorId ? (
          <p className="text-xs text-gray-400 italic">Select a vendor first to see available services</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableServices.map(({ key, label, icon: Icon }) => {
              const selected = form.services.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleService(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    selected
                      ? "btn-primary text-white border-brand-600 shadow-sm"
                      : "bg-white text-brand-neutral border-brand-neutral-border hover:border-brand-300 hover:text-brand-600"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              );
            })}
          </div>
        )}
        {form.services.length === 0 && form.vendorId && (
          <p className="text-xs text-brand-warning">Please select at least one service</p>
        )}
      </div>

      {/* Service-wise Details TABLE */}
      {form.services.length > 0 && (
        <div className="space-y-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee size={14} className="text-brand-primary" />
            <Label className="text-sm font-semibold text-brand-primary">Service-wise Details</Label>
          </div>

          {form.services.map((svc) => {
            const isHotel = svc === "Hotel";
            const entries = serviceCityEntries[svc] || [];
            const svcTotal = getServiceTotal(svc);

            return (
              <div key={svc} className="bg-white rounded-lg border border-indigo-100 overflow-hidden">
                {/* Service Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-brand-primary" />
                    <span className="text-xs font-bold text-brand-primary uppercase">{svc}</span>
                  </div>
                  <span className="text-xs font-bold text-brand-primary">
                    Total: ₹{svcTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="tbl-xs">
                    <thead>
                      <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
                        <th className="tbl-th px-3 py-2">City</th>
                        <th className="tbl-th px-3 py-2">
                          {isHotel ? "Check-in" : "Start Date"}
                        </th>
                        <th className="tbl-th px-3 py-2">
                          {isHotel ? "Check-out" : "End Date"}
                        </th>
                        <th className="tbl-th-center px-3 py-2">
                          {isHotel ? "Nights" : "Days"}
                        </th>
                        <th className="tbl-th-right px-3 py-2">Unit Price</th>
                        <th className="tbl-th-right px-3 py-2">Total Price</th>
                        <th className="tbl-th w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, idx) => {
                        const duration = calcNightsDays(entry.startDate, entry.endDate);
                        return (
                          <tr key={idx} className="border-b border-brand-neutral-border last:border-0 hover:bg-brand-neutral-light/50">
                            <td className="px-2 py-1.5">
                              {cityOptions.length > 0 ? (
                                <select
                                  value={entry.city}
                                  onChange={(e) => handleCityEntryChange(svc, idx, "city", e.target.value)}
                                  className="w-full rounded border border-brand-neutral-border px-2 py-1.5 text-xs bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                >
                                  <option value="">-- Select --</option>
                                  {cityOptions.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  placeholder="City name"
                                  value={entry.city}
                                  onChange={(e) => handleCityEntryChange(svc, idx, "city", e.target.value)}
                                  className="w-full rounded border border-brand-neutral-border px-2 py-1.5 text-xs bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="date"
                                value={entry.startDate}
                                onChange={(e) => handleCityEntryChange(svc, idx, "startDate", e.target.value)}
                                className="w-full rounded border border-brand-neutral-border px-2 py-1.5 text-xs bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="date"
                                value={entry.endDate}
                                onChange={(e) => handleCityEntryChange(svc, idx, "endDate", e.target.value)}
                                min={entry.startDate || undefined}
                                className="w-full rounded border border-brand-neutral-border px-2 py-1.5 text-xs bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                              />
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              {duration !== null ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-brand-primary font-bold text-[10px]">
                                  {duration} {isHotel ? (duration === 1 ? "Night" : "Nights") : (duration === 1 ? "Day" : "Days")}
                                </span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <div className="relative max-w-[100px] ml-auto">
                                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">₹</span>
                                {(() => {
                                  const maxPrice = maxUnitPriceMap[`${svc}-${entry.city}`] || 0;
                                  return (
                                    <input
                                      type="number"
                                      min="0"
                                      max={maxPrice > 0 ? maxPrice : undefined}
                                      placeholder={maxPrice > 0 ? `0-${maxPrice}` : "0"}
                                      value={entry.unitPrice || ""}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (maxPrice > 0 && val > maxPrice) return;
                                        handleCityEntryChange(svc, idx, "unitPrice", val);
                                      }}
                                      className="w-full rounded border border-brand-neutral-border pl-5 pr-1.5 py-1.5 text-xs text-right bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    />
                                  );
                                })()}
                              </div>
                            </td>
                            <td className="px-2 py-1.5 text-right font-bold text-gray-800 text-xs">
                              <span className="px-2 py-0.5 rounded bg-brand-success-light text-brand-success">
                                ₹{(entry.totalPrice || 0).toLocaleString("en-IN")}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              {entries.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeCityFromService(svc, idx)}
                                  className="p-1 text-gray-400 hover:text-brand-danger hover:bg-brand-danger-light rounded transition"
                                  title="Remove city"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-brand-primary-light/50 border-t border-indigo-200">
                        <td colSpan={4} className="px-3 py-2 text-[10px] font-bold text-brand-primary uppercase text-right">
                          Service Total:
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-brand-primary text-xs" colSpan={1}>
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-brand-primary text-sm">
                          ₹{svcTotal.toLocaleString("en-IN")}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Add More City button */}
                <div className="px-3 py-2 border-t border-brand-neutral-border">
                  <button
                    type="button"
                    onClick={() => addCityToService(svc)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-primary bg-brand-primary-light border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-100 transition"
                  >
                    <Plus size={12} />
                    Add More City
                  </button>
                </div>
              </div>
            );
          })}

          {/* Grand Total */}
          <div className="flex justify-end pt-3 border-t-2 border-indigo-300">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-brand-primary uppercase">Grand Total:</span>
              <span className="text-lg font-black text-indigo-800 bg-indigo-100 px-3 py-1 rounded-lg">
                ₹{calculatedTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-brand-neutral">Total Amount (auto-calculated)</Label>
          <div className="flex h-10 w-full rounded-lg border border-brand-neutral-border bg-brand-neutral-light px-3 py-2 text-sm font-bold text-gray-900">
            ₹{calculatedTotal.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-brand-neutral">Assignment Date</Label>
          <Input
            type="date"
            value={form.assignedDate}
            onChange={(e) => setForm((p) => ({ ...p, assignedDate: e.target.value }))}
            className="rounded-lg border-brand-neutral-border focus:ring-brand-500"
          />
        </div>
      </div>

      {initialData && (
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-brand-neutral">Status</Label>
          <select
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            className="flex h-10 w-full rounded-lg border border-brand-neutral-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-brand-neutral">Notes (Optional)</Label>
        <Textarea
          placeholder="Special instructions, requirements, or remarks..."
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          className="rounded-lg border-brand-neutral-border focus:ring-brand-500 min-h-[80px]"
        />
      </div>

      <div className="pt-2">
        <FormActionButton
          text={isLoading ? (initialData ? "Updating..." : "Assigning...") : initialData ? "Update Assignment" : "Assign Vendor"}
          type="submit"
          isLoading={isLoading}
          fullWidth
          size="md"
        />
      </div>
    </form>
  );
}
