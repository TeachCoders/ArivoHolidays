"use client";

import type { ReactNode, RefObject } from "react";
import { useRef, useCallback, useState, useEffect } from "react";
import { Swiper, SwiperSlide, type SwiperClass } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { cn } from "@/lib/utils";

export interface SliderOptions {
  loop?: boolean;
  speed?: number;
  spaceBetween?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  showArrows?: boolean;
  showBullets?: boolean;
  breakpoints?: {
    [width: number]: { slidesPerView: number; spaceBetween?: number };
  };
}

const DEFAULT_BREAKPOINTS = {
  0: { slidesPerView: 1.2, spaceBetween: 12 },
  480: { slidesPerView: 2 },
  768: { slidesPerView: 3 },
  1024: { slidesPerView: 4 },
  1280: { slidesPerView: 5 },
};

interface DestinationSliderProps {
  children: ReactNode[];
  className?: string;
  swiperRef?: RefObject<SwiperClass | null>;
  options?: SliderOptions;
}

export function useSliderControl() {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [canScroll, setCanScroll] = useState(false);

  const updateCanScroll = useCallback(() => {
    const s = swiperRef.current;
    if (!s) return;
    setCanScroll(!s.isBeginning || !s.isEnd);
  }, []);

  useEffect(() => {
    const s = swiperRef.current;
    if (!s) return;
    s.on("init", updateCanScroll);
    s.on("resize", updateCanScroll);
    s.on("slideChange", updateCanScroll);
    updateCanScroll();
    return () => {
      s.off("init", updateCanScroll);
      s.off("resize", updateCanScroll);
      s.off("slideChange", updateCanScroll);
    };
  }, [updateCanScroll]);

  const stopAutoplay = useCallback(() => {
    const s = swiperRef.current;
    if (s && s.autoplay) s.autoplay.stop();
  }, []);

  const slidePrev = useCallback(() => {
    const s = swiperRef.current;
    if (!s) return;
    stopAutoplay();
    if (s.isBeginning) s.slideTo(s.slides.length - 1);
    else s.slidePrev();
  }, [stopAutoplay]);

  const slideNext = useCallback(() => {
    const s = swiperRef.current;
    if (!s) return;
    stopAutoplay();
    if (s.isEnd) s.slideTo(0);
    else s.slideNext();
  }, [stopAutoplay]);

  return { swiperRef, slidePrev, slideNext, stopAutoplay, canScroll };
}

export default function DestinationSlider({
  children,
  className,
  swiperRef,
  options,
}: DestinationSliderProps) {
  const {
    loop = true,
    speed = 600,
    spaceBetween = 16,
    autoplay: enableAutoplay = true,
    autoplayDelay = 3500,
    showArrows = true,
    showBullets = false,
    breakpoints = DEFAULT_BREAKPOINTS,
  } = options ?? {};

  const slides = (Array.isArray(children) ? children : [children]).filter(Boolean);
  const canLoop = loop && slides.length > 5;

  if (slides.length === 0) return null;

  const modules: any[] = [Navigation];
  if (enableAutoplay) modules.push(Autoplay);
  if (showBullets) modules.push(Pagination);

  return (
    <div className={cn("destination-slider", className)}>
      <Swiper
        modules={modules}
        spaceBetween={spaceBetween}
        loop={canLoop}
        speed={speed}
        grabCursor
        navigation={showArrows && !swiperRef}
        pagination={showBullets ? { clickable: true } : false}
        autoplay={
          enableAutoplay
            ? { delay: autoplayDelay, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        onSwiper={(swiper) => {
          if (swiperRef) swiperRef.current = swiper;
        }}
        breakpoints={breakpoints}
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>{slide}</SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
