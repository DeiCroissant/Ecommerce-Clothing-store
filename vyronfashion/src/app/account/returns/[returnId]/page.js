'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/account/ui/PageHeader';
import { ReturnDetailTimeline } from '@/features/returns/components/ReturnDetailTimeline';
import { ReturnProducts } from '@/features/returns/components/ReturnProducts';
import { RefundSummary } from '@/features/returns/components/RefundSummary';
import { 
  getReturnById, 
  generateReturnTimeline, 
  canCancelReturn,
  getReturnStatusInfo,
  formatCurrency
} from '@/lib/mockReturnsData';
import { formatDate } from '@/lib/mockOrdersData';
import { 
  ArrowLeft, 
  RotateCcw, 
  Package, 
  Upload, 
  MessageCircle,
  XCircle
} from 'lucide-react';
import '@/styles/account-returns.css';

export default function ReturnDetailPage({ params }) {
  const router = useRouter();
  const { returnId } = params;
  const [returnData, setReturnData] = useState(() => getReturnById(returnId));

  if (!returnData) {
    return (
      <div className="return-not-found-page">
        <PageHeader
          title="Không tìm thấy yêu cầu"
          description="Yêu cầu trả hàng không tồn tại"
        />
        <div className="return-not-found">
          <RotateCcw size={64} className="not-found-icon" />
          <h2>Không tìm thấy yêu cầu trả hàng</h2>
          <p>Yêu cầu trả hàng với mã {returnId} không tồn tại hoặc đã bị xóa.</p>
          <Link href="/account/returns" className="btn btn-primary">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const timeline = generateReturnTimeline(returnData);
  const statusInfo = getReturnStatusInfo(returnData.status);
  const canCancel = canCancelReturn(returnData);

  const handleCancelReturn = () => {
    const confirmed = window.confirm('Bạn có chắc muốn hủy yêu cầu trả hàng này?');
    
    if (confirmed) {
      setReturnData({
        ...returnData,
        status: 'rejected',
        rejectReason: 'Khách hàng hủy yêu cầu'
      });
    }
  };

  const handleUploadMorePhotos = () => {
    alert('Tính năng upload thêm ảnh đang được phát triển');
  };

  const handleContactSupport = () => {
    alert('Tính năng liên hệ hỗ trợ đang được phát triển');
  };

  return (
    <div className="return-detail-page">
      <PageHeader
        title={`Yêu cầu trả hàng ${returnId}`}
        description={`Đơn hàng: ${returnData.orderId} • ${statusInfo.label} • ${formatDate(returnData.createdAt)}`}
        actions={
          <div className="header-actions">
            {canCancel && (
              <button 
                onClick={handleCancelReturn}
                className="btn btn-danger"
              >
                <XCircle size={20} />
                Hủy yêu cầu
              </button>
            )}
            <button 
              onClick={handleContactSupport}
              className="btn btn-secondary"
            >
              <MessageCircle size={20} />
              Liên hệ hỗ trợ
            </button>
          </div>
        }
      />
      
      <div className="return-detail-page-container">
        {/* Back Button */}
        <Link href="/account/returns" className="back-link">
          <ArrowLeft size={20} />
          Quay lại danh sách
        </Link>

        {/* Main Content - 2 columns on desktop */}
        <div className="return-detail-content">
          {/* Left Column - Timeline & Products */}
          <div className="detail-left-column">
            <ReturnDetailTimeline 
              timeline={timeline} 
              currentStatus={returnData.status}
            />
            
            <ReturnProducts products={returnData.products} />

            {/* Return Info */}
            <div className="return-info-section">
              <h3 className="section-title">Thông Tin Yêu Cầu</h3>
              
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Lý do trả hàng:</span>
                  <span className="info-value">{returnData.reasonText}</span>
                </div>
                
                <div className="info-item full-width">
                  <span className="info-label">Mô tả chi tiết:</span>
                  <p className="info-description">{returnData.description}</p>
                </div>

                {returnData.trackingNumber && (
                  <div className="info-item">
                    <span className="info-label">Mã vận chuyển:</span>
                    <span className="info-value tracking-number">
                      {returnData.trackingNumber}
                    </span>
                  </div>
                )}

                {returnData.rejectReason && (
                  <div className="info-item full-width reject-reason">
                    <span className="info-label">Lý do từ chối:</span>
                    <p className="info-value">{returnData.rejectReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Photos */}
            {returnData.photos && returnData.photos.length > 0 && (
              <div className="return-photos-section">
                <div className="photos-header">
                  <h3 className="section-title">Hình Ảnh Đính Kèm</h3>
                  {returnData.status === 'pending' && (
                    <button 
                      onClick={handleUploadMorePhotos}
                      className="upload-more-btn"
                    >
                      <Upload size={16} />
                      Thêm ảnh
                    </button>
                  )}
                </div>
                <div className="photos-grid">
                  {returnData.photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img src={photo} alt={`Ảnh ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Refund Summary */}
          <div className="detail-right-column">
            <RefundSummary returnData={returnData} />

            {/* Order Reference Card */}
            <div className="order-reference-card">
              <div className="card-header">
                <Package size={20} />
                <span>Đơn hàng gốc</span>
              </div>
              <div className="card-content">
                <div className="order-info-row">
                  <span>Mã đơn hàng:</span>
                  <Link href={`/account/orders/${returnData.orderId}`} className="order-link">
                    {returnData.orderId}
                  </Link>
                </div>
                <div className="order-info-row">
                  <span>Tổng đơn hàng:</span>
                  <span className="order-total">
                    {formatCurrency(returnData.originalOrderTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="help-card">
              <MessageCircle size={20} />
              <div>
                <strong>Cần hỗ trợ?</strong>
                <p>Liên hệ với chúng tôi nếu có bất kỳ thắc mắc nào về yêu cầu trả hàng.</p>
                <button 
                  onClick={handleContactSupport}
                  className="help-btn"
                >
                  Liên hệ ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
