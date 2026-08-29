import React from "react";
import { ChevronDown } from "lucide-react";
import { formatLocalDateTime } from "@/lib/dateUtils";

interface TravellerDetailsCardsProps {
  lead: any;
  leadId?: any;
  
}

const formatDay = (date: any) =>
  date ? formatLocalDateTime(date, { month: "short", day: "numeric", year: "numeric" }) : "Not set";

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-2.5 px-4 gap-4 hover:bg-slate-50 rounded-lg transition-colors">
    <span className="text-sm font-semibold text-slate-700">{label}</span>
    <span className="text-sm font-semibold text-slate-900">{value}</span>
  </div>
);

const Section = ({
  title,
  borderColor,
  textColor,
  children,
}: {
  title: string;
  borderColor: string;
  textColor: string;
  children: React.ReactNode;
}) => (
  <div className={`border-l-2 ${borderColor} pl-3`}>
    <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${textColor}`}>{title}</p>
    <div className="divide-y divide-slate-100">{children}</div>
  </div>
);

export default function TravellerDetailsCards({ lead, leadId }: TravellerDetailsCardsProps) {
  const [open, setOpen] = React.useState(true);
  if (!lead) return null;

  const tourBooking = lead.tourBookings?.[0];
  const vehicleBooking = lead.vehicleBookings?.[0];

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
      {/* Accordion Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          Traveller Details
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="p-4 space-y-5">

          {/* ── Personal Information ── */}
          <Section title="Personal Information" borderColor="border-slate-300" textColor="text-slate-400">
            <Field label="Travel Start Date" value={formatDay(tourBooking.travelStartDate)} />
            <Field label="Travel End Date" value={formatDay(tourBooking.travelEndDate)} />
            <Field label="Email" value={lead.email || "N/A"} />
            <Field label="Country" value={lead.country || "N/A"} />
            <Field label="Sales Person Name" value={lead.bookingStatus === "cancelled" ? "Unassigned" : (lead.assignedTo?.name || "Unassigned")} />
          </Section>

          {/* ── Payment Information ── */}
          <Section title="Payment Information" borderColor="border-emerald-300" textColor="text-emerald-500">
            <Field
              label="Payment Received"
              value={
                lead.paymentStatus === "full_payment"
                  ? "Yes (Full)"
                  : lead.paymentStatus === "first_payment"
                  ? "Yes (Partial)"
                  : "No"
              }
            />
            {(() => {
              const totalPaid = (lead.payments || [])
                .filter((p: any) => p.status === "COMPLETED")
                .reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
              const totalInvoiced = (lead.invoices || [])
                .filter((i: any) => i.status !== "CANCELLED")
                .reduce((s: number, i: any) => s + (i.grandTotal || 0), 0);
              const due = Math.max(0, totalInvoiced - totalPaid);
              return (
                <>
                  <Field label="Total Invoiced" value={`₹${totalInvoiced.toLocaleString()}`} />
                  <Field label="Total Received" value={`₹${totalPaid.toLocaleString()}`} />
                  <Field
                    label="Due Amount"
                    value={`₹${due.toLocaleString()}`}
                  />
                </>
              );
            })()}
          </Section>

          {/* ── Tour Booking ── */}
          {tourBooking && (
            <Section title="Tour Booking Details" borderColor="border-purple-300" textColor="text-purple-500">
              {tourBooking.noOfPersons !== undefined && <Field label="Adults" value={`${tourBooking.noOfPersons} Adults`} />}
              {tourBooking.noOfChildren !== undefined && <Field label="Children" value={tourBooking.noOfChildren.toString()} />}
              {tourBooking.hotelCategory && <Field label="Hotel Category" value={tourBooking.hotelCategory} />}
              {tourBooking.travelStartDate && <Field label="Start Date" value={formatDay(tourBooking.travelStartDate)} />}
              {tourBooking.travelEndDate && <Field label="End Date" value={formatDay(tourBooking.travelEndDate)} />}
              {tourBooking.travellerMessage && <Field label="Message" value={tourBooking.travellerMessage} />}
            </Section>
          )}

          {/* ── Vehicle Booking ── */}
          {vehicleBooking && (
            <Section title="Vehicle Booking Details" borderColor="border-blue-300" textColor="text-blue-500">
              {vehicleBooking.vehicleName && <Field label="Vehicle" value={vehicleBooking.vehicleName} />}
              {vehicleBooking.serviceType && <Field label="Service Type" value={vehicleBooking.serviceType} />}
              {vehicleBooking.travellerMessage && <Field label="Message" value={vehicleBooking.travellerMessage} />}
            </Section>
          )}

        </div>
      )}
    </div>
  );
}