"use client";

import React from "react";
import { useGuestGallery } from "../api";
import GuestGalleryClient from "./GuestGalleryClient";

export default function CmsGuestGalleryWrapper() {
  const { data, isLoading } = useGuestGallery(1, 100, true);

  const items = data?.data || [];

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-400">
        Loading guest gallery photos...
      </div>
    );
  }

  return <GuestGalleryClient initialItems={items} />;
}
