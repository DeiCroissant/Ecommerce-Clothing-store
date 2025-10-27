import Link from 'next/link';
import Stats from '@/components/composite/Stats';

export default function HeroBanner() {
  return (
    <section className="relative bg-stone-50 overflow-hidden">
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 text-center md:text-left z-10">
            <div className="inline-block">
              <span className="bg-zinc-900 text-white px-6 py-2 rounded-full text-sm font-medium tracking-wide uppercase">
                Bộ Sưu Tập Mới
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-zinc-900 leading-tight">
              Bộ sưu tập 
              <span className="block font-light italic">Mùa Hè</span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-600 max-w-lg leading-relaxed">
              Khám phá những xu hướng thời trang mới nhất cho mùa hè.
              Phong cách độc đáo, chất lượng vượt trội.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
              <Link
                href="/products"
                className="bg-zinc-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-zinc-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Mua Ngay
              </Link>
              <Link
                href="/category/ao-nam"
                className="bg-transparent text-zinc-900 px-8 py-4 rounded-full font-semibold hover:bg-zinc-900 hover:text-white transition-all duration-300 border-2 border-zinc-900"
              >
                Xem Chi Tiết
              </Link>
            </div>
            
            {/* Animated Stats */}
            <div className="pt-8">
              <Stats />
            </div>
          </div>
          
          {/* Right Image */}
          <div className="relative">
            <div className="relative w-full h-[500px] md:h-[600px]">
              {/* Subtle decorative background */}
              <div className="absolute inset-0 bg-zinc-200 rounded-3xl transform rotate-2 opacity-30"></div>
              <div className="relative w-full h-full bg-zinc-100 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200">
                {/* Main Hero Image */}
                <img
                  src="/images/banners/hero-autumn.jpg"
                  alt="Autumn Collection"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
