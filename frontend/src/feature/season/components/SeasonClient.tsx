"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, Calendar } from "lucide-react";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import FilterBox from "@/components/shared/FilterBox";
import PageLoader from "@/components/shared/PageLoader";
import TableWraper from "@/components/shared/TableWraper";
import PageSizeSelect from "@/components/shared/PageSizeSelect";
import OrderAtTopCard from "@/components/shared/OrderAtTopCard";
import { useGetSeasons, useDeleteSeason, useToggleSeasonActive, useUpdateSeasonOrder } from "@/feature/season/api/useSeason";
import { getSeasons } from "@/feature/season/api";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import { confirmToast } from "@/components/shared/tost";
import { SEASON_META } from "@/components/shared/seasonUtils";
import SeoPendingBadge, { SeoCompleteBadge, hasMissingSeo, seoPendingRowClass } from "@/components/shared/SeoPendingBadge";

export default function SeasonClient() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isActive, setIsActive] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { seasons, pagination, isLoading } = useGetSeasons({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    isActive: isActive || undefined,
  });
  const { deleteSeason, isPending: isDeleting } = useDeleteSeason();
  const { toggleSeasonActive, isPending: isToggling } = useToggleSeasonActive();
  const { updateSeasonOrder, isPending: isOrderSaving } = useUpdateSeasonOrder();
  const { user } = useGetCurrentUser();

  const [allSeasons, setAllSeasons] = useState<{ id: number; title: string }[]>([]);
  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  const [orderLoading, setOrderLoading] = useState(true);
  const initialOrderRef = React.useRef<number[]>([]);

  React.useEffect(() => {
    getSeasons({ limit: 1000 })
      .then((res) => {
        setAllSeasons(res.data.map((m) => ({ id: m.id, title: m.title })));
        const pinned = res.data
          .filter((m) => m.displayOrder && m.displayOrder > 0)
          .sort((a, b) => a.displayOrder! - b.displayOrder!)
          .map((m) => m.id);
        initialOrderRef.current = pinned;
        setOrderedIds(pinned);
        setOrderLoading(false);
      })
      .catch(() => setOrderLoading(false));
  }, []);

  const orderDirty = JSON.stringify(orderedIds) !== JSON.stringify(initialOrderRef.current);

  const handleSaveOrder = () => {
    updateSeasonOrder(orderedIds, {
      onSuccess: () => {
        initialOrderRef.current = [...orderedIds];
      },
    });
  };

  const handleToggle = (season: { id: number; isActive?: boolean }) => {
    toggleSeasonActive(season.id);
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
    deleteSeason(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PrivatePageHeading icon={Calendar} title="Seasons" description="Manage seasons and their details" />
        {canEdit && (
          <Link
            href="/dashboard/season/create"
            className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Season
          </Link>
        )}
      </div>

      <FilterBox
        search={{ value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search seasons..." }}
        selects={[
          {
            value: isActive,
            onChange: (e) => {
              setIsActive(e.target.value);
              setSearch("");
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
          options={allSeasons}
          selectedIds={orderedIds}
          onChange={setOrderedIds}
          loading={orderLoading}
          loadingText="Loading seasons..."
          placeholder="Select seasons to show at top"
          searchPlaceholder="Search seasons..."
          saving={isOrderSaving}
          onSave={handleSaveOrder}
          dirty={orderDirty}
        />
      )}

      {isLoading ? (
        <PageLoader size="section" />
      ) : (
        <TableWraper variant="brand">
          {seasons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Calendar size={40} className="mb-3 opacity-40" />
              <p className="text-sm">No seasons found</p>
              {canEdit && (
                <Link href="/dashboard/season/create" className="text-sm text-brand-600 mt-2 hover:underline">
                  Create your first season
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
                <th className="tbl-th-center">SEO Status</th>
                <th className="tbl-th">SEO Title</th>
                <th className="tbl-th">Slug</th>
                <th className="tbl-th">Weather</th>
                <th className="tbl-th-center">Active</th>
                <th className="tbl-th-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-neutral-light">
              {seasons.map((season) => (
                <tr
                  key={season.id}
                  className={seoPendingRowClass(season)}
                >
                  <td className="px-4 py-3 text-center">
                    {season.thumbImg ? (
                      <img src={season.thumbImg} alt="thumb" className="w-10 h-10 rounded object-cover border inline-block" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 border inline-block">N/A</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {season.h1Title || "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {hasMissingSeo(season) ? <SeoPendingBadge /> : <SeoCompleteBadge />}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{season.title}</p>

                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{season.slug}</td>

                  <td className="px-4 py-3 text-sm text-gray-600">{season.weather || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    {canEdit ? (
                      <button
                        onClick={() => handleToggle(season)}
                        disabled={isToggling}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={season.isActive ? "Click to disable" : "Click to enable"}
                      >
                        <span
                          className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${
                            season.isActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                              season.isActive ? "translate-x-4" : "translate-x-0.5"
                            }`}
                          />
                        </span>
                        <span className={season.isActive ? "text-green-600" : "text-gray-400"}>
                          {season.isActive ? "Active" : "Inactive"}
                        </span>
                      </button>
                    ) : (
                      <span className={season.isActive ? "text-green-600" : "text-gray-400"}>
                        {season.isActive ? "Active" : "Inactive"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {canEdit && (
                        <>
                          <Link
                            href={`/dashboard/season/${season.id}`}
                            className="p-1.5 rounded-lg hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </Link>
                          <button
                            onClick={() => handleDelete(season.id, season.title)}
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
