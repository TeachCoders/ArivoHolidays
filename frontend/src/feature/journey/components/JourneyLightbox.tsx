"use client";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface JourneyLightboxProps {
  open: boolean;
  index: number;
  slides: { src: string; alt: string }[];
  close: () => void;
}

export default function JourneyLightbox({ open, index, slides, close }: JourneyLightboxProps) {
  return (
    <Lightbox
      open={open}
      index={index}
      close={close}
      slides={slides}
      plugins={[Counter, Zoom, Thumbnails]}
      render={{
        iconPrev: () => <ChevronRight size={40} strokeWidth={3} />,
        iconNext: () => <ChevronLeft size={40} strokeWidth={3} />,
      }}
    />
  );
}
