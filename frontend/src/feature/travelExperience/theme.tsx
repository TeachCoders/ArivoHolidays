import {
  Heart,
  Landmark,
  UtensilsCrossed,
  Flower2,
  Route,
  Mountain,
  Waves,
  Compass,
  Sparkles,
} from "lucide-react";

export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=1000&auto=format&fit=crop";

export function resolveExperienceTheme(title: string): {
  icon: React.ReactNode;
  image: string;
} {
  const t = title.toLowerCase();

  if (/honeymoon|couple|romance/.test(t))
    return {
      icon: <Heart size={20} />,
      image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=1200&auto=format&fit=crop",
    };
  if (/heritage|culture|historical|monument/.test(t))
    return {
      icon: <Landmark size={20} />,
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200&auto=format&fit=crop",
    };
  if (/culinary|food|dishes/.test(t))
    return {
      icon: <UtensilsCrossed size={20} />,
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
    };
  if (/ayurveda|yoga|wellness/.test(t))
    return {
      icon: <Flower2 size={20} />,
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
    };
  if (/taj|golden triangle/.test(t))
    return {
      icon: <Landmark size={20} />,
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1200&auto=format&fit=crop",
    };
  if (/spiritual|temple|pilgrim/.test(t))
    return {
      icon: <Sparkles size={20} />,
      image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=1200&auto=format&fit=crop",
    };
  if (/nature|wildlife/.test(t))
    return {
      icon: <Mountain size={20} />,
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
    };
  if (/beach|lake/.test(t))
    return {
      icon: <Waves size={20} />,
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
    };

  return { icon: <Compass size={20} />, image: FALLBACK_IMAGE };
}
