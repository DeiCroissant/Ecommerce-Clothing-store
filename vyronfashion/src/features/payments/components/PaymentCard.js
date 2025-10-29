import React from 'react';
import { CreditCard, Smartphone, Trash2, Check } from 'lucide-react';
import { 
  formatCardNumber, 
  formatExpiry, 
  isCardExpired,
  getCardBrand,
  getEwalletProvider,
  PAYMENT_TYPES 
} from '@/lib/mockPaymentData';
import styles from './PaymentCard.module.css';

// Memoized PaymentCard component
const PaymentCard = React.memo(({ 
  payment, 
  onSetDefault, 
  onDelete 
}) => {
  const isCard = payment.type === PAYMENT_TYPES.CARD;
  const isExpired = isCard && isCardExpired(payment.expiryMonth, payment.expiryYear);

  // Handle set default
  const handleSetDefault = React.useCallback(() => {
    if (!payment.isDefault) {
      onSetDefault?.(payment.id);
    }
  }, [payment.id, payment.isDefault, onSetDefault]);

  // Handle delete
  const handleDelete = React.useCallback(() => {
    onDelete?.(payment.id);
  }, [payment.id, onDelete]);

  return (
    <div 
      className={`${styles.paymentCard} ${payment.isDefault ? styles.default : ''} ${isExpired ? styles.expired : ''}`}
      role="article"
      aria-label={isCard ? `Thẻ ${payment.brand} cuối ${payment.last4}` : `${payment.provider} ${payment.phoneNumber}`}
    >
      {/* Card/Wallet Icon */}
      <div className={styles.icon}>
        {isCard ? (
          <CreditCard size={24} />
        ) : (
          <Smartphone size={24} />
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {isCard ? (
          <>
            <div className={styles.brandRow}>
              <span className={styles.brand}>
                {getCardBrand(payment.brand).icon} {getCardBrand(payment.brand).name}
              </span>
              {isExpired && (
                <span className={styles.expiredBadge}>Hết hạn</span>
              )}
            </div>
            <div className={styles.number}>{formatCardNumber(payment.last4)}</div>
            <div className={styles.meta}>
              <span>Hạn dùng: {formatExpiry(payment.expiryMonth, payment.expiryYear)}</span>
              <span>{payment.holderName}</span>
            </div>
          </>
        ) : (
          <>
            <div className={styles.brandRow}>
              <span 
                className={styles.ewallet}
                style={{ color: getEwalletProvider(payment.provider).color }}
              >
                {getEwalletProvider(payment.provider).icon} {getEwalletProvider(payment.provider).name}
              </span>
              {payment.isVerified && (
                <span className={styles.verifiedBadge}>
                  <Check size={12} /> Đã xác thực
                </span>
              )}
            </div>
            <div className={styles.phone}>{payment.phoneNumber}</div>
            <div className={styles.meta}>
              <span>{payment.accountName}</span>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {payment.isDefault ? (
          <span className={styles.defaultBadge}>
            <Check size={14} /> Mặc định
          </span>
        ) : (
          <button
            onClick={handleSetDefault}
            className={styles.btnSetDefault}
            aria-label="Đặt làm mặc định"
          >
            Đặt mặc định
          </button>
        )}
        
        <button
          onClick={handleDelete}
          className={styles.btnDelete}
          disabled={payment.isDefault}
          aria-label="Xóa phương thức thanh toán"
          title={payment.isDefault ? 'Không thể xóa phương thức mặc định' : 'Xóa'}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if these props change
  return (
    prevProps.payment.id === nextProps.payment.id &&
    prevProps.payment.isDefault === nextProps.payment.isDefault &&
    prevProps.onSetDefault === nextProps.onSetDefault &&
    prevProps.onDelete === nextProps.onDelete
  );
});

PaymentCard.displayName = 'PaymentCard';

export default PaymentCard;
