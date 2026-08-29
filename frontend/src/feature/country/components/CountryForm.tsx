"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import FormActionButton from "@/components/shared/customBtns";
import Heading from "@/components/shared/heading";
import SeoFields from "@/components/shared/SeoFields";
import BannerSection from "@/components/shared/BannerSection";
import EntityFields from "@/components/shared/EntityFields";
import RichTextEditor from "@/components/shared/RichTextEditor";
import {
  useCreateCountry,
  useUpdateCountry,
} from "@/feature/country/api/useCountry";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import apiClient from "@/lib/apiClient";
import { errorToast } from "@/components/shared/tost";
import type { Country } from "@/feature/country/type";
import type { EntityField } from "@/components/shared/EntityFields";

interface CountryFormProps {
  initialData?: Country;
  mode: "create" | "edit";
}

const countryFields: EntityField[] = [
  { name: "capital", label: "Capital", placeholder: "e.g. New Delhi" },
  { name: "currency", label: "Currency", placeholder: "e.g. INR" },
  { name: "language", label: "Language", placeholder: "e.g. Hindi, English" },
  { name: "timezone", label: "Timezone", placeholder: "e.g. IST (UTC+5:30)" },
  { name: "bestTimeToVisit", label: "Best Time to Visit", placeholder: "e.g. October to March" },
  { name: "dialCode", label: "Dial Code", placeholder: "e.g. +91" },
];

