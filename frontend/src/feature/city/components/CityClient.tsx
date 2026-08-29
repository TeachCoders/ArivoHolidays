"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, MapPin, Eye } from "lucide-react";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import FilterBox from "@/components/shared/FilterBox";
import PageLoader from "@/components/shared/PageLoader";
import TableWraper from "@/components/shared/TableWraper";
import PageSizeSelect from "@/components/shared/PageSizeSelect";
import OrderAtTopCard from "@/components/shared/OrderAtTopCard";
import { useGetCities, useDeleteCity, useToggleCityActive, useUpdateCityOrder } from "@/feature/city/api/useCity";
import DirectoryTableLayout from "@/components/shared/DirectoryTableLayout";
import DirectoryTable, { ColumnDef } from "@/components/shared/DirectoryTable";
import { getCities } from "@/feature/city/api";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import { confirmToast } from "@/components/shared/tost";
import { getCountries } from "@/feature/country/api";
import { getStates } from "@/feature/state/api";
import type { Country } from "@/feature/country/type";
import type { State } from "@/feature/state/type";
import { loadCmsFilters, saveCmsFilters } from "@/lib/cmsFilterState";
import SeoPendingBadge, { SeoCompleteBadge, hasMissingSeo, seoPendingRowClass } from "@/components/shared/SeoPendingBadge";

