"use client";
import RichTextEditor from "./RichTextEditor";
import { Plus, Trash2, GripVertical, Calendar } from "lucide-react";

export interface DayPlan {
  day: number;
  title: string;
  content: string;
}

interface DayItineraryEditorProps {
  value: DayPlan[];
  onChange: (days: DayPlan[]) => void;
}

function DayCard({ day, index, onUpdate, onRemove, canRemove }: {
  day: DayPlan;
  index: number;
  onUpdate: (index: number, data: Partial<DayPlan>) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  return (
    <div className="border border-brand-neutral-border rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-3 bg-brand-neutral-light border-b border-brand-neutral-border">
        <GripVertical size={16} className="text-slate-300" />
        <Calendar size={16} className="text-indigo-500" />
        <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">Day {index + 1}</span>
        <input
          type="text"
          value={day.title}
          onChange={(e) => onUpdate(index, { title: e.target.value })}
          placeholder="Day title (e.g. Arrival in Jaipur)"
          className="flex-1 text-sm font-semibold text-brand-neutral-dark bg-transparent border-none outline-none placeholder:text-slate-400"
        />
        {canRemove && (
          <button type="button" onClick={() => onRemove(index)}
            className="p-1.5 rounded-lg hover:bg-brand-danger-light text-slate-400 hover:text-brand-danger transition-colors">
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <div className="p-3">
        <RichTextEditor
          content={day.content}
          onChange={(html) => onUpdate(index, { content: html })}
          placeholder="Describe this day's activities, sightseeing, meals..."
          minHeight="min-h-[100px]"
        />
      </div>
    </div>
  );
}

export default function DayItineraryEditor({ value, onChange }: DayItineraryEditorProps) {
  const days: DayPlan[] = value || [];

  const addDay = () => {
    onChange([...days, { day: days.length + 1, title: "", content: "" }]);
  };

  const removeDay = (index: number) => {
    onChange(days.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 })));
  };

  const updateDay = (index: number, data: Partial<DayPlan>) => {
    onChange(days.map((d, i) => (i === index ? { ...d, ...data } : d)));
  };

  return (
    <div className="space-y-3">
      {days.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-brand-neutral-border rounded-xl">
          No days added yet. Click "Add Day" to start building your itinerary.
        </div>
      )}
      {days.map((day, index) => (
        <DayCard
          key={index}
          day={day}
          index={index}
          onUpdate={updateDay}
          onRemove={removeDay}
          canRemove={days.length > 1}
        />
      ))}
      <button
        type="button"
        onClick={addDay}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-brand-primary rounded-xl text-sm font-semibold text-brand-primary hover:bg-brand-primary-light hover:border-indigo-300 transition-colors"
      >
        <Plus size={16} /> Add New Day
      </button>
    </div>
  );
}
