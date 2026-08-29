"use client";

import React from "react";
import HeroSection from "./HeroSection";
import StatsCounter from "./StatsCounter";
import PopularDestinations from "./PopularDestinations";
import BestSellingPackages from "./BestSellingPackages";
import TravelExperiencesSection from "./TravelExperiencesSection";
import SeasonalTripsSection from "./SeasonalTripsSection";
import TestimonialsSection from "./TestimonialsSection";
import FaqSection from "./FaqSection";
import type { State, PaginatedResponse as StatePage } from "@/feature/state/type";
import type { City, PaginatedResponse as CityPage } from "@/feature/city/type";
import type { Journey, PaginatedResponse as JourneyPage } from "@/feature/journey/type";

export const HomePageClient: React.FC<{
  initialStates?: StatePage<State> | null;
  initialCities?: CityPage<City> | null;
  initialJourneys?: JourneyPage<Journey> | null;
}> = ({ initialStates, initialCities, initialJourneys }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <StatsCounter />
      <PopularDestinations initialStates={initialStates} initialCities={initialCities} />
      <BestSellingPackages initialJourneys={initialJourneys} />
      <TravelExperiencesSection />
      <SeasonalTripsSection />
      <TestimonialsSection />
      <FaqSection />
    </div>
  );
};

export default HomePageClient;
