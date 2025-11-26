'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/account'
import { ArrowLeft, Package, AlertCircle, CheckCircle } from 'lucide-react'
import * as returnsAPI from '@/lib/api/returns'
import * as orderAPI from '@/lib/api/orders'

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

function NewReturnPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderIdParam = searchParams.get('orderId')
  
  const [userId, setUserId] = useState(null)
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [refundMethod, setRefundMethod] = useState('original')
  const [bankAccount, setBankAccount] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      router.push('/');
      return;
    }
    setUserId(currentUserId);
    fetchOrders(currentUserId);
  }, [router])

  useEffect(() => {
    if (orderIdParam && orders.length > 0) {
      const order = orders.find(o => (o.id || o._id) === orderIdParam);
      if (order) {
        setSelectedOrder(order);
      }
    }
  }, [orderIdParam, orders])

  const fetchOrders = async (userId) => {
    try {
      setLoading(true)
      const response = await orderAPI.getUserOrders(userId);
      const ordersData = response.orders || [];
      
      // Chỉ lấy đơn hàng đã giao hoặc hoàn thành
      const eligibleOrders = ordersData.filter(order => 
        order.status === 'delivered' || order.status === 'completed'
      );
      
      setOrders(eligibleOrders);
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Không thể tải danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const handleOrderSelect = (order) => {
    setSelectedOrder(order)
    setSelectedItems([])
  }

  const handleItemToggle = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.product_id === item.product_id);
      if (exists) {
        return prev.filter(i => i.product_id !== item.product_id);
      } else {
        return [...prev, {
          product_id: item.product_id || item.id,
          product_name: item.product_name || item.name,
          product_image: item.product_image || item.image,
          quantity: 1,
          reason: reason,
          price: item.price || item.pricing?.sale || item.pricing?.original || 0
        }];
      }
    })
  }

  const handleItemQuantityChange = (productId, quantity) => {
    if (quantity < 1) return;
    setSelectedItems(prev => 
      prev.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: Math.min(quantity, getMaxQuantity(productId)) }
          : item
      )
    )
  }

  const handleItemReasonChange = (productId, reason) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.product_id === productId 
          ? { ...item, reason }
          : item
      )
    )
  }

  const getMaxQuantity = (productId) => {
    if (!selectedOrder) return 0;
    const item = selectedOrder.items?.find(i => (i.product_id || i.id) === productId);
    return item?.quantity || 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedOrder) {
      setError('Vui lòng chọn đơn hàng')
      return
    }

    if (selectedItems.length === 0) {
      setError('Vui lòng chọn ít nhất một sản phẩm để trả')
      return
    }

    if (!reason.trim()) {
      setError('Vui lòng nhập lý do trả hàng')
      return
    }

    // Validate mỗi item phải có reason
    const itemsWithoutReason = selectedItems.filter(item => !item.reason.trim())
    if (itemsWithoutReason.length > 0) {
      setError('Vui lòng nhập lý do cho từng sản phẩm')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const returnData = {
        order_id: selectedOrder.id || selectedOrder._id,
        items: selectedItems.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          quantity: item.quantity,
          reason: item.reason,
          price: item.price
        })),
        reason: reason,
        description: description || undefined,
        refund_method: refundMethod,
        bank_account: refundMethod === 'bank_transfer' ? bankAccount : undefined,
        photos: [] // TODO: Implement photo upload
      }

      const result = await returnsAPI.createReturn(returnData, userId);
      
      setSuccess(true)
      
      // Dispatch event để refresh returns list
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('returnsChanged'))
      }

      // Redirect sau 2 giây
      setTimeout(() => {
        router.push(`/account/returns/${result.id}`)
      }, 2000)
    } catch (error) {
      console.error('Error creating return:', error)
      setError(error.message || 'Có lỗi xảy ra khi tạo yêu cầu trả hàng')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="new-return-page">
        <PageHeader title="Tạo yêu cầu trả hàng" />
        <div className="loading">Đang tải...</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="new-return-page">
        <PageHeader title="Tạo yêu cầu trả hàng" />
        <div className="success-message">
          <CheckCircle size={48} className="success-icon" />
          <h2>Yêu cầu trả hàng đã được tạo thành công!</h2>
          <p>Bạn sẽ được chuyển đến trang chi tiết...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="new-return-page">
      <PageHeader
        title="Tạo yêu cầu trả hàng"
        description="Chọn đơn hàng và sản phẩm bạn muốn trả"
      />

      <Link href="/account/returns" className="back-link">
        <ArrowLeft size={20} />
        <span>Quay lại</span>
      </Link>

      <form onSubmit={handleSubmit} className="return-form">
        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Chọn đơn hàng */}
        <div className="form-section">
          <h3 className="section-title">1. Chọn đơn hàng</h3>
          {orders.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <p>Bạn chưa có đơn hàng nào đã giao để trả hàng</p>
              <Link href="/account/orders" className="btn-primary">
                Xem đơn hàng
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div
                  key={order.id || order._id}
                  className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                  onClick={() => handleOrderSelect(order)}
                >
                  <div className="order-info">
                    <div className="order-header">
                      <span className="order-number">#{order.orderNumber || order.order_number || order.id}</span>
                      <span className="order-date">{new Date(order.date || order.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="order-items-count">
                      {order.items?.length || 0} sản phẩm
                    </div>
                  </div>
                  <div className="order-total">
                    {typeof order.total === 'number' 
                      ? order.total.toLocaleString('vi-VN')
                      : order.total_amount?.toLocaleString('vi-VN') || '0'
                    }₫
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chọn sản phẩm */}
        {selectedOrder && (
          <>
            <div className="form-section">
              <h3 className="section-title">2. Chọn sản phẩm muốn trả</h3>
              <div className="products-list">
                {selectedOrder.items?.map((item, index) => {
                  const itemId = item.product_id || item.id
                  const isSelected = selectedItems.some(i => i.product_id === itemId)
                  const selectedItem = selectedItems.find(i => i.product_id === itemId)
                  
                  return (
                    <div key={itemId || index} className={`product-card ${isSelected ? 'selected' : ''}`}>
                      <div className="product-checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleItemToggle(item)}
                        />
                      </div>
                      <img
                        src={item.product_image || item.image || '/images/placeholders/product-placeholder.svg'}
                        alt={item.product_name || item.name}
                        className="product-image"
                      />
                      <div className="product-info">
                        <h4 className="product-name">{item.product_name || item.name}</h4>
                        <div className="product-meta">
                          <span>Số lượng đã mua: {item.quantity}</span>
                          <span className="product-price">
                            {typeof item.price === 'number'
                              ? item.price.toLocaleString('vi-VN')
                              : (item.pricing?.sale || item.pricing?.original || 0).toLocaleString('vi-VN')
                            }₫
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Chi tiết sản phẩm đã chọn */}
            {selectedItems.length > 0 && (
              <div className="form-section">
                <h3 className="section-title">3. Chi tiết sản phẩm trả</h3>
                <div className="selected-items-list">
                  {selectedItems.map((item, index) => (
                    <div key={item.product_id || index} className="selected-item-card">
                      <img
                        src={item.product_image || '/images/placeholders/product-placeholder.svg'}
                        alt={item.product_name}
                        className="item-image"
                      />
                      <div className="item-details">
                        <h4>{item.product_name}</h4>
                        <div className="item-controls">
                          <div className="quantity-control">
                            <label>Số lượng:</label>
                            <div className="quantity-input">
                              <button
                                type="button"
                                onClick={() => handleItemQuantityChange(item.product_id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleItemQuantityChange(item.product_id, item.quantity + 1)}
                                disabled={item.quantity >= getMaxQuantity(item.product_id)}
                              >
                                +
                              </button>
                            </div>
                            <span className="max-quantity">/ {getMaxQuantity(item.product_id)}</span>
                          </div>
                          <div className="reason-input">
                            <label>Lý do trả hàng *</label>
                            <select
                              value={item.reason || ''}
                              onChange={(e) => handleItemReasonChange(item.product_id, e.target.value)}
                              required
                            >
                              <option value="">Chọn lý do...</option>
                              <option value="Sản phẩm không đúng mô tả">Sản phẩm không đúng mô tả</option>
                              <option value="Sản phẩm bị lỗi">Sản phẩm bị lỗi</option>
                              <option value="Sản phẩm không vừa">Sản phẩm không vừa</option>
                              <option value="Không hài lòng với chất lượng">Không hài lòng với chất lượng</option>
                              <option value="Đổi ý">Đổi ý</option>
                              <option value="Khác">Khác</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="item-price">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lý do và mô tả */}
            <div className="form-section">
              <h3 className="section-title">4. Lý do trả hàng tổng quát</h3>
              <div className="form-group">
                <label htmlFor="reason">Lý do *</label>
                <input
                  id="reason"
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ví dụ: Sản phẩm không đúng như mô tả"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Mô tả chi tiết (tùy chọn)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Mô tả chi tiết về vấn đề bạn gặp phải..."
                />
              </div>
            </div>

            {/* Phương thức hoàn tiền */}
            <div className="form-section">
              <h3 className="section-title">5. Phương thức hoàn tiền</h3>
              <div className="form-group">
                <label>
                  <input
                    type="radio"
                    name="refundMethod"
                    value="original"
                    checked={refundMethod === 'original'}
                    onChange={(e) => setRefundMethod(e.target.value)}
                  />
                  <span>Hoàn về phương thức thanh toán gốc</span>
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="radio"
                    name="refundMethod"
                    value="bank_transfer"
                    checked={refundMethod === 'bank_transfer'}
                    onChange={(e) => setRefundMethod(e.target.value)}
                  />
                  <span>Chuyển khoản ngân hàng</span>
                </label>
                {refundMethod === 'bank_transfer' && (
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="Số tài khoản ngân hàng"
                    required={refundMethod === 'bank_transfer'}
                  />
                )}
              </div>
            </div>

            {/* Tổng tiền hoàn */}
            {selectedItems.length > 0 && (
              <div className="form-section summary">
                <h3 className="section-title">Tổng tiền hoàn</h3>
                <div className="refund-summary">
                  <div className="summary-item">
                    <span>Số sản phẩm:</span>
                    <span>{selectedItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="summary-item total">
                    <span>Tổng tiền hoàn:</span>
                    <span className="amount">
                      {selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit button */}
            <div className="form-actions">
              <Link href="/account/returns" className="btn-secondary">
                Hủy
              </Link>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || selectedItems.length === 0}
              >
                {submitting ? 'Đang xử lý...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </>
        )}
      </form>

      <style jsx>{`
        .new-return-page {
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

        .return-form {
          background: white;
          border-radius: 0.75rem;
          padding: 2rem;
          border: 1px solid #e4e4e7;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 0.5rem;
          margin-bottom: 2rem;
        }

        .success-message {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 0.75rem;
          border: 1px solid #e4e4e7;
        }

        .success-icon {
          color: #10b981;
          margin-bottom: 1rem;
        }

        .form-section {
          margin-bottom: 2.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #f4f4f5;
        }

        .form-section:last-child {
          border-bottom: none;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #18181b;
          margin-bottom: 1.5rem;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .order-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border: 2px solid #e4e4e7;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .order-card:hover {
          border-color: #18181b;
        }

        .order-card.selected {
          border-color: #18181b;
          background: #fafafa;
        }

        .order-info {
          flex: 1;
        }

        .order-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .order-number {
          font-weight: 600;
          color: #18181b;
        }

        .order-date {
          color: #71717a;
          font-size: 0.875rem;
        }

        .order-items-count {
          color: #71717a;
          font-size: 0.875rem;
        }

        .order-total {
          font-weight: 700;
          color: #18181b;
          font-size: 1.125rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #71717a;
        }

        .empty-state svg {
          margin-bottom: 1rem;
          color: #d4d4d8;
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .product-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 2px solid #e4e4e7;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .product-card:hover {
          border-color: #18181b;
        }

        .product-card.selected {
          border-color: #18181b;
          background: #fafafa;
        }

        .product-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 0.5rem;
        }

        .product-info {
          flex: 1;
        }

        .product-name {
          font-weight: 500;
          color: #18181b;
          margin-bottom: 0.5rem;
        }

        .product-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #71717a;
        }

        .product-price {
          font-weight: 600;
          color: #18181b;
        }

        .selected-items-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .selected-item-card {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border: 1px solid #e4e4e7;
          border-radius: 0.75rem;
          background: #fafafa;
        }

        .item-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 0.5rem;
        }

        .item-details {
          flex: 1;
        }

        .item-details h4 {
          font-weight: 600;
          color: #18181b;
          margin-bottom: 1rem;
        }

        .item-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quantity-input {
          display: flex;
          align-items: center;
          border: 1px solid #e4e4e7;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .quantity-input button {
          padding: 0.5rem 0.75rem;
          background: white;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }

        .quantity-input button:hover:not(:disabled) {
          background: #f4f4f5;
        }

        .quantity-input button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quantity-input span {
          padding: 0.5rem 1rem;
          min-width: 3rem;
          text-align: center;
          border-left: 1px solid #e4e4e7;
          border-right: 1px solid #e4e4e7;
        }

        .max-quantity {
          color: #71717a;
          font-size: 0.875rem;
        }

        .reason-input {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .reason-input label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #18181b;
        }

        .reason-input select {
          padding: 0.75rem;
          border: 1px solid #e4e4e7;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }

        .item-price {
          font-weight: 700;
          color: #10b981;
          font-size: 1.125rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          color: #18181b;
          margin-bottom: 0.5rem;
        }

        .form-group input[type="text"],
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e4e4e7;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }

        .form-group input[type="radio"] {
          margin-right: 0.5rem;
        }

        .form-group label {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .summary {
          background: #fafafa;
          padding: 1.5rem;
          border-radius: 0.75rem;
        }

        .refund-summary {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          color: #71717a;
        }

        .summary-item.total {
          font-size: 1.125rem;
          font-weight: 700;
          color: #18181b;
          padding-top: 1rem;
          border-top: 2px solid #e4e4e7;
        }

        .summary-item .amount {
          color: #10b981;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e4e4e7;
        }

        .btn-primary,
        .btn-secondary {
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

        .btn-primary:hover:not(:disabled) {
          background: #27272a;
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: white;
          color: #18181b;
          border: 1px solid #e4e4e7;
        }

        .btn-secondary:hover {
          background: #fafafa;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #71717a;
        }

        @media (max-width: 640px) {
          .return-form {
            padding: 1rem;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  )
}

export default function NewReturnPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <NewReturnPageContent />
    </Suspense>
  )
}

