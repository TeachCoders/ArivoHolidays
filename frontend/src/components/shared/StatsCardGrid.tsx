import { type LucideIcon } from "lucide-react";

type StatCardItem = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: string;
};

type StatsCardGridProps = {
  items: StatCardItem[];
  columns?: 3 | 4 | 5;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
};

const DEFAULT_GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-indigo-600",
  "from-blue-500 to-cyan-600",
  "from-rose-500 to-pink-600",
];

const COLUMN_CLASSES: Record<number, string> = {
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-5",
};

const SIZE_CLASSES = {
  sm: {
    card: "rounded-xl p-4 shadow-md",
    label: "text-[10px] font-semibold uppercase",
    value: "text-xl font-bold",
    iconWrap: "p-2 rounded-lg",
    iconSize: 16,
  },
  md: {
    card: "rounded-2xl p-5 shadow-lg",
    label: "text-xs font-semibold",
    value: "text-2xl font-bold",
    iconWrap: "p-2 rounded-xl",
    iconSize: 16,
  },
  lg: {
    card: "rounded-2xl p-5 shadow-lg",
    label: "text-sm font-medium",
    value: "text-3xl font-bold",
    iconWrap: "p-2 rounded-lg",
    iconSize: 18,
  },
};

export default function StatsCardGrid({
  items,
  columns = 4,
  size = "md",
  loading = false,
  className = "",
}: StatsCardGridProps) {
  return (
    <div className={`grid text-white ${COLUMN_CLASSES[columns]} gap-4 ${className}`}>
      {items.map(({ label, value, icon: Icon, gradient }, index) => (
        <div
          key={label}
          className={`bg-gradient-to-br ${gradient || DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length]} ${SIZE_CLASSES[size].card} text-white`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className={`text-white ${SIZE_CLASSES[size].label} font-bold`}>{label}</p>
            <div className={`bg-white/20 ${SIZE_CLASSES[size].iconWrap}`}>
              <Icon size={SIZE_CLASSES[size].iconSize} />
            </div>
          </div>
          <p className={`text-white ${SIZE_CLASSES[size].value}`}>
            {loading ? "..." : value}
          </p>
        </div>
      ))}
    </div>
  );
}
