"use client";

import { useState } from "react";

export function useShowMore<T>(items: T[], step = 12) {
  const [visibleCount, setVisibleCount] = useState(step);

  const key = items
    .map((item) => String((item as { id?: number | string }).id ?? ""))
    .join(",");

  const [prevKey, setPrevKey] = useState(key);
  if (prevKey !== key) {
    setPrevKey(key);
    setVisibleCount(step);
  }

  const shown = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;
  const loadMore = () => setVisibleCount((c) => c + step);

  return { shown, hasMore, loadMore };
}
