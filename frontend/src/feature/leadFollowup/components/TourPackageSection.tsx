"use client";

import { useState } from "react";
import { Plus, Trash2, FileText, MapPin, Pencil } from "lucide-react";
import type { PackageItem } from "./packageTypes";
import { useGetVendors } from "@/feature/vendors/api/useVendorHooks";

export interface TourPackageSectionProps {
  items: PackageItem[];
  setItems: React.Dispatch<React.SetStateAction<PackageItem[]>>;
  newCity: string;
  setNewCity: (val: string) => void;
  addCity: () => void;
  addService: (loc: string, serviceName: string) => void;
  handleChange: (index: number, field: keyof PackageItem, value: any) => void;
  removeItem: (index: number) => void;
  groupedData: Record<string, PackageItem[]>;
  openAccordions: Set<string>;
  toggleAccordion: (key: string) => void;
}

const SERVICE_VENDOR_MAP: Record<string, string[]> = {
  Hotel: ["HOTEL", "HOTEL_VENDOR"],
  Car: ["CAB_OPERATOR", "TRANSPORT_VENDOR"],
  Guide: ["GUIDE_VENDOR", "ALL"],
};

export default function TourPackageSection({
  items,
  setItems,
  newCity,
  setNewCity,
  addCity,
  addService,
  handleChange,
  removeItem,
  groupedData,
  openAccordions,
  toggleAccordion,
}: TourPackageSectionProps) {
  const { vendors } = useGetVendors();
  const [editingNameIdx, setEditingNameIdx] = useState<Set<number>>(new Set());
  const inputCls = "border border-brand-neutral-border rounded px-2 py-1.5 text-xs w-full bg-white focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all";
  const selectCls = "border border-brand-neutral-border rounded px-2 py-1.5 text-xs w-full bg-white focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all";

  const getQtyLabel = (svc: string) => svc === "Hotel" ? "Nights" : "Days";

  const uniqueCities = [...new Set(items.map(i => i.location))];

  const getFilteredVendors = (serviceName: string, city: string) => {
    const allowedTypes = SERVICE_VENDOR_MAP[serviceName] || [];
    const cityLower = city.toLowerCase();
    return vendors.filter((v: any) =>
      v.vendarIsActive &&
      (allowedTypes.includes(v.vendarServiceType) || v.vendarServiceType === "ALL") &&
      (!v.vendarWorkingAreas?.length || v.vendarWorkingAreas.some((a: string) => a.toLowerCase() === cityLower))
    );
  };

  const handleVendorSelect = (idx: number, vendorId: string) => {
    const item = items[idx];
    const nameField = (item.ServiceName === "Hotel" ? "hotelName" : item.ServiceName === "Car" ? "carName" : "guideName") as keyof PackageItem;
    if (vendorId === "custom") {
      setItems(prev => {
        const next = [...prev];
        next[idx] = { ...next[idx], vendorId: undefined, [nameField]: "" };
        return next;
      });
      return;
    }
    const selected = vendors.find((v: any) => String(v.id) === vendorId);
    if (!selected) return;
    const vendorName = selected.vendarCompanyName || selected.vendarName;
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], vendorId: selected.id, [nameField]: vendorName };
      return next;
    });
    setEditingNameIdx(prev => { const next = new Set(prev); next.delete(idx); return next; });
  };

  const toggleNameEdit = (idx: number) => {
    setEditingNameIdx(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const clearVendorAndEdit = (idx: number) => {
    const item = items[idx];
    const nameField = item.ServiceName === "Hotel" ? "hotelName" : item.ServiceName === "Car" ? "carName" : "guideName";
    handleChange(idx, "vendorId", undefined);
    handleChange(idx, nameField, "");
    setEditingNameIdx(prev => { const next = new Set(prev); next.add(idx); return next; });
  };

  const toggleCarCity = (idx: number, city: string) => {
    const current = items[idx].carCities || [];
    const next = current.includes(city) ? current.filter(c => c !== city) : [...current, city];
    const newItems = [...items];
    newItems[idx] = {
      ...newItems[idx],
      carCities: next,
      ServcieQty: next.length || newItems[idx].ServcieQty,
      TotalPrice: (next.length || newItems[idx].ServcieQty) * (Number(newItems[idx].UnitPrice) || 0),
    };
    setItems(newItems);
  };

  return (
    <>
      <div className="flex gap-2 mb-4 bg-brand-neutral-light p-3 rounded-lg">
        <input
          className="border p-2 rounded w-full text-xs bg-white"
          placeholder="Enter city name (e.g. Delhi, Jaipur)"
          value={newCity}
          onChange={e => setNewCity(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addCity()}
        />
        <button onClick={addCity} className="btn-primary px-4 rounded font-bold text-xs whitespace-nowrap">
          + Add City
        </button>
      </div>

      {uniqueCities.length > 0 && (
        <div className="border border-brand-neutral-border rounded-lg overflow-hidden mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
                <th className="tbl-th-sm px-3 py-2 text-left w-20">City</th>
                <th className="tbl-th-sm px-3 py-2 text-left w-20">Service</th>
                <th className="tbl-th-sm px-3 py-2 text-left w-24">Name</th>
                <th className="tbl-th-sm px-3 py-2 text-left w-28">Type</th>
                <th className="tbl-th-sm px-3 py-2 text-center w-28">Qty</th>
                <th className="tbl-th-sm px-3 py-2 text-center w-28">Check-in</th>
                <th className="tbl-th-sm px-3 py-2 text-center w-28">Check-out</th>
                <th className="tbl-th-sm px-3 py-2 text-right w-28">Unit ₹</th>
                <th className="tbl-th-sm px-3 py-2 text-right w-24">Total</th>
                <th className="tbl-th-sm px-3 py-2 text-center w-8"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const getName = () => {
                  if (item.ServiceName === "Hotel") return { value: item.hotelName || "", field: "hotelName", placeholder: "e.g. Taj" };
                  if (item.ServiceName === "Car") return { value: item.carName || "", field: "carName", placeholder: "e.g. Innova" };
                  if (item.ServiceName === "Guide") return { value: item.guideName || "", field: "guideName", placeholder: "Guide name" };
                  return { value: "", field: "", placeholder: "" };
                };
                const getType = () => {
                  if (item.ServiceName === "Hotel") return { value: item.hotelType || "", field: "hotelType", options: ["3-Star", "4-Star", "5-Star", "Budget", "Luxury", "Heritage"] };
                  if (item.ServiceName === "Car") return { value: item.carType || "", field: "carType", options: ["Sedan", "SUV", "Hatchback", "Tempo Traveller", "Bus"] };
                  if (item.ServiceName === "Guide") return { value: item.guideLanguage || "", field: "guideLanguage", options: ["Hindi", "English", "Hindi + English", "Other"] };
                  return null;
                };
                const nameInfo = getName();
                const typeInfo = getType();
                const badgeColor =
                  item.ServiceName === "Hotel" ? "bg-indigo-100 text-brand-primary" :
                  item.ServiceName === "Car" ? "bg-brand-success-light text-brand-success" :
                  "bg-brand-warning-light text-brand-warning";

                const filteredVendors = getFilteredVendors(item.ServiceName, item.location);

                return (
                  <tr key={idx} className={`border-t border-slate-100 hover:bg-brand-neutral-light/30 transition-colors ${item.ServiceName !== "Hotel" ? "bg-brand-info-light/20" : ""}`}>
                    <td className="px-2 py-1.5 align-top">
                      {item.ServiceName === "Hotel" ? (
                        <span className="text-[11px] font-semibold text-brand-neutral flex items-center gap-1">
                          <MapPin size={10} className="text-slate-400 shrink-0" />{item.location}
                        </span>
                      ) : (
                        // Car/Guide: multi-city checkboxes
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Cities Covered:</span>
                          <div className="flex flex-wrap gap-1">
                            {uniqueCities.map(city => {
                              const checked = (item.carCities || []).includes(city);
                              return (
                                <label key={city} className={`flex items-center gap-1 cursor-pointer px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-colors ${checked ? "bg-indigo-100 text-brand-primary border-indigo-300" : "bg-white text-brand-neutral-muted border-brand-neutral-border hover:border-brand-primary"}`}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleCarCity(idx, city)}
                                    className="w-2.5 h-2.5 accent-indigo-600"
                                  />
                                  {city}
                                </label>
                              );
                            })}
                          </div>
                          {(item.carCities || []).length > 0 && (
                            <span className="text-[9px] text-brand-primary font-semibold">{(item.carCities || []).length} cities • {item.ServcieQty} days</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>{item.ServiceName}</span>
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      {item.vendorId && !editingNameIdx.has(idx) ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-brand-neutral truncate" title={nameInfo.value}>{nameInfo.value}</span>
                          <button onClick={() => toggleNameEdit(idx)} className="text-slate-400 hover:text-brand-primary transition-colors shrink-0" title="Edit">
                            <Pencil size={11} />
                          </button>
                        </div>
                      ) : filteredVendors.length > 0 ? (
                        <div className="space-y-1">
                          <select
                            className={selectCls}
                            value={item.vendorId ? String(item.vendorId) : "custom"}
                            onChange={(e) => handleVendorSelect(idx, e.target.value)}
                          >
                            <option value="custom">Custom</option>
                            {filteredVendors.map((v: any) => (
                              <option key={v.id} value={String(v.id)}>{v.vendarCompanyName || v.vendarName}</option>
                            ))}
                          </select>
                          {(!item.vendorId || editingNameIdx.has(idx)) && (
                            <div className="flex items-center gap-1">
                              <input
                                className={inputCls}
                                placeholder={nameInfo.placeholder}
                                value={nameInfo.value}
                                onChange={(e) => handleChange(idx, nameInfo.field as keyof PackageItem, e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <input
                          className={inputCls}
                          placeholder={nameInfo.placeholder}
                          value={nameInfo.value}
                          onChange={(e) => handleChange(idx, nameInfo.field as keyof PackageItem, e.target.value)}
                        />
                      )}
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      {typeInfo ? (
                        <select
                          className={selectCls}
                          value={typeInfo.value}
                          onChange={(e) => handleChange(idx, typeInfo.field as keyof PackageItem, e.target.value)}
                        >
                          <option value="">Select</option>
                          {typeInfo.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <input
                        type="number"
                        className={`${inputCls} text-center`}
                        value={item.ServcieQty === 0 ? "" : item.ServcieQty}
                        placeholder={getQtyLabel(item.ServiceName)}
                        onChange={(e) => handleChange(idx, "ServcieQty", Number(e.target.value))}
                      />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <input
                        type="date"
                        className={inputCls}
                        value={item.startDate || ""}
                        onChange={(e) => handleChange(idx, "startDate", e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <input
                        type="date"
                        className={inputCls}
                        value={item.endDate || ""}
                        onChange={(e) => handleChange(idx, "endDate", e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <input
                        type="number"
                        className={`${inputCls} text-right`}
                        value={item.UnitPrice === 0 ? "" : item.UnitPrice}
                        placeholder="0"
                        onChange={(e) => handleChange(idx, "UnitPrice", Number(e.target.value))}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right font-bold text-brand-neutral-dark text-xs align-top">
                      ₹{Number(item.TotalPrice || 0).toLocaleString()}
                    </td>
                    <td className="px-2 py-1.5 text-center align-top">
                      <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-brand-danger transition-colors" title="Remove">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Per-city add buttons */}
          {uniqueCities.map(city => (
            <div key={city} className="flex items-center gap-1.5 px-3 py-2 border-t border-slate-100 bg-brand-neutral-light/50">
              <span className="text-[10px] font-bold text-slate-400 mr-1">{city}:</span>
              {["Hotel", "Car", "Guide"].map(svc => (
                <button
                  key={svc}
                  onClick={() => addService(city, svc)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded border border-brand-neutral-border bg-white text-brand-neutral hover:bg-brand-primary-light hover:text-brand-primary hover:border-brand-primary transition-colors"
                >
                  + {svc}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-10 text-slate-400 bg-brand-neutral-light rounded-lg border border-dashed mt-4">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-35" />
          <p className="text-xs font-semibold">Enter a city name above to start building the invoice.</p>
        </div>
      )}
    </>
  );
}
