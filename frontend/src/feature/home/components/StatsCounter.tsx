"use client";

import React, { useEffect, useState } from "react";
import { Users, MapPin, Award, Star } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
}

const STATS: StatItem[] = [
  { icon: <Users className="w-6 h-6" />, label: "Happy Travellers", value: 50000, suffix: "+" },
  { icon: <MapPin className="w-6 h-6" />, label: "Destinations Covered", value: 120, suffix: "+" },
  { icon: <Award className="w-6 h-6" />, label: "Packages Delivered", value: 8500, suffix: "+" },
  { icon: <Star className="w-6 h-6" />, label: "Average Rating", value: 4.9, suffix: "/5" },
];

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);
  const isDecimal = target % 1 !== 0;

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(isDecimal ? parseFloat((eased * target).toFixed(1)) : Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration, isDecimal]);

  return count;
}

function StatCard({ item, start }: { item: StatItem; start: boolean }) {
  const count = useCountUp(item.value, 2200, start);
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 text-white">
        {item.icon}
      </div>
      <p className="text-3xl lg:text-4xl font-extrabold text-white tabular-nums">
        {item.value >= 1000 ? count.toLocaleString("en-IN") : count}{item.suffix}
      </p>
      <p className="text-sm font-medium text-white/60 mt-1">{item.label}</p>
    </div>
  );
}

export const StatsCounter: React.FC = () => {
  const { ref, isVisible } = useScrollReveal(0.2);

  return (
    <section ref={ref} className="py-14 bg-[#1C1C1C]">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {STATS.map((stat, i) => (
            <StatCard key={i} item={stat} start={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
