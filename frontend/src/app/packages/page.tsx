import type { Metadata } from "next";
import Link from "next/link";
import { Package, Star, Users, MapPin, Clock } from "lucide-react";
import JsonLd from "@/components/shared/JsonLd";
import { itemListSchema } from "@/lib/jsonLd";
import { fetchPackages, type PublicTourPackage } from "@/feature/tourPackages/public-server";

export const metadata: Metadata = {
  title: "Tour Packages | Arivo Holiday",
  description:
    "Discover handcrafted travel experiences — best selling and all-inclusive holiday tour packages at guaranteed best prices.",
  alternates: { canonical: "/packages" },
  openGraph: {
    type: "website",
    title: "Tour Packages | Arivo Holiday",
    description:
      "Discover handcrafted travel experiences — best selling and all-inclusive holiday tour packages at guaranteed best prices.",
    url: "/packages",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tour Packages | Arivo Holiday",
    description:
      "Discover handcrafted travel experiences — best selling and all-inclusive holiday tour packages at guaranteed best prices.",
  },
};

export default async function PackagesPage() {
  const packages = await fetchPackages();
  const bestSelling = packages.filter((p) => p.isBestSelling);
  const others = packages.filter((p) => !p.isBestSelling);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {packages.length > 0 && (
        <JsonLd
          data={itemListSchema(packages.map((p) => ({ name: p.name, url: `/packages/${p.slug}` })))}
        />
      )}
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-16 px-6">
        <div className="max-w-[1600px] mx-auto text-center">
          <h1 className="h1">Tour Packages</h1>
          <p className="text-indigo-200 mt-3 text-lg">Discover handcrafted travel experiences</p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-10">
        {packages.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium text-lg">No packages available right now</p>
            <p className="text-slate-400 mt-1">Check back soon for amazing deals!</p>
          </div>
        ) : (
          <>
            {/* Best Selling Section */}
            {bestSelling.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Star size={24} className="text-amber-500" fill="currentColor" />
                  <h2 className="h5 text-slate-900">Best Selling Packages</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bestSelling.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} featured />
                  ))}
                </div>
              </div>
            )}

            {/* All Packages */}
            {others.length > 0 && (
              <div>
                <h2 className="h5 text-slate-900 mb-6">All Packages</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {others.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PackageCard({ pkg, featured = false }: { pkg: PublicTourPackage; featured?: boolean }) {
  const bannerUrl = Array.isArray(pkg.bannerImageUrl) ? pkg.bannerImageUrl[0] : pkg.bannerImageUrl;
  return (
    <Link href={`/packages/${pkg.slug}`}>
      <div className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border ${featured ? "border-amber-200 ring-1 ring-amber-100" : "border-slate-200"} group`}>
        {/* Banner */}
        <div className="relative h-48 overflow-hidden">
          {bannerUrl ? (
            <img src={bannerUrl} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <Package size={40} className="text-indigo-300" />
            </div>
          )}
          {featured && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              <Star size={10} fill="currentColor" /> BEST SELLING
            </div>
          )}
          {pkg.discountPrice && pkg.pricePerPerson && pkg.discountPrice > pkg.pricePerPerson && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
              {Math.round(((pkg.discountPrice - pkg.pricePerPerson) / pkg.discountPrice) * 100)}% OFF
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{pkg.name}</h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            {pkg.destination && (
              <span className="flex items-center gap-1"><MapPin size={12} /> {pkg.destination}</span>
            )}
            {pkg.duration && (
              <span className="flex items-center gap-1"><Clock size={12} /> {pkg.duration}</span>
            )}
          </div>
          {pkg.shortDescription && (
            <p className="text-sm text-slate-500 mt-3 line-clamp-2">{pkg.shortDescription}</p>
          )}
          <div className="flex items-end justify-between mt-4 pt-3 border-t border-slate-100">
            <div>
              <p className="text-2xl font-black text-indigo-600">₹{pkg.pricePerPerson?.toLocaleString()}</p>
              {pkg.discountPrice && pkg.discountPrice > (pkg.pricePerPerson || 0) && (
                <p className="text-xs text-slate-400 line-through">₹{pkg.discountPrice.toLocaleString()}</p>
              )}
              <p className="text-[10px] text-slate-400 mt-0.5">per person</p>
            </div>
            {(pkg.purchaseCount ?? 0) > 0 && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Users size={12} />
                <span className="font-semibold">{pkg.purchaseCount}</span> booked
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
