import React from "react";
import { Star, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const CATEGORIES = ["Men", "Women", "Kids", "Sports", "Casual", "Formal", "Leather"];
const SIZES = ["39", "40", "41", "42", "43", "44", "45"];
const COLOR_SWATCHES = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#F5F5F2" },
  { name: "Brown", hex: "#6B4423" },
  { name: "Blue", hex: "#2C4A7C" },
  { name: "Gray", hex: "#8A8A8A" },
  { name: "Red", hex: "#B34B2D" },
];
const PRICE_PRESETS = [
  { label: "Under ETB 1,000", range: [0, 1000] },
  { label: "ETB 1,000–2,000", range: [1000, 2000] },
  { label: "ETB 2,000–3,000", range: [2000, 3000] },
  { label: "Above ETB 3,000", range: [3000, 20000] },
];
const LABELS = [
  { key: "new_arrival", label: "New Arrivals" },
  { key: "best_seller", label: "Best Sellers" },
  { key: "flash_deal", label: "Flash Deals" },
  { key: "on_sale", label: "On Sale" },
];
const RATINGS = [5, 4, 3, 2, 1];
const PRICE_MAX = 20000;

const sectionClass = "rounded-xl border border-[#0F0F0F]/10 bg-white p-4 shadow-soft";
const headingClass = "text-[11px] tracking-[0.2em] uppercase text-[#4A4A4A] font-mono mb-3";

