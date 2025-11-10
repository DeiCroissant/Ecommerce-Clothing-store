'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Package, User, MapPin, Phone, Mail, CreditCard } from 'lucide-react'
import * as orderAPI from '@/lib/api/orders'
import * as adminOrderAPI from '@/lib/api/adminOrders'
import { formatCurrency } from '@/lib/formatCurrency'
import { formatDate } from '@/lib/mockOrdersData'
import Image from 'next/image'
import Link from 'next/link'
import '@/styles/admin-design-system.css'
import '@/styles/admin-components.css'

function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

const statusConfig = {
  pending: { 
    label: 'Chờ xác nhận', 
    color: 'var(--brand-600)', 
    bgColor: 'var(--brand-50)',
    displayStatus: 'pending'
  },
  processing: { 
    label: 'Xác nhận đơn hàng', 
    color: 'var(--brand-600)', 
    bgColor: 'var(--brand-50)',
    displayStatus: 'pending'
  },
  shipped: { 
    label: 'Đang giao', 
    color: '#9333ea', 
    bgColor: '#f3e8ff',
    displayStatus: 'shipped'
  },
  delivered: { 
    label: 'Đang giao', 
    color: '#9333ea', 
    bgColor: '#f3e8ff',
    displayStatus: 'shipped'
  },
  cancelled: { 
    label: 'Đã hủy', 
    color: 'var(--error-600)', 
    bgColor: 'var(--error-50)',
    displayStatus: 'cancelled'
  },
  completed: { 
    label: 'Hoàn thành', 
    color: 'var(--success-600)', 
    bgColor: 'var(--success-50)',
    displayStatus: 'completed'
  },
}

