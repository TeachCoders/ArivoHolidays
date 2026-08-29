"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, Newspaper } from "lucide-react";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import FilterBox from "@/components/shared/FilterBox";
import PageLoader from "@/components/shared/PageLoader";
import TableWraper from "@/components/shared/TableWraper";
import PageSizeSelect from "@/components/shared/PageSizeSelect";
import OrderAtTopCard from "@/components/shared/OrderAtTopCard";
import { useGetBlogPosts, useDeleteBlogPost, useToggleBlogPostActive, useUpdateBlogPostOrder } from "@/feature/blog/api/useBlogPost";
import { getBlogPosts } from "@/feature/blog/api";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import { confirmToast } from "@/components/shared/tost";

export default function BlogPostClient() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isActive, setIsActive] = useState("");
  const [category, setCategory] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { blogPosts, pagination, isLoading } = useGetBlogPosts({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    isActive: isActive || undefined,
    category: category || undefined,
  });
  const { deleteBlogPost, isPending: isDeleting } = useDeleteBlogPost();
  const { toggleBlogPostActive, isPending: isToggling } = useToggleBlogPostActive();
  const { updateBlogPostOrder, isPending: isOrderSaving } = useUpdateBlogPostOrder();
  const { user } = useGetCurrentUser();

  const [allPosts, setAllPosts] = useState<{ id: number; title: string }[]>([]);
  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  const [orderLoading, setOrderLoading] = useState(true);
  const initialOrderRef = React.useRef<number[]>([]);

  React.useEffect(() => {
    getBlogPosts({ limit: 1000 })
      .then((res) => {
        setAllPosts(res.data.map((p) => ({ id: p.id, title: p.title })));
        const pinned = res.data
          .filter((p) => p.displayOrder && p.displayOrder > 0)
          .sort((a, b) => a.displayOrder! - b.displayOrder!)
          .map((p) => p.id);
        initialOrderRef.current = pinned;
        setOrderedIds(pinned);
        setOrderLoading(false);
      })
      .catch(() => setOrderLoading(false));
  }, []);

  const orderDirty = JSON.stringify(orderedIds) !== JSON.stringify(initialOrderRef.current);

  const handleSaveOrder = () => {
    updateBlogPostOrder(orderedIds, {
      onSuccess: () => {
        initialOrderRef.current = [...orderedIds];
      },
    });
  };

  const handleToggle = (post: { id: number; isActive?: boolean }) => {
    toggleBlogPostActive(post.id);
  };

  const normalizedRole = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = normalizedRole.includes("super") && normalizedRole.includes("admin");
  const isITTeam =
    user?.team?.name?.toLowerCase().includes("it") ||
    user?.team?.name?.toLowerCase().includes("maintenance");
  const canEdit = isSuperAdmin || isITTeam;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: number, title: string) => {
    const confirmed = await confirmToast(`Are you sure you want to delete "${title}"?`);
    if (!confirmed) return;
    deleteBlogPost(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PrivatePageHeading icon={Newspaper} title="Blog" description="Manage travel blog posts and their details" />
        {canEdit && (
          <Link
            href="/dashboard/blog/create"
            className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Post
          </Link>
        )}
      </div>

      <FilterBox
        search={{ value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search posts..." }}
        selects={[
          {
            value: isActive,
            onChange: (e) => {
              setIsActive(e.target.value);
              setCurrentPage(1);
            },
            options: [
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ],
            placeholder: "All Status",
          },
          {
            value: category,
            onChange: (e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            },
            options: [
              { value: "Destinations", label: "Destinations" },
              { value: "Honeymoon", label: "Honeymoon" },
              { value: "Tour Guides", label: "Tour Guides" },
              { value: "Travel Tips", label: "Travel Tips" },
            ],
            placeholder: "All Categories",
          },
        ]}
      />

      {canEdit && (
        <OrderAtTopCard
          options={allPosts}
          selectedIds={orderedIds}
          onChange={setOrderedIds}
          loading={orderLoading}
          loadingText="Loading posts..."
          placeholder="Select posts to show at top"
          searchPlaceholder="Search posts..."
          saving={isOrderSaving}
          onSave={handleSaveOrder}
          dirty={orderDirty}
        />
      )}

      {isLoading ? (
        <PageLoader size="section" />
      ) : (
        <TableWraper variant="brand">
          {blogPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Newspaper size={40} className="mb-3 opacity-40" />
              <p className="text-sm">No blog posts found</p>
              {canEdit && (
                <Link href="/dashboard/blog/create" className="text-sm text-brand-600 mt-2 hover:underline">
                  Create your first post
                </Link>
              )}
            </div>
          ) : (
            <>
              <table className="tbl">
                <thead>
                  <tr className="border-b border-brand-neutral-border">
                    <th className="tbl-th">Title</th>
                    <th className="tbl-th-center">Thumb</th>
                    <th className="tbl-th">Slug</th>
                    <th className="tbl-th">Category</th>
                    <th className="tbl-th">Author</th>
                    <th className="tbl-th-center">Active</th>
                    <th className="tbl-th-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-neutral-light">
                  {blogPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-brand-neutral-light/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{post.title}</p>
                        {post.publishedAt && (
                          <p className="text-xs text-gray-400 mt-0.5">{post.publishedAt}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {post.thumbImg ? (
                          <img src={post.thumbImg} alt="thumb" className="w-10 h-10 rounded object-cover border inline-block" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 border inline-block">N/A</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{post.slug}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{post.category || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{post.author || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        {canEdit ? (
                          <button
                            onClick={() => handleToggle(post)}
                            disabled={isToggling}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={post.isActive ? "Click to disable" : "Click to enable"}
                          >
                            <span
                              className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                                post.isActive ? "bg-green-500" : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                  post.isActive ? "translate-x-4" : "translate-x-0.5"
                                }`}
                              />
                            </span>
                            <span className={post.isActive ? "text-green-600" : "text-gray-400"}>
                              {post.isActive ? "Active" : "Inactive"}
                            </span>
                          </button>
                        ) : (
                          <span className={post.isActive ? "text-green-600" : "text-gray-400"}>
                            {post.isActive ? "Active" : "Inactive"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {canEdit && (
                            <>
                              <Link
                                href={`/dashboard/blog/${post.id}`}
                                className="p-1.5 rounded-lg hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </Link>
                              <button
                                onClick={() => handleDelete(post.id, post.title)}
                                disabled={isDeleting}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pagination && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
                  <div className="flex items-center gap-3">
                    <PageSizeSelect
                      value={itemsPerPage}
                      onChange={(size) => {
                        setItemsPerPage(size);
                        setCurrentPage(1);
                      }}
                    />
                    <p className="text-sm text-gray-500">
                      Showing {pagination.total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage === pagination.totalPages}
                      className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </TableWraper>
      )}
    </div>
  );
}
