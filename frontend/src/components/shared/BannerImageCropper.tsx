import React from "react";
import ImageCropUpload from "@/components/shared/ImageCropUpload";

type BannerImageCropperProps = {
  /** Maximum height for the output image (default 500px) */
  maxHeight?: number;
  /** Callback called with the URL of the cropped image */
  onCropComplete: (url: string) => void;
  /** Initial image URL to display */
  initialImage?: string;
  /** Folder path for uploading */
  folderPath?: string;
  /** Filename for uploading */
  filename?: string;
};

export default function BannerImageCropper({ maxHeight = 750, onCropComplete, initialImage, folderPath, filename }: BannerImageCropperProps) {
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    const fd = new FormData();
    fd.append("category", "thumb");
    if (filename) {
      fd.append("filename", filename.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-thumb");
      fd.append("label", `${filename} - Thumbnail`);
    }
    fd.append("file", file);

    try {
      // Need to import apiClient if not already imported
      const { default: apiClient } = await import("@/lib/apiClient");
      const res = await apiClient.post("/upload", fd);
      if (res.data?.url) {
        onCropComplete(res.data.url);
      }
    } catch (err) {
      console.error("Banner upload failed", err);
      // Fallback to blob if upload fails just so it doesn't break entirely?
      // Actually better to not fallback, so we don't save invalid data
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ImageCropUpload
      onFileSelect={handleFileSelect}
      maxHeight={maxHeight}
      label="Upload Banner Image"
      initialImage={initialImage}
    />
  );
}
