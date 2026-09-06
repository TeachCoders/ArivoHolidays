"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, FileText, Eye } from "lucide-react";
import { confirmToast } from "@/components/shared/tost";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import FilterBox from "@/components/shared/FilterBox";
import { useGetAdLandingPages, useDeleteAdLandingPage, useToggleAdLandingPageActive } from "@/feature/landing/api/useAdLandingPage";
import DirectoryTableLayout from "@/components/shared/DirectoryTableLayout";
import DirectoryTable from "@/components/shared/DirectoryTable";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";

export default function AdLandingPageClient() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isActive, setIsActive] = useState("");

  const { pages, isLoading } = useGetAdLandingPages({
    limit: 1000,
    search: debouncedSearch || undefined,
    isActive: isActive || undefined,
  });
  
  const { deleteAdLandingPage, isPending: isDeleting } = useDeleteAdLandingPage();
  const { toggleAdLandingPageActive, isPending: isToggling } = useToggleAdLandingPageActive();
  const { user } = useGetCurrentUser();

  const normalizedRole = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = normalizedRole.includes("super") && normalizedRole.includes("admin");
  const isITTeam = user?.team?.name?.toLowerCase().includes("it") || user?.team?.name?.toLowerCase().includes("maintenance");
  const canEdit = isSuperAdmin || isITTeam;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: number) => {
    const confirmed = await confirmToast("Are you sure you want to delete?");
    if (!confirmed) return;
    deleteAdLandingPage(id);
  };

  const handleToggle = (page: any) => {
    toggleAdLandingPageActive(page.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PrivatePageHeading icon={FileText} title="Ad Landing Pages" description="Manage custom marketing landing pages" />
        {canEdit && (
          <Link href="/dashboard/ad-landing-pages/create" className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2">
            <Plus size={16} /> Add Page
          </Link>
        )}
      </div>

      <FilterBox
        search={{ value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search landing pages..." }}
        selects={[
          {
            value: isActive,
            onChange: (e) => {
              setIsActive(e.target.value);
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
        isLoading={isLoading}
        isEmpty={pages.length === 0}
        emptyIcon={FileText}
        emptyMessage="No ad landing pages found"
        emptyCreateLink="/dashboard/ad-landing-pages/create"
        emptyCreateLabel="Create your first ad landing page"
        canEdit={canEdit}
      >
        <DirectoryTable
          data={pages as any[]}
          columns={[
            {
              header: "Thumb",
              className: "tbl-th-center w-16",
              cellClassName: "px-4 py-3 text-center",
              render: (page) => (
                page.bannerImages && page.bannerImages[0] ? (
                  <img src={page.bannerImages[0]} alt="thumb" className="w-10 h-10 rounded object-cover border inline-block" />
                ) : (
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 border inline-block">N/A</div>
                )
              ),
            },
            {
              header: "Title",
              className: "tbl-th",
              cellClassName: "px-4 py-3",
              render: (page) => (
                <div>
                  <p className="text-sm font-medium text-gray-900">{page.title}</p>
                  {page.theme && <span className="text-xs text-brand-600">{page.theme} theme</span>}
                </div>
              ),
            },
            {
              header: "Slug",
              className: "tbl-th",
              cellClassName: "px-4 py-3 text-sm text-gray-600",
              render: (page) => `/offers/${page.slug}`,
            },
            {
              header: "Hero Heading",
              className: "tbl-th",
              cellClassName: "px-4 py-3 text-sm text-gray-600",
              render: (page) => <span className="line-clamp-1">{page.heroHeading || "-"}</span>,
            },
            {
              header: "Active",
              className: "tbl-th-center w-24",
              cellClassName: "px-4 py-3 text-center",
              render: (page) => (
                canEdit ? (
                  <button
                    onClick={() => handleToggle(page)}
                    disabled={isToggling}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={page.isActive ? "Click to disable" : "Click to enable"}
                  >
                    <span className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors ${page.isActive ? "bg-green-500" : "bg-gray-300"}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${page.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                    </span>
                    <span className={page.isActive ? "text-green-600" : "text-gray-400"}>
                      {page.isActive ? "Active" : "Inactive"}
                    </span>
                  </button>
                ) : (
                  <span className={page.isActive ? "text-green-600" : "text-gray-400"}>
                    {page.isActive ? "Active" : "Inactive"}
                  </span>
                )
              ),
            },
            {
              header: "Actions",
              className: "tbl-th-center w-28",
              cellClassName: "px-4 py-3",
              render: (page) => (
                <div className="flex items-center justify-center gap-1">
                  <Link href={`/offers/${page.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="View Public Page">
                    <Eye size={14} />
                  </Link>
                  {canEdit && (
                    <>
                      <Link href={`/dashboard/ad-landing-pages/${page.id}`} className="p-1.5 rounded-lg hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors" title="Edit">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => handleDelete(page.id)} disabled={isDeleting} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50" title="Delete">
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
