'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader, LoadingSkeleton } from '@/components/account'
import { ArrowLeft, PackageX, CheckCircle, Clock, XCircle, AlertCircle, FileText } from 'lucide-react'
import * as returnsAPI from '@/lib/api/returns'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

function getCurrentUserId() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.id || user._id || null;
  } catch {
    return null;
  }
}

const statusConfig = {
  pending: {
    label: 'Chờ xử lý',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    icon: Clock,
    description: 'Yêu cầu trả hàng đang chờ xử lý'
  },
  approved: {
    label: 'Đã duyệt',
    color: '#10b981',
    bgColor: '#d1fae5',
    icon: CheckCircle,
    description: 'Yêu cầu trả hàng đã được duyệt'
  },
  processing: {
    label: 'Đang xử lý',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    icon: Clock,
    description: 'Yêu cầu trả hàng đang được xử lý'
  },
  completed: {
    label: 'Hoàn thành',
    color: '#10b981',
    bgColor: '#d1fae5',
    icon: CheckCircle,
    description: 'Yêu cầu trả hàng đã hoàn thành và tiền đã được hoàn'
  },
  rejected: {
    label: 'Từ chối',
    color: '#ef4444',
    bgColor: '#fee2e2',
    icon: XCircle,
    description: 'Yêu cầu trả hàng đã bị từ chối'
  }
}

