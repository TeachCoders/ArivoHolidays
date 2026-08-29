"use client";

import { MapPin } from "lucide-react";
import { useGetStates } from "@/feature/state/api/useState";
import DestinationSlider from "@/components/shared/DestinationSlider";
import StateCard from "./StateCard";
import DestinationsSkeleton from "./DestinationsSkeleton";

export default function DestinationsList() {
  const { states, isLoading } = useGetStates({ limit: 100 });

  if (isLoading) return <DestinationsSkeleton />;

  if (states.length === 0) {
    return (
      <div className="text-center py-16">
        <MapPin size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium text-lg">No destinations found</p>
      </div>
    );
  }

  return (
    <DestinationSlider className="pb-10">
      {states.map((s) => (
        <StateCard key={s.id} state={s} />
      ))}
    </DestinationSlider>
  );
}
