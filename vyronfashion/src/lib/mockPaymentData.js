/**
 * Mock Payment Methods Data
 * Vietnamese E-commerce format with PCI compliance
 */

// Payment method types
export const PAYMENT_TYPES = {
  CARD: 'card',
  EWALLET: 'ewallet',
  BANK: 'bank_transfer'
};

// Card brands
export const CARD_BRANDS = {
  VISA: { name: 'Visa', icon: '💳' },
  MASTERCARD: { name: 'Mastercard', icon: '💳' },
  JCB: { name: 'JCB', icon: '💳' },
  AMEX: { name: 'American Express', icon: '💳' }
};

// E-wallet providers
export const EWALLET_PROVIDERS = {
  MOMO: { name: 'MoMo', icon: '🟣', color: '#A50064' },
  VNPAY: { name: 'VNPay', icon: '🔵', color: '#0066CC' },
  ZALOPAY: { name: 'ZaloPay', icon: '🔷', color: '#008FE5' },
  SHOPEEPAY: { name: 'ShopeePay', icon: '🟠', color: '#EE4D2D' }
};

// Mock payment methods (PCI compliant - no full card numbers)
export const mockPaymentMethods = [
  {
    id: 'pm-1',
    type: PAYMENT_TYPES.CARD,
    brand: 'VISA',
    last4: '4242',
    expiryMonth: '12',
    expiryYear: '2025',
    holderName: 'NGUYEN VAN A',
    isDefault: true,
    addedDate: '2024-03-15',
    billingAddress: {
      city: 'TP. Hồ Chí Minh',
      country: 'VN'
    }
  },
  {
    id: 'pm-2',
    type: PAYMENT_TYPES.CARD,
    brand: 'MASTERCARD',
    last4: '5555',
    expiryMonth: '08',
    expiryYear: '2026',
    holderName: 'NGUYEN VAN A',
    isDefault: false,
    addedDate: '2024-06-20',
    billingAddress: {
      city: 'Hà Nội',
      country: 'VN'
    }
  },
  {
    id: 'pm-3',
    type: PAYMENT_TYPES.EWALLET,
    provider: 'MOMO',
    phoneNumber: '0901***234',
    accountName: 'Nguyễn Văn A',
    isDefault: false,
    isVerified: true,
    addedDate: '2024-05-10'
  },
  {
    id: 'pm-4',
    type: PAYMENT_TYPES.EWALLET,
    provider: 'VNPAY',
    phoneNumber: '0902***567',
    accountName: 'Nguyễn Văn A',
    isDefault: false,
    isVerified: true,
    addedDate: '2024-07-01'
  }
];

// Helper: Format card number with masking
export const formatCardNumber = (last4) => {
  return `•••• •••• •••• ${last4}`;
};

// Helper: Format expiry date
export const formatExpiry = (month, year) => {
  return `${month.padStart(2, '0')}/${year.slice(-2)}`;
};

// Helper: Check if card is expired
export const isCardExpired = (month, year) => {
  const now = new Date();
  const expiry = new Date(parseInt(year), parseInt(month) - 1);
  return expiry < now;
};

// Helper: Get card brand info
export const getCardBrand = (brand) => {
  return CARD_BRANDS[brand] || { name: 'Card', icon: '💳' };
};

// Helper: Get ewallet provider info
export const getEwalletProvider = (provider) => {
  return EWALLET_PROVIDERS[provider] || { name: provider, icon: '💰', color: '#666' };
};

// Helper: Mask phone number
export const maskPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1***$3');
};

// Helper: Get default payment method
export const getDefaultPaymentMethod = (methods = mockPaymentMethods) => {
  return methods.find(m => m.isDefault) || methods[0];
};

// Helper: Set default payment method
export const setDefaultPaymentMethod = (methods, methodId) => {
  return methods.map(m => ({
    ...m,
    isDefault: m.id === methodId
  }));
};

// Helper: Remove payment method
export const removePaymentMethod = (methods, methodId) => {
  const filtered = methods.filter(m => m.id !== methodId);
  
  // If removed default, set first as new default
  const hasDefault = filtered.some(m => m.isDefault);
  if (!hasDefault && filtered.length > 0) {
    filtered[0].isDefault = true;
  }
  
  return filtered;
};

// Helper: Validate card (basic client-side validation)
export const validateCard = (cardData) => {
  const errors = {};
  
  // Card number (Luhn algorithm - simplified)
  if (!cardData.cardNumber || cardData.cardNumber.length < 13) {
    errors.cardNumber = 'Số thẻ không hợp lệ';
  }
  
  // Expiry date
  const now = new Date();
  const expiryDate = new Date(
    parseInt(cardData.expiryYear), 
    parseInt(cardData.expiryMonth) - 1
  );
  if (expiryDate < now) {
    errors.expiry = 'Thẻ đã hết hạn';
  }
  
  // CVV
  if (!cardData.cvv || cardData.cvv.length < 3) {
    errors.cvv = 'CVV không hợp lệ';
  }
  
  // Holder name
  if (!cardData.holderName || cardData.holderName.length < 2) {
    errors.holderName = 'Tên chủ thẻ bắt buộc';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Helper: Group payment methods by type
export const groupPaymentsByType = (methods = mockPaymentMethods) => {
  return methods.reduce((acc, method) => {
    const type = method.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(method);
    return acc;
  }, {});
};

// Helper: Get payment stats
export const getPaymentStats = (methods = mockPaymentMethods) => {
  return {
    total: methods.length,
    cards: methods.filter(m => m.type === PAYMENT_TYPES.CARD).length,
    ewallets: methods.filter(m => m.type === PAYMENT_TYPES.EWALLET).length,
    expired: methods.filter(m => 
      m.type === PAYMENT_TYPES.CARD && 
      isCardExpired(m.expiryMonth, m.expiryYear)
    ).length
  };
};

// Security note for display
export const PCI_COMPLIANCE_NOTE = `
🔒 Bảo mật thông tin thanh toán

Chúng tôi không lưu trữ số thẻ đầy đủ hoặc mã CVV. 
Tất cả thông tin thanh toán được mã hóa và tuân thủ chuẩn PCI DSS.
Thông tin thẻ được xử lý an toàn bởi đối tác thanh toán được chứng nhận.
`;

export default mockPaymentMethods;
