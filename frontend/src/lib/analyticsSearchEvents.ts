export interface SearchRefinementPayload {
  searchQuery: string;
  destination: string;
  filtersApplied: unknown;
}

type SearchListener = (payload: SearchRefinementPayload) => void;

const listeners = new Set<SearchListener>();

export function onSearchRefinement(listener: SearchListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitSearchRefinement(payload: SearchRefinementPayload) {
  listeners.forEach((listener) => listener(payload));
}