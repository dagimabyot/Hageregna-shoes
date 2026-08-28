import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductCard from "@/components/products/ProductCard";
import FilterSidebar from "@/components/products/FilterSidebar";
import PageHeader from "@/components/shared/PageHeader";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Best Rated", value: "rating" },
  { label: "Best Selling", value: "best_selling" },
];
const PRICE_MAX = 20000;
const STORAGE_KEY = "hageregna_product_filters";

const defaultFilters = () => ({
  sizes: [],
  colors: [],
  brands: [],
  availability: [],
  labels: [],
  priceMin: 0,
  priceMax: PRICE_MAX,
  rating: 0,
});

const LABEL_MAP = {
  new_arrival: "is_new_arrival",
  best_seller: "is_best_seller",
  flash_deal: "is_flash_deal",
  trending: "is_trending",
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [filters, setFilters] = useState(defaultFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort") || "newest";
  const filterFlag = searchParams.get("filter") || "";

  // Restore sidebar filters from localStorage once on mount.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) setFilters((f) => ({ ...f, ...saved }));
    } catch {}
  }, []);

  // Persist sidebar filters.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  // Fetch from server when URL-driven params change.
  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    const query = {};
    if (category) query.category = category;
    if (filterFlag && LABEL_MAP[filterFlag]) query[LABEL_MAP[filterFlag]] = true;

    const sortMap = {
      newest: "-created_date",
      price_asc: "price",
      price_desc: "-price",
      rating: "-rating",
      best_selling: "-sold_quantity",
    };

    base44.entities.Product.filter(query, sortMap[sortBy] || "-created_date", 200)
      .then((items) => setAllProducts((items || []).filter((item) => item.is_active !== false)))
      .catch((error) => {
        console.error("[v0] Product catalog request failed:", error);
        setAllProducts([]);
        setLoadError(error?.message || "The product service is not configured for this preview.");
      })
      .finally(() => setLoading(false));
  }, [category, sortBy, filterFlag, retryCount]);

  const brands = useMemo(() => {
    const set = new Set();
    allProducts.forEach((p) => p.brand && set.add(p.brand));
    return Array.from(set).sort();
  }, [allProducts]);

  const filtered = useMemo(() => {
    let result = [...allProducts];
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      );
    }
    if (filters.sizes.length > 0) {
      result = result.filter((p) => p.sizes?.some((s) => filters.sizes.includes(s)));
    }
    if (filters.colors.length > 0) {
      result = result.filter((p) => p.colors?.some((c) => filters.colors.includes(c)));
    }
    if (filters.brands.length > 0) {
      result = result.filter((p) => filters.brands.includes(p.brand));
    }
    if (filters.availability.length > 0) {
      result = result.filter((p) => {
        const inStock = (p.stock ?? 0) > 0;
        return filters.availability.some((a) =>
          a === "in_stock" ? inStock : !inStock
        );
      });
    }
    if (filters.rating > 0) {
      result = result.filter((p) => (p.rating || 0) >= filters.rating);
    }
    if (filters.labels.length > 0) {
      result = result.filter((p) =>
        filters.labels.some((l) => {
          if (l === "on_sale") return p.discount_price && p.discount_price < p.price;
          const field = LABEL_MAP[l];
          return field ? p[field] : false;
        })
      );
    }
    result = result.filter((p) => {
      const price = p.discount_price || p.price;
      return price >= filters.priceMin && price <= filters.priceMax;
    });
    return result;
  }, [allProducts, search, filters]);

  const setCategory = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (!cat) params.delete("category");
    else params.set("category", cat);
    setSearchParams(params);
    setDrawerOpen(false);
  };

  const setSort = (val) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", val);
    setSearchParams(params);
  };

  const resetFilters = () => {
    setFilters(defaultFilters());
    const params = new URLSearchParams(searchParams);
    params.delete("category");
    params.delete("filter");
    setSearchParams(params);
  };

  // Build active filter chips.
  const toggleOff = (key, value) =>
    setFilters((f) => {
      const arr = f[key] || [];
      return { ...f, [key]: arr.filter((x) => x !== value) };
    });

  const chips = [];
  if (category) chips.push({ label: category, remove: () => setCategory("") });
  filters.sizes.forEach((s) => chips.push({ label: `Size ${s}`, remove: () => toggleOff("sizes", s) }));
  filters.colors.forEach((c) => chips.push({ label: c, remove: () => toggleOff("colors", c) }));
  filters.brands.forEach((b) => chips.push({ label: b, remove: () => toggleOff("brands", b) }));
  if (filters.priceMin > 0 || filters.priceMax < PRICE_MAX) {
    chips.push({
      label: `ETB ${filters.priceMin.toLocaleString()}–${filters.priceMax.toLocaleString()}`,
      remove: () => setFilters((f) => ({ ...f, priceMin: 0, priceMax: PRICE_MAX })),
    });
  }
  filters.availability.forEach((a) =>
    chips.push({ label: a === "in_stock" ? "In Stock" : "Out of Stock", remove: () => toggleOff("availability", a) })
  );
  if (filters.rating > 0)
    chips.push({ label: `${filters.rating}★ & up`, remove: () => setFilters((f) => ({ ...f, rating: 0 })) });
  filters.labels.forEach((l) => {
    const map = { new_arrival: "New Arrivals", best_seller: "Best Sellers", flash_deal: "Flash Deals", on_sale: "On Sale" };
    chips.push({ label: map[l], remove: () => toggleOff("labels", l) });
  });

  const removeChip = (chip) => chip.remove();

  const sidebarProps = {
    category,
    onSetCategory: setCategory,
    filters,
    setFilters,
    onReset: resetFilters,
    onApply: () => setDrawerOpen(false),
    brands,
    resultCount: filtered.length,
  };

  const heading =
    category ? `${category} Shoes` :
    search ? `Results for "${search}"` :
    filterFlag === "trending" ? "Trending Now" :
    filterFlag === "flash_deal" ? "Flash Deals" :
    filterFlag === "best_seller" ? "Best Sellers" :
    filterFlag === "new_arrival" ? "New Arrivals" : "All Shoes";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title={heading} className="mb-6" />

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden flex items-center gap-2 text-sm text-[#0F0F0F] border border-[#0F0F0F]/20 rounded-xl px-4 py-2.5 hover:border-[#0F0F0F] transition-colors"
        >
          <SlidersHorizontal size={15} /> Filters
          {chips.length > 0 && <span className="w-5 h-5 bg-[#B34B2D] text-white text-[10px] rounded-full flex items-center justify-center">{chips.length}</span>}
        </button>
        <span className="text-sm text-[#4A4A4A]">{filtered.length} products</span>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#4A4A4A] hidden sm:inline">Sort</label>
          <select
            value={sortBy}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm bg-transparent border border-[#0F0F0F]/20 rounded-xl px-3 py-2 outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sticky sidebar */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1 pb-4 scrollbar-hide">
            <FilterSidebar {...sidebarProps} />
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Active chips */}
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {chips.map((chip, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 bg-[#0F0F0F]/5 border border-[#0F0F0F]/10 rounded-full pl-3 pr-1.5 py-1 text-xs text-[#0F0F0F]"
                >
                  {chip.label}
                  <button
                    onClick={() => removeChip(chip)}
                    className="w-4 h-4 rounded-full hover:bg-[#0F0F0F]/10 flex items-center justify-center"
                    aria-label={`Remove ${chip.label}`}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              <button onClick={resetFilters} className="text-xs text-[#B34B2D] hover:underline ml-1">
                Clear All
              </button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-[#0F0F0F]/5 rounded-xl" />
                  <div className="h-3 bg-[#0F0F0F]/5 rounded mt-3 w-2/3" />
                  <div className="h-3 bg-[#0F0F0F]/5 rounded mt-2 w-1/3" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="text-center py-20">
              <p className="text-[#4A4A4A] text-lg mb-2">Unable to load products</p>
              <p className="text-sm text-[#4A4A4A]/60">{loadError}</p>
              <button onClick={() => setRetryCount((count) => count + 1)} className="mt-4 text-sm text-[#B34B2D] hover:underline">Try again</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#4A4A4A] text-lg mb-2">No shoes found</p>
              <p className="text-sm text-[#4A4A4A]/60">Try adjusting your filters or search terms</p>
              <button onClick={resetFilters} className="mt-4 text-sm text-[#B34B2D] hover:underline">Clear all filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile / tablet drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-[#FBF8F4] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 h-14 border-b border-[#0F0F0F]/10 shrink-0">
              <span className="text-sm font-semibold tracking-widest uppercase">Filters</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-lg hover:bg-[#0F0F0F]/5 transition-colors"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterSidebar {...sidebarProps} onApply={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
