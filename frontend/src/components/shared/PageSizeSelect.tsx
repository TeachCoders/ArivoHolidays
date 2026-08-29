"use client";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

interface PageSizeSelectProps {
  value: number;
  onChange: (size: number) => void;
}

export default function PageSizeSelect({ value, onChange }: PageSizeSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 outline-none focus:border-brand-500"
      title="Rows per page"
    >
      {PAGE_SIZE_OPTIONS.map((n) => (
        <option key={n} value={n}>
          1-{n}
        </option>
      ))}
    </select>
  );
}
