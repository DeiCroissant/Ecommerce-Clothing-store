'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useIsDesktop } from '@/hooks/useIsDesktop';

// Skeleton Loader
import HomePageSkeleton from '@/components/ui/HomePageSkeleton';

// Standard Homepage Components
import HeroBanner from '@/components/layout/HeroBanner';
import FeaturedCategories from '@/components/composite/FeaturedCategories';
import NewArrivals from '@/components/composite/NewArrivals';
import BestSellers from '@/components/composite/BestSellers';

// Scrollytelling Components (Code Splitting for Performance)
const WelcomeScreen = dynamic(() => import('@/components/scrollytelling/WelcomeScreen'), {
  ssr: false
});
const ScrollytellingHero = dynamic(() => import('@/components/scrollytelling/ScrollytellingHero'));
const SwipeableGallery = dynamic(() => import('@/components/scrollytelling/SwipeableGallery'));
const StatsSection = dynamic(() => import('@/components/scrollytelling/StatsSection'));
const SectionNavigation = dynamic(() => import('@/components/scrollytelling/SectionNavigation'), {
  ssr: false
});

export default function HomePage() {
  const isDesktop = useIsDesktop();
  const [showWelcome, setShowWelcome] = useState(true);
  const [canPlayVideo, setCanPlayVideo] = useState(false);

  // Section navigation configuration
  const sections = [
    { id: 'hero', label: 'Trang Chủ' },
    { id: 'gallery', label: 'Bộ Sưu Tập' },
    { id: 'stats', label: 'Thành Tựu' },
    { id: 'arrivals', label: 'Sản Phẩm Mới' }
  ];

  // Enable video playback after WelcomeScreen disappears
  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    // Delay video start slightly for smooth transition
    setTimeout(() => {
      setCanPlayVideo(true);
    }, 500);
  };

  // Loading state: Show skeleton during SSR and initial client render
  // This prevents hydration mismatch (server renders skeleton, client initially renders skeleton)
  if (isDesktop === null) {
    return <HomePageSkeleton />;
  }

  // Desktop: Scrollytelling Experience
  if (isDesktop) {
    return (
      <>
        {/* Welcome Screen (scroll to dismiss) */}
        {showWelcome && (
          <WelcomeScreen onComplete={handleWelcomeComplete} />
        )}

        {/* Section Navigation Dots */}
        <SectionNavigation sections={sections} />

        <main className="bg-white">
          {/* 1. Hero Section with Video Background */}
          <section id="hero">
            <ScrollytellingHero canPlayVideo={canPlayVideo} />
          </section>

          {/* 2. Swipeable Gallery */}
          <section id="gallery">
            <SwipeableGallery />
          </section>

          {/* 3. Animated Stats */}
          <section id="stats">
            <StatsSection />
          </section>

          {/* 4. New Arrivals (Enhanced) */}
          <section id="arrivals" className="py-16">
            <NewArrivals />
          </section>

          {/* 5. Best Sellers */}
          <section id="bestsellers" className="py-16 bg-zinc-50">
            <BestSellers />
          </section>

          {/* 6. Featured Categories */}
          <section id="categories" className="py-16">
            <FeaturedCategories />
          </section>
        </main>
      </>
    );
  }

  // Mobile: Standard Homepage (Fallback)
  return (
    <main className="bg-zinc-50">
      {/* 1. Hero Banner - Banner chính với hình ảnh lớn và CTA */}
      <HeroBanner />
      
      {/* 2. Featured Categories - Danh mục nổi bật */}
      <FeaturedCategories />
      
      {/* 3. New Arrivals - Sản phẩm mới */}
      <NewArrivals />
      
      {/* 4. Best Sellers - Sản phẩm bán chạy */}
      <BestSellers />
      
      {/* Footer đã được đặt trong layout.js */}
    </main>
  );
}

