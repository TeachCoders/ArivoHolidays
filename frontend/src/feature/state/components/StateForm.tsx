"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormActionButton from "@/components/shared/customBtns";
import Heading from "@/components/shared/heading";
import SeoFields from "@/components/shared/SeoFields";
import BannerSection from "@/components/shared/BannerSection";
import RichTextEditor from "@/components/shared/RichTextEditor";
import FaqEditor, { FaqData } from "@/components/shared/FaqEditor";
import {
  useCreateState,
  useUpdateState,
} from "@/feature/state/api/useState";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import { useGetCountries } from "@/feature/country/api/useCountry";
import { errorToast } from "@/components/shared/tost";
import apiClient from "@/lib/apiClient";
import type { Country } from "@/feature/country/type";
import type { State } from "@/feature/state/type";

interface StateFormProps {
  initialData?: State;
  mode: "create" | "edit";
}

const stateFields = [
  { name: "capital", label: "Capital", placeholder: "e.g. Mumbai" },
  { name: "language", label: "Language", placeholder: "e.g. Hindi, Marathi" },
  { name: "area", label: "Area", placeholder: "e.g. 603 km²" },
];

export default function StateFormPage({ initialData, mode }: StateFormProps) {
  const router = useRouter();
  const { createState, isPending: isCreating } = useCreateState();
  const { updateState, isPending: isUpdating } = useUpdateState();
  const { user } = useGetCurrentUser();

  const normalizedRole = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = normalizedRole.includes("super") && normalizedRole.includes("admin");
  const isITTeam =
    user?.team?.name?.toLowerCase().includes("it") ||
    user?.team?.name?.toLowerCase().includes("maintenance");
  const canEdit = isSuperAdmin || isITTeam;

  const { countries, isLoading: loadingCountries } = useGetCountries({ limit: 1000 });

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    seoDescription: initialData?.seoDescription || "",
    overView: initialData?.overView || "",
    seoKeyword: initialData?.seoKeyword || "",
    seoTitle: initialData?.seoTitle || "",
    h1Title: initialData?.h1Title || "",
    thumbImg: initialData?.thumbImg || "",
    capital: initialData?.capital || "",
    language: initialData?.language || "",
    famousFor: initialData?.famousFor || "",
    area: initialData?.area || "",
    countryId: initialData?.countryId || 0,
    isActive: initialData?.isActive ?? false,
    showOnSite: initialData?.showOnSite ?? true,
  });

  const countrySlug = initialData?.country?.slug || countries.find(c => c.id === formData.countryId)?.slug || "";

  const [bannerTitle, setBannerTile] = useState(initialData?.banner?.bannerTitle || "");
  const [bannerTag, setBannerTag] = useState(initialData?.banner?.bannerTag || "");
  const [bannerImages, setBannerImages] = useState<string[]>(initialData?.banner?.images || []);
  const [bannerFiles, setBannerFiles] = useState<{ file: File; index: number }[]>([]);
  const [moreDescription, setMoreDescription] = useState(initialData?.moreDescription || "");
  const [faqs, setFaqs] = useState<FaqData[]>(initialData?.faqs || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initializedRef = React.useRef(false);

  React.useEffect(() => {
    if (initialData && !initializedRef.current) {
      initializedRef.current = true;
      setFormData({
        title: initialData.title || "",
        slug: initialData.slug || "",
        seoDescription: initialData.seoDescription || "",
        overView: initialData.overView || "",
        seoKeyword: initialData.seoKeyword || "",
        seoTitle: initialData.seoTitle || "",
        h1Title: initialData.h1Title || "",
        thumbImg: initialData.thumbImg || "",
        capital: initialData.capital || "",
        language: initialData.language || "",
        famousFor: initialData.famousFor || "",
        area: initialData.area || "",
        countryId: initialData.countryId || 0,
        isActive: initialData.isActive ?? true,
        showOnSite: initialData.showOnSite ?? true,
      });
      setBannerTile(initialData.banner?.bannerTitle || "");
      setBannerTag(initialData.banner?.bannerTag || "");
      setBannerImages(initialData.banner?.images || []);
      setMoreDescription(initialData.moreDescription || "");
      setFaqs(initialData.faqs || []);
    }
  }, [initialData]);

  const isLoading = isCreating || isUpdating;



  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.seoDescription.trim()) newErrors.seoDescription = "Description is required";
    if (!formData.countryId) newErrors.countryId = "Country is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleShortDescChange = (html: string) => {
    setFormData((prev) => ({ ...prev, overView: html }));
  };

  const handleThumbImgUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, thumbImg: url }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    let finalBannerImages = bannerImages;
    try {
      if (bannerFiles.length > 0) {
        const merged = [...bannerImages];
        const ordered = [...bannerFiles].sort((a, b) => a.index - b.index);
        for (const { file, index } of ordered) {
          const fd = new FormData();
          fd.append("category", "banner");
          fd.append("filename", formData.slug ? `${formData.slug}-holiday-${index + 1}` : `new-state-holiday-${index + 1}`);
          fd.append("label", formData.slug ? `${formData.slug}-holiday-${index + 1}` : `New State Holiday ${index + 1}`);
          fd.append("file", file);
          const res = await apiClient.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
          const url = res.data?.url;
          if (url) merged.splice(index, 0, url);
        }
        finalBannerImages = merged;
      }
    } catch {
      return errorToast("Banner upload failed, please try again");
    }

    const payload: any = {
      title: formData.title.trim(),
      seoDescription: formData.seoDescription.trim(),
      slug: formData.slug.trim().replace(/-+$/g, "") || undefined,
      overView: formData.overView.trim() || undefined,
      seoKeyword: formData.seoKeyword.trim() || undefined,
      seoTitle: formData.seoTitle.trim() || undefined,
      h1Title: formData.h1Title.trim() || undefined,
      thumbImg: formData.thumbImg.trim() || undefined,
      capital: formData.capital.trim() || undefined,
      language: formData.language.trim() || undefined,
      famousFor: formData.famousFor.trim() || undefined,
      area: formData.area.trim() || undefined,
      countryId: formData.countryId,
      isActive: formData.isActive,
      showOnSite: formData.showOnSite,
      bannerTitle: bannerTitle.trim() || undefined,
      bannerTag: bannerTag.trim() || undefined,
      bannerImages: finalBannerImages,
      moreDescription: moreDescription.trim() || undefined,
      faqs,
    };

    if (mode === "edit" && initialData?.id) {
      updateState(
        { id: initialData.id, payload },
        { onSuccess: () => router.push("/dashboard/state") }
      );
    } else {
      createState(payload, {
        onSuccess: () => router.push("/dashboard/state"),
      });
    }
  };

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">You don&apos;t have permission to {mode} states.</p>
        <Link href="/dashboard/state" className="text-sm text-brand-600 mt-2 hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/state"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <Heading
          heading={mode === "create" ? "Create State" : "Edit State"}
          tagLine={mode === "create" ? "Add a new state to the system" : `Editing ${initialData?.title || "state"}`}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Country Selector */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Country</h2>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Country <span className="text-red-500">*</span>
            </Label>
            <select
              value={formData.countryId || ""}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, countryId: Number(e.target.value) }));
                if (errors.countryId) setErrors((prev) => ({ ...prev, countryId: "" }));
              }}
              disabled={loadingCountries}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.countryId ? "border-red-400" : "border-slate-300"}`}
            >
              <option value="">{loadingCountries ? "Loading countries..." : "Select a country"}</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.title}
                </option>
              ))}
            </select>
            {errors.countryId && <p className="text-xs text-red-500">{errors.countryId}</p>}
          </div>
        </div>

        {/* SEO Fields */}
        <SeoFields
          formData={{
            title: formData.title,
            seoTitle: formData.seoTitle,
            slug: formData.slug,
            seoDescription: formData.seoDescription,
            overView: formData.overView,
            seoKeyword: formData.seoKeyword || "",
            thumbImg: formData.thumbImg || "",
            h1Title: formData.h1Title || "",
          }}
          onFieldChange={handleFieldChange}
          onDescriptionChange={handleShortDescChange}
          onThumbImgUpload={handleThumbImgUpload}
          errors={errors}
          bannerImages={bannerImages}
          basePath={countrySlug ? `/${countrySlug}` : "/state"}
          folderPath={countrySlug ? `${countrySlug}/trip` : ""}
        />

        {/* Banner Section */}
        <BannerSection
          bannerTitle={bannerTitle}
          bannerTag={bannerTag}
          bannerImages={bannerImages}
          onBannerTileChange={setBannerTile}
          onBannerTagChange={setBannerTag}
          onBannerImagesChange={setBannerImages}
          onBannerFilesSelect={(files, indices) =>
            setBannerFiles(files.map((file, i) => ({ file, index: indices?.[i] ?? bannerImages.length + i })))
          }
          folderPath={countrySlug ? `${countrySlug}/holiday` : ""}
        />

        {/* State Details */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-slate-500" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">State Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stateFields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-600">{field.label}</Label>
                <Input
                  value={(formData as any)[field.name]}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block mb-2">Famous For</label>
          <RichTextEditor content={formData.famousFor} onChange={(html) => handleFieldChange("famousFor", html)} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block mb-2">More Description</label>
          <RichTextEditor content={moreDescription} onChange={(html) => setMoreDescription(html)} />
        </div>

        <FaqEditor faqs={faqs} setFaqs={setFaqs} />

        {/* Submit */}
        <div className="flex items-center justify-between gap-3 pb-8">
          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-slate-300"
              />
              Active
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/state"
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </Link>
            <FormActionButton
              text={
                isLoading
                  ? mode === "create" ? "Creating..." : "Updating..."
                  : mode === "create" ? "Create State" : "Update State"
              }
              type="submit"
              isLoading={isLoading}
              size="md"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
