'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Import Swiper styles (v12+ bundle)
import 'swiper/swiper-bundle.css';

/**
 * Swipeable Gallery with Coverflow Effect
 * Shows collection highlights with smooth transitions
 */
export default function SwipeableGallery() {
  const slides = [
    {
      id: 1,
      image: '/images/products/tshirt-grey.jpg',
      title: 'Summer T-Shirts',
      description: 'Lightweight & Breathable',
      link: '/category/t-shirts',
      color: 'from-blue-500/20 to-purple-500/20'
    },
    {
      id: 2,
      image: '/images/products/jacket-denim.jpg',
      title: 'Denim Jackets',
      description: 'Classic Never Dies',
      link: '/category/jackets',
      color: 'from-indigo-500/20 to-blue-500/20'
    },
    {
      id: 3,
      image: '/images/products/polo-navy.jpg',
      title: 'Polo Collection',
      description: 'Elegant & Comfortable',
      link: '/category/polos',
      color: 'from-purple-500/20 to-pink-500/20'
    },
    {
      id: 4,
      image: '/images/products/hoodie-black.jpg',
      title: 'Premium Hoodies',
      description: 'Stay Cozy in Style',
      link: '/category/hoodies',
      color: 'from-orange-500/20 to-red-500/20'
    },
    {
      id: 5,
      image: '/images/products/jeans-blue.jpg',
      title: 'Designer Jeans',
      description: 'Perfect Fit Guaranteed',
      link: '/category/jeans',
      color: 'from-teal-500/20 to-green-500/20'
    }
  ];

  return (
    <section className="relative py-24 bg-zinc-50 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: '-100px' }}
        className="text-center mb-16 px-4"
      >
        <span className="inline-block px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-full mb-4">
          KHÁM PHÁ BỘ SƯU TẬP
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
          Tuyển Chọn Đặc Biệt
        </h2>
        <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
          Lướt qua các sản phẩm nổi bật được chọn lọc kỹ càng cho bạn
        </p>
      </motion.div>

      {/* Swiper Gallery */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        viewport={{ once: true, margin: '-100px' }}
        className="relative px-4"
      >
        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          navigation={{
            prevEl: '.swiper-button-prev-custom',
            nextEl: '.swiper-button-next-custom',
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
          className="!pb-12"
        >
          {slides.map((slide) => (
            <SwiperSlide 
              key={slide.id}
              className="!w-[300px] md:!w-[400px] !h-[400px] md:!h-[500px]"
            >
              <Link
                href={slide.link}
                className="group block relative w-full h-full rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                {/* Image */}
                <div className="absolute inset-0">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      if (e.target.src.includes('placeholder')) return;
                      e.target.src = '/images/placeholders/product.jpg';
                    }}
                  />
                </div>

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${slide.color} opacity-60 group-hover:opacity-40 transition-opacity duration-500`} />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                  <motion.h3
                    className="text-2xl md:text-3xl font-bold mb-2"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {slide.title}
                  </motion.h3>
                  <motion.p
                    className="text-sm md:text-base text-white/90 mb-4"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {slide.description}
                  </motion.p>
                  <motion.div
                    className="inline-flex items-center gap-2 text-sm font-semibold group-hover:translate-x-2 transition-transform"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Khám phá ngay
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-zinc-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-zinc-900" />
        </button>
        <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-zinc-100 transition-colors">
          <ArrowRight className="w-6 h-6 text-zinc-900" />
        </button>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        viewport={{ once: true }}
        className="text-center mt-12"
      >
        <Link
          href="/category/all"
          className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-full font-semibold hover:bg-zinc-800 transition-all hover:scale-105"
        >
          Xem Tất Cả Bộ Sưu Tập
          <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: #18181b;
          opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
          background: #18181b;
        }
      `}</style>
    </section>
  );
}
