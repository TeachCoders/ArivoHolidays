import { useState } from "react";
import { createCountry } from "@/feature/country/api";
import { createState } from "@/feature/state/api";
import { createCity } from "@/feature/city/api";
import { createTravelExperience } from "@/feature/travelExperience/api";

export type QuickCreateTarget = "country" | "state" | "city" | "experience";

export function useEntityQuickCreate(onSuccess?: (target: QuickCreateTarget, newId: number, title: string) => void) {
  const [quickCreate, setQuickCreate] = useState<QuickCreateTarget | null>(null);
  const [quickCreateLoading, setQuickCreateLoading] = useState(false);
  const [quickCreateError, setQuickCreateError] = useState("");
  const [quickParentId, setQuickParentId] = useState<number | null>(null);

  const openQuickCreate = (target: QuickCreateTarget, parentId: number | null = null) => {
    setQuickParentId(parentId);
    setQuickCreateError("");
    setQuickCreate(target);
  };

  const closeQuickCreate = () => {
    setQuickCreate(null);
    setQuickParentId(null);
    setQuickCreateError("");
  };

  const handleQuickCreate = async (data: { title: string; slug: string; h1Title: string; parentId: number | null }) => {
    if (!quickCreate) return;
    
    setQuickCreateLoading(true);
    setQuickCreateError("");
    const desc = "Created from quick form";
    
    try {
      let newId = 0;
      
      if (quickCreate === "country") {
        const res = await createCountry({ title: data.title, slug: data.slug || undefined, seoDescription: desc, showOnSite: false });
        newId = res.data.id;
      } else if (quickCreate === "state") {
        const res = await createState({ title: data.title, slug: data.slug || undefined, seoDescription: desc, countryId: data.parentId!, showOnSite: false });
        newId = res.data.id;
      } else if (quickCreate === "city") {
        const res = await createCity({ title: data.title, slug: data.slug || undefined, seoDescription: desc, stateId: data.parentId!, showOnSite: false });
        newId = res.data.id;
      } else if (quickCreate === "experience") {
        const res = await createTravelExperience({ title: data.title, slug: data.slug || undefined, seoDescription: desc });
        newId = res.data.id;
      }
      
      if (onSuccess) {
        onSuccess(quickCreate, newId, data.title);
      }
      closeQuickCreate();
    } catch (err: any) {
      setQuickCreateError(err?.response?.data?.message || "Failed to create. Please try again.");
    } finally {
      setQuickCreateLoading(false);
    }
  };

  return {
    quickCreate,
    quickCreateLoading,
    quickCreateError,
    quickParentId,
    openQuickCreate,
    closeQuickCreate,
    handleQuickCreate,
    setQuickParentId,
  };
}
