'use client';

import { PageHeader } from '@/components/account/ui/PageHeader';
import { ReturnRequestForm } from '@/features/returns/components/ReturnRequestForm';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { getEligibleOrders, RETURN_WINDOW_DAYS } from '@/lib/mockReturnsData';
import '@/styles/account-returns.css';

export default function NewReturnPage() {
  const eligibleOrders = getEligibleOrders();

  return (
    <div className="new-return-page">
      <PageHeader
        title="Tạo Yêu Cầu Trả Hàng"
        description="Điền thông tin để gửi yêu cầu trả hàng và hoàn tiền"
      />

      {/* Info Box */}
      <div className="return-info-box">
        <AlertCircle size={20} />
        <div>
          <strong>Điều kiện trả hàng:</strong>
          <ul>
            <li>Đơn hàng đã được giao trong vòng {RETURN_WINDOW_DAYS} ngày</li>
            <li>Sản phẩm còn nguyên tem mác, chưa qua sử dụng</li>
            <li>Có hóa đơn mua hàng và đầy đủ phụ kiện đi kèm</li>
          </ul>
        </div>
      </div>

      {/* Form */}
      {eligibleOrders.length > 0 ? (
        <div className="return-form-card">
          <ReturnRequestForm />
        </div>
      ) : (
        <div className="no-eligible-orders">
          <RotateCcw size={48} className="no-orders-icon" />
          <h3>Không có đơn hàng đủ điều kiện</h3>
          <p>
            Bạn không có đơn hàng nào đủ điều kiện để trả hàng. 
            Đơn hàng phải được giao trong vòng {RETURN_WINDOW_DAYS} ngày.
          </p>
          <a href="/account/orders" className="btn btn-secondary">
            Xem đơn hàng
          </a>
        </div>
      )}
    </div>
  );
}
