"use client";
import { useState } from "react";
import { useGetAllPackages, useDeletePackageMutation, useToggleBestSellingMutation } from "../api/useTourPackages";
import PackageCreateForm from "./PackageCreateForm";
import { Plus, Pencil, Trash2, Star, Eye, EyeOff, TrendingUp, Package } from "lucide-react";
import PageLoader from "@/components/shared/PageLoader";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import FilterBox from "@/components/shared/FilterBox";
import { successToast, errorToast } from "@/components/shared/tost";

export default function TourPackageManager() {
  const { data, isLoading } = useGetAllPackages();
  const deleteMutation = useDeletePackageMutation();
  const toggleBest = useToggleBestSellingMutation();
  const [showForm, setShowForm] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any>(null);
  const [search, setSearch] = useState("");

  const packages = (data?.data || []).filter((p: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.destination?.toLowerCase().includes(q);
  });
  const totalActive = packages.filter((p: any) => p.isActive).length;
  const totalBestSelling = packages.filter((p: any) => p.isBestSelling).length;
  const totalPurchases = packages.reduce((s: number, p: any) => s + (p.purchaseCount || 0), 0);

  const handleEdit = (pkg: any) => {
    setEditingPkg(pkg);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this package? This action cannot be undone.")) return;
    try {
      await deleteMutation.mutateAsync(id);
      successToast("Package deleted");
    } catch {
      errorToast("Failed to delete package. Please try again.");
    }
  };

  const handleToggleBest = async (id: number) => {
    try {
      await toggleBest.mutateAsync(id);
      successToast("Updated successfully");
    } catch {
      errorToast("Failed to update package. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PrivatePageHeading
          icon={Package}
          title="Tour Packages"
          description="Manage tour packages for your website"
        />
        <button onClick={() => { setEditingPkg(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-primary rounded-xl hover:bg-brand-primary transition-colors">
          <Plus size={16} /> Create Package
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Packages", value: packages.length, color: "text-slate-700", icon: Package },
          { label: "Active", value: totalActive, color: "text-brand-success", icon: Eye },
          { label: "Best Selling", value: totalBestSelling, color: "text-brand-warning", icon: Star },
          { label: "Total Purchases", value: totalPurchases, color: "text-brand-primary", icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <Icon size={20} className={`mx-auto ${color} mb-1`} />
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      <FilterBox
        search={{ value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search packages..." }}
      />

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <PageLoader size="section" />
        ) : packages.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Package size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium">No packages yet</p>
            <p className="text-sm mt-1">Click "Create Package" to get started</p>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr className="border-b border-brand-neutral-border">
                <th className="tbl-th">Banner</th>
                <th className="tbl-th">Name</th>
                <th className="tbl-th">Destination</th>
                <th className="tbl-th-center">Duration</th>
                <th className="tbl-th-right">Price</th>
                <th className="tbl-th-center">Purchases</th>
                <th className="tbl-th-center">Status</th>
                <th className="tbl-th-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-neutral-light">
              {packages.map((pkg: any) => (
                <tr key={pkg.id} className="hover:bg-brand-neutral-light/50 transition-colors">
                  <td className="px-4 py-3">
                    {pkg.bannerImageUrl && (Array.isArray(pkg.bannerImageUrl) ? pkg.bannerImageUrl[0] : pkg.bannerImageUrl) ? (
                      <img src={Array.isArray(pkg.bannerImageUrl) ? pkg.bannerImageUrl[0] : pkg.bannerImageUrl} alt="" className="w-16 h-10 object-cover rounded-lg border border-slate-200" />
                    ) : (
                      <div className="w-16 h-10 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
                        <Package size={14} className="text-slate-300" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-slate-800">{pkg.name}</p>
                    {pkg.isBestSelling && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full mt-0.5">
                        <Star size={9} fill="currentColor" /> Best Selling
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{pkg.destination}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 text-center">{pkg.duration}</td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-sm font-bold text-slate-800">₹{pkg.pricePerPerson?.toLocaleString()}</p>
                    {pkg.discountPrice && <p className="text-xs text-slate-400 line-through">₹{pkg.discountPrice.toLocaleString()}</p>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-bold text-brand-primary">{pkg.purchaseCount}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pkg.isActive ? "bg-brand-success-light text-brand-success" : "bg-slate-100 text-slate-400"}`}>
                      {pkg.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleToggleBest(pkg.id)} title="Toggle Best Selling" disabled={toggleBest.isPending}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${pkg.isBestSelling ? "bg-amber-50 text-amber-500" : "hover:bg-amber-50 text-slate-400 hover:text-amber-500"}`}>
                        {toggleBest.isPending ? <PageLoader size="inline" /> : <Star size={14} fill={pkg.isBestSelling ? "currentColor" : "none"} />}
                      </button>
                      <button onClick={() => handleEdit(pkg)} title="Edit"
                        className="p-1.5 rounded-lg hover:bg-brand-primary-light text-slate-400 hover:text-brand-primary transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(pkg.id)} title="Delete" disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-lg hover:bg-brand-danger-light text-slate-400 hover:text-brand-danger transition-colors disabled:opacity-50">
                        {deleteMutation.isPending ? <PageLoader size="inline" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-8 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">{editingPkg ? "Edit Package" : "Create Package"}</h2>
              <button onClick={() => { setShowForm(false); setEditingPkg(null); }}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                <span className="text-lg">×</span>
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <PackageCreateForm initialData={editingPkg} onClose={() => { setShowForm(false); setEditingPkg(null); }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
