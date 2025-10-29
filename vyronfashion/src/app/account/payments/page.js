'use client';

import { useState, useCallback, useMemo } from 'react';
import { Plus, Shield } from 'lucide-react';
import { PageHeader } from '@/components/account/ui/PageHeader';
import PaymentCard from '@/features/payments/components/PaymentCard';
import AddPaymentSheet from '@/features/payments/components/AddPaymentSheet';
import { 
  mockPaymentMethods,
  setDefaultPaymentMethod,
  removePaymentMethod,
  groupPaymentsByType,
  getPaymentStats,
  PAYMENT_TYPES,
  PCI_COMPLIANCE_NOTE
} from '@/lib/mockPaymentData';
import styles from './page.module.css';

export default function PaymentsPage() {
  const [payments, setPayments] = useState(mockPaymentMethods);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Get payment stats (memoized)
  const stats = useMemo(() => getPaymentStats(payments), [payments]);

  // Group payments by type (memoized)
  const groupedPayments = useMemo(() => groupPaymentsByType(payments), [payments]);

  // Handle set default
  const handleSetDefault = useCallback((paymentId) => {
    setPayments(prev => setDefaultPaymentMethod(prev, paymentId));
  }, []);

  // Handle delete
  const handleDelete = useCallback((paymentId) => {
    const payment = payments.find(p => p.id === paymentId);
    
    if (payment?.isDefault && payments.length > 1) {
      alert('Vui lòng đặt phương thức khác làm mặc định trước khi xóa.');
      return;
    }

    const confirmed = window.confirm(
      'Bạn có chắc muốn xóa phương thức thanh toán này?'
    );
    
    if (confirmed) {
      setPayments(prev => removePaymentMethod(prev, paymentId));
    }
  }, [payments]);

  // Handle add new payment
  const handleAddPayment = useCallback((newPayment) => {
    setPayments(prev => [...prev, newPayment]);
  }, []);

  return (
    <div className={styles.paymentsPage}>
      <PageHeader
        title="Phương Thức Thanh Toán"
        description="Quản lý thẻ tín dụng và ví điện tử của bạn"
        actions={
          <button
            onClick={() => setIsSheetOpen(true)}
            className={styles.btnAdd}
          >
            <Plus size={20} />
            Thêm phương thức
          </button>
        }
      />

      <div className={styles.content}>
        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>Tổng số</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.cards}</div>
            <div className={styles.statLabel}>Thẻ ngân hàng</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.ewallets}</div>
            <div className={styles.statLabel}>Ví điện tử</div>
          </div>
          {stats.expired > 0 && (
            <div className={`${styles.statCard} ${styles.warning}`}>
              <div className={styles.statValue}>{stats.expired}</div>
              <div className={styles.statLabel}>Thẻ hết hạn</div>
            </div>
          )}
        </div>

        {/* Cards Section */}
        {groupedPayments[PAYMENT_TYPES.CARD]?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Thẻ Tín Dụng/Ghi Nợ ({groupedPayments[PAYMENT_TYPES.CARD].length})
            </h2>
            <div className={styles.paymentsList}>
              {groupedPayments[PAYMENT_TYPES.CARD].map(payment => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onSetDefault={handleSetDefault}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )}

        {/* E-wallets Section */}
        {groupedPayments[PAYMENT_TYPES.EWALLET]?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Ví Điện Tử ({groupedPayments[PAYMENT_TYPES.EWALLET].length})
            </h2>
            <div className={styles.paymentsList}>
              {groupedPayments[PAYMENT_TYPES.EWALLET].map(payment => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onSetDefault={handleSetDefault}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {payments.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>💳</div>
            <h3>Chưa có phương thức thanh toán</h3>
            <p>Thêm thẻ ngân hàng hoặc ví điện tử để thanh toán nhanh hơn</p>
            <button
              onClick={() => setIsSheetOpen(true)}
              className={styles.btnAddEmpty}
            >
              <Plus size={20} />
              Thêm phương thức
            </button>
          </div>
        )}

        {/* Security Notice */}
        <div className={styles.securityNotice}>
          <Shield size={20} />
          <div>
            <strong>Bảo mật thông tin thanh toán</strong>
            <p>
              Chúng tôi không lưu trữ số thẻ đầy đủ hoặc mã CVV. 
              Tất cả thông tin thanh toán được mã hóa và tuân thủ chuẩn PCI DSS.
            </p>
          </div>
        </div>
      </div>

      {/* Add Payment Sheet */}
      <AddPaymentSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onAdd={handleAddPayment}
      />
    </div>
  );
}

