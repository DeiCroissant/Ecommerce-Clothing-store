import Link from 'next/link';

export default function HeroBanner() {
  return (
    <section className="relative bg-gradient-to-r from-blue-50 to-purple-50 overflow-hidden">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 text-center md:text-left z-10">
            <div className="inline-block">
              <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Bộ Sưu Tập Mới
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              New Autumn
              <span className="block text-blue-600">Collection</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-lg">
              Khám phá những xu hướng thời trang mới nhất cho mùa thu. 
              Phong cách độc đáo, chất lượng vượt trội.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/products"
                className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Mua Ngay
              </Link>
              <Link
                href="/category/ao-nam"
                className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 border-2 border-gray-200 hover:border-blue-600"
              >
                Xem Chi Tiết
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex gap-8 justify-center md:justify-start pt-8">
              <div>
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Sản Phẩm</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">10k+</div>
                <div className="text-sm text-gray-600">Khách Hàng</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">4.8★</div>
                <div className="text-sm text-gray-600">Đánh Giá</div>
              </div>
            </div>
          </div>
          
          {/* Right Image */}
          <div className="relative">
            <div className="relative w-full h-[500px] md:h-[600px]">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl transform rotate-3 opacity-20"></div>
              <div className="relative w-full h-full bg-gray-200 rounded-3xl overflow-hidden shadow-2xl">
                {/* Main Hero Image */}
                <img
                  src="/images/banners/hero-autumn.jpg"
                  alt="Autumn Collection"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-60 blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-pink-400 rounded-full opacity-60 blur-2xl"></div>
          </div>
        </div>
      </div>
      
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-300 rounded-full opacity-20 animate-pulse delay-150"></div>
      </div>
    </section>
  );
}
