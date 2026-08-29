import React from "react";
import AsyncMultiSelect from "@/components/shared/AsyncMultiSelect";
import { getCountries } from "@/feature/country/api";
import { getStates } from "@/feature/state/api";
import { getCities } from "@/feature/city/api";
import { getSeasons } from "@/feature/season/api";
import { getTravelExperiences } from "@/feature/travelExperience/api";
import { Plus } from "lucide-react";
import type { QuickCreateTarget } from "@/hooks/useEntityQuickCreate";
import QuickCreateModal from "@/components/shared/QuickCreateModal";

interface JourneyBasicInfoProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: any;
  setErrors: React.Dispatch<React.SetStateAction<any>>;
  
  filterCountryIds: number[];
  setFilterCountryIds: React.Dispatch<React.SetStateAction<number[]>>;
  filterStateIds: number[];
  setFilterStateIds: React.Dispatch<React.SetStateAction<number[]>>;
  
  seasonIds: number[];
  setSeasonIds: React.Dispatch<React.SetStateAction<number[]>>;
  travelExperienceIds: number[];
  setTravelExperienceIds: React.Dispatch<React.SetStateAction<number[]>>;
  
  quickCreateProps: any;
  quickCreatedOptions: Record<string, {id: number, title: string}[]>;
  initialData?: any;
}

