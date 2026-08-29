"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Route, Plus, Trash2, ChevronDown, Star, Map, Sparkles, GitBranch, CalendarDays, Package, Heart, ScrollText, MessageCircle, FileText, CheckCircle2, XCircle, GripVertical, X, Search, Maximize2 } from "lucide-react";
import FilterBox from "@/components/shared/FilterBox";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormActionButton from "@/components/shared/customBtns";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import SeoFields from "@/components/shared/SeoFields";
import BannerSection from "@/components/shared/BannerSection";
import RichTextEditor from "@/components/shared/RichTextEditor";
import DayItineraryEditor from "@/components/shared/DayItineraryEditor";
import ListEditor from "@/components/shared/ListEditor";
import SearchableMultiSelect from "@/components/shared/SearchableMultiSelect";
import TravelExperiencePills from "@/components/shared/TravelExperiencePills";
import QuickCreateModal from "@/components/shared/QuickCreateModal";
import type { DayPlan } from "@/components/shared/DayItineraryEditor";
import JourneyBasicInfo from "./form-sections/JourneyBasicInfo";
import JourneyItineraryBuilder from "./form-sections/JourneyItineraryBuilder";
import JourneyMedia from "./form-sections/JourneyMedia";
import { useEntityQuickCreate, QuickCreateTarget } from "@/hooks/useEntityQuickCreate";
import {
  useCreateJourney,
  useUpdateJourney,
} from "@/feature/journey/api/useJourney";
import { usePermissions } from "@/hooks/usePermissions";
import { getCities, createCity } from "@/feature/city/api";
import { getStates, createState } from "@/feature/state/api";
import apiClient from "@/lib/apiClient";
import { errorToast } from "@/components/shared/tost";
import { getCountries, createCountry } from "@/feature/country/api";
import { getSeasons } from "@/feature/season/api";
import { getTravelExperiences, createTravelExperience } from "@/feature/travelExperience/api";
import type { City } from "@/feature/city/type";
import type { State } from "@/feature/state/type";
import type { Country } from "@/feature/country/type";
import type { Journey } from "@/feature/journey/type";

interface JourneyFormProps {
  initialData?: Journey;
  mode: "create" | "edit";
}

