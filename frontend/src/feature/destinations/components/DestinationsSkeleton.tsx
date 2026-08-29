export default function DestinationsSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-[280px] sm:h-[320px] rounded-xl bg-white shadow-sm overflow-hidden animate-pulse"
        >
          <div className="h-full w-full bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
