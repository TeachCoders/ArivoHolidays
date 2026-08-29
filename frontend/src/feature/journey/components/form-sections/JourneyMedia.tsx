import React from "react";
import BannerSection from "@/components/shared/BannerSection";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/shared/RichTextEditor";

interface JourneyMediaProps {
  bannerTitle: string;
  setBannerTile: React.Dispatch<React.SetStateAction<string>>;
  bannerTag: string;
  setBannerTag: React.Dispatch<React.SetStateAction<string>>;
  bannerImages: string[];
  setBannerImages: React.Dispatch<React.SetStateAction<string[]>>;
  bannerFiles: { file: File; index: number }[];
  setBannerFiles: React.Dispatch<React.SetStateAction<{ file: File; index: number }[]>>;
  moreDescription: string;
  setMoreDescription: React.Dispatch<React.SetStateAction<string>>;
}

export default function JourneyMedia({
  bannerTitle,
  setBannerTile,
  bannerTag,
  setBannerTag,
  bannerImages,
  setBannerImages,
  bannerFiles,
  setBannerFiles,
  moreDescription,
  setMoreDescription,
}: JourneyMediaProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <BannerSection
        bannerTitle={bannerTitle}
        bannerTag={bannerTag}
        bannerImages={bannerImages}
        onBannerTileChange={setBannerTile}
        onBannerTagChange={setBannerTag}
        onBannerImagesChange={setBannerImages}
        onBannerFilesSelect={(files, indices) =>
          setBannerFiles(files.map((file, i) => ({ file, index: indices?.[i] ?? bannerImages.length + i })))
        }
        folderPath="journey"
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Additional Description</h2>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-slate-600 mb-2 block">Additional Banner Description</Label>
          <RichTextEditor
            content={moreDescription}
            onChange={(html) => setMoreDescription(html)}
          />
        </div>
      </div>
    </div>
  );
}
