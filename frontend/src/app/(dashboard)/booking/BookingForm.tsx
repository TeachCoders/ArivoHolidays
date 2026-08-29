"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function BookingForm() {
  const [formData, setFormData] = useState({
    traveller_name: '',
    traveller_email: '',
    traveller_phone: '',
    country: '',
    country_id: '',
    traveller_message: '',
    // Tour fields
    no_of_persons: '',
    no_of_children: '',
    hotel_category: '',
    travel_start_date: '',
    travel_end_date: '',
    // Vehicle fields
    vehicle_name: '',
    service_type: '',
    // Docs / payment URLs (optional)
    passport_url: '',
    govt_id_url: '',
    payment_screenshot_url: '',
    transaction_id: '',
    transaction_detail: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Convert numeric fields to numbers when present
    const payload = {
      ...formData,
      no_of_persons: formData.no_of_persons ? Number(formData.no_of_persons) : undefined,
      no_of_children: formData.no_of_children ? Number(formData.no_of_children) : undefined,
    };
    try {
      const res = await fetch('/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Booking submitted successfully!');
        setFormData({
          traveller_name: '', traveller_email: '', traveller_phone: '', country: '', country_id: '', traveller_message: '',
          no_of_persons: '', no_of_children: '', hotel_category: '', travel_start_date: '', travel_end_date: '',
          vehicle_name: '', service_type: '', passport_url: '', govt_id_url: '', payment_screenshot_url: '', transaction_id: '', transaction_detail: ''
        });
      } else {
        toast.error('Error: ' + (data.message || JSON.stringify(data.errors)));
      }
    } catch (err) {
      console.error(err);
      toast.error('Unexpected error while submitting');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 p-6 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="h5">Travel Booking</h2>
      {/* Basic Contact Info */}
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          name="traveller_name"
          value={formData.traveller_name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-grary-600  focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          name="traveller_email"
          value={formData.traveller_email}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-grary-600  focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Phone</label>
        <input
          type="text"
          name="traveller_phone"
          value={formData.traveller_phone}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-grary-600  focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Country</label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-grary-600  focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Country ID</label>
        <input
          type="text"
          name="country_id"
          value={formData.country_id}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-grary-600  focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {/* Optional Message */}
      <div>
        <label className="block text-sm font-medium">Message (optional)</label>
        <textarea
          name="traveller_message"
          value={formData.traveller_message}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border border-grary-600  focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {/* Tour Section */}
      <h3 className="h6 text-white mt-6">Tour Details (optional)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">No. of Persons</label>
          <input type="number" name="no_of_persons" value={formData.no_of_persons} onChange={handleChange} className="mt-1 block w-full rounded-md border border-grary-600 " />
        </div>
        <div>
          <label className="block text-sm font-medium">No. of Children</label>
          <input type="number" name="no_of_children" value={formData.no_of_children} onChange={handleChange} className="mt-1 block w-full rounded-md border border-grary-600 " />
        </div>
        <div>
          <label className="block text-sm font-medium">Hotel Category</label>
          <input type="text" name="hotel_category" value={formData.hotel_category} onChange={handleChange} className="mt-1 block w-full rounded-md border border-grary-600 " />
        </div>
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input type="date" name="travel_start_date" value={formData.travel_start_date} onChange={handleChange} className="mt-1 block w-full rounded-md border border-grary-600 " />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input type="date" name="travel_end_date" value={formData.travel_end_date} onChange={handleChange} className="mt-1 block w-full rounded-md border border-grary-600 " />
        </div>
      </div>
      {/* Vehicle Section */}
      <h3 className="h6 mt-6">Vehicle Details (optional)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Vehicle Name</label>
          <input type="text" name="vehicle_name" value={formData.vehicle_name} onChange={handleChange} className="mt-1 block w-full rounded-md border border-grary-600 " />
        </div>
        <div>
          <label className="block text-sm font-medium">Service Type</label>
          <select name="service_type" value={formData.service_type} onChange={handleChange} className="mt-1 block w-full rounded-md border border-grary-600 ">
            <option value="">Select</option>
            <option value="oneway">One‑Way</option>
            <option value="roundway">Round‑Way</option>
            <option value="pickup_drop">Pick‑up & Drop</option>
            <option value="sightseeing">Sightseeing</option>
          </select>
        </div>
      </div>
      {/* Documents / Payment */}
      <h3 className="h6 mt-6">Documents & Payment (optional)</h3>
      <div className="grid gap-2">
        <input type="url" name="passport_url" placeholder="Passport URL" value={formData.passport_url} onChange={handleChange} className="rounded-md border border-grary-600 " />
        <input type="url" name="govt_id_url" placeholder="Govt ID URL" value={formData.govt_id_url} onChange={handleChange} className="rounded-md border border-grary-600 " />
        <input type="url" name="payment_screenshot_url" placeholder="Payment Screenshot URL" value={formData.payment_screenshot_url} onChange={handleChange} className="rounded-md border border-grary-600 " />
        <input type="text" name="transaction_id" placeholder="Transaction ID" value={formData.transaction_id} onChange={handleChange} className="rounded-md border border-grary-600 " />
        <textarea name="transaction_detail" placeholder="Transaction Detail" value={formData.transaction_detail} onChange={handleChange} rows={2} className="rounded-md border border-grary-600 " />
      </div>
      <button type="submit" className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-md text-white">
        Submit Booking
      </button>
    </form>
  );
}
