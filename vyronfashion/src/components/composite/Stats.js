'use client';

import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

/**
 * Stats Component
 * Displays 3 animated statistics with counters
 * Uses Framer Motion for fade-in animations and AnimatedCounter for number animations
 */
export default function Stats() {
  const stats = [
    {
      value: 500,
      suffix: '+',
      label: 'Sản Phẩm',
      decimals: 0,
      duration: 2.5
    },
    {
      value: 10,
      suffix: 'k+',
      label: 'Khách Hàng',
      decimals: 0,
      duration: 2.5
    },
    {
      value: 4.8,
      suffix: '★',
      label: 'Đánh Giá',
      decimals: 1,
      duration: 2
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1]
      }
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      className="flex flex-wrap justify-center gap-8 md:gap-16 py-8 md:py-12"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          variants={item}
          className="text-center"
        >
          <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            <AnimatedCounter
              value={stat.value}
              suffix={stat.suffix}
              decimals={stat.decimals}
              duration={stat.duration}
            />
          </div>
          <div className="text-sm md:text-base text-gray-600 font-medium">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
