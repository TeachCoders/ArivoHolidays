import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import TableWraper from "./TableWraper";
import OrderAtTopCard from "./OrderAtTopCard";
import PageLoader from "./PageLoader";

interface DirectoryTableLayoutProps {
  // Order At Top Props
  showOrderAtTop?: boolean;
  orderOptions?: { id: number; title: string; isActive?: boolean }[];
  orderSelectedIds?: number[];
  orderOnChange?: (ids: number[]) => void;
  orderLoading?: boolean;
  orderLoadingText?: string;
  orderPlaceholder?: string;
  orderSearchPlaceholder?: string;
  orderSaving?: boolean;
  orderOnSave?: () => void;
  orderDirty?: boolean;
  orderActiveOnly?: boolean;

  // Table Props
  isLoading: boolean;
  isEmpty: boolean;
  emptyIcon?: LucideIcon;
  emptyMessage?: string;
  emptyCreateLink?: string;
  emptyCreateLabel?: string;
  canEdit: boolean;
  
  children: React.ReactNode;
}

export default function DirectoryTableLayout({
  showOrderAtTop,
  orderOptions = [],
  orderSelectedIds = [],
  orderOnChange = () => {},
  orderLoading = false,
  orderLoadingText,
  orderPlaceholder,
  orderSearchPlaceholder,
  orderSaving = false,
  orderOnSave = () => {},
  orderDirty = false,
  orderActiveOnly = false,
  isLoading,
  isEmpty,
  emptyIcon: EmptyIcon,
  emptyMessage = "No records found",
  emptyCreateLink,
  emptyCreateLabel = "Create your first record",
  canEdit,
  children,
}: DirectoryTableLayoutProps) {
  return (
    <TableWraper variant="brand">
      {showOrderAtTop && canEdit && (
        <div className="p-4 bg-slate-50/50 border-b border-brand-neutral-border">
          <OrderAtTopCard
            options={orderOptions}
            activeOnly={orderActiveOnly}
            selectedIds={orderSelectedIds}
            onChange={orderOnChange}
            loading={orderLoading}
            loadingText={orderLoadingText}
            placeholder={orderPlaceholder}
            searchPlaceholder={orderSearchPlaceholder}
            saving={orderSaving}
            onSave={orderOnSave}
            dirty={orderDirty}
            variant="flush"
          />
        </div>
      )}

      {isLoading ? (
        <PageLoader size="section" />
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          {EmptyIcon && <EmptyIcon size={40} className="mb-3 opacity-40" />}
          <p className="text-sm">{emptyMessage}</p>
          {canEdit && emptyCreateLink && (
            <Link href={emptyCreateLink} className="text-sm text-brand-600 mt-2 hover:underline">
              {emptyCreateLabel}
            </Link>
          )}
        </div>
      ) : (
        <div className="p-4 sm:p-5 overflow-x-auto">
          {children}
        </div>
      )}
    </TableWraper>
  );
}