export default function ReturnDetailPage() {
  const params = useParams()
  const router = useRouter()
  const returnId = params?.returnId
  const [returnRequest, setReturnRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!returnId) return;
    
    const userId = getCurrentUserId();
    if (!userId) {
      router.push('/');
      return;
    }

    fetchReturn();

    // Listen for return updates
    const handleReturnsChanged = () => {
      fetchReturn();
    };

    window.addEventListener('returnsChanged', handleReturnsChanged);
    
    return () => {
      window.removeEventListener('returnsChanged', handleReturnsChanged);
    };
  }, [returnId, router])

  const fetchReturn = async () => {
    try {
      setLoading(true)
      setError(null)
      const returnData = await returnsAPI.getReturn(returnId);
      
      if (!returnData) {
        setError('Không tìm thấy yêu cầu trả hàng')
        return
      }

      setReturnRequest(returnData)
    } catch (error) {
      console.error('Error fetching return:', error)
      setError(error.message || 'Không thể tải thông tin yêu cầu trả hàng')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="return-detail-page">
        <PageHeader title="Chi tiết yêu cầu trả hàng" />
        <LoadingSkeleton type="card" count={3} />
      </div>
    )
  }

  if (error || !returnRequest) {
    return (
      <div className="return-detail-page">
        <PageHeader title="Chi tiết yêu cầu trả hàng" />
        <div className="error-state">
          <AlertCircle size={48} />
          <h2>Không tìm thấy yêu cầu trả hàng</h2>
          <p>{error || 'Yêu cầu trả hàng không tồn tại'}</p>
          <Link href="/account/returns" className="btn-primary">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  const status = statusConfig[returnRequest.status] || statusConfig.pending
  const StatusIcon = status.icon

  // Format dates
  let formattedCreatedDate = ''
  let formattedUpdatedDate = ''
  let formattedRefundDate = ''
  
  try {
    if (returnRequest.created_at) {
      formattedCreatedDate = format(new Date(returnRequest.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })
    }
    if (returnRequest.updated_at) {
      formattedUpdatedDate = format(new Date(returnRequest.updated_at), 'dd/MM/yyyy HH:mm', { locale: vi })
    }
    if (returnRequest.refund_date) {
      formattedRefundDate = format(new Date(returnRequest.refund_date), 'dd/MM/yyyy', { locale: vi })
    }
  } catch (e) {
    formattedCreatedDate = returnRequest.created_at || ''
    formattedUpdatedDate = returnRequest.updated_at || ''
    formattedRefundDate = returnRequest.refund_date || ''
  }

  return (
    <div className="return-detail-page">
      <PageHeader title="Chi tiết yêu cầu trả hàng" />

      <Link href="/account/returns" className="back-link">
        <ArrowLeft size={20} />
        <span>Quay lại</span>
      </Link>

      <div className="return-detail-content">
        {/* Header Info */}
        <div className="return-header-card">
          <div className="return-header-info">
            <div className="return-number-section">
              <PackageX size={24} />
              <div>
                <h2 className="return-number">
                  #{returnRequest.return_number || returnRequest.id}
                </h2>
                <p className="return-date">
                  Ngày tạo: {formattedCreatedDate}
                </p>
              </div>
            </div>
            <div className="return-status-badge" style={{
              backgroundColor: status.bgColor,
              color: status.color
            }}>
              <StatusIcon size={18} />
              <span>{status.label}</span>
            </div>
          </div>
          <p className="return-description">{status.description}</p>
        </div>

        {/* Products List */}
        <div className="return-section">
          <h3 className="section-title">Sản phẩm trả hàng</h3>
          <div className="products-list">
            {returnRequest.items?.map((item, index) => (
              <div key={item.product_id || index} className="product-card">
                <img
                  src={item.product_image || '/images/placeholders/product-placeholder.svg'}
                  alt={item.product_name}
                  className="product-image"
                />
                <div className="product-info">
                  <h4 className="product-name">{item.product_name}</h4>
                  <div className="product-meta">
                    <span>Số lượng: {item.quantity}</span>
                    <span className="product-price">
                      {typeof item.price === 'number'
                        ? item.price.toLocaleString('vi-VN')
                        : '0'
                      }₫
                    </span>
                  </div>
                  {item.reason && (
                    <div className="product-reason">
                      <strong>Lý do:</strong> {item.reason}
                    </div>
                  )}
                </div>
                <div className="product-total">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Return Details */}
        <div className="return-section">
          <h3 className="section-title">Thông tin yêu cầu</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Mã đơn hàng:</label>
              <span>#{returnRequest.order_id}</span>
            </div>
            <div className="info-item">
              <label>Lý do trả hàng:</label>
              <span>{returnRequest.reason}</span>
            </div>
            {returnRequest.description && (
              <div className="info-item full-width">
                <label>Mô tả chi tiết:</label>
                <span>{returnRequest.description}</span>
              </div>
            )}
            <div className="info-item">
              <label>Phương thức hoàn tiền:</label>
              <span>
                {returnRequest.refund_method === 'original' 
                  ? 'Hoàn về phương thức thanh toán gốc'
                  : returnRequest.refund_method === 'bank_transfer'
                  ? `Chuyển khoản ngân hàng${returnRequest.bank_account ? ` (${returnRequest.bank_account})` : ''}`
                  : returnRequest.refund_method
                }
              </span>
            </div>
            {returnRequest.updated_at && (
              <div className="info-item">
                <label>Cập nhật lần cuối:</label>
                <span>{formattedUpdatedDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Refund Summary */}
        {returnRequest.refund_amount && (
          <div className="return-section refund-section">
            <h3 className="section-title">Thông tin hoàn tiền</h3>
            <div className="refund-summary">
              <div className="refund-item">
                <span className="refund-label">Số tiền hoàn:</span>
                <span className="refund-amount">
                  {typeof returnRequest.refund_amount === 'number'
                    ? returnRequest.refund_amount.toLocaleString('vi-VN')
                    : returnRequest.refund_amount
                  }₫
                </span>
              </div>
              {returnRequest.refund_date && (
                <div className="refund-item">
                  <span className="refund-label">Ngày hoàn tiền:</span>
                  <span>{formattedRefundDate}</span>
                </div>
              )}
              {returnRequest.status === 'completed' && (
                <div className="refund-status">
                  <CheckCircle size={20} />
                  <span>Tiền đã được hoàn thành công</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin Note */}
        {returnRequest.admin_note && (
          <div className="return-section admin-note-section">
            <h3 className="section-title">Ghi chú từ hệ thống</h3>
            <div className="admin-note">
              <p>{returnRequest.admin_note}</p>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="return-section">
          <h3 className="section-title">Tiến trình xử lý</h3>
          <div className="timeline">
            <div className={`timeline-item ${returnRequest.status !== 'rejected' ? 'active' : ''}`}>
              <div className="timeline-icon">
                <CheckCircle size={20} />
              </div>
              <div className="timeline-content">
                <h4>Yêu cầu đã được tạo</h4>
                <p>{formattedCreatedDate}</p>
              </div>
            </div>

            {returnRequest.status === 'approved' && (
              <div className="timeline-item active">
                <div className="timeline-icon">
                  <CheckCircle size={20} />
                </div>
                <div className="timeline-content">
                  <h4>Yêu cầu đã được duyệt</h4>
                  <p>{formattedUpdatedDate || 'Đang xử lý...'}</p>
                </div>
              </div>
            )}

            {returnRequest.status === 'processing' && (
              <div className="timeline-item active">
                <div className="timeline-icon">
                  <Clock size={20} />
                </div>
                <div className="timeline-content">
                  <h4>Đang xử lý hoàn tiền</h4>
                  <p>Đang xử lý...</p>
                </div>
              </div>
            )}

            {returnRequest.status === 'completed' && (
              <>
                <div className="timeline-item active">
                  <div className="timeline-icon">
                    <CheckCircle size={20} />
                  </div>
                  <div className="timeline-content">
                    <h4>Đã hoàn tiền</h4>
                    <p>{formattedRefundDate || formattedUpdatedDate}</p>
                  </div>
                </div>
                <div className="timeline-item active">
                  <div className="timeline-icon">
                    <CheckCircle size={20} />
                  </div>
                  <div className="timeline-content">
                    <h4>Hoàn thành</h4>
                    <p>Yêu cầu trả hàng đã hoàn thành</p>
                  </div>
                </div>
              </>
            )}

            {returnRequest.status === 'rejected' && (
              <div className="timeline-item rejected">
                <div className="timeline-icon">
                  <XCircle size={20} />
                </div>
                <div className="timeline-content">
                  <h4>Yêu cầu bị từ chối</h4>
                  <p>{formattedUpdatedDate || 'Đã từ chối'}</p>
                  {returnRequest.admin_note && (
                    <p className="rejection-note">{returnRequest.admin_note}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="return-actions">
          <Link href="/account/returns" className="btn-secondary">
            Quay lại danh sách
          </Link>
          {returnRequest.status === 'pending' && (
            <Link href={`/account/orders/${returnRequest.order_id}`} className="btn-primary">
              <FileText size={18} />
              <span>Xem đơn hàng</span>
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .return-detail-page {
          max-width: 1200px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          color: #71717a;
          text-decoration: none;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #18181b;
        }

        .return-detail-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .return-header-card {
          background: white;
          border: 1px solid #e4e4e7;
          border-radius: 0.75rem;
          padding: 2rem;
        }

        .return-header-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .return-number-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .return-number-section svg {
          color: #18181b;
        }

        .return-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #18181b;
          margin: 0 0 0.25rem 0;
        }

        .return-date {
          font-size: 0.875rem;
          color: #71717a;
          margin: 0;
        }

        .return-status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .return-description {
          color: #71717a;
          margin: 0;
          font-size: 0.875rem;
        }

        .return-section {
          background: white;
          border: 1px solid #e4e4e7;
          border-radius: 0.75rem;
          padding: 2rem;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #18181b;
          margin: 0 0 1.5rem 0;
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .product-card {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: #fafafa;
          border-radius: 0.75rem;
        }

        .product-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 0.5rem;
        }

        .product-info {
          flex: 1;
        }

        .product-name {
          font-weight: 600;
          color: #18181b;
          margin: 0 0 0.5rem 0;
        }

        .product-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #71717a;
          margin-bottom: 0.5rem;
        }

        .product-price {
          font-weight: 600;
          color: #18181b;
        }

        .product-reason {
          font-size: 0.875rem;
          color: #71717a;
        }

        .product-total {
          font-weight: 700;
          color: #10b981;
          font-size: 1.125rem;
          align-self: center;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .info-item.full-width {
          grid-column: 1 / -1;
        }

        .info-item label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #71717a;
        }

        .info-item span {
          font-size: 0.9375rem;
          color: #18181b;
        }

        .refund-section {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }

        .refund-summary {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .refund-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: white;
          border-radius: 0.5rem;
        }

        .refund-label {
          font-weight: 500;
          color: #18181b;
        }

        .refund-amount {
          font-size: 1.25rem;
          font-weight: 700;
          color: #10b981;
        }

        .refund-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: white;
          border-radius: 0.5rem;
          color: #10b981;
          font-weight: 500;
        }

        .admin-note-section {
          background: #fef3c7;
          border-color: #fbbf24;
        }

        .admin-note {
          background: white;
          padding: 1rem;
          border-radius: 0.5rem;
        }

        .admin-note p {
          margin: 0;
          color: #18181b;
        }

        .timeline {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
          padding-left: 2rem;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 0.75rem;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e4e4e7;
        }

        .timeline-item {
          display: flex;
          gap: 1rem;
          position: relative;
        }

        .timeline-item.active .timeline-icon {
          background: #10b981;
          color: white;
        }

        .timeline-item.rejected .timeline-icon {
          background: #ef4444;
          color: white;
        }

        .timeline-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: #e4e4e7;
          color: #71717a;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        .timeline-content {
          flex: 1;
          padding-top: 0.25rem;
        }

        .timeline-content h4 {
          font-weight: 600;
          color: #18181b;
          margin: 0 0 0.25rem 0;
        }

        .timeline-content p {
          font-size: 0.875rem;
          color: #71717a;
          margin: 0;
        }

        .rejection-note {
          margin-top: 0.5rem !important;
          color: #ef4444 !important;
          font-weight: 500;
        }

        .return-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 2rem;
          border-top: 1px solid #e4e4e7;
        }

        .btn-primary,
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }

        .btn-primary {
          background: #18181b;
          color: white;
        }

        .btn-primary:hover {
          background: #27272a;
        }

        .btn-secondary {
          background: white;
          color: #18181b;
          border: 1px solid #e4e4e7;
        }

        .btn-secondary:hover {
          background: #fafafa;
        }

        .error-state {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 0.75rem;
          border: 1px solid #e4e4e7;
        }

        .error-state svg {
          color: #ef4444;
          margin-bottom: 1rem;
        }

        .error-state h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #18181b;
          margin-bottom: 0.5rem;
        }

        .error-state p {
          color: #71717a;
          margin-bottom: 2rem;
        }

        @media (max-width: 640px) {
          .info-grid {
            grid-template-columns: 1fr;
          }

          .return-header-info {
            flex-direction: column;
            gap: 1rem;
          }

          .return-actions {
            flex-direction: column;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}

