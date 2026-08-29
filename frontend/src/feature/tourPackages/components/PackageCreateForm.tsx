"use client";
import { useState, useEffect } from "react";
import { useCreatePackageMutation, useUpdatePackageMutation, useUploadBannerMutation } from "../api/useTourPackages";
import DayItineraryEditor from "./DayItineraryEditor";
import ServiceDetailsEditor, { HotelDetail, CarDetail, GuideDetail } from "./ServiceDetailsEditor";
import BannerImageUpload from "./BannerImageUpload";
import InclusionExclusionEditor from "./InclusionExclusionEditor";
import { Save, X, ChevronDown, ChevronUp } from "lucide-react";
import PageLoader from "@/components/shared/PageLoader";
import { successToast, errorToast } from "@/components/shared/tost";

interface PackageCreateFormProps {
  initialData?: any;
  onClose: () => void;
}

const defaultForm = {
  name: "",
  destination: "",
  duration: "",
  durationDays: 0,
  pricePerPerson: 0,
  discountPrice: null as number | null,
  shortDescription: "",
  description: "",
  bannerImageUrl: [] as string[],
  itinerary: [] as { day: number; title: string; content: string }[],
  hotelDetails: [] as HotelDetail[],
  carDetails: [] as CarDetail[],
  guideDetails: [] as GuideDetail[],
  includes: [] as string[],
  excludes: [] as string[],
  isActive: true,
  isBestSelling: false,
  displayOrder: 0,
};

