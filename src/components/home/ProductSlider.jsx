import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductSlider({ children }) {
  const scrollRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * scrollRef.current.clientWidth * 0.8, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanLeft(scrollLeft > 5);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  const items = React.Children.toArray(children);

  return (
    <div className="relative">
      {/* Desktop: scrollable row with arrows */}
      {canLeft && (
        <button
          onClick={() => scroll(-1)}
          className="hidden md:flex absolute -left-3 top-[38%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-lg items-center justify-center text-[#0F0F0F] hover:bg-[#B34B2D] hover:text-white transition-colors border border-[#0F0F0F]/10"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {canRight && (
        <button
          onClick={() => scroll(1)}
          className="hidden md:flex absolute -right-3 top-[38%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-lg items-center justify-center text-[#0F0F0F] hover:bg-[#B34B2D] hover:text-white transition-colors border border-[#0F0F0F]/10"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Scrollable container — desktop shows ~4, mobile continuous */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
      >
        {items.map((child, i) => (
          <div
            key={i}
            className="shrink-0 w-[58%] sm:w-[42%] md:w-[calc(25%-12px)] lg:w-[calc(25%-18px)] snap-start"
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}