import React from "react";
import HeroSection from "@/components/home/HeroSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import TrustBanner from "@/components/home/TrustBanner";
import CraftsmanshipStory from "@/components/home/CraftsmanshipStory";
import FlashDeals from "@/components/home/FlashDeals";
import BestSellers from "@/components/home/BestSellers";
import NewArrivals from "@/components/home/NewArrivals";
import Newsletter from "@/components/home/Newsletter";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <TrustBanner />
      <FeaturedProducts title="Featured Shoes" subtitle="Curated Selection" filterKey="is_featured" seeAllLink="/products" />
      <FlashDeals />
      <CategoryGrid />
      <BestSellers />
      <CraftsmanshipStory />
      <NewArrivals />
      <FeaturedProducts title="Trending Now" subtitle="Most Popular" filterKey="is_trending" seeAllLink="/products?filter=trending" />
      <Newsletter />
    </div>
  );
}