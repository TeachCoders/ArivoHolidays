"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, Globe, Eye } from "lucide-react";
import { confirmToast } from "@/components/shared/tost";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import FilterBox from "@/components/shared/FilterBox";
import PageLoader from "@/components/shared/PageLoader";
import TableWraper from "@/components/shared/TableWraper";
import PageSizeSelect from "@/components/shared/PageSizeSelect";
import OrderAtTopCard from "@/components/shared/OrderAtTopCard";
import { useGetCountries, useDeleteCountry, useToggleCountryActive, useUpdateCountryOrder } from "@/feature/country/api/useCountry";
import DirectoryTableLayout from "@/components/shared/DirectoryTableLayout";
import DirectoryTable, { ColumnDef } from "@/components/shared/DirectoryTable";
import { getCountries } from "@/feature/country/api";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import { loadCmsFilters, saveCmsFilters } from "@/lib/cmsFilterState";
import SeoPendingBadge, { SeoCompleteBadge, hasMissingSeo, seoPendingRowClass } from "@/components/shared/SeoPendingBadge";

export default function CountryClient() {
  const [search, setSearch] = useState(() => loadCmsFilters("country").search || "");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isActive, setIsActive] = useState("");
  const [countryId, setCountryId] = useState<number | undefined>(undefined);

  const { countries, isLoading } = useGetCountries({
    limit: 1000,
    search: debouncedSearch || undefined,
    isActive: isActive || undefined,
    id: countryId,
  });
  const { deleteCountry, isPending: isDeleting } = useDeleteCountry();
  const { toggleCountryActive, isPending: isToggling } = useToggleCountryActive();
  const { updateCountryOrder, isPending: isOrderSaving } = useUpdateCountryOrder();
  const { user } = useGetCurrentUser();

  const [allCountries, setAllCountries] = useState<{ id: number; title: string; isActive?: boolean }[]>([]);
  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  const [orderLoading, setOrderLoading] = useState(true);
  const initialOrderRef = React.useRef<number[]>([]);

  React.useEffect(() => {
    getCountries({ limit: 1000 })
      .then((res) => {
        setAllCountries(res.data.map((c) => ({ id: c.id, title: c.title, isActive: c.isActive })));
        const pinned = res.data
          .filter((c) => c.displayOrder && c.displayOrder > 0)
          .sort((a, b) => a.displayOrder! - b.displayOrder!)
          .map((c) => c.id);
        initialOrderRef.current = pinned;
        setOrderedIds(pinned);
        setOrderLoading(false);
      })
      .catch(() => setOrderLoading(false));
  }, []);

  const orderDirty = JSON.stringify(orderedIds) !== JSON.stringify(initialOrderRef.current);

  const handleSaveOrder = () => {
    updateCountryOrder(orderedIds, {
      onSuccess: () => {
        initialOrderRef.current = [...orderedIds];
      },
    });
  };

  const handleToggle = (country: { id: number; title: string; isActive?: boolean }) => {
    toggleCountryActive(country.id);
  };

  const normalizedRole = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = normalizedRole.includes("super") && normalizedRole.includes("admin");
  const isITTeam =
    user?.team?.name?.toLowerCase().includes("it") ||
    user?.team?.name?.toLowerCase().includes("maintenance");
  const canEdit = isSuperAdmin || isITTeam;

  React.useEffect(() => {
    saveCmsFilters("country", { search });
  }, [search]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: number) => {
    const confirmed = await confirmToast("Are you sure you want to delete?");
    if (!confirmed) return;
    deleteCountry(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PrivatePageHeading icon={Globe} title="Countries" description="Manage countries and their details" />
        {canEdit && (
          <Link
            href="/dashboard/country/create"
            className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Country
          </Link>
        )}
      </div>

      <FilterBox
        search={{ value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search countries..." }}
        selects={[
          {
            value: countryId || "",
            onChange: (e) => {
              setCountryId(e.target.value ? Number(e.target.value) : undefined);
              setSearch("");
              setIsActive("");
            },
            options: allCountries.map((c) => ({ value: String(c.id), label: c.title })),
            placeholder: "All Countries",
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
        orderOptions={allCountries}
        orderActiveOnly
        orderSelectedIds={orderedIds}
        orderOnChange={setOrderedIds}
        orderLoading={orderLoading}
        orderLoadingText="Loading countries..."
        orderPlaceholder="Select countries to show at top"
        orderSearchPlaceholder="Search countries..."
        orderSaving={isOrderSaving}
        orderOnSave={handleSaveOrder}
        orderDirty={orderDirty}
        isLoading={isLoading}
        isEmpty={countries.length === 0}
        emptyIcon={Globe}
        emptyMessage="No countries found"
        emptyCreateLink="/dashboard/country/create"
        emptyCreateLabel="Create your first country"
        canEdit={canEdit}
      >
        <DirectoryTable
          data={countries}
          getRowClass={seoPendingRowClass}
          columns={[
            {
              header: "Display Order",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (country) => (
                country.displayOrder && country.displayOrder > 0 ? (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold shadow-sm">
                    #{country.displayOrder}
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
              render: (country) => (
                country.thumbImg ? (
                  <img src={country.thumbImg} alt="thumb" className="w-10 h-10 rounded object-cover border inline-block" />
                ) : (
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 border inline-block">N/A</div>
                )
              ),
            },
            {
              header: "H1 Title",
              className: "tbl-th",
              cellClassName: "px-4 py-3 text-sm text-gray-600",
              render: (country) => country.h1Title || "-",
            },
            {
              header: "SEO Title",
              className: "tbl-th",
              cellClassName: "px-4 py-3",
              render: (country) => (
                <div>
                  <p className="text-sm font-medium text-gray-900">{country.seoTitle || "-"}</p>

                </div>
              ),
            },
            {
              header: "Slug",
              className: "tbl-th",
              cellClassName: "px-4 py-3 text-sm text-gray-600",
              render: (country) => country.slug,
            },
            {
              header: "Keyword",
              className: "tbl-th",
              cellClassName: "px-4 py-3 text-sm text-gray-600",
              render: (country) => country.seoKeyword || "-",
            },
            {
              header: "SEO Status",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (country) => hasMissingSeo(country) ? <SeoPendingBadge /> : <SeoCompleteBadge />,
            },
            {
              header: "States",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (country) => (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                  {country.states?.length ?? 0}
                </span>
              ),
            },
            {
              header: "Tours",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (country) => (
                <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                  {country.tourCount ?? 0}
                </span>
              ),
            },
            {
              header: "Active",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3 text-center",
              render: (country) => (
                canEdit ? (
                  <button
                    onClick={() => handleToggle(country)}
                    disabled={isToggling}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={country.isActive ? "Click to disable" : "Click to enable"}
                  >
                    <span className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${country.isActive ? "bg-green-500" : "bg-gray-300"}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${country.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                    </span>
                    <span className={country.isActive ? "text-green-600" : "text-gray-400"}>
                      {country.isActive ? "Active" : "Inactive"}
                    </span>
                  </button>
                ) : (
                  <span className={country.isActive ? "text-green-600" : "text-gray-400"}>
                    {country.isActive ? "Active" : "Inactive"}
                  </span>
                )
              ),
            },
            {
              header: "Actions",
              className: "tbl-th-center",
              cellClassName: "px-4 py-3",
              render: (country) => (
                <div className="flex items-center justify-center gap-1">
                  <Link href={`/tour-packages/${country.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="View Public Page">
                    <Eye size={14} />
                  </Link>
                  {canEdit && (
                    <>
                      <Link href={`/dashboard/country/${country.id}`} className="p-1.5 rounded-lg hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors" title="Edit">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => handleDelete(country.id)} disabled={isDeleting} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50" title="Delete">
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
