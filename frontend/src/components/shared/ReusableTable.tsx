"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import PageSizeSelect from "@/components/shared/PageSizeSelect";

export type Column<T> = {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  width?: string;
};

type ReusableTableProps<T extends Record<string, any>> = {
  columns: Column<T>[];
  data: T[];
  expandable?: boolean;
  renderExpandedRow?: (item: T) => React.ReactNode;
  getRowId?: (item: T) => string | number;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize?: number;
    onPageSizeChange?: (size: number) => void;
  };
};

export default function ReusableTable<T extends Record<string, any>>({
  columns,
  data,
  expandable = false,
  renderExpandedRow,
  getRowId = (item: T) => (item as any).id as string | number, // Safe default
  pagination,
}: ReusableTableProps<T>) {
  const [expandedRow, setExpandedRow] = useState<string | number | null>(null);

  const toggleRow = (id: string | number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const paginatedData = pagination
    ? data.slice(
        (pagination.currentPage - 1) * (pagination.pageSize || 10),
        pagination.currentPage * (pagination.pageSize || 10)
      )
    : data;

  return (
    <div className="rounded shadow-sm bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead
                key={idx}
                className={col.className}
                style={{ width: col.width }}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedData.map((item, rowIndex) => {
            const rowId = getRowId(item);

            return (
             <React.Fragment key={rowId ?? rowIndex}>
                <TableRow  className="bg-white hover:bg-gray-50">
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} className={col.className}>
                      {expandable && colIndex === 0 ? (
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleRow(rowId)}
                          >
                            {expandedRow === rowId ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>

                          {typeof col.accessor === "function"
                            ? col.accessor(item)
                            : (item[col.accessor] as React.ReactNode)}
                        </div>
                      ) : (
                        typeof col.accessor === "function"
                          ? col.accessor(item)
                          : (item[col.accessor] as React.ReactNode)
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                {expandable && expandedRow === rowId && renderExpandedRow && (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="bg-white p-0"
                    >
                      {renderExpandedRow(item)}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
          <div className="flex items-center gap-3">
            {pagination.onPageSizeChange && (
              <PageSizeSelect
                value={pagination.pageSize || 10}
                onChange={(size) => pagination.onPageSizeChange!(size)}
              />
            )}
            <p className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}