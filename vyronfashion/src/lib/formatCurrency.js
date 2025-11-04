/**
 * Format currency utility
 * Formats numbers to Vietnamese Dong (VND) currency
 */

export function formatCurrency(amount) {
  if (typeof amount !== 'number') {
    return '0₫'
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format currency with custom options
 */
export function formatCurrencyCustom(amount, options = {}) {
  const {
    currency = 'VND',
    locale = 'vi-VN',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0
  } = options

  if (typeof amount !== 'number') {
    return '0₫'
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(amount)
}

/**
 * Parse currency string back to number
 */
export function parseCurrency(currencyString) {
  if (typeof currencyString !== 'string') {
    return 0
  }

  // Remove all non-digit characters except minus sign
  const cleaned = currencyString.replace(/[^\d-]/g, '')
  return parseInt(cleaned, 10) || 0
}

/**
 * Format number with thousand separators (no currency symbol)
 */
export function formatNumber(num) {
  if (typeof num !== 'number') {
    return '0'
  }

  return new Intl.NumberFormat('vi-VN').format(num)
}