export default function CountryFormPage({ initialData, mode }: CountryFormProps) {
  const router = useRouter();
  const { createCountry, isPending: isCreating } = useCreateCountry();
  const { updateCountry, isPending: isUpdating } = useUpdateCountry();
  const { user } = useGetCurrentUser();

  const normalizedRole = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = normalizedRole.includes("super") && normalizedRole.includes("admin");
  const isITTeam =
    user?.team?.name?.toLowerCase().includes("it") ||
    user?.team?.name?.toLowerCase().includes("maintenance");
  const canEdit = isSuperAdmin || isITTeam;

  const [seoData, setSeoData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    seoDescription: initialData?.seoDescription || "",
    overView: initialData?.overView || "",
    seoKeyword: initialData?.seoKeyword || "",
    thumbImg: initialData?.thumbImg || "",
    seoTitle: initialData?.seoTitle || "",
      h1Title: initialData?.h1Title || "",
  });

  const [moreDescription, setMoreDescription] = useState(initialData?.moreDescription || "");

  const [bannerTitle, setBannerTile] = useState(initialData?.banner?.bannerTitle || "");
  const [bannerTag, setBannerTag] = useState(initialData?.banner?.bannerTag || "");
  const [bannerImages, setBannerImages] = useState<string[]>(initialData?.banner?.images || []);
  const [bannerFiles, setBannerFiles] = useState<{ file: File; index: number }[]>([]);
  const [isActive, setIsActive] = useState<boolean>(initialData?.isActive ?? false);
  const [showOnSite, setShowOnSite] = useState<boolean>(initialData?.showOnSite ?? true);

  const [entityValues, setEntityValues] = useState<Record<string, string>>({
    capital: initialData?.capital || "",
    currency: initialData?.currency || "",
    language: initialData?.language || "",
    timezone: initialData?.timezone || "",
    bestTimeToVisit: initialData?.bestTimeToVisit || "",
    dialCode: initialData?.dialCode || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const initializedRef = React.useRef(false);

  React.useEffect(() => {
    if (initialData && !initializedRef.current) {
      initializedRef.current = true;
      setSeoData({
        title: initialData.title || "",
        slug: initialData.slug || "",
        seoDescription: initialData.seoDescription || "",
        overView: initialData.overView || "",
        seoKeyword: initialData.seoKeyword || "",
        seoTitle: initialData.seoTitle || "",
        thumbImg: initialData.thumbImg || "",
        h1Title: initialData.h1Title || "",
      });
      setMoreDescription(initialData.moreDescription || "");
      setBannerTile(initialData.banner?.bannerTitle || "");
      setBannerTag(initialData.banner?.bannerTag || "");
      setBannerImages(initialData.banner?.images || []);
      setIsActive(initialData.isActive ?? true);
      setShowOnSite(initialData.showOnSite ?? true);
      setEntityValues({
        capital: initialData.capital || "",
        currency: initialData.currency || "",
        language: initialData.language || "",
        timezone: initialData.timezone || "",
        bestTimeToVisit: initialData.bestTimeToVisit || "",
        dialCode: initialData.dialCode || "",
      });
    }
  }, [initialData]);

  const isLoading = isCreating || isUpdating;

  const handleSeoFieldChange = (name: string, value: string) => {
    setSeoData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleShortDescChange = (html: string) => {
    setSeoData((prev) => ({ ...prev, overView: html }));
  };

  const handleThumbImgUpload = (url: string) => {
    setSeoData((prev) => ({ ...prev, thumbImg: url }));
  };

  const handleEntityFieldChange = (name: string, value: string) => {
    setEntityValues((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!seoData.title.trim()) newErrors.title = "Title is required";
    if (!seoData.seoDescription.trim()) newErrors.seoDescription = "Description is required";
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
          fd.append("filename", seoData.slug ? `${seoData.slug}-holiday-${index + 1}` : `new-country-holiday-${index + 1}`);
          fd.append("label", seoData.slug ? `${seoData.slug}-holiday-${index + 1}` : `New Country Holiday ${index + 1}`);
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
      title: seoData.title.trim(),
      slug: seoData.slug.trim().replace(/-+$/g, "") || undefined,
      seoDescription: seoData.seoDescription.trim(),
      overView: seoData.overView.trim() || undefined,
      seoKeyword: seoData.seoKeyword.trim() || undefined,
      seoTitle: seoData.seoTitle.trim() || undefined,
      h1Title: seoData.h1Title.trim() || undefined,
      thumbImg: seoData.thumbImg.trim() || undefined,
      capital: entityValues.capital.trim() || undefined,
      currency: entityValues.currency.trim() || undefined,
      language: entityValues.language.trim() || undefined,
      timezone: entityValues.timezone.trim() || undefined,
      bestTimeToVisit: entityValues.bestTimeToVisit.trim() || undefined,
      dialCode: entityValues.dialCode.trim() || undefined,
      bannerTitle: bannerTitle.trim() || undefined,
      bannerTag: bannerTag.trim() || undefined,
      bannerImages: finalBannerImages,
      moreDescription: moreDescription.trim() || undefined,
      isActive,
      showOnSite,
    };

    if (mode === "edit" && initialData?.id) {
      updateCountry(
        { id: initialData.id, payload },
        { onSuccess: () => router.push("/dashboard/country") }
      );
    } else {
      createCountry(payload, {
        onSuccess: () => router.push("/dashboard/country"),
      });
    }
  };

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">You don&apos;t have permission to {mode} countries.</p>
        <Link href="/dashboard/country" className="text-sm text-brand-600 mt-2 hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/country"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <Heading
          heading={mode === "create" ? "Create Country" : "Edit Country"}
          tagLine={mode === "create" ? "Add a new country to the system" : `Editing ${initialData?.title || "country"}`}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SeoFields
          formData={seoData}
          onFieldChange={handleSeoFieldChange}
          onDescriptionChange={handleShortDescChange}
          onThumbImgUpload={handleThumbImgUpload}
          errors={errors}
          basePath=""
          folderPath={seoData.slug ? `${seoData.slug}/trip` : ""}
          bannerImages={bannerImages}
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
          folderPath={seoData.slug ? `${seoData.slug}/holiday` : ""}
          maxImages={15}
        />

        <EntityFields
          title="Country Details"
          fields={countryFields}
          values={entityValues}
          onFieldChange={handleEntityFieldChange}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block mb-2">More Description</label>
          <RichTextEditor content={moreDescription} onChange={(html) => setMoreDescription(html)} />
        </div>

        <div className="flex items-center justify-between gap-3 pb-8">
          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-300"
              />
              Active
            </label>
          </div>
          <div className="flex items-center gap-3">
          <Link
            href="/dashboard/country"
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
          <FormActionButton
            text={
              isLoading
                ? mode === "create" ? "Creating..." : "Updating..."
                : mode === "create" ? "Create Country" : "Update Country"
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
