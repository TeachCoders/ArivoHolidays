"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateVendorGroup, useUpdateVendorGroup } from "@/feature/vendors/api/useVendorHooks";
import FormActionButton from "@/components/shared/customBtns";

interface VendorGroupFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export function VendorGroupForm({ onSuccess, initialData }: VendorGroupFormProps) {
  const { mutate: createGroup, isPending: isCreating } = useCreateVendorGroup();
  const { mutate: updateGroup, isPending: isUpdating } = useUpdateVendorGroup();
  
  const [formData, setFormData] = useState({
    description: initialData?.description || "",
    type: initialData?.type || "ALL",
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  });

  const isLoading = isCreating || isUpdating;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      name: formData.type, // Map type to name for uniqueness constraint
      description: formData.description,
      type: formData.type,
      isActive: formData.isActive,
    };

    if (initialData?.id) {
      updateGroup(
        { id: initialData.id, payload },
        {
          onSuccess: () => {
            if (onSuccess) onSuccess();
          },
        }
      );
    } else {
      createGroup(payload, {
        onSuccess: () => {
          if (onSuccess) onSuccess();
          setFormData({ description: "", type: "ALL", isActive: true });
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
 <div className="space-y-2">
        <Label htmlFor="type" className="text-sm font-medium text-gray-700">Vendor Type </Label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleInputChange as any}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="TOUR_OPERATOR">Tour Operator Vendor</option>
          <option value="TRANSPORT_VENDOR">Transport Vendor</option>
          <option value="HOTEL_VENDOR">Hotel Vendor</option>
          <option value="GUIDE_VENDOR">Guide Vendor</option>
          <option value="ALL">All</option>
        </select>
      </div>  

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-sm font-medium text-gray-700"
        >
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="What kind of vendors belong to this group?"
          value={formData.description}
          onChange={handleInputChange}
          required
          className="border-gray-200 focus:border-brand-500 min-h-[100px]"
        />
      </div>

     

      <div className="flex items-center space-x-2 py-2">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleInputChange}
          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
        />
        <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Group is active
        </Label>
      </div>

      <div className="pt-4">
        <FormActionButton
          text={isLoading ? (initialData ? "Updating Group..." : "Creating Group...") : "Submit"}
          type="submit"
          isLoading={isLoading}
          fullWidth
          size="md"
        />
      </div>
    </form>
  );
}
