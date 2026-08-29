"use client";

import React, { useState } from "react";
import { useGetUnassignedItems, useAssignVendorToItem, useGetVendors } from "@/feature/vendors/api/useVendorHooks";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import { ReusableModel } from "@/components/shared/reusableModel";
import { VendorForm } from "./VendorForm";
import { AlertTriangle, Building2, Car, MapPin, User, Plus, ChevronDown, ChevronRight } from "lucide-react";
import PageLoader from "@/components/shared/PageLoader";

const SERVICE_ICON: Record<string, React.ElementType> = {
  Hotel: Building2,
  Car: Car,
  Guide: User,
};

const SERVICE_COLOR: Record<string, string> = {
  Hotel: "bg-brand-warning-light text-brand-warning",
  Car: "bg-brand-info-light text-brand-info",
  Guide: "bg-brand-success-light text-brand-success",
};

const SERVICE_VENDOR_MAP: Record<string, string[]> = {
  Hotel: ["HOTEL", "HOTEL_VENDOR"],
  Car: ["CAB_OPERATOR", "TRANSPORT_VENDOR"],
  Guide: ["GUIDE_VENDOR", "ALL"],
};

export default function UnassignedVendorsSection() {
  const { unassignedItems, isLoading } = useGetUnassignedItems();
  const { vendors } = useGetVendors();
  const { user } = useGetCurrentUser();
  const { mutate: assignVendor, isPending: isAssigning } = useAssignVendorToItem();

  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignItem, setAssignItem] = useState<any>(null);

  const isSuperAdmin = (user?.role ?? "").toLowerCase().includes("super");

  if (!isSuperAdmin) return null;
  if (isLoading) return <div className="text-sm text-gray-400 py-4">Loading unassigned items...</div>;
  if (!unassignedItems || unassignedItems.length === 0) return null;

  const totalMissing = unassignedItems.reduce((sum: number, g: any) => sum + g.items.length, 0);

  const handleOpenCreateVendor = (service: string, city: string) => {
    setSelectedService(service);
    setSelectedCity(city);
    setVendorModalOpen(true);
  };

  const handleOpenAssign = (item: any) => {
    setAssignItem(item);
    setAssignModalOpen(true);
  };

  const handleAssignVendor = (itemId: number, vendorId: number) => {
    assignVendor({ itemId, vendorId }, {
      onSuccess: () => {
        setAssignModalOpen(false);
        setAssignItem(null);
      },
    });
  };

  const getFilteredVendors = (service: string, city: string) => {
    const allowedTypes = SERVICE_VENDOR_MAP[service] || [];
    const cityLower = city.toLowerCase();
    return vendors.filter((v: any) =>
      v.vendarIsActive &&
      (allowedTypes.includes(v.vendarServiceType) || v.vendarServiceType === "ALL") &&
      (!v.vendarWorkingAreas?.length ||
        v.vendarWorkingAreas.some((a: string) => a.toLowerCase() === cityLower))
    );
  };

  return (
    <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Unassigned Vendors</h2>
              <p className="text-xs text-brand-neutral-muted">{totalMissing} items need vendor assignment</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full">
            {totalMissing}
          </span>
        </div>
      </div>

      {/* City Groups */}
      <div className="divide-y divide-gray-100">
        {unassignedItems.map((group: any) => {
          const cityKey = `${group.city}__${group.service}`;
          const isExpanded = expandedCity === cityKey;
          const ServiceIcon = SERVICE_ICON[group.service] || Building2;
          const colorClass = SERVICE_COLOR[group.service] || "bg-gray-100 text-brand-neutral";

          return (
            <div key={cityKey}>
              {/* City + Service Row */}
              <button
                onClick={() => setExpandedCity(isExpanded ? null : cityKey)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-brand-neutral-light transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                  <MapPin size={16} className="text-gray-400" />
                  <span className="font-semibold text-sm text-gray-800">{group.city}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
                    {group.service}
                  </span>
                  <span className="text-xs text-gray-400">({group.items.length} items)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenCreateVendor(group.service, group.city); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    Create Vendor
                  </button>
                </div>
              </button>

              {/* Expanded Items */}
              {isExpanded && (
                <div className="bg-brand-neutral-light px-5 py-3">
                  <table className="tbl">
                    <thead>
                      <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
                        <th className="tbl-th-sm font-medium">Traveller</th>
                        <th className="tbl-th-sm font-medium">Name</th>
                        <th className="tbl-th-sm font-medium">Qty</th>
                        <th className="tbl-th-sm font-medium">Unit Price</th>
                        <th className="tbl-th-sm font-medium">Total</th>
                        <th className="tbl-th-sm text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-neutral-light">
                      {group.items.map((item: any) => (
                        <tr key={item.id} className="hover:bg-white transition-colors">
                          <td className="py-2 text-brand-neutral">{item.travellerName}</td>
                          <td className="py-2 text-brand-neutral">
                            {item.hotelName || item.carName || item.guideName || "-"}
                          </td>
                          <td className="py-2 text-brand-neutral">{item.ServcieQty}</td>
                          <td className="py-2 text-brand-neutral">₹{item.UnitPrice?.toLocaleString()}</td>
                          <td className="py-2 text-brand-neutral font-medium">₹{item.TotalPrice?.toLocaleString()}</td>
                          <td className="py-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenAssign(item)}
                                className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                              >
                                Assign Existing
                              </button>
                              <button
                                onClick={() => handleOpenCreateVendor(group.service, group.city)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                              >
                                Create New
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Vendor Modal */}
      <ReusableModel
        open={vendorModalOpen}
        onOpenChange={setVendorModalOpen}
        title="Create Vendor"
        description={`Add a new ${selectedService} vendor for ${selectedCity}`}
        contentClassName="sm:max-w-[720px]"
      >
        <div className="py-2 max-h-[75vh] overflow-y-auto px-1">
          <VendorForm
            vendorGroupId={null}
            vendorGroupType={
              selectedService === "Hotel" ? "HOTEL_VENDOR" :
              selectedService === "Car" ? "CAB_OPERATOR" :
              selectedService === "Guide" ? "GUIDE_VENDOR" : "ALL"
            }
            initialData={{ vendarWorkingAreas: [selectedCity] }}
            onSuccess={() => setVendorModalOpen(false)}
          />
        </div>
      </ReusableModel>

      {/* Assign Existing Vendor Modal */}
      <ReusableModel
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        title="Assign Vendor"
        description={assignItem ? `Assign a vendor to ${assignItem.hotelName || assignItem.carName || assignItem.guideName || "this item"}` : ""}
        contentClassName="sm:max-w-[500px]"
      >
        <div className="py-2 space-y-3">
          {assignItem && (
            <div className="bg-brand-neutral-light rounded-lg p-3 text-sm space-y-1">
              <p><span className="font-medium">Traveller:</span> {assignItem.travellerName}</p>
              <p><span className="font-medium">Service Name:</span> {assignItem.hotelName || assignItem.carName || assignItem.guideName || "-"}</p>
              <p><span className="font-medium">Price:</span> ₹{assignItem.TotalPrice?.toLocaleString()}</p>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm font-medium text-brand-neutral">Select a vendor:</p>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {(() => {
                const availableVendors = getFilteredVendors(
                  assignItem ? (assignItem.hotelName ? "Hotel" : assignItem.carName ? "Car" : "Guide") : "",
                  ""
                );
                if (availableVendors.length === 0) {
                  return (
                    <p className="text-sm text-brand-neutral-muted py-4 text-center">
                      No matching vendors found. Create a new vendor first.
                    </p>
                  );
                }
                return availableVendors.map((vendor: any) => (
                  <button
                    key={vendor.id}
                    onClick={() => assignItem && handleAssignVendor(assignItem.id, vendor.id)}
                    disabled={isAssigning}
                    className="w-full flex items-center justify-between p-3 border border-brand-neutral-border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <div className="text-left">
                      <p className="font-medium text-sm text-gray-800">{vendor.vendarCompanyName || vendor.vendarName}</p>
                      <p className="text-xs text-brand-neutral-muted">{vendor.vendarServiceType} • {vendor.vendarMobile}</p>
                    </div>
                    {isAssigning ? (
                      <span className="text-xs text-brand-info font-medium flex items-center gap-1">
                        <PageLoader size="inline" /> Assigning...
                      </span>
                    ) : (
                      <span className="text-xs text-brand-info font-medium">Select</span>
                    )}
                  </button>
                ));
              })()}
            </div>
          </div>
        </div>
      </ReusableModel>
    </div>
  );
}
