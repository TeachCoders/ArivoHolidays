"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Heading from "@/components/shared/heading";
import FormActionButton from "@/components/shared/customBtns";
import SeoFields from "@/components/shared/SeoFields";
import BannerSection from "@/components/shared/BannerSection";
import RichTextEditor from "@/components/shared/RichTextEditor";
import FaqEditor, { FaqData } from "@/components/shared/FaqEditor";
import {
  useCreateTravelExperience,
  useUpdateTravelExperience,
} from "@/feature/travelExperience/api/useTravelExperience";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import apiClient from "@/lib/apiClient";
import { errorToast } from "@/components/shared/tost";
import type { TravelExperience } from "@/feature/travelExperience/type";

interface TravelExperienceFormProps {
  initialData?: TravelExperience;
  mode: "create" | "edit";
}

export default function TravelExperienceForm({ initialData, mode }: TravelExperienceFormProps) {
  const router = useRouter();
  const { createTravelExperience, isPending: isCreating } = useCreateTravelExperience();
  const { updateTravelExperience, isPending: isUpdating } = useUpdateTravelExperience();
  const { user } = useGetCurrentUser();

  const normalizedRole = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = normalizedRole.includes("super") && normalizedRole.includes("admin");
  const isITTeam =
    user?.team?.name?.toLowerCase().includes("it") ||
    user?.team?.name?.toLowerCase().includes("maintenance");
  const canEdit = isSuperAdmin || isITTeam;

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    seoDescription: initialData?.seoDescription || "",
    overView: initialData?.overView || "",
    seoKeyword: initialData?.seoKeyword || "",
    seoTitle: initialData?.seoTitle || "",
      h1Title: initialData?.h1Title || "",
    thumbImg: initialData?.thumbImg || "",
    isActive: initialData?.isActive ?? false,
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
        isActive: initialData.isActive ?? true,
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
          fd.append("filename", formData.slug ? `${formData.slug}-holiday-${index + 1}` : `new-experience-holiday-${index + 1}`);
          fd.append("label", formData.slug ? `${formData.slug}-holiday-${index + 1}` : `New Experience Holiday ${index + 1}`);
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
      isActive: formData.isActive,
      bannerTitle: bannerTitle.trim() || undefined,
      bannerTag: bannerTag.trim() || undefined,
      bannerImages: finalBannerImages.length > 0 ? finalBannerImages : undefined,
      moreDescription: moreDescription.trim() || undefined,
      faqs,
    };

    if (mode === "edit" && initialData?.id) {
      updateTravelExperience(
        { id: initialData.id, payload },
        { onSuccess: () => router.push("/dashboard/travel-experience") }
      );
    } else {
      createTravelExperience(payload, {
        onSuccess: () => router.push("/dashboard/travel-experience"),
      });
    }
  };

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">You don&apos;t have permission to {mode} travel experiences.</p>
        <Link href="/dashboard/travel-experience" className="text-sm text-brand-600 mt-2 hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/travel-experience"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <Heading
          heading={mode === "create" ? "Create Travel Experience" : "Edit Travel Experience"}
          tagLine={mode === "create" ? "Add a new travel experience to the system" : `Editing ${initialData?.title || "experience"}`}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <SeoFields
          formData={formData}
          onFieldChange={handleFieldChange}
          onDescriptionChange={handleShortDescChange}
          onThumbImgUpload={handleThumbImgUpload}
          errors={errors}
          basePath="/travel-experience"
          folderPath={formData.slug ? `${formData.slug}/trip` : ""}
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
          folderPath={formData.slug ? `${formData.slug}/holiday` : ""}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block mb-2">More Description</label>
          <RichTextEditor content={moreDescription} onChange={(html) => setMoreDescription(html)} />
        </div>

        <FaqEditor faqs={faqs} setFaqs={setFaqs} />

        <div className="flex items-center justify-between gap-3 pb-8">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-slate-300"
            />
            Active
          </label>
          <div className="flex items-center gap-3">
          <Link
            href="/dashboard/travel-experience"
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
          <FormActionButton
            text={
              isLoading
                ? mode === "create" ? "Creating..." : "Updating..."
                : mode === "create" ? "Create Experience" : "Update Experience"
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
