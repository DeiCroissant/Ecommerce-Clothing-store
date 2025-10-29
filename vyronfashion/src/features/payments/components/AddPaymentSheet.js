import React, { useState, useCallback } from 'react';
import { X, CreditCard, Smartphone, AlertCircle } from 'lucide-react';
import { PAYMENT_TYPES, CARD_BRANDS, EWALLET_PROVIDERS, validateCard, PCI_COMPLIANCE_NOTE } from '@/lib/mockPaymentData';
import styles from './AddPaymentSheet.module.css';

const AddPaymentSheet = React.memo(({ isOpen, onClose, onAdd }) => {
  const [paymentType, setPaymentType] = useState(PAYMENT_TYPES.CARD);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: '',
    brand: 'VISA'
  });
  const [ewalletData, setEwalletData] = useState({
    provider: 'MOMO',
    phoneNumber: '',
    accountName: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle card input change
  const handleCardChange = useCallback((field, value) => {
    setCardData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Handle ewallet input change
  const handleEwalletChange = useCallback((field, value) => {
    setEwalletData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Handle submit
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (paymentType === PAYMENT_TYPES.CARD) {
      const { isValid, errors: validationErrors } = validateCard(cardData);
      
      if (!isValid) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      // Mock: Add card (in real app, tokenize with payment gateway)
      const newCard = {
        id: `pm-${Date.now()}`,
        type: PAYMENT_TYPES.CARD,
        brand: cardData.brand,
        last4: cardData.cardNumber.slice(-4),
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        holderName: cardData.holderName.toUpperCase(),
        isDefault: false,
        addedDate: new Date().toISOString().split('T')[0],
        billingAddress: { city: 'TP. Hồ Chí Minh', country: 'VN' }
      };

      setTimeout(() => {
        onAdd?.(newCard);
        setIsSubmitting(false);
        onClose?.();
        // Reset form
        setCardData({
          cardNumber: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          holderName: '',
          brand: 'VISA'
        });
      }, 1000);
    } else {
      // Add ewallet
      const newEwallet = {
        id: `pm-${Date.now()}`,
        type: PAYMENT_TYPES.EWALLET,
        provider: ewalletData.provider,
        phoneNumber: ewalletData.phoneNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1***$3'),
        accountName: ewalletData.accountName,
        isDefault: false,
        isVerified: true,
        addedDate: new Date().toISOString().split('T')[0]
      };

      setTimeout(() => {
        onAdd?.(newEwallet);
        setIsSubmitting(false);
        onClose?.();
        setEwalletData({ provider: 'MOMO', phoneNumber: '', accountName: '' });
      }, 1000);
    }
  }, [paymentType, cardData, ewalletData, onAdd, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Thêm Phương Thức Thanh Toán</h2>
          <button onClick={onClose} className={styles.btnClose} aria-label="Đóng">
            <X size={24} />
          </button>
        </div>

        {/* Type Selector */}
        <div className={styles.typeSelector}>
          <button
            className={`${styles.typeBtn} ${paymentType === PAYMENT_TYPES.CARD ? styles.active : ''}`}
            onClick={() => setPaymentType(PAYMENT_TYPES.CARD)}
          >
            <CreditCard size={20} />
            Thẻ tín dụng/ghi nợ
          </button>
          <button
            className={`${styles.typeBtn} ${paymentType === PAYMENT_TYPES.EWALLET ? styles.active : ''}`}
            onClick={() => setPaymentType(PAYMENT_TYPES.EWALLET)}
          >
            <Smartphone size={20} />
            Ví điện tử
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {paymentType === PAYMENT_TYPES.CARD ? (
            <>
              {/* Card Number */}
              <div className={styles.field}>
                <label htmlFor="cardNumber">Số thẻ *</label>
                <input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.cardNumber}
                  onChange={(e) => handleCardChange('cardNumber', e.target.value.replace(/\s/g, ''))}
                  maxLength="16"
                  className={errors.cardNumber ? styles.error : ''}
                />
                {errors.cardNumber && (
                  <span className={styles.errorMsg}>
                    <AlertCircle size={14} /> {errors.cardNumber}
                  </span>
                )}
              </div>

              {/* Expiry & CVV */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="expiryMonth">Tháng hết hạn *</label>
                  <input
                    id="expiryMonth"
                    type="text"
                    placeholder="MM"
                    value={cardData.expiryMonth}
                    onChange={(e) => handleCardChange('expiryMonth', e.target.value)}
                    maxLength="2"
                    className={errors.expiry ? styles.error : ''}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="expiryYear">Năm *</label>
                  <input
                    id="expiryYear"
                    type="text"
                    placeholder="YYYY"
                    value={cardData.expiryYear}
                    onChange={(e) => handleCardChange('expiryYear', e.target.value)}
                    maxLength="4"
                    className={errors.expiry ? styles.error : ''}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="cvv">CVV *</label>
                  <input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={(e) => handleCardChange('cvv', e.target.value)}
                    maxLength="4"
                    className={errors.cvv ? styles.error : ''}
                  />
                </div>
              </div>
              {errors.expiry && (
                <span className={styles.errorMsg}>
                  <AlertCircle size={14} /> {errors.expiry}
                </span>
              )}

              {/* Holder Name */}
              <div className={styles.field}>
                <label htmlFor="holderName">Tên chủ thẻ *</label>
                <input
                  id="holderName"
                  type="text"
                  placeholder="NGUYEN VAN A"
                  value={cardData.holderName}
                  onChange={(e) => handleCardChange('holderName', e.target.value.toUpperCase())}
                  className={errors.holderName ? styles.error : ''}
                />
                {errors.holderName && (
                  <span className={styles.errorMsg}>
                    <AlertCircle size={14} /> {errors.holderName}
                  </span>
                )}
              </div>

              {/* Brand */}
              <div className={styles.field}>
                <label htmlFor="brand">Loại thẻ</label>
                <select
                  id="brand"
                  value={cardData.brand}
                  onChange={(e) => handleCardChange('brand', e.target.value)}
                >
                  {Object.keys(CARD_BRANDS).map(brand => (
                    <option key={brand} value={brand}>
                      {CARD_BRANDS[brand].icon} {CARD_BRANDS[brand].name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              {/* E-wallet Provider */}
              <div className={styles.field}>
                <label htmlFor="provider">Nhà cung cấp</label>
                <select
                  id="provider"
                  value={ewalletData.provider}
                  onChange={(e) => handleEwalletChange('provider', e.target.value)}
                >
                  {Object.keys(EWALLET_PROVIDERS).map(provider => (
                    <option key={provider} value={provider}>
                      {EWALLET_PROVIDERS[provider].icon} {EWALLET_PROVIDERS[provider].name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Number */}
              <div className={styles.field}>
                <label htmlFor="phoneNumber">Số điện thoại *</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0901234567"
                  value={ewalletData.phoneNumber}
                  onChange={(e) => handleEwalletChange('phoneNumber', e.target.value)}
                  maxLength="10"
                />
              </div>

              {/* Account Name */}
              <div className={styles.field}>
                <label htmlFor="accountName">Tên tài khoản *</label>
                <input
                  id="accountName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={ewalletData.accountName}
                  onChange={(e) => handleEwalletChange('accountName', e.target.value)}
                />
              </div>
            </>
          )}

          {/* Security Note */}
          <div className={styles.securityNote}>
            <AlertCircle size={16} />
            <div>
              <strong>Bảo mật thông tin</strong>
              <p>Chúng tôi không lưu trữ số thẻ đầy đủ hoặc mã CVV. Thông tin được mã hóa và tuân thủ chuẩn PCI DSS.</p>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.btnCancel}>
              Hủy
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Đang thêm...' : 'Thêm phương thức'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

AddPaymentSheet.displayName = 'AddPaymentSheet';

export default AddPaymentSheet;
