'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, Award, ShoppingBag } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

/**
 * Scroll-triggered Stats Section
 * Displays key metrics with animated counters
 */
export default function StatsSection() {
  const stats = [
    {
      icon: ShoppingBag,
      value: 500,
      suffix: '+',
      label: 'Sản Phẩm',
      description: 'Đa dạng mẫu mã',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      value: 10000,
      suffix: '+',
      label: 'Khách Hàng',
      description: 'Tin tưởng & ủng hộ',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Award,
      value: 4.8,
      suffix: '★',
      label: 'Đánh Giá',
      description: 'Từ khách hàng',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: TrendingUp,
      value: 98,
      suffix: '%',
      label: 'Hài Lòng',
      description: 'Tỷ lệ quay lại',
      color: 'from-green-500 to-teal-500'
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.8 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <section className="relative py-24 bg-gradient-to-b from-white to-zinc-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(24 24 27) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-full mb-4">
            CON SỐ NÓI LÊN TẤT CẢ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
            Thành Tựu Của Chúng Tôi
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Những con số ấn tượng phản ánh sự tin tưởng và yêu mến của khách hàng
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="relative group"
              >
                {/* Card */}
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Value */}
                  <div className="text-4xl md:text-5xl font-bold text-zinc-900 mb-2 tracking-tight">
                    <AnimatedCounter 
                      value={stat.value} 
                      suffix={stat.suffix}
                      duration={2}
                    />
                  </div>

                  {/* Label */}
                  <div className="text-lg font-semibold text-zinc-900 mb-1">
                    {stat.label}
                  </div>

                  {/* Description */}
                  <div className="text-sm text-zinc-600">
                    {stat.description}
                  </div>

                  {/* Decorative Element */}
                  <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br from-zinc-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-zinc-600 max-w-3xl mx-auto">
            Từ những khởi đầu khiêm tốn, <strong className="text-zinc-900">VyronFashion</strong> đã trở thành 
            điểm đến tin cậy cho hàng ngàn khách hàng trên toàn quốc. 
            Chúng tôi cam kết mang đến những trải nghiệm mua sắm tuyệt vời nhất.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
