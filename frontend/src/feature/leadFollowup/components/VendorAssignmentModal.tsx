"use client";

import { ReusableModel } from "@/components/shared/reusableModel";
import { VendorAssignmentForm } from "@/feature/vendors/components/VendorAssignmentForm";
import { useGetVendors } from "@/feature/vendors/api/useVendorHooks";

interface VendorAssignmentModalProps {
  leadId: number;
  lead: any;
  onClose: () => void;
}

export default function VendorAssignmentModal({ leadId, lead, onClose }: VendorAssignmentModalProps) {
  const { vendors = [] } = useGetVendors();

  const travellers = [
    {
      id: lead.id,
      name: lead.name,
      travellerId: lead.travellerId,
      payments: lead.payments || [],
      requirement: lead.requirement || null,
    },
  ];

  const assignmentVendors = vendors.map((v: any) => ({
    id: v.id,
    vendarName: v.vendarName || "",
    vendarCompanyName: v.vendarCompanyName || "",
    vendarServiceType: v.vendarServiceType,
    vendarWorkingAreas: v.vendarWorkingAreas || [],
  }));

  const latestInvoice = lead.invoices?.[0];
  const invoiceItems = latestInvoice?.items || [];
  const invoiceTravelDate = lead.requirement?.startDate || "";

  return (
    <ReusableModel
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Assign Vendor to Traveller"
      description="Assign services to the vendor with city and dates."
      contentClassName="sm:max-w-[600px]"
    >
      <div className="py-2 max-h-[80vh] overflow-y-auto px-1">
        <VendorAssignmentForm
          travellers={travellers}
          vendors={assignmentVendors}
          initialData={{ travellerId: leadId }}
          invoiceItems={invoiceItems}
          invoiceTravelDate={invoiceTravelDate}
          onSuccess={onClose}
        />
      </div>
    </ReusableModel>
  );
}
