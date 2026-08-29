export interface Destination {
  state: string;
  city: string;
  slug: string;
  attractions: string[];
  thumb: string;
  banners: string[];
}

export interface StateGroup {
  state: string;
  destinations: Destination[];
}
