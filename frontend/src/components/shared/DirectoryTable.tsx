import React, { useMemo } from "react";

export interface ColumnDef<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
  cellClassName?: string;
}

export interface DirectoryTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  groupBy?: (item: T) => { id: string | number; title: string; subtitle?: string };
  getRowClass?: (item: T) => string;
}

export default function DirectoryTable<T extends { id: string | number; title?: string; displayOrder?: number | null }>({
  data,
  columns,
  groupBy,
  getRowClass,
}: DirectoryTableProps<T>) {
  const groupedData = useMemo(() => {
    if (!groupBy) {
      const items = [...data].sort((a, b) => {
        const aPinned = (a.displayOrder ?? 0) > 0;
        const bPinned = (b.displayOrder ?? 0) > 0;
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        if (aPinned && bPinned) return a.displayOrder! - b.displayOrder!;
        return (a.title || "").localeCompare(b.title || "");
      });
      return [{ group: null, items }];
    }

    const map = new Map<string | number, { group: any; items: T[] }>();
    data.forEach((item) => {
      const g = groupBy(item);
      if (!map.has(g.id)) {
        map.set(g.id, { group: g, items: [] });
      }
      map.get(g.id)!.items.push(item);
    });

    const sortedGroups = Array.from(map.values()).sort((a, b) => 
      a.group.title.localeCompare(b.group.title)
    );

    sortedGroups.forEach(g => {
      g.items.sort((a, b) => {
        const aPinned = (a.displayOrder ?? 0) > 0;
        const bPinned = (b.displayOrder ?? 0) > 0;
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        if (aPinned && bPinned) return a.displayOrder! - b.displayOrder!;
        return (a.title || "").localeCompare(b.title || "");
      });
    });

    return sortedGroups;
  }, [data, groupBy]);

  return (
    <table className="tbl w-full border border-slate-200 rounded-lg">
      <thead>
        <tr className="bg-slate-800">
          {columns.map((col, i) => {
            const isCenter = col.className?.includes('center');
            const isRight = col.className?.includes('right');
            const alignClass = isCenter ? 'text-center' : isRight ? 'text-right' : 'text-left';
            return (
              <th key={i} className={`!text-white ${alignClass} py-3.5 px-4 text-xs font-semibold whitespace-nowrap first:rounded-tl-lg last:rounded-tr-lg`}>
                {col.header}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className="divide-y divide-brand-neutral-light">
        {groupedData.map(({ group, items }, groupIndex) => (
          <React.Fragment key={group ? group.id : `group-${groupIndex}`}>
            {group && (
              <tr className="bg-slate-50/80 border-y border-slate-200 group/header">
                <td colSpan={columns.length} className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-800 text-sm tracking-wide">
                      {group.title}
                    </span>
                    {group.subtitle && (
                      <span className="text-[10px] bg-brand-100/80 text-brand-700 px-2.5 py-0.5 rounded-full font-semibold border border-brand-200/50">
                        {group.subtitle}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className={getRowClass ? getRowClass(item) : ""}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={col.cellClassName || "px-4 py-3"}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}
