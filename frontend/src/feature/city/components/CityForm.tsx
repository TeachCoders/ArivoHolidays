"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Heading from "@/components/shared/heading";
import FormActionButton from "@/components/shared/customBtns";
import SeoFields from "@/components/shared/SeoFields";
import BannerSection from "@/components/shared/BannerSection";
import EntityFields from "@/components/shared/EntityFields";
import type { EntityField } from "@/components/shared/EntityFields";
import RichTextEditor from "@/components/shared/RichTextEditor";
import FaqEditor, { FaqData } from "@/components/shared/FaqEditor";
import {
  useCreateCity,
  useUpdateCity,
} from "@/feature/city/api/useCity";
import { getStates, getStateById } from "@/feature/state/api";
import AsyncSelect from "@/components/shared/AsyncSelect";
import { usePermissions } from "@/hooks/usePermissions";
import apiClient from "@/lib/apiClient";
import { errorToast } from "@/components/shared/tost";
import type { City } from "@/feature/city/type";

interface CityFormProps {
  initialData?: City;
  mode: "create" | "edit";
}

const cityFields: EntityField[] = [
  { name: "attractions", label: "Attractions", placeholder: "e.g. Taj Mahal, Varanasi Ghats", type: "textarea" },
  { name: "weather", label: "Weather", placeholder: "e.g. Tropical, moderate" },
];

export default function CityForm({ initialData, mode }: CityFormProps) {
  const router = useRouter();
  const { createCity, isPending: isCreating } = useCreateCity();
  const { updateCity, isPending: isUpdating } = useUpdateCity();
  const { canEditAdminContent: canEdit } = usePermissions();

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    seoDescription: initialData?.seoDescription || "",
    overView: initialData?.overView || "",
    seoKeyword: initialData?.seoKeyword || "",
    seoTitle: initialData?.seoTitle || "",
      h1Title: initialData?.h1Title || "",
    thumbImg: initialData?.thumbImg || "",
    stateId: initialData?.stateId || 0,
    isActive: initialData?.isActive ?? false,
    showOnSite: initialData?.showOnSite ?? true,
  });

  const [selectedState, setSelectedState] = useState<any>(initialData?.state || null);

  React.useEffect(() => {
    if (formData.stateId && formData.stateId !== selectedState?.id) {
      getStateById(formData.stateId).then((stateData) => {
        if (stateData) setSelectedState(stateData);
      }).catch(console.error);
    }
  }, [formData.stateId]);

  const stateSlug = selectedState?.slug || "";
  const countrySlug = selectedState?.country?.slug || "";

  const [entityValues, setEntityValues] = useState<Record<string, string>>({
    famousFor: initialData?.famousFor || "",
    attractions: initialData?.attractions || "",
    weather: initialData?.weather || "",
  });

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
        stateId: initialData.stateId || 0,
        isActive: initialData.isActive ?? true,
        showOnSite: initialData.showOnSite ?? true,
      });
      setEntityValues({
        famousFor: initialData.famousFor || "",
        attractions: initialData.attractions || "",
        weather: initialData.weather || "",
      });
      setBannerTile(initialData.banner?.bannerTitle || "");
      setBannerTag(initialData.banner?.bannerTag || "");
      setBannerImages(initialData.banner?.images || []);
      setMoreDescription(initialData.moreDescription || "");
      setFaqs(initialData.faqs || []);
    }
  }, [initialData]);

  const isLoading = isCreating || isUpdating;

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleEntityChange = (name: string, value: string) => {
    setEntityValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleShortDescChange = (html: string) => {
    setFormData((prev) => ({ ...prev, overView: html }));
  };

  const handleThumbImgUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, thumbImg: url }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.seoDescription.trim()) newErrors.seoDescription = "Description is required";
    if (!formData.stateId) newErrors.stateId = "State is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
          fd.append("filename", formData.slug ? `${formData.slug}-holiday-${index + 1}` : `new-city-holiday-${index + 1}`);
          fd.append("label", formData.slug ? `${formData.slug}-holiday-${index + 1}` : `New City Holiday ${index + 1}`);
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
      stateId: formData.stateId,
      isActive: formData.isActive,
      showOnSite: formData.showOnSite,
      famousFor: entityValues.famousFor.trim() || undefined,
      attractions: entityValues.attractions.trim() || undefined,
      weather: entityValues.weather.trim() || undefined,
      bannerTitle: bannerTitle.trim() || undefined,
      bannerTag: bannerTag.trim() || undefined,
      bannerImages: finalBannerImages,
      moreDescription: moreDescription.trim() || undefined,
      faqs,
    };

    if (mode === "edit" && initialData?.id) {
      updateCity(
        { id: initialData.id, payload },
        { onSuccess: () => router.push("/dashboard/city") }
      );
    } else {
      createCity(payload, {
        onSuccess: () => router.push("/dashboard/city"),
      });
    }
  };

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">You don&apos;t have permission to {mode} cities.</p>
        <Link href="/dashboard/city" className="text-sm text-brand-600 mt-2 hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/city"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <Heading
          heading={mode === "create" ? "Create City" : "Edit City"}
          tagLine={mode === "create" ? "Add a new city to the system" : `Editing ${initialData?.title || "city"}`}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Basic Information</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              State <span className="text-red-500">*</span>
            </label>
            <AsyncSelect
              selectedId={formData.stateId || null}
              onChange={(id) => {
                setFormData((prev) => ({ ...prev, stateId: id || 0 }));
                if (errors.stateId) setErrors((prev) => ({ ...prev, stateId: "" }));
              }}
              fetchOptions={async (search) => {
                const res = await getStates({ search, limit: 20 });
                return res.data;
              }}
              initialOptions={initialData?.state ? [initialData.state] : []}
              placeholder="Select a state"
              searchPlaceholder="Search states..."
              error={errors.stateId}
            />
            {errors.stateId && <p className="text-xs text-red-500">{errors.stateId}</p>}
          </div>
        </div>

        <SeoFields
          formData={formData}
          onFieldChange={handleFieldChange}
          onDescriptionChange={handleShortDescChange}
          onThumbImgUpload={handleThumbImgUpload}
          errors={errors}
          bannerImages={bannerImages}
          basePath={stateSlug ? `/${stateSlug}` : "/city"}
          folderPath={countrySlug ? `${countrySlug}/trip` : ""}
        />

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

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block mb-2">Famous For</label>
          <RichTextEditor content={entityValues.famousFor} onChange={(html) => handleEntityChange("famousFor", html)} />
        </div>

        <EntityFields
          title="City Details"
          fields={cityFields}
          values={entityValues}
          onFieldChange={handleEntityChange}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block mb-2">More Description</label>
          <RichTextEditor content={moreDescription} onChange={(html) => setMoreDescription(html)} />
        </div>

        <FaqEditor faqs={faqs} setFaqs={setFaqs} />

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
            href="/dashboard/city"
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
          <FormActionButton
            text={
              isLoading
                ? mode === "create" ? "Creating..." : "Updating..."
                : mode === "create" ? "Create City" : "Update City"
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
