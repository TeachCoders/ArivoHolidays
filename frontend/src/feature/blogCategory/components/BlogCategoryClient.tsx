"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, Tags } from "lucide-react";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import FilterBox from "@/components/shared/FilterBox";
import PageLoader from "@/components/shared/PageLoader";
import TableWraper from "@/components/shared/TableWraper";
import PageSizeSelect from "@/components/shared/PageSizeSelect";
import { useGetBlogCategories, useDeleteBlogCategory, useToggleBlogCategoryActive } from "@/feature/blogCategory/api/useBlogCategory";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import { confirmToast } from "@/components/shared/tost";

export default function BlogCategoryClient() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isActive, setIsActive] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { blogCategories, pagination, isLoading } = useGetBlogCategories({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    isActive: isActive || undefined,
  });
  const { deleteBlogCategory, isPending: isDeleting } = useDeleteBlogCategory();
  const { toggleBlogCategoryActive, isPending: isToggling } = useToggleBlogCategoryActive();
  const { user } = useGetCurrentUser();

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

  const handleToggle = (category: { id: number; isActive?: boolean }) => {
    toggleBlogCategoryActive(category.id);
  };

  const handleDelete = async (id: number, name: string) => {
    const confirmed = await confirmToast(`Are you sure you want to delete "${name}"?`);
    if (!confirmed) return;
    deleteBlogCategory(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PrivatePageHeading icon={Tags} title="Blog Categories" description="Manage categories used in blog posts" />
        {canEdit && (
          <Link
            href="/dashboard/blog-category/create"
            className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Category
          </Link>
        )}
      </div>

      <FilterBox
        search={{ value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search categories..." }}
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
        ]}
      />

      {isLoading ? (
        <PageLoader size="section" />
      ) : (
        <TableWraper variant="brand">
          {blogCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Tags size={40} className="mb-3 opacity-40" />
              <p className="text-sm">No blog categories found</p>
              {canEdit && (
                <Link href="/dashboard/blog-category/create" className="text-sm text-brand-600 mt-2 hover:underline">
                  Create your first category
                </Link>
              )}
            </div>
          ) : (
            <>
              <table className="tbl">
                <thead>
                  <tr className="border-b border-brand-neutral-border">
                    <th className="tbl-th">Name</th>
                    <th className="tbl-th">Slug</th>
                    <th className="tbl-th">Description</th>
                    <th className="tbl-th-center">Active</th>
                    <th className="tbl-th-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-neutral-light">
                  {blogCategories.map((category) => (
                    <tr
                      key={category.id}
                      className="hover:bg-brand-neutral-light/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{category.name}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">/{category.slug}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {category.description || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {canEdit ? (
                          <button
                            onClick={() => handleToggle(category)}
                            disabled={isToggling}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={category.isActive ? "Click to disable" : "Click to enable"}
                          >
                            <span
                              className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                                category.isActive ? "bg-green-500" : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                  category.isActive ? "translate-x-4" : "translate-x-0.5"
                                }`}
                              />
                            </span>
                            <span className={category.isActive ? "text-green-600" : "text-gray-400"}>
                              {category.isActive ? "Active" : "Inactive"}
                            </span>
                          </button>
                        ) : (
                          <span className={category.isActive ? "text-green-600" : "text-gray-400"}>
                            {category.isActive ? "Active" : "Inactive"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {canEdit && (
                            <>
                              <Link
                                href={`/dashboard/blog-category/${category.id}`}
                                className="p-1.5 rounded-lg hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </Link>
                              <button
                                onClick={() => handleDelete(category.id, category.name)}
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
