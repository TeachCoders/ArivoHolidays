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
import TrustedPartners from "./TrustedPartners";
import TravelerMoments from "./TravelerMoments";
import WhyChooseUsSection from "@/components/shared/WhyChooseUsSection";
import SeoTextBlock from "./TravelYourWaySection";
import type { State, PaginatedResponse as StatePage } from "@/feature/state/type";
import type { City, PaginatedResponse as CityPage } from "@/feature/city/type";
import type { Journey, PaginatedResponse as JourneyPage } from "@/feature/journey/type";
import type { Season, PaginatedResponse as SeasonPage } from "@/feature/season/type";

export const HomePageClient: React.FC<{
  initialStates?: StatePage<State> | null;
  initialCities?: CityPage<City> | null;
  initialJourneys?: JourneyPage<Journey> | null;
  initialSeasons?: SeasonPage<Season> | null;
}> = ({ initialStates, initialCities, initialJourneys, initialSeasons }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <SeoTextBlock />
       <BestSellingPackages initialJourneys={initialJourneys} />
      <PopularDestinations initialStates={initialStates} initialCities={initialCities} />
     
      <TravelExperiencesSection />
      <SeasonalTripsSection initialSeasons={initialSeasons} initialJourneys={initialJourneys} />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <FaqSection />
      <TrustedPartners />
    </div>
  );
};

export default HomePageClient;
