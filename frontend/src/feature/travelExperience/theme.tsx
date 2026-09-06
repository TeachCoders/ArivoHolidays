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

export const FALLBACK_IMAGE = "";

export function resolveExperienceTheme(title: string): {
  icon: React.ReactNode;
  image: string;
} {
  const t = title.toLowerCase();

  if (/honeymoon|couple|romance/.test(t))
    return {
      icon: <Heart size={20} />,
      image: "",
    };
  if (/heritage|culture|historical|monument/.test(t))
    return {
      icon: <Landmark size={20} />,
      image: "",
    };
  if (/culinary|food|dishes/.test(t))
    return {
      icon: <UtensilsCrossed size={20} />,
      image: "",
    };
  if (/ayurveda|yoga|wellness/.test(t))
    return {
      icon: <Flower2 size={20} />,
      image: "",
    };
  if (/taj|golden triangle/.test(t))
    return {
      icon: <Landmark size={20} />,
      image: "",
    };
  if (/spiritual|temple|pilgrim/.test(t))
    return {
      icon: <Sparkles size={20} />,
      image: "",
    };
  if (/nature|wildlife/.test(t))
    return {
      icon: <Mountain size={20} />,
      image: "",
    };
  if (/beach|lake/.test(t))
    return {
      icon: <Waves size={20} />,
      image: "",
    };

  return { icon: <Compass size={20} />, image: FALLBACK_IMAGE };
}