export default function PackageCreateForm({ initialData, onClose }: PackageCreateFormProps) {
  const [form, setForm] = useState(defaultForm);
  const [bannerFiles, setBannerFiles] = useState<{ file: File; index: number }[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true, banner: true, description: true, itinerary: true,
    services: true, inclusions: true, display: true,
  });

  const createMutation = useCreatePackageMutation();
  const updateMutation = useUpdatePackageMutation();
  const uploadBanner = useUploadBannerMutation();

  const isEditing = !!initialData;
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        destination: initialData.destination || "",
        duration: initialData.duration || "",
        durationDays: initialData.durationDays || 0,
        pricePerPerson: initialData.pricePerPerson || 0,
        discountPrice: initialData.discountPrice || null,
        shortDescription: initialData.shortDescription || "",
        description: initialData.description || "",
        bannerImageUrl: initialData.bannerImageUrl || [],
        itinerary: initialData.itinerary || [],
        hotelDetails: initialData.hotelDetails || [],
        carDetails: initialData.carDetails || [],
        guideDetails: initialData.guideDetails || [],
        includes: initialData.includes || [],
        excludes: initialData.excludes || [],
        isActive: initialData.isActive ?? true,
        isBestSelling: initialData.isBestSelling ?? false,
        displayOrder: initialData.displayOrder || 0,
      });
    }
  }, [initialData]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateField = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return errorToast("Package name is required");
    if (!form.destination.trim()) return errorToast("Destination is required");

    try {
      let result;
      const payload = { ...form };
      if (isEditing) {
        result = await updateMutation.mutateAsync({ id: initialData.id, payload });
      } else {
        result = await createMutation.mutateAsync(payload);
      }

      // Upload multiple banner files (ascending index so insert positions stay correct)
      if (bannerFiles.length > 0 && result?.data?.id) {
        const ordered = [...bannerFiles].sort((a, b) => a.index - b.index);
        for (const { file, index } of ordered) {
          await uploadBanner.mutateAsync({ id: result.data.id, file, index });
        }
      }

      successToast(isEditing ? "Package updated!" : "Package created!");
      onClose();
    } catch {
      errorToast("Failed to save package. Please try again.");
    }
  };

  const Section = ({ title, sectionKey, children }: { title: string; sectionKey: string; children: React.ReactNode }) => (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button type="button" onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors">
        <span className="text-sm font-bold text-slate-700">{title}</span>
        {expandedSections[sectionKey] ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {expandedSections[sectionKey] && <div className="p-5">{children}</div>}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <Section title="Basic Info" sectionKey="basic">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Package Name *</label>
            <input type="text" value={form.name} onChange={e => updateField("name", e.target.value)}
              placeholder="e.g. Golden Triangle Tour" className="w-full text-sm px-3 py-2 border border-brand-neutral-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Destination *</label>
            <input type="text" value={form.destination} onChange={e => updateField("destination", e.target.value)}
              placeholder="e.g. Rajasthan" className="w-full text-sm px-3 py-2 border border-brand-neutral-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Duration (text)</label>
            <input type="text" value={form.duration} onChange={e => updateField("duration", e.target.value)}
              placeholder="e.g. 5N/6D" className="w-full text-sm px-3 py-2 border border-brand-neutral-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Duration (days)</label>
            <input type="number" value={form.durationDays} onChange={e => updateField("durationDays", parseInt(e.target.value) || 0)}
              className="w-full text-sm px-3 py-2 border border-brand-neutral-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Price per Person (₹)</label>
            <input type="number" value={form.pricePerPerson} onChange={e => updateField("pricePerPerson", parseFloat(e.target.value) || 0)}
              className="w-full text-sm px-3 py-2 border border-brand-neutral-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Discount Price (₹)</label>
            <input type="number" value={form.discountPrice || ""} onChange={e => updateField("discountPrice", e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full text-sm px-3 py-2 border border-brand-neutral-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary" />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Short Description</label>
          <textarea value={form.shortDescription} onChange={e => updateField("shortDescription", e.target.value)}
            placeholder="1-2 line summary for card display" rows={2}
            className="w-full text-sm px-3 py-2 border border-brand-neutral-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary resize-none" />
        </div>
      </Section>

      {/* Banner Images */}
      <Section title="Banner Images" sectionKey="banner">
        <BannerImageUpload
          value={form.bannerImageUrl}
          onChange={(urls) => updateField("bannerImageUrl", urls)}
          onFilesSelect={(files, indices) =>
            setBannerFiles(files.map((file, i) => ({ file, index: indices?.[i] ?? (form.bannerImageUrl?.length || 0) + i })))
          }
          maxImages={15}
          folderPath={form.name ? form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "/holiday" : ""}
        />
      </Section>

      {/* Day-wise Itinerary */}
      <Section title="Day-wise Itinerary" sectionKey="itinerary">
        <DayItineraryEditor value={form.itinerary} onChange={v => updateField("itinerary", v)} />
      </Section>

      {/* Service Details */}
      <Section title="Hotel / Car / Guide Details" sectionKey="services">
        <ServiceDetailsEditor
          hotelValue={form.hotelDetails} hotelOnChange={v => updateField("hotelDetails", v)}
          carValue={form.carDetails} carOnChange={v => updateField("carDetails", v)}
          guideValue={form.guideDetails} guideOnChange={v => updateField("guideDetails", v)}
        />
      </Section>

      {/* Inclusions / Exclusions */}
      <Section title="Inclusions & Exclusions" sectionKey="inclusions">
        <InclusionExclusionEditor
          includes={form.includes} includesOnChange={v => updateField("includes", v)}
          excludes={form.excludes} excludesOnChange={v => updateField("excludes", v)}
        />
      </Section>

      {/* Display Settings */}
      <Section title="Display Settings" sectionKey="display">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => updateField("isActive", e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
            Active (show on website)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.isBestSelling} onChange={e => updateField("isBestSelling", e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded border-slate-300" />
            Best Selling
          </label>
          <div>
            <label className="text-xs font-semibold text-slate-500 mr-2">Display Order:</label>
            <input type="number" value={form.displayOrder} onChange={e => updateField("displayOrder", parseInt(e.target.value) || 0)}
              className="w-20 text-sm px-2 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-primary rounded-xl hover:bg-brand-primary disabled:opacity-50 transition-colors">
          {isPending && <PageLoader size="inline" />}
          <Save size={15} />
          {isEditing ? "Update Package" : "Create Package"}
        </button>
      </div>
    </div>
  );
}
