import { formatCurrency, REFUND_METHODS } from '@/lib/mockReturnsData';
import { CreditCard, Gift } from 'lucide-react';

export function RefundSummary({ returnData }) {
  const { refundAmount, refundMethod, refundStatus, estimatedRefundDate } = returnData;
  
  const refundMethodData = REFUND_METHODS[refundMethod];
  const bonusAmount = refundMethodData?.bonusPercentage 
    ? refundAmount * refundMethodData.bonusPercentage 
    : 0;
  const totalRefund = refundAmount + bonusAmount;

  const getRefundIcon = () => {
    return refundMethod === 'store_credit' ? <Gift size={20} /> : <CreditCard size={20} />;
  };

  return (
    <div className="refund-summary-container">
      <h3 className="refund-title">Thông Tin Hoàn Tiền</h3>
      
      <div className="refund-content">
        <div className="refund-method">
          <div className="method-icon">{getRefundIcon()}</div>
          <div className="method-info">
            <span className="method-label">Phương thức hoàn tiền</span>
            <span className="method-value">{refundMethodData?.label}</span>
          </div>
        </div>

        <div className="refund-breakdown">
          <div className="breakdown-row">
            <span>Giá trị sản phẩm:</span>
            <span className="amount">{formatCurrency(refundAmount)}</span>
          </div>
          
          {bonusAmount > 0 && (
            <div className="breakdown-row bonus">
              <span>
                Thưởng ({refundMethodData.bonusPercentage * 100}%):
              </span>
              <span className="amount bonus-amount">
                +{formatCurrency(bonusAmount)}
              </span>
            </div>
          )}
          
          <div className="breakdown-divider" />
          
          <div className="breakdown-row total">
            <span>Tổng hoàn tiền:</span>
            <span className="amount total-amount">
              {formatCurrency(totalRefund)}
            </span>
          </div>
        </div>

        {refundStatus && (
          <div className={`refund-status status-${refundStatus}`}>
            {refundStatus === 'pending' && 'Đang chờ xử lý'}
            {refundStatus === 'processing' && 'Đang xử lý hoàn tiền'}
            {refundStatus === 'completed' && 'Đã hoàn tiền thành công'}
          </div>
        )}

        {estimatedRefundDate && (
          <div className="estimated-date">
            <span className="date-label">Dự kiến hoàn tiền:</span>
            <span className="date-value">
              {new Date(estimatedRefundDate).toLocaleDateString('vi-VN')}
            </span>
          </div>
        )}

        {refundMethod === 'store_credit' && bonusAmount > 0 && (
          <div className="refund-note">
            <Gift size={16} />
            <p>
              Bạn nhận thêm {formatCurrency(bonusAmount)} khi chọn hoàn tiền 
              bằng Store Credit!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
