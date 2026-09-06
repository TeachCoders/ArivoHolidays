import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export interface ReusableModelProps {
  title?: string
  description?: string
  trigger?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  contentClassName?: string
}

/* How to use ReusableModel:

import { ReusableModel } from "@/components/shared/reusableModel";
import FormActionButton from "@/components/shared/customBtns";

<ReusableModel
  title="Create Item"
  description="Fill out the details below to create a new item."
  trigger={<FormActionButton text="Create New" size="sm" />}
  footer={<FormActionButton text="Submit" size="sm" />}
>
  <div className="p-4">
    <p>Your form fields go here...</p>
  </div>
</ReusableModel>

*/
import { cn } from "@/lib/utils"   // ← yeh import kar lo (Shadcn ka cn utility)

export function ReusableModel({
  title,
  description,
  trigger,
  children,
  footer,
  open,
  onOpenChange,
  contentClassName,
}: ReusableModelProps) {
  const dialogProps = open !== undefined ? { open, onOpenChange } : {};
  const hasCustomMaxWidth = contentClassName && contentClassName.includes("max-w-");

  return (
    <Dialog {...dialogProps}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        className={cn(
          "rounded w-full",
          !hasCustomMaxWidth && "sm:max-w-[425px]",
          contentClassName
        )}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}

        <div className="py-4">{children}</div>

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}