'use client';

import { XMarkIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

/**
 * FilterChips Component
 * Hiển thị các filter đang áp dụng dưới dạng chips có thể xóa
 */
export default function FilterChips({ activeFilters, onRemoveFilter, onClearAll }) {
  const chips = [];

  // Convert activeFilters object to array of chips
  Object.entries(activeFilters).forEach(([filterType, values]) => {
    if (filterType === 'priceRange' && values.min !== undefined && values.max !== undefined) {
      chips.push({
        type: 'priceRange',
        label: `${values.min.toLocaleString('vi-VN')}đ - ${values.max.toLocaleString('vi-VN')}đ`,
        value: null
      });
    } else if (Array.isArray(values) && values.length > 0) {
      values.forEach(value => {
        chips.push({
          type: filterType,
          label: getLabelFromValue(filterType, value),
          value: value
        });
      });
    }
  });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip, index) => (
        <motion.button
          key={`${chip.type}-${chip.value}-${index}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={() => onRemoveFilter(chip.type, chip.value)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors group"
        >
          <span>{chip.label}</span>
          <XMarkIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </motion.button>
      ))}

      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-gray-600 hover:text-red-600 font-medium underline transition-colors"
        >
          Xóa tất cả
        </button>
      )}
    </div>
  );
}

// Helper function to get display label from filter value
function getLabelFromValue(filterType, value) {
  // This should ideally come from your filter config
  const labels = {
    size: {
      'XS': 'XS',
      'S': 'S',
      'M': 'M',
      'L': 'L',
      'XL': 'XL',
      'XXL': 'XXL'
    },
    color: {
      'red': 'Đỏ',
      'blue': 'Xanh dương',
      'black': 'Đen',
      'white': 'Trắng',
      'gray': 'Xám',
      'green': 'Xanh lá',
      'yellow': 'Vàng',
      'pink': 'Hồng'
    },
    features: {
      'in_stock': 'Còn hàng',
      'free_shipping': 'Miễn phí ship',
      'on_sale': 'Giảm giá'
    }
  };

  return labels[filterType]?.[value] || value;
}
