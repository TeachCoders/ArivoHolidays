"use client";
import BannerImageUpload from "@/components/shared/BannerImageUpload";

interface BannerSectionProps {
  bannerTitle: string;
  bannerTag: string;
  bannerImages: string[];
  onBannerTileChange: (val: string) => void;
  onBannerTagChange: (val: string) => void;
  onBannerImagesChange: (images: string[]) => void;
  onBannerFilesSelect?: (files: File[], indices?: number[]) => void;
  folderPath?: string;
  maxImages?: number;
  hideInputs?: boolean;
  label?: string;
}

export default function BannerSection({
  bannerTitle,
  bannerTag,
  bannerImages,
  onBannerTileChange,
  onBannerTagChange,
  onBannerImagesChange,
  onBannerFilesSelect,
  folderPath = "",
  maxImages = 15,
  hideInputs = false,
  label = "Banner Images",
}: BannerSectionProps) {
  return (
    <div className="border border-slate-200 rounded-xl shadow-sm bg-white p-6 space-y-5">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
        Banner
      </h3>

      {!hideInputs && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-neutral-muted block">
              Banner Tile
            </label>
            <input
              type="text"
              value={bannerTitle}
              onChange={(e) => onBannerTileChange(e.target.value)}
              placeholder="Banner tile text"
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-neutral-muted block">
              Banner Tag
            </label>
            <input
              type="text"
              value={bannerTag}
              onChange={(e) => onBannerTagChange(e.target.value)}
              placeholder="Banner tag text"
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            />
          </div>
        </div>
      )}

      <BannerImageUpload
        value={bannerImages}
        onChange={onBannerImagesChange}
        onFilesSelect={onBannerFilesSelect}
        label={label}
        maxImages={maxImages}
        folderPath={folderPath}
      />
    </div>
  );
}
