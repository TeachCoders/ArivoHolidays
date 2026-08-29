"use client";

import { Suspense } from "react";
import VendarClient from "@/feature/vendors/components/VendarClient";


export default function VendorDashboard() {
  
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-sm">Loading...</div>}>
      <VendarClient />
    </Suspense>
  );
}