export default function CityClient() {
  const [search, setSearch] = useState(() => loadCmsFilters("city").search || "");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [countryId, setCountryId] = useState<number | undefined>(() => loadCmsFilters("city").countryId);
  const [stateId, setStateId] = useState<number | undefined>(() => loadCmsFilters("city").stateId);
  const [countries, setCountries] = useState<Country[]>([]);
  const [statesList, setStatesList] = useState<State[]>([]);
  const [isActive, setIsActive] = useState("");

  React.useEffect(() => {
    getCountries({ limit: 1000 }).then((res) => setCountries(res.data)).catch(() => {});
  }, []);

  const mountedRef = React.useRef(false);

  React.useEffect(() => {
    getStates({ 
      limit: 1000, 
      countryId: countryId ? String(countryId) : undefined 
    }).then((res) => setStatesList(res.data)).catch(() => {});
    
    if (mountedRef.current) setStateId(undefined);
    mountedRef.current = true;
  }, [countryId]);

  React.useEffect(() => {
    saveCmsFilters("city", { countryId, stateId, search });
  }, [countryId, stateId, search]);

  const { cities, isLoading } = useGetCities({
    limit: 1000,
    search: debouncedSearch || undefined,
    countryId,
    stateId,
    isActive: isActive || undefined,
  });
  const { deleteCity, isPending: isDeleting } = useDeleteCity();
  const { toggleCityActive, isPending: isToggling } = useToggleCityActive();
  const { updateCityOrder, isPending: isOrderSaving } = useUpdateCityOrder();
  const { user } = useGetCurrentUser();

  const [allCities, setAllCities] = useState<{ id: number; title: string; isActive?: boolean }[]>([]);
  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  const [orderLoading, setOrderLoading] = useState(true);
  const initialOrderRef = React.useRef<number[]>([]);

  React.useEffect(() => {
    setOrderLoading(true);
    getCities({ 
      limit: 1000,
      stateId: stateId ? String(stateId) : undefined,
      countryId: countryId ? String(countryId) : undefined
    })
      .then((res) => {
        setAllCities(res.data.map((c) => ({ id: c.id, title: c.title, isActive: c.isActive })));
        const pinned = res.data
          .filter((c) => c.displayOrder && c.displayOrder > 0)
          .sort((a, b) => a.displayOrder! - b.displayOrder!)
          .map((c) => c.id);
        initialOrderRef.current = pinned;
        setOrderedIds(pinned);
        setOrderLoading(false);
      })
      .catch(() => setOrderLoading(false));
  }, [countryId, stateId]);

  const orderDirty = JSON.stringify(orderedIds) !== JSON.stringify(initialOrderRef.current);

  const handleSaveOrder = () => {
    updateCityOrder(orderedIds, {
      onSuccess: () => {
        initialOrderRef.current = [...orderedIds];
      },
    });
  };

  const handleToggle = (city: { id: number; title: string; isActive?: boolean }) => {
    toggleCityActive(city.id);
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
    deleteCity(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PrivatePageHeading icon={MapPin} title="Cities" description="Manage cities and their details" />
        {canEdit && (
          <Link
            href="/dashboard/city/create"
            className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add City
          </Link>
        )}
      </div>

      <FilterBox
        search={{ value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search cities..." }}
        selects={[
          {
            value: countryId || "",
            onChange: (e) => {
              setCountryId(e.target.value ? Number(e.target.value) : undefined);
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
              setSearch("");
              setIsActive("");
            },
            options: statesList.map((s) => ({ value: String(s.id), label: s.title })),
            placeholder: "All States",
            disabled: !countryId,
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
        orderOptions={allCities}
        orderActiveOnly
        orderSelectedIds={orderedIds}
        orderOnChange={setOrderedIds}
        orderLoading={orderLoading}
        orderLoadingText="Loading cities..."
        orderPlaceholder="Select cities to show at top"
        orderSearchPlaceholder="Search cities..."
        orderSaving={isOrderSaving}
        orderOnSave={handleSaveOrder}
        orderDirty={orderDirty}
        isLoading={isLoading}
        isEmpty={cities.length === 0}
        emptyIcon={MapPin}
        emptyMessage="No cities found"
        emptyCreateLink="/dashboard/city/create"
        emptyCreateLabel="Create your first city"
        canEdit={canEdit}
      >
        <DirectoryTable
          data={cities}
          getRowClass={seoPendingRowClass}
          groupBy={(city) => ({
            id: city.state?.id || 0,
            title: city.state?.title || "No State",
            subtitle: city.state?.country?.title || "No Country"
          })}
          columns={[
            {
              header: "Display Order",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (city) => (
                city.displayOrder && city.displayOrder > 0 ? (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold shadow-sm">
                    #{city.displayOrder}
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
              render: (city) => (
                city.thumbImg ? (
                  <img src={city.thumbImg} alt="thumb" className="w-10 h-10 rounded object-cover border inline-block" />
                ) : (
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 border inline-block">N/A</div>
                )
              ),
            },
            {
              header: "H1 Title",
              className: "tbl-th",
              cellClassName: "px-4 py-3 text-sm text-gray-600",
              render: (city) => city.h1Title || "-",
            },
            {
              header: "SEO Status",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (city) => hasMissingSeo(city) ? <SeoPendingBadge /> : <SeoCompleteBadge />,
            },

            {
              header: "SEO Title",
              className: "tbl-th",
              cellClassName: "px-4 py-3",
              render: (city) => (
                <div>
                  <p className="text-sm font-medium text-gray-900">{city.title}</p>

                </div>
              ),
            },
            {
              header: "Slug",
              className: "tbl-th",
              cellClassName: "px-4 py-3 text-sm text-gray-600",
              render: (city) => city.slug,
            },
            {
              header: "Itineraries",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (city) => (
                <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                  {city.tourCount ?? 0}
                </span>
              ),
            },
            {
              header: "Active",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (city) => (
                canEdit ? (
                  <button
                    onClick={() => handleToggle(city)}
                    disabled={isToggling}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={city.isActive ? "Click to disable" : "Click to enable"}
                  >
                    <span className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${city.isActive ? "bg-green-500" : "bg-gray-300"}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${city.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                    </span>
                    <span className={city.isActive ? "text-green-600" : "text-gray-400"}>
                      {city.isActive ? "Active" : "Inactive"}
                    </span>
                  </button>
                ) : (
                  <span className={city.isActive ? "text-green-600" : "text-gray-400"}>
                    {city.isActive ? "Active" : "Inactive"}
                  </span>
                )
              ),
            },
            {
              header: "Actions",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3",
              render: (city) => (
                <div className="flex items-center justify-center gap-1">
                  {city.state?.country?.slug && city.state?.slug && (
                    <Link href={`/${city.state.country.slug}/${city.state.slug}/${city.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="View Public Page">
                      <Eye size={14} />
                    </Link>
                  )}
                  {canEdit && (
                    <>
                      <Link href={`/dashboard/city/${city.id}`} className="p-1.5 rounded-lg hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors" title="Edit">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => handleDelete(city.id, city.title)} disabled={isDeleting} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50" title="Delete">
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
