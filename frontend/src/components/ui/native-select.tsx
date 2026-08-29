import * as React from "react"

import { cn } from "@/lib/utils"

interface NativeSelectProps extends React.ComponentProps<"select"> {
  value?: string | number
}

function NativeSelect({ className, value, ...props }: NativeSelectProps) {
  return (
    <select
      value={value}
      data-slot="native-select"
      className={cn(
        "h-12 px-3 text-sm rounded-lg border border-input bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:pointer-events-none transition-colors",
        className
      )}
      {...props}
    />
  )
}

export { NativeSelect }
