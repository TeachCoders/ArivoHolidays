"use client";
import { Plus, Trash2, Hotel, Car, Navigation } from "lucide-react";

// ── Hotel Details ──
export interface HotelDetail {
  name: string;
  type: string;
  location: string;
  nights: number;
  pricePerNight: number;
}

// ── Car Details ──
export interface CarDetail {
  name: string;
  ownerName: string;
  type: string;
  location: string;
  price: number;
}

// ── Guide Details ──
export interface GuideDetail {
  name: string;
  language: string;
  location: string;
  pricePerDay: number;
}

// ── Hotel Editor ──
function HotelEditor({ value, onChange }: { value: HotelDetail[]; onChange: (v: HotelDetail[]) => void }) {
  const add = () => onChange([...value, { name: "", type: "", location: "", nights: 1, pricePerNight: 0 }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const update = (i: number, data: Partial<HotelDetail>) => {
    onChange(value.map((h, idx) => (idx === i ? { ...h, ...data } : h)));
  };

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">No hotels added</p>
      )}
      {value.map((hotel, i) => (
        <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <Hotel size={14} className="text-indigo-400 shrink-0" />
          <input value={hotel.name} onChange={e => update(i, { name: e.target.value })} placeholder="Hotel Name" className="flex-1 text-xs px-2 py-1.5 border border-brand-neutral-border rounded-md bg-white outline-none focus:ring-1 focus:ring-brand-primary" />
          <select value={hotel.type} onChange={e => update(i, { type: e.target.value })} className="text-xs px-2 py-1.5 border border-brand-neutral-border rounded-md bg-white outline-none focus:ring-1 focus:ring-brand-primary">
            <option value="">Type</option>
            <option value="3 Star">3 Star</option>
            <option value="4 Star">4 Star</option>
            <option value="5 Star">5 Star</option>
            <option value="Resort">Resort</option>
            <option value="Budget">Budget</option>
            <option value="Heritage">Heritage</option>
          </select>
          <input value={hotel.location} onChange={e => update(i, { location: e.target.value })} placeholder="Location" className="w-24 text-xs px-2 py-1.5 border border-brand-neutral-border rounded-md bg-white outline-none focus:ring-1 focus:ring-brand-primary" />
          <input type="number" value={hotel.nights} onChange={e => update(i, { nights: parseInt(e.target.value) || 0 })} placeholder="Nights" className="w-16 text-xs px-2 py-1.5 border border-brand-neutral-border rounded-md bg-white outline-none focus:ring-1 focus:ring-brand-primary text-center" />
          <input type="number" value={hotel.pricePerNight} onChange={e => update(i, { pricePerNight: parseFloat(e.target.value) || 0 })} placeholder="Price/Night" className="w-24 text-xs px-2 py-1.5 border border-brand-neutral-border rounded-md bg-white outline-none focus:ring-1 focus:ring-brand-primary" />
          <button type="button" onClick={() => remove(i)} className="p-1.5 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-500"><Trash2 size={13} /></button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-primary mt-1"><Plus size={13} /> Add Hotel</button>
    </div>
  );
}

// ── Car Editor ──
function CarEditor({ value, onChange }: { value: CarDetail[]; onChange: (v: CarDetail[]) => void }) {
  const add = () => onChange([...value, { name: "", ownerName: "", type: "", location: "", price: 0 }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const update = (i: number, data: Partial<CarDetail>) => {
    onChange(value.map((c, idx) => (idx === i ? { ...c, ...data } : c)));
  };

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">No cars added</p>
      )}
      {value.map((car, i) => (
        <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <Car size={14} className="text-emerald-400 shrink-0" />
          <input value={car.name} onChange={e => update(i, { name: e.target.value })} placeholder="Car Name" className="flex-1 text-xs px-2 py-1.5 border border-brand-neutral-border rounded-md bg-white outline-none focus:ring-1 focus:ring-brand-success" />
          <input value={car.ownerName} onChange={e => update(i, { ownerName: e.target.value })} placeholder="Owner Name" className="w-28 text-xs px-2 py-1.5 border border-brand-neutral-border rounded-md bg-white outline-none focus:ring-1 focus:ring-brand-success" />
          <select value={car.type} onChange={e => update(i, { type: e.target.value })} className="text-xs px-2 py-1.5 border border-brand-neutral-border rounded-md bg-white outline-none focus:ring-1 focus:ring-brand-success">
            <option value="">Type</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Innova">Innova</option>
            <option value="Innova Crysta">Innova Crysta</option>
            <option value="Tempo Traveller">Tempo Traveller</option>
            <option value="Bus">Bus</option>
          </select>
          <input value={car.location} onChange={e => update(i, { location: e.target.value })} placeholder="Location" className="w-24 text-xs px-2 py-1.5 border border-brand-neutral-border rounded-md bg-white outline-none focus:ring-1 focus:ring-brand-success" />
          <input type="number" value={car.price} onChange={e => update(i, { price: parseFloat(e.target.value) || 0 })} placeholder="Price" className="w-24 text-xs px-2 py-1.5 border border-brand-neutral-border rounded-md bg-white outline-none focus:ring-1 focus:ring-brand-success" />
          <button type="button" onClick={() => remove(i)} className="p-1.5 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-500"><Trash2 size={13} /></button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1.5 text-xs font-semibold text-brand-success hover:text-brand-success mt-1"><Plus size={13} /> Add Car</button>
    </div>
  );
}

// ── Guide Editor ──
function GuideEditor({ value, onChange }: { value: GuideDetail[]; onChange: (v: GuideDetail[]) => void }) {
  const add = () => onChange([...value, { name: "", language: "", location: "", pricePerDay: 0 }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const update = (i: number, data: Partial<GuideDetail>) => {
    onChange(value.map((g, idx) => (idx === i ? { ...g, ...data } : g)));
  };

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">No guides added</p>
      )}
      {value.map((guide, i) => (
        <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <Navigation size={14} className="text-amber-400 shrink-0" />
          <input value={guide.name} onChange={e => update(i, { name: e.target.value })} placeholder="Guide Name" className="flex-1 text-xs px-2 py-1.5 border border-brand-neutral-border rounded-md bg-white outline-none focus:ring-1 focus:ring-brand-warning" />
          <input value={guide.language} onChange={e => update(i, { language: e.target.value })} placeholder="Language" className="w-28 text-xs px-2 py-1.5 border border-brand-neutral-border rounded-md bg-white outline-none focus:ring-1 focus:ring-brand-warning" />
          <input value={guide.location} onChange={e => update(i, { location: e.target.value })} placeholder="Location" className="w-24 text-xs px-2 py-1.5 border border-brand-neutral-border rounded-md bg-white outline-none focus:ring-1 focus:ring-brand-warning" />
          <input type="number" value={guide.pricePerDay} onChange={e => update(i, { pricePerDay: parseFloat(e.target.value) || 0 })} placeholder="Price/Day" className="w-24 text-xs px-2 py-1.5 border border-brand-neutral-border rounded-md bg-white outline-none focus:ring-1 focus:ring-brand-warning" />
          <button type="button" onClick={() => remove(i)} className="p-1.5 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-500"><Trash2 size={13} /></button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1.5 text-xs font-semibold text-brand-warning hover:text-brand-warning mt-1"><Plus size={13} /> Add Guide</button>
    </div>
  );
}

// ── Main Component ──
interface ServiceDetailsEditorProps {
  hotelValue: HotelDetail[];
  hotelOnChange: (v: HotelDetail[]) => void;
  carValue: CarDetail[];
  carOnChange: (v: CarDetail[]) => void;
  guideValue: GuideDetail[];
  guideOnChange: (v: GuideDetail[]) => void;
}

export default function ServiceDetailsEditor({
  hotelValue, hotelOnChange,
  carValue, carOnChange,
  guideValue, guideOnChange,
}: ServiceDetailsEditorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Hotel size={15} className="text-brand-primary" /> Hotel Details</h4>
        <HotelEditor value={hotelValue} onChange={hotelOnChange} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Car size={15} className="text-brand-success" /> Car Details</h4>
        <CarEditor value={carValue} onChange={carOnChange} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Navigation size={15} className="text-brand-warning" /> Guide Details</h4>
        <GuideEditor value={guideValue} onChange={guideOnChange} />
      </div>
    </div>
  );
}
