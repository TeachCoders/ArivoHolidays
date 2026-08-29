"use client";

import React from "react";
import BlogPostForm from "@/feature/blog/components/BlogPostForm";
import { useGetBlogPostById } from "@/feature/blog/api/useBlogPost";
import PageLoader from "@/components/shared/PageLoader";

export default function EditBlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { blogPost, isLoading } = useGetBlogPostById(Number(id));

  if (isLoading) return <PageLoader size="page" />;
  if (!blogPost) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">Blog post not found</p>
      </div>
    );
  }

  return <BlogPostForm initialData={blogPost} mode="edit" />;
}