const getDisplayStatus = (status) => {
  if (status === 'pending' || status === 'processing') return 'pending';
  if (status === 'shipped' || status === 'delivered') return 'shipped';
  if (status === 'completed') return 'completed';
  if (status === 'cancelled') return 'cancelled';
  return 'pending';
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params?.orderId
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!orderId) return;
    
    // Check if orderId is a status filter, not an actual order ID
    const statusFilters = ['pending', 'cancelled', 'completed', 'shipped', 'delivered'];
    if (statusFilters.includes(orderId)) {
      // Redirect to main orders page with status filter
      router.push(`/admin/orders?status=${orderId}`);
      return;
    }
    
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchOrder();
  }, [orderId, router])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      const orderData = await orderAPI.getOrderById(orderId);
      
      const transformedOrder = {
        id: orderData.id || orderData._id,
        orderNumber: orderData.order_number || orderData.orderNumber || orderData.id,
        status: orderData.status || 'pending',
        total: orderData.total_amount || orderData.total || 0,
        date: orderData.created_at || orderData.date,
        orderDate: orderData.created_at || orderData.date,
        createdAt: orderData.created_at,
        items: orderData.items || [],
        shipping_address: orderData.shipping_address || {},
        payment_method: orderData.payment_method || 'COD',
        note: orderData.note || '',
        user_id: orderData.user_id
      };
      
      setOrder(transformedOrder);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError(error.message || 'Không thể tải chi tiết đơn hàng');
      setLoading(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Không thể tải chi tiết đơn hàng', type: 'error', duration: 3000 } 
        }));
      }
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (!order) return;
    
    try {
      setUpdating(true);
      await adminOrderAPI.updateOrderStatus(order.id, newStatus);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Đã cập nhật trạng thái đơn hàng thành công', type: 'success', duration: 3000 } 
        }));
        // Dispatch event to notify customer side to refresh
        window.dispatchEvent(new CustomEvent('ordersChanged'));
      }
      fetchOrder(); // Refresh order data
    } catch (error) {
      console.error('Error updating order status:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Lỗi khi cập nhật trạng thái', type: 'error', duration: 3000 } 
        }));
      }
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: 'var(--space-6)'
      }}>
        <div className="admin-spinner"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: 'var(--space-6)',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--text)',
          marginBottom: 'var(--space-4)'
        }}>
          Không tìm thấy đơn hàng
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          marginBottom: 'var(--space-6)' 
        }}>
          {error || 'Đơn hàng không tồn tại'}
        </p>
        <Link
          href="/admin/orders"
          className="admin-btn admin-btn-primary"
        >
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    )
  }

  const displayStatus = getDisplayStatus(order.status);
  const status = statusConfig[order.status] || statusConfig.pending;
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = order.total - subtotal;

  const paymentMethodLabels = {
    'COD': 'Thanh toán khi nhận hàng',
    'BankTransfer': 'Chuyển khoản ngân hàng',
    'bank_transfer': 'Chuyển khoản ngân hàng',
    'MoMo': 'Ví điện tử MoMo'
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <Link
          href="/admin/orders"
          className="admin-btn admin-btn-ghost admin-btn-sm"
          style={{ marginBottom: 'var(--space-4)' }}
        >
          <ArrowLeft size={18} />
          <span>Quay lại danh sách đơn hàng</span>
        </Link>
        
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--text)',
                marginBottom: 'var(--space-4)',
                fontFamily: 'var(--font-display)'
              }}>
                Chi tiết đơn hàng
              </h1>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-4)',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--text-secondary)',
                  fontWeight: 'var(--font-semibold)'
                }}>
                  #{order.orderNumber}
                </span>
                <span className="admin-badge" style={{
                  backgroundColor: status.bgColor,
                  color: status.color
                }}>
                  {status.label}
                </span>
                <span style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)'
                }}>
                  {formatDate(order.date)}
                </span>
              </div>
            </div>
            
            {/* Status Update */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-3)',
              flexShrink: 0
            }}>
              <label style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--text)',
                whiteSpace: 'nowrap'
              }}>
                Cập nhật trạng thái:
              </label>
              <select
                className="admin-select"
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                style={{ minWidth: '200px' }}
              >
                <option value="pending">Chờ xác nhận</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đang giao</option>
                <option value="delivered">Đã giao</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-grid admin-grid-cols-3">
        {/* Main Content */}
        <div style={{ gridColumn: 'span 2' }}>
          {/* Products */}
          <div className="admin-card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Sản phẩm</h2>
                <p className="admin-card-description">{order.items.length} sản phẩm trong đơn hàng</p>
              </div>
            </div>
            <div className="admin-card-content">
              <div className="admin-table-container" style={{ border: 'none' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Biến thể</th>
                      <th className="admin-table-cell-center">Số lượng</th>
                      <th className="admin-table-cell-right">Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => {
                      const itemImage = item.product_image || item.image || '/images/placeholders/product-placeholder.svg';
                      const itemName = item.product_name || item.name || 'Sản phẩm';
                      
                      return (
                        <tr key={index}>
                          <td>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 'var(--space-3)'
                            }}>
                              <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                backgroundColor: 'var(--neutral-100)',
                                border: '1px solid var(--border)',
                                flexShrink: 0,
                                position: 'relative'
                              }}>
                                {itemImage.startsWith('data:image/') || itemImage.startsWith('http') || itemImage.startsWith('/') ? (
                                  <Image
                                    src={itemImage}
                                    alt={itemName}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                    unoptimized={itemImage.startsWith('data:image/')}
                                  />
                                ) : (
                                  <img
                                    src={itemImage}
                                    alt={itemName}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                )}
                              </div>
                              <div>
                                <div style={{
                                  fontWeight: 'var(--font-semibold)',
                                  color: 'var(--text)',
                                  marginBottom: 'var(--space-1)'
                                }}>
                                  {itemName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                              {item.variant_color && (
                                <span className="admin-badge admin-badge-primary">
                                  {item.variant_color}
                                </span>
                              )}
                              {item.variant_size && (
                                <span className="admin-badge admin-badge-gray">
                                  Size {item.variant_size}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="admin-table-cell-center">
                            <span style={{ fontWeight: 'var(--font-semibold)' }}>
                              {item.quantity}
                            </span>
                          </td>
                          <td className="admin-table-cell-right" style={{ fontWeight: 'var(--font-semibold)' }}>
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Customer Info */}
          <div className="admin-card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Thông tin khách hàng</h2>
                <p className="admin-card-description">Chi tiết người nhận hàng</p>
              </div>
            </div>
            <div className="admin-card-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--brand-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <User size={20} style={{ color: 'var(--brand-600)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-1)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 'var(--font-medium)'
                    }}>
                      Tên khách hàng
                    </div>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--text)',
                      wordBreak: 'break-word'
                    }}>
                      {order.shipping_address?.full_name || 'N/A'}
                    </div>
                  </div>
                </div>
                
                {order.shipping_address?.phone && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--success-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Phone size={20} style={{ color: 'var(--success-600)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--space-1)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 'var(--font-medium)'
                      }}>
                        Số điện thoại
                      </div>
                      <div style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--text)',
                        wordBreak: 'break-all'
                      }}>
                        {order.shipping_address.phone}
                      </div>
                    </div>
                  </div>
                )}
                
                {order.shipping_address?.email && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--info-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Mail size={20} style={{ color: 'var(--info-600)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--space-1)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 'var(--font-medium)'
                      }}>
                        Email
                      </div>
                      <div style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--text)',
                        wordBreak: 'break-all'
                      }}>
                        {order.shipping_address.email}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="admin-card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Địa chỉ giao hàng</h2>
                <p className="admin-card-description">Thông tin nhận hàng</p>
              </div>
            </div>
            <div className="admin-card-content">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--success-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <MapPin size={20} style={{ color: 'var(--success-600)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--text)',
                    marginBottom: 'var(--space-2)',
                    wordBreak: 'break-word'
                  }}>
                    {order.shipping_address?.full_name}
                  </div>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    lineHeight: 'var(--leading-relaxed)',
                    wordBreak: 'break-word'
                  }}>
                    <div>{order.shipping_address?.street}</div>
                    <div>{order.shipping_address?.ward}, {order.shipping_address?.city}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="admin-card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Phương thức thanh toán</h2>
                <p className="admin-card-description">Cách thức thanh toán</p>
              </div>
            </div>
            <div className="admin-card-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--warning-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <CreditCard size={20} style={{ color: 'var(--warning-600)' }} />
                </div>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--text)'
                }}>
                  {paymentMethodLabels[order.payment_method] || order.payment_method}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="admin-card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Tóm tắt đơn hàng</h2>
                <p className="admin-card-description">Chi tiết giá trị đơn hàng</p>
              </div>
            </div>
            <div className="admin-card-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)'
                }}>
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)'
                }}>
                  <span>Phí vận chuyển:</span>
                  <span>{formatCurrency(shippingFee)}</span>
                </div>
                <div style={{ 
                  borderTop: '2px solid var(--border)',
                  paddingTop: 'var(--space-3)',
                  marginTop: 'var(--space-2)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--text)'
                    }}>
                      Tổng cộng:
                    </span>
                    <span style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--text)',
                      fontFamily: 'var(--font-display)'
                    }}>
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          {order.note && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title">Ghi chú</h2>
                  <p className="admin-card-description">Lưu ý từ khách hàng</p>
                </div>
              </div>
              <div className="admin-card-content">
                <div style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--warning-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--warning-100)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text)',
                  lineHeight: 'var(--leading-relaxed)'
                }}>
                  {order.note}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