export default function JourneyFormPage({ initialData, mode }: JourneyFormProps) {
  const router = useRouter();
  const { createJourney, isPending: isCreating } = useCreateJourney();
  const { updateJourney, isPending: isUpdating } = useUpdateJourney();
  const { canEditAdminContent: canEdit } = usePermissions();

  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [allStates, setAllStates] = useState<State[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const journeyCountryIds = React.useMemo(
    () => Array.from(new Set((initialData?.cities ?? []).map((c: any) => c.state?.country?.id).filter(Boolean))) as number[],
    [initialData]
  );
  const journeyStateIds = React.useMemo(
    () => Array.from(new Set((initialData?.cities ?? []).map((c: any) => c.state?.id).filter(Boolean))) as number[],
    [initialData]
  );
  const [filterCountryIds, setFilterCountryIds] = useState<number[]>(journeyCountryIds);
  const [filterStateIds, setFilterStateIds] = useState<number[]>(journeyStateIds);

  const filteredStates = React.useMemo(
    () => (filterCountryIds.length > 0 ? allStates.filter((s) => filterCountryIds.includes(s.countryId)) : []),
    [allStates, filterCountryIds]
  );

  const getCityLabel = React.useCallback(
    (city: City) => city.title,
    []
  );

  const [seasons, setSeasons] = useState<{ id: number; title: string }[]>([]);
  const [loadingSeasons, setLoadingSeasons] = useState(true);

  const [experiences, setExperiences] = useState<{ id: number; title: string }[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    seoDescription: initialData?.seoDescription || "",
    overView: initialData?.overView || "",
    seoKeyword: initialData?.seoKeyword || "",
    seoTitle: initialData?.seoTitle || "",
    h1Title: initialData?.h1Title || "",
    thumbImg: initialData?.thumbImg || "",
    noDays: initialData?.noDays || 1,
    cityIds: (initialData?.route?.map((c: any) => c.id) || initialData?.cities?.map((c: any) => c.id) || []) as number[],
    destination: initialData?.destination || "",
    isActive: initialData?.isActive ?? true,
    isBestSelling: initialData?.isBestSelling ?? false,
    displayOrder: initialData?.displayOrder || 0,
  });

  React.useEffect(() => {
    if (formData.cityIds.length > 0 && cities.length > 0) {
      const selectedCities = formData.cityIds
        .map((id) => cities.find((c) => c.id === id)?.title)
        .filter(Boolean);
      if (selectedCities.length > 0) {
        setFormData((prev) => ({ ...prev, destination: selectedCities.join("-") }));
      }
    }
  }, [formData.cityIds, cities]);

  const [seasonIds, setSeasonIds] = useState<number[]>(initialData?.months?.map((m: any) => m.id) || []);
  const [travelExperienceIds, setTravelExperienceIds] = useState<number[]>(initialData?.travelExperiences?.map((e: any) => e.id) || []);

  const reorderIds = React.useCallback((fromId: number, toId: number, current: number[]) => {
    const arr = [...current];
    const fromIdx = arr.indexOf(fromId);
    const toIdx = arr.indexOf(toId);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return current;
    const [item] = arr.splice(fromIdx, 1);
    arr.splice(toIdx > fromIdx ? toIdx - 1 : toIdx, 0, item);
    return arr;
  }, []);

  const [dragCityIdx, setDragCityIdx] = useState<number | null>(null);
  const [addStopOpen, setAddStopOpen] = useState(false);
  const [addStopSearch, setAddStopSearch] = useState("");

  const addRouteStop = React.useCallback((cityId: number) => {
    setFormData((prev) => ({ ...prev, cityIds: [...prev.cityIds, cityId] }));
  }, []);


  const [quickCreatedOptions, setQuickCreatedOptions] = useState<Record<string, {id: number, title: string}[]>>({
    country: [], state: [], city: [], experience: []
  });

  const quickCreateProps = useEntityQuickCreate((target, newId, title) => {
    setQuickCreatedOptions(prev => ({ ...prev, [target]: [...prev[target], { id: newId, title }] }));
    if (target === "country") setFilterCountryIds((prev) => [...prev, newId]);
    else if (target === "state") setFilterStateIds((prev) => [...prev, newId]);
    else if (target === "city") setFormData((prev) => ({ ...prev, cityIds: [...prev.cityIds, newId] }));
    else if (target === "experience") setTravelExperienceIds((prev) => [...prev, newId]);
  });

  const quickCreateConfig = {
    country: { modalTitle: "Create Country", parentOptions: [], parentValue: null },
    state: { modalTitle: "Create State", parentLabel: "Country", parentPlaceholder: "Select country", parentOptions: countries.map((c) => ({ id: c.id, title: c.title })), parentValue: quickCreateProps.quickParentId },
    city: { modalTitle: "Create City", parentLabel: "State", parentPlaceholder: "Select state", parentOptions: filteredStates.map((s) => ({ id: s.id, title: s.title })), parentValue: quickCreateProps.quickParentId },
    experience: { modalTitle: "Create Travel Experience", parentOptions: [], parentValue: null },
  };

  const currentConfig = quickCreateProps.quickCreate ? quickCreateConfig[quickCreateProps.quickCreate as keyof typeof quickCreateConfig] : {} as any;
  const mergedQuickCreateProps = { ...quickCreateProps, ...currentConfig };


  const [seoOpen, setSeoOpen] = useState(false);

  const moveCityByIdx = React.useCallback((fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    setFormData((prev) => {
      const arr = [...prev.cityIds];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return { ...prev, cityIds: arr };
    });
  }, []);

  const citySlug = (initialData?.cities?.[0]?.slug) || cities.find(c => formData.cityIds[0] && c.id === formData.cityIds[0])?.slug || "";

  const [bannerTitle, setBannerTile] = useState(initialData?.banner?.bannerTitle || "");
  const [bannerTag, setBannerTag] = useState(initialData?.banner?.bannerTag || "");
  const [bannerImages, setBannerImages] = useState<string[]>(initialData?.banner?.images || []);
  const [bannerFiles, setBannerFiles] = useState<{ file: File; index: number }[]>([]);
  const [moreDescription, setMoreDescription] = useState(initialData?.moreDescription || "");

  const initializedRef = React.useRef(false);

  React.useEffect(() => {
    if (initialData && !initializedRef.current) {
      initializedRef.current = true;
      setFormData({
        title: initialData.title || "",
        slug: initialData.slug || "",
        seoDescription: initialData.seoDescription || "",
        overView: initialData.overView || "",
        seoKeyword: initialData.seoKeyword || "",
        seoTitle: initialData.seoTitle || "",
        h1Title: initialData.h1Title || "",
        thumbImg: initialData.thumbImg || "",
        noDays: initialData.noDays || 1,
        cityIds: (initialData.route?.map((c: any) => c.id) || initialData.cities?.map((c: any) => c.id) || []) as number[],
        destination: initialData.destination || "",
        isActive: initialData.isActive ?? true,
        isBestSelling: initialData.isBestSelling ?? false,
        displayOrder: initialData.displayOrder || 0,
      });
      setSeasonIds(initialData.months?.map((m: any) => m.id) || []);
      setTravelExperienceIds(initialData.travelExperiences?.map((e: any) => e.id) || []);
      setFilterCountryIds(
        Array.from(new Set((initialData.cities ?? []).map((c: any) => c.state?.country?.id).filter(Boolean)))
      );
      setFilterStateIds(
        Array.from(new Set((initialData.cities ?? []).map((c: any) => c.state?.id).filter(Boolean)))
      );
      setBannerTile(initialData.banner?.bannerTitle || "");
      setBannerTag(initialData.banner?.bannerTag || "");
      setBannerImages(initialData.banner?.images || []);
      setMoreDescription(initialData.moreDescription || "");
      setDays(initialData.days?.map((d: any, i: number) => ({ day: i + 1, title: d.day, content: d.description })) || []);
      setInclusions(initialData.inclusions || []);
      setHighlights(initialData.highlights || []);
      setExclusions(initialData.exclusions || []);
      setWhyChooseUs(initialData.whyChooseUs || []);
      setBookingPolicyList(initialData.bookingPolicyList || []);
      setFaqs(initialData.faqs || []);
      setActiveTab(initialData.isBestSelling ? "bestSelling" : "general");
    }
  }, [initialData]);

  const [days, setDays] = useState<DayPlan[]>(
    initialData?.days?.map((d: any, i: number) => ({ day: i + 1, title: d.day, content: d.description })) || []
  );
  const [inclusions, setInclusions] = useState<string[]>(initialData?.inclusions || []);
  const [highlights, setHighlights] = useState<string[]>(initialData?.highlights || []);
  const [exclusions, setExclusions] = useState<string[]>(initialData?.exclusions || []);
  const [whyChooseUs, setWhyChooseUs] = useState<string[]>(initialData?.whyChooseUs || []);
  const [bookingPolicyList, setBookingPolicyList] = useState<string[]>(initialData?.bookingPolicyList || []);
  const [faqs, setFaqs] = useState<{ ques: string; ans: string }[]>(initialData?.faqs || []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"general" | "bestSelling">(
    initialData?.isBestSelling ? "bestSelling" : "general"
  );

  const isBestSellingTab = activeTab === "bestSelling";

  const isLoading = isCreating || isUpdating;

  React.useEffect(() => {
    getCities({ limit: 1000 }).then((res) => {
      setCities(res.data);
      setLoadingCities(false);
    }).catch(() => setLoadingCities(false));

    getStates({ limit: 1000 }).then((res) => setAllStates(res.data)).catch(() => { });
    getCountries({ limit: 1000 }).then((res) => setCountries(res.data)).catch(() => { });

    getSeasons({ limit: 1000 }).then((res) => {
      setSeasons(res.data.map((m: any) => ({ id: m.id, title: m.title })));
      setLoadingSeasons(false);
    }).catch(() => setLoadingSeasons(false));

    getTravelExperiences({ limit: 1000 }).then((res) => {
      setExperiences(res.data.map((e: any) => ({ id: e.id, title: e.title })));
      setLoadingExperiences(false);
    }).catch(() => setLoadingExperiences(false));
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.seoDescription.trim()) newErrors.seoDescription = "Description is required";
    if (formData.cityIds.length === 0) newErrors.cityIds = "At least one city is required";
    if (!isBestSellingTab && (!formData.noDays || formData.noDays < 1)) newErrors.noDays = "Days must be at least 1";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleShortDescChange = (html: string) => {
    setFormData((prev) => ({ ...prev, overView: html }));
  };

  const handleThumbImgUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, thumbImg: url }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    let finalBannerImages = bannerImages;
    try {
      if (bannerFiles.length > 0) {
        const merged = [...bannerImages];
        const ordered = [...bannerFiles].sort((a, b) => a.index - b.index);
        for (const { file, index } of ordered) {
          const fd = new FormData();
          fd.append("category", "banner");
          fd.append("filename", formData.slug ? `${formData.slug}-holiday-${index + 1}` : `new-journey-holiday-${index + 1}`);
          fd.append("label", formData.slug ? `${formData.slug}-holiday-${index + 1}` : `New Journey Holiday ${index + 1}`);
          fd.append("file", file);
          const res = await apiClient.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
          const url = res.data?.url;
          if (url) merged[index] = url;
        }
        finalBannerImages = merged;
      }
    } catch {
      return errorToast("Banner upload failed, please try again");
    }

    const payload: any = {
      title: formData.title.trim(),
      seoDescription: formData.seoDescription.trim(),
      slug: formData.slug.trim().replace(/-+$/g, "") || undefined,
      overView: formData.overView.trim() || undefined,
      seoKeyword: formData.seoKeyword.trim() || undefined,
      seoTitle: formData.seoTitle.trim() || undefined,
      h1Title: formData.h1Title.trim() || undefined,
      thumbImg: formData.thumbImg.trim() || undefined,
      noDays: Number(formData.noDays),
      cityIds: formData.cityIds,
      destination: formData.destination.trim() || undefined,
      isActive: formData.isActive,
      isBestSelling: activeTab === "bestSelling" ? true : formData.isBestSelling,
      displayOrder: Number(formData.displayOrder) || 0,
      monthIds: seasonIds.length > 0 ? seasonIds : undefined,
      travelExperienceIds: travelExperienceIds.length > 0 ? travelExperienceIds : undefined,
      bannerTitle: bannerTitle.trim() || undefined,
      bannerTag: bannerTag.trim() || undefined,
      bannerImages: finalBannerImages,
      moreDescription: moreDescription.trim() || undefined,
      days: days.map(d => ({ day: d.title, description: d.content, image: "" })),
      highlights: highlights.filter(h => h.trim()),
      inclusions,
      exclusions,
      whyChooseUs,
      bookingPolicy: bookingPolicyList,
      faqs,
    };

    if (mode === "edit" && initialData?.id) {
      updateJourney(
        { id: initialData.id, payload },
        { onSuccess: () => router.push("/dashboard/journey") }
      );
    } else {
      createJourney(payload, {
        onSuccess: () => router.push("/dashboard/journey"),
      });
    }
  };

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">You don&apos;t have permission to {mode} journeys.</p>
        <Link href="/dashboard/journey" className="text-sm text-brand-600 mt-2 hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/journey"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <PrivatePageHeading
          icon={Route}
          title={mode === "create" ? "Create Journey" : "Edit Journey"}
          description={mode === "create" ? "Add a new journey to the system" : `Editing ${initialData?.h1Title || initialData?.title || "journey"}`}
        />
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-slate-200 pb-0">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-lg border-b-2 transition-colors ${activeTab === "general"
              ? "border-brand-primary text-brand-primary bg-white"
              : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
        >
          <Map size={16} />
          General Tour
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bestSelling")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-lg border-b-2 transition-colors ${activeTab === "bestSelling"
              ? "border-amber-500 text-amber-600 bg-white"
              : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
        >
          <Star size={16} className={activeTab === "bestSelling" ? "fill-amber-400" : ""} />
          Best Selling Tour
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. SEO Fields — Title, Meta Description, Page URL, Short Description */}
        <div className="relative">
          <SeoFields
            formData={{
              title: formData.title,
              slug: formData.slug,
              seoTitle: formData.seoTitle,
              seoDescription: formData.seoDescription,
              overView: formData.overView,
              seoKeyword: formData.seoKeyword || "",
              thumbImg: formData.thumbImg || "",
              h1Title: formData.h1Title || "",
            }}
            onFieldChange={handleFieldChange}
            onDescriptionChange={handleShortDescChange}
            onThumbImgUpload={handleThumbImgUpload}
            errors={errors}
            bannerImages={bannerImages}
            basePath={citySlug ? `/${citySlug}` : "/journey"}
            folderPath={formData.slug ? `${formData.slug}/trip` : ""}
          />
          <button
            type="button"
            onClick={() => setSeoOpen(true)}
            title="Edit SEO in popup"
            className="absolute top-4 right-4 shrink-0 h-8 w-8 flex items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <Maximize2 size={14} />
          </button>
        </div>


        <div className="space-y-10">
          <JourneyBasicInfo 
            formData={formData} setFormData={setFormData}
            errors={errors} setErrors={setErrors}
            filterCountryIds={filterCountryIds} setFilterCountryIds={setFilterCountryIds}
            filterStateIds={filterStateIds} setFilterStateIds={setFilterStateIds}
            seasonIds={seasonIds} setSeasonIds={setSeasonIds}
            travelExperienceIds={travelExperienceIds} setTravelExperienceIds={setTravelExperienceIds}
            quickCreateProps={mergedQuickCreateProps}
            quickCreatedOptions={quickCreatedOptions}
            initialData={initialData}
          />
          <JourneyItineraryBuilder 
            formData={formData}
            days={days} setDays={setDays}
            inclusions={inclusions} setInclusions={setInclusions}
            highlights={highlights} setHighlights={setHighlights}
            exclusions={exclusions} setExclusions={setExclusions}
            whyChooseUs={whyChooseUs} setWhyChooseUs={setWhyChooseUs}
            bookingPolicyList={bookingPolicyList} setBookingPolicyList={setBookingPolicyList}
            faqs={faqs} setFaqs={setFaqs}
          />
          <JourneyMedia 
            bannerTitle={bannerTitle} setBannerTile={setBannerTile}
            bannerTag={bannerTag} setBannerTag={setBannerTag}
            bannerImages={bannerImages} setBannerImages={setBannerImages}
            bannerFiles={bannerFiles} setBannerFiles={setBannerFiles}
            moreDescription={moreDescription} setMoreDescription={setMoreDescription}
          />
        </div>
                {/* Submit */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link
            href="/dashboard/journey"
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
          <FormActionButton
            text={
              isLoading
                ? mode === "create" ? "Creating..." : "Updating..."
                : mode === "create" ? "Create Journey" : "Update Journey"
            }
            type="submit"
            isLoading={isLoading}
            size="md"
          />
        </div>
      </form>

      {seoOpen && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-transparent w-full max-w-3xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 bg-white rounded-t-2xl border border-slate-200 border-b-0">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Search size={16} className="text-slate-500" /> SEO Details
              </h3>
              <button
                type="button"
                onClick={() => setSeoOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="bg-white rounded-b-2xl border border-slate-200 shadow-2xl overflow-y-auto flex-1">
              <SeoFields
                formData={{
                  title: formData.title,
                  seoTitle: formData.seoTitle,
                  slug: formData.slug,
                  seoDescription: formData.seoDescription,
                  overView: formData.overView,
                  seoKeyword: formData.seoKeyword || "",
                  thumbImg: formData.thumbImg || "",
                  h1Title: formData.h1Title || "",
                }}
                onFieldChange={handleFieldChange}
                onDescriptionChange={handleShortDescChange}
                onThumbImgUpload={handleThumbImgUpload}
                errors={errors}
                bannerImages={bannerImages}
                basePath={citySlug ? `/${citySlug}` : "/journey"}
                folderPath={formData.slug ? `${formData.slug}/trip` : ""}
              />
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}
