"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, Map, Eye } from "lucide-react";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import FilterBox from "@/components/shared/FilterBox";
import PageLoader from "@/components/shared/PageLoader";
import TableWraper from "@/components/shared/TableWraper";
import PageSizeSelect from "@/components/shared/PageSizeSelect";
import OrderAtTopCard from "@/components/shared/OrderAtTopCard";
import { useGetStates, useDeleteState, useToggleStateActive, useUpdateStateOrder } from "@/feature/state/api/useState";
import DirectoryTableLayout from "@/components/shared/DirectoryTableLayout";
import DirectoryTable, { ColumnDef } from "@/components/shared/DirectoryTable";
import { getStates } from "@/feature/state/api";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import { confirmToast } from "@/components/shared/tost";
import { getCountries } from "@/feature/country/api";
import { getCities } from "@/feature/city/api";
import type { Country } from "@/feature/country/type";
import type { City } from "@/feature/city/type";
import { loadCmsFilters, saveCmsFilters } from "@/lib/cmsFilterState";
import SeoPendingBadge, { SeoCompleteBadge, hasMissingSeo, seoPendingRowClass } from "@/components/shared/SeoPendingBadge";

export default function StateClient() {
  const [search, setSearch] = useState(() => loadCmsFilters("state").search || "");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [countryId, setCountryId] = useState<number | undefined>(() => loadCmsFilters("state").countryId);
  const [stateId, setStateId] = useState<number | undefined>(undefined);
  const [cityId, setCityId] = useState<number | undefined>(undefined);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isActive, setIsActive] = useState("");

  React.useEffect(() => {
    getCountries({ limit: 1000 }).then((res) => setCountries(res.data)).catch(() => {});
  }, []);

  React.useEffect(() => {
    getCities({ 
      limit: 1000, 
      stateId: stateId ? String(stateId) : undefined,
      countryId: countryId ? String(countryId) : undefined 
    }).then((res) => setCities(res.data)).catch(() => {});
  }, [stateId, countryId]);

  React.useEffect(() => {
    saveCmsFilters("state", { countryId, search });
  }, [countryId, search]);

  const { states, isLoading } = useGetStates({
    limit: 1000,
    search: debouncedSearch || undefined,
    countryId,
    stateId,
    cityId,
    isActive: isActive || undefined,
  });

  const { deleteState, isPending: isDeleting } = useDeleteState();
  const { toggleStateActive, isPending: isToggling } = useToggleStateActive();
  const { updateStateOrder, isPending: isOrderSaving } = useUpdateStateOrder();
  const { user } = useGetCurrentUser();

  const [allStates, setAllStates] = useState<{ id: number; title: string; isActive?: boolean }[]>([]);
  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  const [orderLoading, setOrderLoading] = useState(true);
  const initialOrderRef = React.useRef<number[]>([]);

  React.useEffect(() => {
    setOrderLoading(true);
    getStates({ 
      limit: 1000,
      countryId: countryId ? String(countryId) : undefined 
    })
      .then((res) => {
        setAllStates(res.data.map((s) => ({ id: s.id, title: s.title, isActive: s.isActive })));
        const pinned = res.data
          .filter((s) => s.displayOrder && s.displayOrder > 0)
          .sort((a, b) => a.displayOrder! - b.displayOrder!)
          .map((s) => s.id);
        initialOrderRef.current = pinned;
        setOrderedIds(pinned);
        setOrderLoading(false);
      })
      .catch(() => setOrderLoading(false));
  }, [countryId]);

  const orderDirty = JSON.stringify(orderedIds) !== JSON.stringify(initialOrderRef.current);

  const handleSaveOrder = () => {
    updateStateOrder(orderedIds, {
      onSuccess: () => {
        initialOrderRef.current = [...orderedIds];
      },
    });
  };

  const handleToggle = (state: { id: number; title: string; isActive?: boolean }) => {
    toggleStateActive(state.id);
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
    deleteState(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PrivatePageHeading icon={Map} title="States" description="Manage states and their details" />
        {canEdit && (
          <Link
            href="/dashboard/state/create"
            className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add State
          </Link>
        )}
      </div>

      <FilterBox
        search={{ value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search states..." }}
        selects={[
          {
            value: countryId || "",
            onChange: (e) => {
              setCountryId(e.target.value ? Number(e.target.value) : undefined);
              setStateId(undefined);
              setCityId(undefined);
              setSearch("");
              setIsActive("");
            },
            options: countries.map((c) => ({ value: String(c.id), label: c.title })),
            placeholder: "All Countries",
          },
          {
            value: stateId || "",
            onChange: (e) => {
              setStateId(e.target.value ? Number(e.target.value) : undefined);
              setCityId(undefined);
              setSearch("");
              setIsActive("");
            },
            options: allStates.map((s) => ({ value: String(s.id), label: s.title })),
            placeholder: "All States",
          },
          {
            value: cityId || "",
            onChange: (e) => {
              setCityId(e.target.value ? Number(e.target.value) : undefined);
              setSearch("");
              setIsActive("");
            },
            options: cities.map((c) => ({ value: String(c.id), label: c.title })),
            placeholder: "All Cities",
          },
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
        orderOptions={allStates}
        orderActiveOnly
        orderSelectedIds={orderedIds}
        orderOnChange={setOrderedIds}
        orderLoading={orderLoading}
        orderLoadingText="Loading states..."
        orderPlaceholder="Select states to show at top"
        orderSearchPlaceholder="Search states..."
        orderSaving={isOrderSaving}
        orderOnSave={handleSaveOrder}
        orderDirty={orderDirty}
        isLoading={isLoading}
        isEmpty={states.length === 0}
        emptyIcon={Map}
        emptyMessage="No states found"
        emptyCreateLink="/dashboard/state/create"
        emptyCreateLabel="Create your first state"
        canEdit={canEdit}
      >
        <DirectoryTable
          data={states}
          getRowClass={seoPendingRowClass}
          groupBy={(state) => ({
            id: state.country?.id || 0,
            title: state.country?.title || "No Country"
          })}
          columns={[
            {
              header: "Display Order",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (state) => (
                state.displayOrder && state.displayOrder > 0 ? (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold shadow-sm">
                    #{state.displayOrder}
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
              render: (state) => (
                state.thumbImg ? (
                  <img src={state.thumbImg} alt="thumb" className="w-10 h-10 rounded object-cover border inline-block" />
                ) : (
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 border inline-block">N/A</div>
                )
              ),
            },
            {
              header: "H1 Title",
              className: "tbl-th",
              cellClassName: "px-4 py-3 text-sm text-gray-600",
              render: (state) => state.h1Title || "-",
            },
            {
              header: "SEO Title",
              className: "tbl-th",
              cellClassName: "px-4 py-3",
              render: (state) => (
                <div>
                  <p className="text-sm font-medium text-gray-900">{state.seoTitle || "-"}</p>

                </div>
              ),
            },
            {
              header: "Country",
              className: "tbl-th",
              cellClassName: "px-4 py-3 text-sm text-gray-600",
              render: (state) => state.country?.title || "-",
            },
            {
              header: "SEO Status",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (state) => hasMissingSeo(state) ? <SeoPendingBadge /> : <SeoCompleteBadge />,
            },
            {
              header: "Slug",
              className: "tbl-th",
              cellClassName: "px-4 py-3 text-sm text-gray-600",
              render: (state) => state.slug,
            },
            {
              header: "Cities",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (state) => (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                  {state.cities?.length ?? 0}
                </span>
              ),
            },
            {
              header: "Tours",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (state) => (
                <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                  {state.tourCount ?? 0}
                </span>
              ),
            },
            {
              header: "Active",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (state) => (
                canEdit ? (
                  <button
                    onClick={() => handleToggle(state)}
                    disabled={isToggling}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={state.isActive ? "Click to disable" : "Click to enable"}
                  >
                    <span className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${state.isActive ? "bg-green-500" : "bg-gray-300"}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${state.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                    </span>
                    <span className={state.isActive ? "text-green-600" : "text-gray-400"}>
                      {state.isActive ? "Active" : "Inactive"}
                    </span>
                  </button>
                ) : (
                  <span className={state.isActive ? "text-green-600" : "text-gray-400"}>
                    {state.isActive ? "Active" : "Inactive"}
                  </span>
                )
              ),
            },
            {
              header: "Actions",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3",
              render: (state) => (
                <div className="flex items-center justify-center gap-1">
                  {state.country?.slug && (
                    <Link href={`/tour-packages/${state.country.slug}/${state.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="View Public Page">
                      <Eye size={14} />
                    </Link>
                  )}
                  {canEdit && (
                    <>
                      <Link href={`/dashboard/state/${state.id}`} className="p-1.5 rounded-lg hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors" title="Edit">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => handleDelete(state.id, state.title)} disabled={isDeleting} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50" title="Delete">
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