function Stars({ count, active }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} stars and up`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < count ? "fill-primary text-primary" : "text-[#0F0F0F]/20"}
        />
      ))}
    </div>
  );
}

export default function FilterSidebar({
  category,
  onSetCategory,
  filters,
  setFilters,
  onReset,
  onApply,
  brands = [],
  resultCount = 0,
}) {
  const toggle = (key, value) => {
    setFilters((f) => {
      const arr = f[key] || [];
      return {
        ...f,
        [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value],
      };
    });
  };

  const setPrice = (min, max) => setFilters((f) => ({ ...f, priceMin: min, priceMax: max }));

  return (
    <div className="space-y-4">
      {/* Categories */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => onSetCategory("")}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!category ? "bg-[#0F0F0F] text-[#F7F5F0]" : "text-[#0F0F0F] hover:bg-[#0F0F0F]/5"}`}
          >
            All Shoes
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onSetCategory(cat)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${category === cat ? "bg-[#0F0F0F] text-[#F7F5F0]" : "text-[#0F0F0F] hover:bg-[#0F0F0F]/5"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Price (ETB)</h3>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            min={0}
            value={filters.priceMin}
            onChange={(e) => setPrice(Math.max(0, +e.target.value), filters.priceMax)}
            placeholder="Min"
            className="w-full border border-[#0F0F0F]/15 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-primary"
          />
          <span className="text-[#4A4A4A]">–</span>
          <input
            type="number"
            max={PRICE_MAX}
            value={filters.priceMax}
            onChange={(e) => setPrice(filters.priceMin, Math.min(PRICE_MAX, +e.target.value))}
            placeholder="Max"
            className="w-full border border-[#0F0F0F]/15 rounded-lg px-2.5 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <Slider
          value={[filters.priceMin, filters.priceMax]}
          min={0}
          max={PRICE_MAX}
          step={100}
          onValueChange={(vals) => setPrice(vals[0], vals[1])}
          className="my-3"
          aria-label="Price range"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {PRICE_PRESETS.map((p) => {
            const active = filters.priceMin === p.range[0] && filters.priceMax === p.range[1];
            return (
              <button
                key={p.label}
                onClick={() => setPrice(p.range[0], p.range[1])}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors ${active ? "bg-[#0F0F0F] text-[#F7F5F0] border-[#0F0F0F]" : "border-[#0F0F0F]/15 text-[#4A4A4A] hover:border-[#0F0F0F]"}`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shoe Size */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Shoe Size</h3>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => {
            const active = filters.sizes?.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggle("sizes", s)}
                aria-pressed={active}
                className={`w-11 h-11 text-sm rounded-lg border transition-colors ${active ? "bg-[#0F0F0F] text-[#F7F5F0] border-[#0F0F0F]" : "border-[#0F0F0F]/15 text-[#0F0F0F] hover:border-[#0F0F0F]"}`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Color</h3>
        <div className="grid grid-cols-3 gap-2">
          {COLOR_SWATCHES.map((c) => {
            const active = filters.colors?.includes(c.name);
            return (
              <button
                key={c.name}
                onClick={() => toggle("colors", c.name)}
                aria-pressed={active}
                aria-label={c.name}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg border transition-colors ${active ? "border-[#0F0F0F] bg-[#0F0F0F]/5" : "border-[#0F0F0F]/15 hover:border-[#0F0F0F]"}`}
              >
                <span
                  className="w-5 h-5 rounded-full border border-[#0F0F0F]/10 shrink-0"
                  style={{ background: c.hex }}
                />
                <span className="text-xs text-[#0F0F0F]">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand */}
      {brands.length > 0 && (
        <div className={sectionClass}>
          <h3 className={headingClass}>Brand</h3>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {brands.map((b) => {
              const active = filters.brands?.includes(b);
              return (
                <label key={b} className="flex items-center gap-2.5 text-sm text-[#0F0F0F] cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={active || false}
                    onChange={() => toggle("brands", b)}
                    className="w-4 h-4 rounded accent-[#0F0F0F] cursor-pointer"
                  />
                  <span>{b}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Availability */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Availability</h3>
        <div className="space-y-1.5">
          {[
            { key: "in_stock", label: "In Stock" },
            { key: "out_of_stock", label: "Out of Stock" },
          ].map((a) => {
            const active = filters.availability?.includes(a.key);
            return (
              <label key={a.key} className="flex items-center gap-2.5 text-sm text-[#0F0F0F] cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={active || false}
                  onChange={() => toggle("availability", a.key)}
                  className="w-4 h-4 rounded accent-[#0F0F0F] cursor-pointer"
                />
                <span>{a.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Rating */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Customer Rating</h3>
        <div className="space-y-1.5">
          {RATINGS.map((r) => {
            const active = filters.rating === r;
            return (
              <button
                key={r}
                onClick={() => setFilters((f) => ({ ...f, rating: active ? 0 : r }))}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${active ? "bg-[#0F0F0F]/5" : "hover:bg-[#0F0F0F]/5"}`}
              >
                <Stars count={r} active={active} />
                <span className="text-[11px] text-[#4A4A4A]">& up</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Labels */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Product Labels</h3>
        <div className="flex flex-col gap-1.5">
          {LABELS.map((l) => {
            const active = filters.labels?.includes(l.key);
            return (
              <label key={l.key} className="flex items-center gap-2.5 text-sm text-[#0F0F0F] cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={active || false}
                  onChange={() => toggle("labels", l.key)}
                  className="w-4 h-4 rounded accent-[#0F0F0F] cursor-pointer"
                />
                <span>{l.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-1">
        <button
          onClick={onApply}
          className="w-full h-11 rounded-xl bg-[#B34B2D] text-white text-sm font-medium tracking-wide hover:bg-[#9a3f25] transition-all duration-200 shadow-soft"
        >
          Apply Filters
        </button>
        <button
          onClick={onReset}
          className="w-full h-11 rounded-xl border border-[#0F0F0F]/20 text-[#0F0F0F] text-sm font-medium tracking-wide hover:bg-[#0F0F0F]/5 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <RotateCcw size={14} /> Reset Filters
        </button>
        <p className="text-center text-xs text-[#4A4A4A] pt-1">{resultCount} matching product{resultCount === 1 ? "" : "s"}</p>
      </div>
    </div>
  );
}