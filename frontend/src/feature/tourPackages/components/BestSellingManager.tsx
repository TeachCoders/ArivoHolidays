"use client";
import { useState } from "react";
import { useGetAllPackages, useToggleBestSellingMutation } from "../api/useTourPackages";
import { Star, TrendingUp, Package, ArrowUpDown } from "lucide-react";
import PageLoader from "@/components/shared/PageLoader";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import FilterBox from "@/components/shared/FilterBox";
import { successToast, errorToast } from "@/components/shared/tost";

export default function BestSellingManager() {
  const { data, isLoading } = useGetAllPackages();
  const toggleBest = useToggleBestSellingMutation();
  const [search, setSearch] = useState("");

  const packages = (data?.data || []).filter((p: any) => {
    if (!p.isBestSelling) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.destination?.toLowerCase().includes(q);
  });
  const totalPurchases = packages.reduce((s: number, p: any) => s + (p.purchaseCount || 0), 0);

  const handleToggleBest = async (id: number) => {
    try {
      await toggleBest.mutateAsync(id);
      successToast("Removed from Best Selling");
    } catch {
      errorToast("Failed to update");
    }
  };

  return (
    <div className="space-y-6">
      <PrivatePageHeading
        icon={TrendingUp}
        title="Best Selling Packages"
        description="Packages marked as best selling — displayed prominently on your website"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Best Selling Packages", value: packages.length, color: "text-amber-600", icon: Star },
          { label: "Total Purchases", value: totalPurchases, color: "text-indigo-600", icon: TrendingUp },
          { label: "Avg Purchases", value: packages.length ? Math.round(totalPurchases / packages.length) : 0, color: "text-emerald-600", icon: ArrowUpDown },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <Icon size={20} className={`mx-auto ${color} mb-1`} />
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      <FilterBox
        search={{ value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search best selling packages..." }}
      />

      {/* Packages Grid */}
      {isLoading ? (
        <PageLoader size="section" />
      ) : packages.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
          <Star size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">No best selling packages</p>
          <p className="text-sm text-slate-400 mt-1">Go to Tour Packages and click the star icon to mark packages as best selling</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg: any, index: number) => (
            <div key={pkg.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {pkg.bannerImageUrl && (Array.isArray(pkg.bannerImageUrl) ? pkg.bannerImageUrl[0] : pkg.bannerImageUrl) ? (
                <img src={Array.isArray(pkg.bannerImageUrl) ? pkg.bannerImageUrl[0] : pkg.bannerImageUrl} alt={pkg.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-indigo-100 to-amber-50 flex items-center justify-center">
                  <Package size={32} className="text-indigo-300" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                      #{index + 1} Best Selling
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-2">{pkg.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{pkg.destination} • {pkg.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-600">₹{pkg.pricePerPerson?.toLocaleString()}</p>
                    {pkg.discountPrice && <p className="text-xs text-slate-400 line-through">₹{pkg.discountPrice.toLocaleString()}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-indigo-500" />
                    <span className="text-xs font-bold text-indigo-600">{pkg.purchaseCount} purchases</span>
                  </div>
                  <button onClick={() => handleToggleBest(pkg.id)} disabled={toggleBest.isPending}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors disabled:opacity-50">
                    {toggleBest.isPending ? (
                      <>
                        <PageLoader size="inline" className="mr-1" />
                        Removing...
                      </>
                    ) : (
                      "Remove"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
