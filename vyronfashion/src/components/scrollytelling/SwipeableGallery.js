'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import * as productAPI from '@/lib/api/products';
import { getProductImage, handleImageError } from '@/lib/imageHelper';

// Import Swiper styles (v12+ bundle)
import 'swiper/swiper-bundle.css';

/**
 * Swipeable Gallery with Coverflow Effect
 * Shows products with most wishlist counts
 */
export default function SwipeableGallery() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load most wishlisted products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        // Fetch products sorted by wishlist_count (most wishlisted first)
        const response = await productAPI.getProducts({
          status: 'active',
          sort: 'most_wishlisted',
          limit: 10, // Get top 10 most wishlisted products
          page: 1
        });
        
        if (response.products && response.products.length > 0) {
          // Transform API products to slides format
          const transformedProducts = response.products.map((product, index) => {
            // Get product image using helper
            const productImage = getProductImage(product);

            // Color gradients for variety
            const gradients = [
              'from-blue-500/20 to-purple-500/20',
              'from-indigo-500/20 to-blue-500/20',
              'from-purple-500/20 to-pink-500/20',
              'from-orange-500/20 to-red-500/20',
              'from-teal-500/20 to-green-500/20',
              'from-pink-500/20 to-rose-500/20',
              'from-cyan-500/20 to-blue-500/20',
              'from-emerald-500/20 to-teal-500/20',
              'from-amber-500/20 to-orange-500/20',
              'from-violet-500/20 to-purple-500/20'
            ];

            return {
              id: product.id,
              slug: product.slug,
              image: productImage,
              title: product.name,
              link: `/products/${product.slug}`,
              color: gradients[index % gradients.length],
              wishlistCount: product.wishlist_count || 0,
              price: product.pricing?.sale || product.pricing?.original || 0
            };
          });
          
          setProducts(transformedProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error loading most wishlisted products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <section className="relative py-24 bg-zinc-50 overflow-hidden">
        <div className="text-center mb-16 px-4">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-12 bg-gray-200 rounded w-96 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto animate-pulse" />
        </div>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">Đang tải sản phẩm...</div>
        </div>
      </section>
    );
  }

  // Show empty state
  if (products.length === 0) {
    return (
      <section className="relative py-24 bg-zinc-50 overflow-hidden">
        <div className="text-center mb-16 px-4">
          <span className="inline-block px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-full mb-4">
            KHÁM PHÁ BỘ SƯU TẬP
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
            Tuyển Chọn Đặc Biệt
          </h2>
          <p className="text-lg text-gray-500">
            Chưa có sản phẩm nào được yêu thích
          </p>
        </div>
      </section>
    );
  }

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
          Những sản phẩm được yêu thích nhất từ khách hàng
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
          {products.map((product) => (
            <SwiperSlide 
              key={product.id}
              className="!w-[300px] md:!w-[400px] !h-[400px] md:!h-[500px]"
            >
              <Link
                href={product.link}
                className="group block relative w-full h-full rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                {/* Image */}
                <div className="absolute inset-0">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={handleImageError}
                  />
                </div>

                {/* Gradient Overlay - giữ màu gradient nhẹ */}
                <div className={`absolute inset-0 bg-gradient-to-t ${product.color} opacity-70 group-hover:opacity-50 transition-opacity duration-500`} />

                {/* Content - chữ tối trên nền sáng */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  {/* Wishlist badge */}
                  {product.wishlistCount > 0 && (
                    <motion.div
                      className="inline-flex items-center gap-1.5 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3 shadow-md w-fit"
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      ❤️ {product.wishlistCount} yêu thích
                    </motion.div>
                  )}
                  
                  {/* Title - chữ tối */}
                  <motion.h3
                    className="text-xl md:text-2xl font-bold mb-2 text-zinc-800 line-clamp-2"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    {product.title}
                  </motion.h3>
                  
                  {/* Price */}
                  {product.price > 0 && (
                    <motion.div
                      className="text-lg font-bold text-red-600 mb-3"
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {product.price.toLocaleString('vi-VN')}₫
                    </motion.div>
                  )}
                  
                  {/* CTA Button - nền trắng bo tròn */}
                  <motion.div
                    className="inline-flex items-center gap-2 text-sm font-semibold bg-white text-zinc-900 px-4 py-2 rounded-full shadow-lg hover:bg-zinc-100 hover:shadow-xl transition-all duration-300 w-fit"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
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
