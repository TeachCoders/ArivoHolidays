"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, FileText } from "lucide-react";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import FilterBox from "@/components/shared/FilterBox";
import PageLoader from "@/components/shared/PageLoader";
import TableWraper from "@/components/shared/TableWraper";
import PageSizeSelect from "@/components/shared/PageSizeSelect";
import OrderAtTopCard from "@/components/shared/OrderAtTopCard";
import { useGetCmsPages, useDeleteCmsPage, useToggleCmsPageActive, useUpdateCmsPageOrder } from "@/feature/cms/api/useCmsPage";
import { getCmsPages } from "@/feature/cms/api";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import { confirmToast } from "@/components/shared/tost";
import SeoPendingBadge, { seoPendingRowClass } from "@/components/shared/SeoPendingBadge";

export default function CmsPageClient() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isActive, setIsActive] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { cmsPages, pagination, isLoading } = useGetCmsPages({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    isActive: isActive || undefined,
  });
  const { deleteCmsPage, isPending: isDeleting } = useDeleteCmsPage();
  const { toggleCmsPageActive, isPending: isToggling } = useToggleCmsPageActive();
  const { updateCmsPageOrder, isPending: isOrderSaving } = useUpdateCmsPageOrder();
  const { user } = useGetCurrentUser();

  const [allPages, setAllPages] = useState<{ id: number; title: string }[]>([]);
  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  const [orderLoading, setOrderLoading] = useState(true);
  const initialOrderRef = React.useRef<number[]>([]);

  React.useEffect(() => {
    getCmsPages({ limit: 1000 })
      .then((res) => {
        setAllPages(res.data.map((p) => ({ id: p.id, title: p.title })));
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
    updateCmsPageOrder(orderedIds, {
      onSuccess: () => {
        initialOrderRef.current = [...orderedIds];
      },
    });
  };

  const handleToggle = (page: { id: number; isActive?: boolean }) => {
    toggleCmsPageActive(page.id);
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
    deleteCmsPage(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PrivatePageHeading icon={FileText} title="CMS Pages" description="Manage pages like About Us, Privacy Policy, Terms & Conditions" />
        {canEdit && (
          <Link
            href="/dashboard/cms-page/create"
            className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Page
          </Link>
        )}
      </div>

      <FilterBox
        search={{ value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search pages..." }}
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

      {canEdit && (
        <OrderAtTopCard
          options={allPages}
          selectedIds={orderedIds}
          onChange={setOrderedIds}
          loading={orderLoading}
          loadingText="Loading pages..."
          placeholder="Select pages to show at top"
          searchPlaceholder="Search pages..."
          saving={isOrderSaving}
          onSave={handleSaveOrder}
          dirty={orderDirty}
        />
      )}

      {isLoading ? (
        <PageLoader size="section" />
      ) : (
        <TableWraper variant="brand">
          {cmsPages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FileText size={40} className="mb-3 opacity-40" />
              <p className="text-sm">No pages found</p>
              {canEdit && (
                <Link href="/dashboard/cms-page/create" className="text-sm text-brand-600 mt-2 hover:underline">
                  Create your first page
                </Link>
              )}
            </div>
          ) : (
            <>
              <table className="tbl">
                <thead>
                  <tr className="border-b border-brand-neutral-border">
                    <th className="tbl-th-center">Thumb</th>
                    <th className="tbl-th">H1 Title</th>
                    <th className="tbl-th">SEO Title</th>
                    <th className="tbl-th">Slug</th>
                    <th className="tbl-th-center">Active</th>
                    <th className="tbl-th-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-neutral-light">
                  {cmsPages.map((page) => (
                    <tr
                      key={page.id}
                      className={seoPendingRowClass(page)}
                    >
                      <td className="px-4 py-3 text-center">
                        {page.thumbImg ? (
                          <img src={page.thumbImg} alt="thumb" className="w-10 h-10 rounded object-cover border inline-block" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 border inline-block">N/A</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{page.h1Title ? page.h1Title : <SeoPendingBadge />}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{page.title}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">/{page.slug}</td>
                      <td className="px-4 py-3 text-center">
                        {canEdit ? (
                          <button
                            onClick={() => handleToggle(page)}
                            disabled={isToggling}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={page.isActive ? "Click to disable" : "Click to enable"}
                          >
                            <span
                              className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                                page.isActive ? "bg-green-500" : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                  page.isActive ? "translate-x-4" : "translate-x-0.5"
                                }`}
                              />
                            </span>
                            <span className={page.isActive ? "text-green-600" : "text-gray-400"}>
                              {page.isActive ? "Active" : "Inactive"}
                            </span>
                          </button>
                        ) : (
                          <span className={page.isActive ? "text-green-600" : "text-gray-400"}>
                            {page.isActive ? "Active" : "Inactive"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {canEdit && (
                            <>
                              <Link
                                href={`/dashboard/cms-page/${page.id}`}
                                className="p-1.5 rounded-lg hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </Link>
                              <button
                                onClick={() => handleDelete(page.id, page.title)}
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
