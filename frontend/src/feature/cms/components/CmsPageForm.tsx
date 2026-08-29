"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Heading from "@/components/shared/heading";
import FormActionButton from "@/components/shared/customBtns";
import SeoFields from "@/components/shared/SeoFields";
import RichTextEditor from "@/components/shared/RichTextEditor";
import {
  useCreateCmsPage,
  useUpdateCmsPage,
} from "@/feature/cms/api/useCmsPage";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import { errorToast } from "@/components/shared/tost";
import type { CmsPage } from "@/feature/cms/type";

interface CmsPageFormProps {
  initialData?: CmsPage;
  mode: "create" | "edit";
}

export default function CmsPageForm({ initialData, mode }: CmsPageFormProps) {
  const router = useRouter();
  const { createCmsPage, isPending: isCreating } = useCreateCmsPage();
  const { updateCmsPage, isPending: isUpdating } = useUpdateCmsPage();
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
    overView: "",
    seoKeyword: initialData?.seoKeyword || "",
    thumbImg: initialData?.thumbImg || "",
    seoTitle: initialData?.seoTitle || "",
      h1Title: initialData?.h1Title || "",
    isActive: initialData?.isActive ?? false,
  });

  const [moreDescription, setMoreDescription] = useState(initialData?.moreDescription || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isLoading = isCreating || isUpdating;

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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

    const payload: any = {
      title: formData.title.trim(),
      seoDescription: formData.seoDescription.trim(),
      slug: formData.slug.trim().replace(/-+$/g, "") || undefined,
      seoKeyword: formData.seoKeyword.trim() || undefined,
      thumbImg: formData.thumbImg.trim() || undefined,
      seoTitle: formData.seoTitle.trim() || undefined,
      h1Title: formData.h1Title.trim() || undefined,
      moreDescription: moreDescription.trim() || undefined,
      isActive: formData.isActive,
    };

    if (mode === "edit" && initialData?.id) {
      updateCmsPage(
        { id: initialData.id, payload },
        { onSuccess: () => router.push("/dashboard/cms-page") }
      );
    } else {
      createCmsPage(payload, {
        onSuccess: () => router.push("/dashboard/cms-page"),
      });
    }
  };

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">You don&apos;t have permission to {mode} pages.</p>
        <Link href="/dashboard/cms-page" className="text-sm text-brand-600 mt-2 hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/cms-page"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <Heading
          heading={mode === "create" ? "Create Page" : "Edit Page"}
          tagLine={mode === "create" ? "Add a new page (About Us, Privacy Policy, Terms, etc.)" : `Editing ${initialData?.title || "page"}`}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <SeoFields
          formData={formData}
          onFieldChange={handleFieldChange}
          onDescriptionChange={(html) => handleFieldChange("overView", html)}
          onThumbImgUpload={handleThumbImgUpload}
          errors={errors}
          basePath=""
          folderPath={formData.slug ? `${formData.slug}/page` : ""}
          hideShortDesc
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Detailed Information
          </label>
          <RichTextEditor content={moreDescription} onChange={(html) => setMoreDescription(html)} />
        </div>

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
              href="/dashboard/cms-page"
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </Link>
            <FormActionButton
              text={
                isLoading
                  ? mode === "create" ? "Creating..." : "Updating..."
                  : mode === "create" ? "Create Page" : "Update Page"
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
