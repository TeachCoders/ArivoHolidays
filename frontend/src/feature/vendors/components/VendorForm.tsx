"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateVendor, useUpdateVendor } from "@/feature/vendors/api/useVendorHooks";
import FormActionButton from "@/components/shared/customBtns";

interface VendorFormProps {
  vendorGroupId: number | null;
  vendorGroupType?: string;
  onSuccess?: () => void;
  initialData?: any;
}

export function VendorForm({ vendorGroupId, vendorGroupType, onSuccess, initialData }: VendorFormProps) {
  const { mutate: createVendor, isPending: isCreating } = useCreateVendor();
  const { mutate: updateVendor, isPending: isUpdating } = useUpdateVendor();
  const [formData, setFormData] = useState({
    vendarName: initialData?.vendarName || "",
    vendarEmail: initialData?.vendarEmail || "",
    vendarPassword: "",
    vendarMobile: initialData?.vendarMobile || "",
    vendarCompanyName: initialData?.vendarCompanyName || "",
    vndarGstNumber: initialData?.vndarGstNumber || "",
    vendarAddress: initialData?.vendarAddress || "",
    vendarServiceType: initialData?.vendarServiceType || vendorGroupType || "ALL",
    vendarWorkingAreas: initialData?.vendarWorkingAreas ? initialData.vendarWorkingAreas.join(", ") : "",
    vendarIsActive: initialData?.vendarIsActive !== undefined ? initialData.vendarIsActive : true,
    bankAccountName: initialData?.bankAccountName || "",
    bankAccountNumber: initialData?.bankAccountNumber || "",
    bankIfscCode: initialData?.bankIfscCode || "",
  });

  const isLoading = isCreating || isUpdating;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: any = {
      ...formData,
      vendarServiceType: formData.vendarServiceType || "ALL",
      vendarWorkingAreas: formData.vendarWorkingAreas.split(",").map((a: string) => a.trim()).filter(Boolean),
      vendorGroupId,
      engagementModel: "SERVICE",
    };
    if (!payload.vendarPassword) delete payload.vendarPassword;

    if (initialData?.id) {
      updateVendor({ id: initialData.id, payload }, { onSuccess: () => onSuccess?.() });
    } else {
      createVendor(payload, { onSuccess: () => onSuccess?.() });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Vendor Service Type Dropdown */}
      {!vendorGroupType && (
        <div className="space-y-1.5">
          <Label htmlFor="vendarServiceType" className="text-sm font-semibold text-gray-700">Vendor Service Type *</Label>
          <select
            id="vendarServiceType"
            name="vendarServiceType"
            value={formData.vendarServiceType}
            onChange={handleChange}
            required
            className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="ALL">All (Hotel, Car, Guide)</option>
            <option value="HOTEL">Hotel Only</option>
            <option value="CAB_OPERATOR">Car / Cab Only</option>
            <option value="GUIDE_VENDOR">Guide Only</option>
            <option value="TRANSPORT_VENDOR">Transport (Car)</option>
            <option value="HOTEL_VENDOR">Hotel Vendor</option>
          </select>
        </div>
      )}

      {/* Basic Info */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Basic Information</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="vendarName" className="text-sm font-semibold text-gray-700">Contact Person Name</Label>
            <Input id="vendarName" name="vendarName" value={formData.vendarName} onChange={handleChange} className="rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vendarCompanyName" className="text-sm font-semibold text-gray-700">Company Name *</Label>
            <Input id="vendarCompanyName" name="vendarCompanyName" value={formData.vendarCompanyName} onChange={handleChange} required className="rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vendarEmail" className="text-sm font-semibold text-gray-700">Email *</Label>
            <Input id="vendarEmail" name="vendarEmail" type="email" value={formData.vendarEmail} onChange={handleChange} required className="rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vendarMobile" className="text-sm font-semibold text-gray-700">Mobile *</Label>
            <Input id="vendarMobile" name="vendarMobile" value={formData.vendarMobile} onChange={handleChange} required className="rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vndarGstNumber" className="text-sm font-semibold text-gray-700">GST Number</Label>
            <Input id="vndarGstNumber" name="vndarGstNumber" value={formData.vndarGstNumber} onChange={handleChange} className="rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vendarWorkingAreas" className="text-sm font-semibold text-gray-700">Working Areas (comma separated)</Label>
            <Input id="vendarWorkingAreas" name="vendarWorkingAreas" placeholder="Delhi, Agra, Jaipur" value={formData.vendarWorkingAreas} onChange={handleChange} className="rounded-lg" />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="vendarAddress" className="text-sm font-semibold text-gray-700">Address</Label>
            <Textarea id="vendarAddress" name="vendarAddress" value={formData.vendarAddress} onChange={handleChange} placeholder="Enter full address" className="rounded-lg min-h-[80px]" />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Bank Details</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="bankAccountName" className="text-sm font-semibold text-gray-700">Account Name</Label>
            <Input id="bankAccountName" name="bankAccountName" value={formData.bankAccountName} onChange={handleChange} className="rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bankAccountNumber" className="text-sm font-semibold text-gray-700">Account Number</Label>
            <Input id="bankAccountNumber" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} className="rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bankIfscCode" className="text-sm font-semibold text-gray-700">IFSC Code</Label>
            <Input id="bankIfscCode" name="bankIfscCode" value={formData.bankIfscCode} onChange={handleChange} className="rounded-lg" />
          </div>
        </div>
      </div>

      {/* Password & Active */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="vendarPassword" className="text-sm font-semibold text-gray-700">
            Password {initialData && "(leave blank to keep current)"}
          </Label>
          <PasswordInput id="vendarPassword" name="vendarPassword" value={formData.vendarPassword} onChange={handleChange} required={!initialData} className="rounded-lg" />
        </div>
        <div className="flex items-center gap-3 mt-6">
          <input
            type="checkbox"
            id="vendarIsActive"
            name="vendarIsActive"
            checked={formData.vendarIsActive}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <Label htmlFor="vendarIsActive" className="text-sm font-medium text-gray-700">Vendor is Active</Label>
        </div>
      </div>

      <div className="pt-2">
        <FormActionButton
          text={isLoading ? (initialData ? "Updating..." : "Creating...") : initialData ? "Update Vendor" : "Create Vendor"}
          type="submit"
          isLoading={isLoading}
          fullWidth
          size="md"
        />
      </div>
    </form>
  );
}
