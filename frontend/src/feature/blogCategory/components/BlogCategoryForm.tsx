"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Heading from "@/components/shared/heading";
import FormActionButton from "@/components/shared/customBtns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  useCreateBlogCategory,
  useUpdateBlogCategory,
} from "@/feature/blogCategory/api/useBlogCategory";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import type { BlogCategory } from "@/feature/blogCategory/type";

interface BlogCategoryFormProps {
  initialData?: BlogCategory;
  mode: "create" | "edit";
}

export default function BlogCategoryForm({ initialData, mode }: BlogCategoryFormProps) {
  const router = useRouter();
  const { createBlogCategory, isPending: isCreating } = useCreateBlogCategory();
  const { updateBlogCategory, isPending: isUpdating } = useUpdateBlogCategory();
  const { user } = useGetCurrentUser();

  const normalizedRole = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = normalizedRole.includes("super") && normalizedRole.includes("admin");
  const isITTeam =
    user?.team?.name?.toLowerCase().includes("it") ||
    user?.team?.name?.toLowerCase().includes("maintenance");
  const canEdit = isSuperAdmin || isITTeam;

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    isActive: initialData?.isActive ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isLoading = isCreating || isUpdating;

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: any = {
      name: formData.name.trim(),
      slug: formData.slug.trim().replace(/-+$/g, "") || undefined,
      description: formData.description.trim() || undefined,
      isActive: formData.isActive,
    };

    if (mode === "edit" && initialData?.id) {
      updateBlogCategory(
        { id: initialData.id, payload },
        { onSuccess: () => router.push("/dashboard/blog-category") }
      );
    } else {
      createBlogCategory(payload, {
        onSuccess: () => router.push("/dashboard/blog-category"),
      });
    }
  };

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">You don&apos;t have permission to {mode} blog categories.</p>
        <Link href="/dashboard/blog-category" className="text-sm text-brand-600 mt-2 hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/blog-category"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <Heading
          heading={mode === "create" ? "Create Blog Category" : "Edit Blog Category"}
          tagLine={mode === "create" ? "Add a new blog category" : `Editing ${initialData?.name || "blog category"}`}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="border border-slate-200 rounded-xl shadow-sm bg-white p-6 space-y-5">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Category Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-600">
                Name <span className="text-red-500 ml-0.5">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="e.g. Destinations, Travel Tips"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-600">Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => handleFieldChange("slug", e.target.value)}
                placeholder="Auto-generated from name if left empty"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-600">Description</Label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Short description for this category (optional)"
              className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            />
          </div>
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
              href="/dashboard/blog-category"
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </Link>
            <FormActionButton
              text={
                isLoading
                  ? mode === "create" ? "Creating..." : "Updating..."
                  : mode === "create" ? "Create Category" : "Update Category"
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
