/**
 * Currency Formatting Utilities
 * SSR-safe - No hydration mismatch
 */

/**
 * Format number as VND currency (SSR-safe)
 * Uses simple string formatting to avoid Intl hydration issues
 */
export function formatVND(amount) {
  if (typeof amount !== 'number') return '0₫';
  
  // Simple thousands separator without Intl
  const parts = amount.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return parts.join(',') + '₫';
}

/**
 * Format as currency using Intl (may cause hydration mismatch)
 * Use only in client-side only components
 */
export function formatCurrency(amount) {
  if (typeof window === 'undefined') {
    // Server-side: use simple format
    return formatVND(amount);
  }
  
  // Client-side: use Intl
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  } catch (error) {
    return formatVND(amount);
  }
}

/**
 * Format percentage
 */
export function formatPercent(value, decimals = 0) {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format discount (e.g., "-25%")
 */
export function formatDiscount(percent) {
  return `-${Math.abs(percent)}%`;
}

export default {
  formatVND,
  formatCurrency,
  formatPercent,
  formatDiscount
};
