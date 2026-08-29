import { Search, Route } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectConfig {
  value: string | number | undefined | null
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
  placeholder: string
  disabled?: boolean
}

interface SearchConfig {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}

interface FilterBoxProps {
  selects?: SelectConfig[]
  search?: SearchConfig
  search2?: SearchConfig
  direction?: "row" | "column"
  className?: string
}

export default function FilterBox({ selects, search, search2, direction = "row", className }: FilterBoxProps) {
  const selectsContent = selects?.map((s, i) => {
    const currentValue = (s.value === "" || s.value === undefined || s.value === null) ? "all" : String(s.value);
    
    return (
      <div key={i} className={direction === "column" ? "flex-1" : "min-w-[150px]"}>
        <Select 
          value={currentValue} 
          onValueChange={(val) => {
            s.onChange({ target: { value: val === "all" ? "" : val } } as any)
          }}
          disabled={s.disabled}
        >
          <SelectTrigger className="bg-white h-10 border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-brand-500/20 shadow-sm transition-all text-sm font-medium text-slate-700 w-full">
            <SelectValue placeholder={s.placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-slate-500 italic">{s.placeholder}</SelectItem>
            {s.options.map((o) => (
              <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  })

  return (
    <div
      className={`bg-white/60 backdrop-blur-xl border border-slate-200/80 rounded-xl p-2.5 shadow-sm ring-1 ring-slate-900/5 ${
        direction === "row" ? "flex items-center gap-2.5 flex-wrap" : "space-y-2.5"
      } ${className || ""}`}
    >
      {direction === "column" && selects ? (
        <div className="flex gap-2">
          {selectsContent}
        </div>
      ) : (
        selectsContent
      )}
      {search && (
        <div className="relative flex-1 min-w-[240px] max-w-md group transition-all">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
          <Input
            placeholder={search.placeholder || "Search..."}
            value={search.value}
            onChange={search.onChange}
            className="pl-10 h-10 bg-white border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-brand-500/20 shadow-sm transition-all rounded-lg text-sm"
          />
        </div>
      )}
      {search2 && (
        <div className="relative flex-1 min-w-[240px] max-w-md group transition-all">
          <Route className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
          <Input
            placeholder={search2.placeholder || "Search..."}
            value={search2.value}
            onChange={search2.onChange}
            className="pl-10 h-10 bg-white border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-brand-500/20 shadow-sm transition-all rounded-lg text-sm"
          />
        </div>
      )}
    </div>
  )
}
