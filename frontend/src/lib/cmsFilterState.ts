export interface CmsFilters {
  countryId?: number;
  stateId?: number;
  cityId?: number;
  search?: string;
  route?: string;
}

function keyFor(entity: string): string {
  return `cms.filters.${entity}`;
}

export function loadCmsFilters(entity: string): CmsFilters {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(keyFor(entity));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as CmsFilters) : {};
  } catch {
    return {};
  }
}

export function saveCmsFilters(entity: string, filters: CmsFilters): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(keyFor(entity), JSON.stringify(filters));
  } catch {
    // ignore write failures (private mode, quota, etc.)
  }
}