export default function JourneyBasicInfo({ 
  formData, setFormData, errors, setErrors,
  filterCountryIds, setFilterCountryIds,
  filterStateIds, setFilterStateIds,
  seasonIds, setSeasonIds,
  travelExperienceIds, setTravelExperienceIds,
  quickCreateProps, quickCreatedOptions, initialData 
}: JourneyBasicInfoProps) {

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Basic Information</h2>



        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Destination Label</label>
            <input
              value={formData.destination || ""}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, destination: e.target.value }))}
              placeholder="e.g. Jaipur - Jodhpur - Udaipur"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Number of Days <span className="text-red-500">*</span></label>
            <input
              type="number"
              min={1}
              value={formData.noDays}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, noDays: Number(e.target.value) }))}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.noDays ? "border-red-400" : "border-slate-300"}`}
            />
            {errors.noDays && <p className="text-xs text-red-500">{errors.noDays}</p>}
          </div>
        </div>


      </div>

      {/* Routes & Categorization */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Routes & Categories</h2>

        <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <label className="text-sm font-semibold text-slate-700">Route Selection (Cities) <span className="text-red-500">*</span></label>
          <div className="text-xs text-slate-500 mb-2">Filter by country and state to easily find cities.</div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <AsyncMultiSelect
                  selectedIds={filterCountryIds}
                  onChange={(ids) => {
                    const hasOverlap = filterCountryIds.length === 0 || ids.some(id => filterCountryIds.includes(id));
                    setFilterCountryIds(ids);
                    if (!hasOverlap) {
                      setFilterStateIds([]); 
                      setFormData((prev: any) => ({ ...prev, cityIds: [] }));
                    }
                  }}
                  fetchOptions={async (search) => {
                    const res = await getCountries({ search, limit: 20 });
                    return res.data;
                  }}
                  initialOptions={[...(initialData?.cities?.map((c: any) => c.state?.country).filter(Boolean).map((c: any) => ({id: c.id, title: c.title})) || []), ...(quickCreatedOptions.country || [])]}
                  placeholder="Filter by Countries"
                  searchPlaceholder="Search countries..."
                />
                <button type="button" onClick={() => quickCreateProps.openQuickCreate("country")} className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"><Plus size={15} /></button>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <AsyncMultiSelect
                  selectedIds={filterStateIds}
                  onChange={(ids) => {
                    const hasOverlap = filterStateIds.length === 0 || ids.some(id => filterStateIds.includes(id));
                    setFilterStateIds(ids);
                    if (!hasOverlap) {
                      setFormData((prev: any) => ({ ...prev, cityIds: [] }));
                    }
                  }}
                  fetchOptions={async (search) => {
                    const countryId = filterCountryIds.length > 0 ? filterCountryIds.join(',') : undefined;
                    const res = await getStates({ search, limit: 100, countryId });
                    return res.data;
                  }}
                  initialOptions={initialData?.cities?.map((c: any) => c.state).filter(Boolean).map((s: any) => ({id: s.id, title: s.title}))}
                  placeholder="Filter by States"
                  searchPlaceholder="Search states..."
                />
                <button type="button" onClick={() => quickCreateProps.openQuickCreate("state")} className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"><Plus size={15} /></button>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-1.5 relative group">
                <AsyncMultiSelect
                  selectedIds={formData.cityIds || []}
                  onChange={(ids) => {
                    setFormData((prev: any) => ({...prev, cityIds: ids}));
                  }}
                  fetchOptions={async (search) => {
                    const stateId = filterStateIds.length > 0 ? filterStateIds.join(',') : undefined;
                    const res = await getCities({ search, limit: 100, stateId });
                    return res.data;
                  }}
                  initialOptions={initialData?.cities || initialData?.route || []}
                  placeholder="Select Cities *"
                  searchPlaceholder="Search cities..."
                  error={errors.cityIds}
                  onReorder={(fromId, toId) => {
                    const arr = [...(formData.cityIds || [])];
                    const fromIdx = arr.indexOf(fromId);
                    const toIdx = arr.indexOf(toId);
                    if (fromIdx !== -1 && toIdx !== -1) {
                      const [item] = arr.splice(fromIdx, 1);
                      arr.splice(toIdx, 0, item);
                      setFormData((prev: any) => ({...prev, cityIds: arr}));
                    }
                  }}
                />
                {(formData.cityIds?.length > 0) && (
                  <button 
                    type="button" 
                    onClick={() => setFormData((prev: any) => ({...prev, cityIds: []}))}
                    className="absolute -top-6 right-10 text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider"
                  >
                    Clear All Cities
                  </button>
                )}
                <button type="button" onClick={() => quickCreateProps.openQuickCreate("city")} className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"><Plus size={15} /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Best Seasons to Visit</label>
            <AsyncMultiSelect
              selectedIds={seasonIds}
              onChange={setSeasonIds}
              fetchOptions={async (search) => {
                const res = await getSeasons();
                return res.data.filter((m: any) => m.title.toLowerCase().includes(search.toLowerCase()));
              }}
              initialOptions={initialData?.months || []}
              placeholder="Select Seasons"
              searchPlaceholder="Search..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Travel Experiences</label>
            <div className="flex items-center gap-1.5">
              <AsyncMultiSelect
                selectedIds={travelExperienceIds}
                onChange={setTravelExperienceIds}
                fetchOptions={async (search) => {
                  const res = await getTravelExperiences({ search, limit: 20 });
                  return res.data;
                }}
                initialOptions={initialData?.travelExperiences || []}
                placeholder="Select Experiences"
                searchPlaceholder="Search experiences..."
              />
              <button type="button" onClick={() => quickCreateProps.openQuickCreate("experience")} className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"><Plus size={15} /></button>
            </div>
          </div>
        </div>
      </div>
      
      <QuickCreateModal
        open={!!quickCreateProps.quickCreate}
        onClose={quickCreateProps.closeQuickCreate}
        title={`Create ${quickCreateProps.quickCreate}`}
        onSubmit={quickCreateProps.handleQuickCreate}
        loading={quickCreateProps.quickCreateLoading}
        error={quickCreateProps.quickCreateError}
        parentLabel={quickCreateProps.parentLabel}
        parentOptions={quickCreateProps.parentOptions}
        parentValue={quickCreateProps.quickParentId}
        onParentChange={quickCreateProps.setQuickParentId}
      />
    </div>
  );
}
