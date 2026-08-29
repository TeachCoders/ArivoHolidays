import React from "react";
import {
  Upload,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  Pencil,
} from "lucide-react";

interface FileUploadProps {
  title: string;
  subtitle?: string;
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  accept?: string;
  name?: string;
}

export function FileUpload({
  title,
  subtitle,
  file,
  setFile,
  accept = "*/*",
  name = "file",
}: FileUploadProps) {
  const getFileIcon = () => {
    if (!file) return <Upload className="size-5" />;

    if (file.type.startsWith("image/")) {
      return <FileImage className="size-5" />;
    }

    if (file.type.startsWith("video/")) {
      return <FileVideo className="size-5" />;
    }

    if (file.type.startsWith("audio/")) {
      return <FileAudio className="size-5" />;
    }

    return <FileText className="size-5" />;
  };

  return (
    <div className="w-full">
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 transition hover:border-brand hover:bg-brand-soft">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* ICON */}
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
            {getFileIcon()}
          </span>

          {/* TEXT */}
          <div className="flex flex-col">
            {!file ? (
              <>
                <span className="text-sm font-medium text-gray-700">
                  {title}
                </span>

                {subtitle && (
                  <span className="text-xs text-gray-500">{subtitle}</span>
                )}
              </>
            ) : (
              <>
                <span className="max-w-[220px] truncate text-sm font-semibold text-gray-800">
                  {file.name}
                </span>

                <span className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(2)} MB
                </span>
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <span className="text-xs font-medium text-brand">
          {file && <Pencil />}
        </span>

        <input
          type="file"
          name={name}
          accept={accept}
          className="hidden"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
              setFile(e.target.files[0]);
            }
          }}
        />
      </label>
    </div>
  );
}
