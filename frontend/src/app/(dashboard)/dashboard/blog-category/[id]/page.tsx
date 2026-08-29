"use client";

import React from "react";
import BlogCategoryForm from "@/feature/blogCategory/components/BlogCategoryForm";
import { useGetBlogCategoryById } from "@/feature/blogCategory/api/useBlogCategory";
import PageLoader from "@/components/shared/PageLoader";

export default function EditBlogCategory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { blogCategory, isLoading } = useGetBlogCategoryById(Number(id));

  if (isLoading) return <PageLoader size="page" />;
  if (!blogCategory) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">Blog category not found</p>
      </div>
    );
  }

  return <BlogCategoryForm initialData={blogCategory} mode="edit" />;
}
