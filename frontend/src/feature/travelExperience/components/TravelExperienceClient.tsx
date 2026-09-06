"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, Compass, Eye } from "lucide-react";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import FilterBox from "@/components/shared/FilterBox";
import PageLoader from "@/components/shared/PageLoader";
import TableWraper from "@/components/shared/TableWraper";
import PageSizeSelect from "@/components/shared/PageSizeSelect";
import OrderAtTopCard from "@/components/shared/OrderAtTopCard";
import { useGetTravelExperiences, useDeleteTravelExperience, useToggleTravelExperienceActive, useUpdateTravelExperienceOrder } from "@/feature/travelExperience/api/useTravelExperience";
import DirectoryTableLayout from "@/components/shared/DirectoryTableLayout";
import DirectoryTable, { ColumnDef } from "@/components/shared/DirectoryTable";
import { getTravelExperiences } from "@/feature/travelExperience/api";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import { confirmToast } from "@/components/shared/tost";
import SeoPendingBadge, { SeoCompleteBadge, hasMissingSeo, seoPendingRowClass } from "@/components/shared/SeoPendingBadge";

export default function TravelExperienceClient() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isActive, setIsActive] = useState("");

  const { travelExperiences, isLoading } = useGetTravelExperiences({
    limit: 1000,
    search: debouncedSearch || undefined,
    isActive: isActive || undefined,
  });
  const { deleteTravelExperience, isPending: isDeleting } = useDeleteTravelExperience();
  const { toggleTravelExperienceActive, isPending: isToggling } = useToggleTravelExperienceActive();
  const { updateTravelExperienceOrder, isPending: isOrderSaving } = useUpdateTravelExperienceOrder();
  const { user } = useGetCurrentUser();

  const [allExperiences, setAllExperiences] = useState<{ id: number; title: string }[]>([]);
  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  const [orderLoading, setOrderLoading] = useState(true);
  const initialOrderRef = React.useRef<number[]>([]);

  React.useEffect(() => {
    getTravelExperiences({ limit: 1000 })
      .then((res) => {
        setAllExperiences(res.data.map((e) => ({ id: e.id, title: e.title })));
        const pinned = res.data
          .filter((e) => e.displayOrder && e.displayOrder > 0)
          .sort((a, b) => a.displayOrder! - b.displayOrder!)
          .map((e) => e.id);
        initialOrderRef.current = pinned;
        setOrderedIds(pinned);
        setOrderLoading(false);
      })
      .catch(() => setOrderLoading(false));
  }, []);

  const orderDirty = JSON.stringify(orderedIds) !== JSON.stringify(initialOrderRef.current);

  const handleSaveOrder = () => {
    updateTravelExperienceOrder(orderedIds, {
      onSuccess: () => {
        initialOrderRef.current = [...orderedIds];
      },
    });
  };

  const handleToggle = (exp: { id: number; isActive?: boolean }) => {
    toggleTravelExperienceActive(exp.id);
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
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: number, title: string) => {
    const confirmed = await confirmToast(`Are you sure you want to delete "${title}"?`);
    if (!confirmed) return;
    deleteTravelExperience(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PrivatePageHeading icon={Compass} title="Travel Experiences" description="Manage travel experiences and their details" />
        {canEdit && (
          <Link
            href="/dashboard/travel-experience/create"
            className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Experience
          </Link>
        )}
      </div>

      <FilterBox
        search={{ value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search experiences..." }}
        selects={[
          {
            value: isActive,
            onChange: (e) => {
              setIsActive(e.target.value);
              setSearch("");
            },
            options: [
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ],
            placeholder: "All Status",
          },
        ]}
      />

      <DirectoryTableLayout
        showOrderAtTop={canEdit}
        orderOptions={allExperiences}
        orderSelectedIds={orderedIds}
        orderOnChange={setOrderedIds}
        orderLoading={orderLoading}
        orderLoadingText="Loading experiences..."
        orderPlaceholder="Select experiences to show at top"
        orderSearchPlaceholder="Search experiences..."
        orderSaving={isOrderSaving}
        orderOnSave={handleSaveOrder}
        orderDirty={orderDirty}
        isLoading={isLoading}
        isEmpty={travelExperiences.length === 0}
        emptyIcon={Compass}
        emptyMessage="No travel experiences found"
        emptyCreateLink="/dashboard/travel-experience/create"
        emptyCreateLabel="Create your first travel experience"
        canEdit={canEdit}
      >
        <DirectoryTable
          data={travelExperiences}
          getRowClass={seoPendingRowClass}
          groupBy={(exp) => ({
            id: exp.type || "uncategorized",
            title: exp.type || "Uncategorized"
          })}
          columns={[
            {
              header: "Display Order",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (exp) => (
                exp.displayOrder && exp.displayOrder > 0 ? (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold shadow-sm">
                    #{exp.displayOrder}
                  </span>
                ) : (
                  <span className="text-xs text-slate-300">-</span>
                )
              ),
            },
            {
              header: "Thumb",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (exp) => (
                exp.thumbImg ? (
                  <img src={exp.thumbImg} alt="thumb" className="w-10 h-10 rounded object-cover border inline-block" />
                ) : (
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 border inline-block">N/A</div>
                )
              ),
            },
            {
              header: "H1 Title",
              className: "tbl-th",
              cellClassName: "px-4 py-3 text-sm text-gray-600",
              render: (exp) => exp.h1Title || "-",
            },
            {
              header: "SEO Status",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (exp) => hasMissingSeo(exp) ? <SeoPendingBadge /> : <SeoCompleteBadge />,
            },
            {
              header: "SEO Title",
              className: "tbl-th",
              cellClassName: "px-4 py-3",
              render: (exp) => (
                <div>
                  <p className="text-sm font-medium text-gray-900">{exp.seoTitle || "-"}</p>

                </div>
              ),
            },
            {
              header: "Slug",
              className: "tbl-th",
              cellClassName: "px-4 py-3 text-sm text-gray-600",
              render: (exp) => exp.slug,
            },
            {
              header: "Type",
              className: "tbl-th",
              cellClassName: "px-4 py-3 text-sm text-gray-600",
              render: (exp) => exp.type || "-",
            },
            {
              header: "Ideal For",
              className: "tbl-th",
              cellClassName: "px-4 py-3 text-sm text-gray-600",
              render: (exp) => exp.idealFor || "-",
            },
            {
              header: "Active",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (exp) => (
                canEdit ? (
                  <button
                    onClick={() => handleToggle(exp)}
                    disabled={isToggling}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={exp.isActive ? "Click to disable" : "Click to enable"}
                  >
                    <span className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${exp.isActive ? "bg-green-500" : "bg-gray-300"}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${exp.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                    </span>
                    <span className={exp.isActive ? "text-green-600" : "text-gray-400"}>
                      {exp.isActive ? "Active" : "Inactive"}
                    </span>
                  </button>
                ) : (
                  <span className={exp.isActive ? "text-green-600" : "text-gray-400"}>
                    {exp.isActive ? "Active" : "Inactive"}
                  </span>
                )
              ),
            },
            {
              header: "Actions",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3",
              render: (exp) => (
                <div className="flex items-center justify-center gap-1">
                  <Link href={`/travel-experiences/${exp.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="View Public Page">
                    <Eye size={14} />
                  </Link>
                  {canEdit && (
                    <>
                      <Link href={`/dashboard/travel-experience/${exp.id}`} className="p-1.5 rounded-lg hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors" title="Edit">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => handleDelete(exp.id, exp.title)} disabled={isDeleting} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </DirectoryTableLayout>
    </div>
  );
}
