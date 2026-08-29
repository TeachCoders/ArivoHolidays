export const STATUS_BADGE: Record<string, { label: string; cls: string; dot: string }> = {
  CONFIRMED: { label: "Confirmed", cls: "text-brand-success", dot: "bg-emerald-600" },
  COMPLETED: { label: "Confirmed", cls: "text-brand-success", dot: "bg-emerald-600" },
  working: { label: "In Progress", cls: "text-brand-info", dot: "bg-blue-600" },
  PENDING: { label: "Pending", cls: "text-brand-warning", dot: "bg-amber-600" },
  CANCELLED: { label: "Cancelled", cls: "text-rose-600", dot: "bg-rose-600" },
};

export const PAYMENT_BADGE: Record<string, { label: string; cls: string }> = {
  full: { label: "Verified Paid", cls: "bg-brand-success-light text-emerald-800" },
  partial: { label: "Partial Paid", cls: "bg-brand-warning-light text-amber-800" },
  unpaid: { label: "Unpaid", cls: "bg-rose-100 text-rose-800" },
  none: { label: "No Invoice", cls: "bg-slate-100 text-brand-neutral-muted" },
};

export const getLeadStatus = (lead: any) => {
  const hasApprovedPayment = (lead.payments || []).some(
    (p: any) => p.status === "COMPLETED"
  );
  if (hasApprovedPayment) return "CONFIRMED";
  return lead.bookingStatus || "PENDING";
};

export const getAssignedType = (lead: any): "sales" | "vendor" | "both" | "none" => {
  const hasSales = !!lead.assignedTo?.id;
  const hasVendor = lead.vendorAssignments?.length > 0;
  if (hasSales && hasVendor) return "both";
  if (hasVendor) return "vendor";
  if (hasSales) return "sales";
  return "none";
};

export const getAssignedPerson = (lead: any) => ({
  name: lead.assignedTo?.name || null,
  email: lead.assignedTo?.email || null,
  mobile: lead.assignedTo?.mobile || null,
  profileImage: lead.assignedTo?.profileImage || null,
});

export const getVendorInfo = (lead: any) => {
  const va = lead.vendorAssignments?.[0]?.vendor;
  return {
    name: va?.vendarCompanyName || va?.vendarName || null,
    email: va?.vendarEmail || null,
    mobile: va?.vendarMobile || null,
  };
};

export const getInvoiceTotal = (lead: any) => {
  if (!lead?.invoices || lead.invoices.length === 0) return 0;
  return lead.invoices
    .filter((inv: any) => inv.status !== "CANCELLED")
    .reduce((sum: number, inv: any) => sum + (inv.grandTotal || 0), 0);
};

export const getPaymentPaid = (lead: any) => {
  if (!lead?.payments || lead.payments.length === 0) return 0;
  return lead.payments
    .filter((p: any) => p.status === "COMPLETED")
    .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
};

export const getPaymentStatus = (lead: any) => {
  const invoiced = getInvoiceTotal(lead);
  const paid = getPaymentPaid(lead);
  if (invoiced === 0 && paid === 0) return "none";
  if (paid >= invoiced && invoiced > 0) return "full";
  if (paid > 0) return "partial";
  return "unpaid";
};
