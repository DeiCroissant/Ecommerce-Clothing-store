'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, Package, Eye, ChevronDown, ChevronUp, User, Phone, Calendar, DollarSign, MapPin, Mail, RefreshCw } from 'lucide-react'
import { formatCurrency } from '@/lib/formatCurrency'
import { formatDate } from '@/lib/mockOrdersData'
import * as adminOrderAPI from '@/lib/api/adminOrders'
import Link from 'next/link'
import '@/styles/admin-design-system.css'
import '@/styles/admin-components.css'

// Custom hook for debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}

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
    label: 'Xác nhận đơn hàng',
    color: 'var(--brand-600)',
    bgColor: 'var(--brand-50)',
    displayStatus: 'pending',
  },
  processing: {
    label: 'Xác nhận đơn hàng',
    color: 'var(--brand-600)',
    bgColor: 'var(--brand-50)',
    displayStatus: 'pending',
  },
  shipped: {
    label: 'Đang giao',
    color: '#9333ea',
    bgColor: '#f3e8ff',
    displayStatus: 'shipped',
  },
  delivered: {
    label: 'Đang giao',
    color: '#9333ea',
    bgColor: '#f3e8ff',
    displayStatus: 'shipped',
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'var(--error-600)',
    bgColor: 'var(--error-50)',
    displayStatus: 'cancelled',
  },
  completed: {
    label: 'Hoàn thành',
    color: 'var(--success-600)',
    bgColor: 'var(--success-50)',
    displayStatus: 'completed',
  },
}

// Map status to display status
const getDisplayStatus = (status) => {
  if (status === 'pending' || status === 'processing') return 'pending';
  if (status === 'shipped' || status === 'delivered') return 'shipped';
  if (status === 'completed') return 'completed';
  if (status === 'cancelled') return 'cancelled';
  return 'pending';
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // Store all orders for stats
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  // Cache ref
  const cacheRef = useRef({});

  // Read status from URL query parameter
  useEffect(() => {
    const statusFromUrl = searchParams?.get('status');
    if (statusFromUrl && ['pending', 'cancelled', 'completed', 'shipped', 'delivered'].includes(statusFromUrl)) {
      setStatusFilter(statusFromUrl);
    }
  }, [searchParams]);
  
  // Reset page when filter/search changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch]);

  const fetchOrders = useCallback(async (forceRefresh = false) => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    const cacheKey = `${statusFilter}_${debouncedSearch}_${page}`;
    
    // Check cache
    if (!forceRefresh && cacheRef.current[cacheKey]) {
      const cached = cacheRef.current[cacheKey];
      setOrders(cached.orders);
      setAllOrders(cached.allOrders);
      setTotal(cached.total);
      return;
    }
    
    try {
      setLoading(true);
      
      // Determine which statuses to fetch from backend
      let backendStatusFilter = statusFilter;
      if (statusFilter === 'pending') {
        backendStatusFilter = null; // Will fetch all and filter client-side
      } else if (statusFilter === 'shipped') {
        backendStatusFilter = null; // Will fetch all and filter client-side
      }
      
      // Fetch orders from backend
      const response = await adminOrderAPI.getAllOrders({
        status: backendStatusFilter === 'all' ? undefined : backendStatusFilter,
        page: 1,
        limit: 100,
        search: debouncedSearch || undefined,
      });
      
      // Filter on client side for display status
      let filteredOrders = response.orders || [];
      
      if (statusFilter === 'pending') {
        filteredOrders = filteredOrders.filter(o => o.status === 'pending' || o.status === 'processing');
      } else if (statusFilter === 'shipped') {
        filteredOrders = filteredOrders.filter(o => o.status === 'shipped' || o.status === 'delivered');
      } else if (statusFilter !== 'all' && statusFilter !== 'pending' && statusFilter !== 'shipped') {
        filteredOrders = filteredOrders.filter(o => o.status === statusFilter);
      }
      
      // Store all orders for stats calculation
      setAllOrders(filteredOrders);
      
      // Apply pagination after filtering
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
      
      // Update total count
      const filteredTotal = filteredOrders.length;
      
      const transformedOrders = paginatedOrders.map(order => ({
        id: order.id || order._id,
        orderNumber: order.order_number || order.orderNumber,
        status: order.status || 'pending',
        total: order.total_amount || order.total || 0,
        date: order.created_at || order.date,
        createdAt: order.created_at,
        items: order.items || [],
        shipping_address: order.shipping_address || {},
        payment_method: order.payment_method || 'COD',
        user_id: order.user_id,
        note: order.note || '',
      }));
      
      // Cache result
      cacheRef.current[cacheKey] = {
        orders: transformedOrders,
        allOrders: filteredOrders,
        total: filteredTotal
      };
      
      setOrders(transformedOrders);
      setTotal(filteredTotal);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Lỗi khi tải danh sách đơn hàng', type: 'error', duration: 3000 } 
        }));
      }
      setOrders([]);
      setAllOrders([]);
      setTotal(0);
      setLoading(false);
      setRefreshing(false);
    }
  }, [router, statusFilter, debouncedSearch, page, limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  // Refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    cacheRef.current = {};
    fetchOrders(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminOrderAPI.updateOrderStatus(orderId, newStatus);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Đã cập nhật trạng thái đơn hàng thành công', type: 'success', duration: 3000 } 
        }));
        // Dispatch event to notify customer side to refresh
        window.dispatchEvent(new CustomEvent('ordersChanged'));
      }
      // Clear cache and refresh
      cacheRef.current = {};
      fetchOrders(true);
    } catch (error) {
      console.error('Error updating order status:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Lỗi khi cập nhật trạng thái', type: 'error', duration: 3000 } 
        }));
      }
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && orders.length === 0) {
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
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-8)'
        }}>
          <div>
            <h1 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--text)',
              marginBottom: 'var(--space-1)',
              fontFamily: 'var(--font-display)'
            }}>
              Quản lý đơn hàng
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)'
            }}>
              Theo dõi và quản lý tất cả đơn hàng của khách hàng
            </p>
          </div>
          <button
            className="admin-btn admin-btn-secondary"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={20} style={{ 
              animation: refreshing ? 'spin 1s linear infinite' : 'none' 
            }} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="admin-grid admin-grid-cols-4" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="metric-card">
            <div className="metric-card-header">
              <div className="metric-card-title">Chờ xác nhận</div>
              <div className="metric-card-icon blue">
                <Package size={20} />
              </div>
            </div>
            <div className="metric-card-body">
              <div className="metric-card-value" style={{ color: 'var(--brand-600)' }}>
                {allOrders.filter(o => getDisplayStatus(o.status) === 'pending').length}
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-card-header">
              <div className="metric-card-title">Đang giao</div>
              <div className="metric-card-icon purple" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                <Package size={20} />
              </div>
            </div>
            <div className="metric-card-body">
              <div className="metric-card-value" style={{ color: '#9333ea' }}>
                {allOrders.filter(o => getDisplayStatus(o.status) === 'shipped').length}
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-card-header">
              <div className="metric-card-title">Hoàn thành</div>
              <div className="metric-card-icon green">
                <Package size={20} />
              </div>
            </div>
            <div className="metric-card-body">
              <div className="metric-card-value" style={{ color: 'var(--success-600)' }}>
                {allOrders.filter(o => getDisplayStatus(o.status) === 'completed').length}
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-card-header">
              <div className="metric-card-title">Đã hủy</div>
              <div className="metric-card-icon" style={{ backgroundColor: 'var(--error-50)', color: 'var(--error-600)' }}>
                <Package size={20} />
              </div>
            </div>
            <div className="metric-card-body">
              <div className="metric-card-value" style={{ color: 'var(--error-600)' }}>
                {allOrders.filter(o => getDisplayStatus(o.status) === 'cancelled').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Bộ lọc & Tìm kiếm</h2>
            <p className="admin-card-description">Tìm kiếm và lọc đơn hàng theo tiêu chí</p>
          </div>
        </div>
        <div className="admin-card-content">
          <div className="admin-grid admin-grid-cols-2">
            <div className="admin-form-group">
              <label className="admin-label">Tìm kiếm</label>
              <div className="admin-search-input">
                <Search className="admin-search-input-icon" size={18} />
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Mã đơn hàng, tên khách hàng, số điện thoại..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Trạng thái</label>
              <select
                className="admin-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Xác nhận đơn hàng</option>
                <option value="shipped">Đang giao</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div>
        {orders.length === 0 && !loading ? (
          <div className="admin-card">
            <div className="admin-card-content" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
              <div className="admin-table-empty-icon">
                <Package size={48} />
              </div>
              <h3 className="admin-table-empty-title">Không có đơn hàng nào</h3>
              <p className="admin-table-empty-description">
                {statusFilter !== 'all' 
                  ? `Không có đơn hàng nào với trạng thái "${statusConfig[statusFilter]?.label || statusFilter}"`
                  : 'Chưa có đơn hàng nào trong hệ thống'}
              </p>
              {searchQuery && (
                <button
                  className="admin-btn admin-btn-secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setPage(1);
                  }}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {orders.map((order) => {
              const displayStatus = getDisplayStatus(order.status);
              const status = statusConfig[displayStatus] || statusConfig.pending;
              const isExpanded = expandedOrder === order.id;

              return (
                <div key={order.id} className="admin-card">
                  {/* Status Indicator */}
                  <div style={{ 
                    height: '4px',
                    width: '100%',
                    backgroundColor: status.color,
                    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
                  }} />
                  
                  <div className="admin-card-content">
                    {/* Order Header */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      justifyContent: 'space-between',
                      marginBottom: 'var(--space-6)',
                      gap: 'var(--space-4)'
                    }}>
                      <div style={{ display: 'flex', gap: 'var(--space-4)', flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: status.bgColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Package size={24} style={{ color: status.color }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 'var(--space-2)',
                            marginBottom: 'var(--space-2)',
                            flexWrap: 'wrap'
                          }}>
                            <Link 
                              href={`/admin/orders/${order.id}`}
                              style={{
                                fontSize: 'var(--text-lg)',
                                fontWeight: 'var(--font-bold)',
                                color: 'var(--text)',
                                fontFamily: 'var(--font-mono)',
                                textDecoration: 'none'
                              }}
                              onMouseEnter={(e) => e.target.style.color = 'var(--brand-600)'}
                              onMouseLeave={(e) => e.target.style.color = 'var(--text)'}
                            >
                              #{order.orderNumber || order.id}
                            </Link>
                            <span className="admin-badge" style={{
                              backgroundColor: status.bgColor,
                              color: status.color
                            }}>
                              {status.label}
                            </span>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 'var(--space-2)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-secondary)'
                          }}>
                            <Calendar size={14} />
                            <span>{formatDate(order.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          title="Xem chi tiết"
                          style={{ 
                            padding: 'var(--space-1)',
                            width: '32px',
                            height: '32px',
                            minWidth: '32px'
                          }}
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(order.id);
                          }}
                          title={isExpanded ? "Thu gọn" : "Mở rộng"}
                          style={{ 
                            padding: 'var(--space-1)',
                            width: '32px',
                            height: '32px',
                            minWidth: '32px'
                          }}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div style={{ 
                      marginBottom: 'var(--space-6)',
                      paddingBottom: 'var(--space-6)',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        backgroundColor: 'var(--neutral-50)',
                        borderRadius: 'var(--radius-md)'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--brand-500)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <User size={18} style={{ color: 'white' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-semibold)',
                            color: 'var(--text)',
                            marginBottom: 'var(--space-1)',
                            wordBreak: 'break-word'
                          }}>
                            {order.shipping_address?.full_name || 'N/A'}
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-secondary)'
                          }}>
                            <Phone size={14} />
                            <span style={{ wordBreak: 'break-all' }}>
                              {order.shipping_address?.phone || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Products Preview */}
                    <div style={{ 
                      marginBottom: 'var(--space-6)',
                      paddingBottom: 'var(--space-6)',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 'var(--space-3)'
                      }}>
                        Sản phẩm
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            gap: 'var(--space-3)',
                            padding: 'var(--space-3)',
                            backgroundColor: 'var(--neutral-50)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)'
                          }}>
                            <div style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: 'var(--radius-md)',
                              overflow: 'hidden',
                              backgroundColor: 'var(--neutral-100)',
                              flexShrink: 0,
                              border: '1px solid var(--border)'
                            }}>
                              {item.product_image || item.image ? (
                                <img
                                  src={item.product_image || item.image}
                                  alt={item.product_name || item.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <Package size={20} style={{ color: 'var(--text-tertiary)' }} />
                                </div>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-semibold)',
                                color: 'var(--text)',
                                marginBottom: 'var(--space-2)',
                                wordBreak: 'break-word'
                              }}>
                                {item.product_name || item.name}
                              </div>
                              <div style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap',
                                gap: 'var(--space-2)',
                                alignItems: 'center'
                              }}>
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
                                <span style={{
                                  fontSize: 'var(--text-xs)',
                                  color: 'var(--text-secondary)',
                                  fontWeight: 'var(--font-medium)'
                                }}>
                                  ×{item.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-secondary)',
                            fontWeight: 'var(--font-medium)',
                            paddingLeft: 'calc(64px + var(--space-3) + var(--space-3))'
                          }}>
                            +{order.items.length - 2} sản phẩm khác
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      gap: 'var(--space-4)',
                      flexWrap: 'wrap'
                    }}>
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
                          <DollarSign size={18} style={{ color: 'var(--warning-600)' }} />
                        </div>
                        <div>
                          <div style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-secondary)',
                            fontWeight: 'var(--font-medium)',
                            marginBottom: 'var(--space-1)'
                          }}>
                            Tổng tiền
                          </div>
                          <div style={{
                            fontSize: 'var(--text-2xl)',
                            fontWeight: 'var(--font-bold)',
                            color: 'var(--text)'
                          }}>
                            {formatCurrency(order.total)}
                          </div>
                        </div>
                      </div>
                      <select
                        className="admin-select"
                        value={displayStatus}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          let actualStatus = order.status;
                          if (newStatus === 'pending') {
                            actualStatus = 'processing';
                          } else if (newStatus === 'shipped') {
                            actualStatus = 'shipped';
                          } else if (newStatus === 'completed') {
                            actualStatus = 'completed';
                          } else if (newStatus === 'cancelled') {
                            actualStatus = 'cancelled';
                          }
                          handleStatusChange(order.id, actualStatus);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ minWidth: '200px' }}
                      >
                        <option value="pending">Xác nhận đơn hàng</option>
                        <option value="shipped">Đang giao</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div style={{
                        marginTop: 'var(--space-6)',
                        paddingTop: 'var(--space-6)',
                        borderTop: '2px solid var(--border)',
                        backgroundColor: 'var(--neutral-50)',
                        marginLeft: 'calc(-1 * var(--space-6))',
                        marginRight: 'calc(-1 * var(--space-6))',
                        marginBottom: 'calc(-1 * var(--space-6))',
                        paddingLeft: 'var(--space-6)',
                        paddingRight: 'var(--space-6)',
                        paddingBottom: 'var(--space-6)',
                        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                        animation: 'fadeIn 0.2s ease-out',
                        transition: 'all var(--transition-base)'
                      }}>
                        <div className="admin-grid admin-grid-cols-2">
                          {/* Products Section */}
                          <div className="admin-card">
                            <div className="admin-card-header">
                              <div>
                                <h3 className="admin-card-title">Sản phẩm</h3>
                                <p className="admin-card-description">{order.items.length} sản phẩm</p>
                              </div>
                            </div>
                            <div className="admin-card-content">
                              <div className="admin-table-container" style={{ border: 'none' }}>
                                <table className="admin-table">
                                  <thead>
                                    <tr>
                                      <th>Sản phẩm</th>
                                      <th>Biến thể</th>
                                      <th className="admin-table-cell-right">Tổng</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.items.map((item, idx) => (
                                      <tr key={idx}>
                                        <td>
                                          <div style={{ fontWeight: 'var(--font-semibold)' }}>
                                            {item.product_name || item.name}
                                          </div>
                                          <div style={{ 
                                            fontSize: 'var(--text-xs)',
                                            color: 'var(--text-secondary)',
                                            marginTop: 'var(--space-1)'
                                          }}>
                                            SL: {item.quantity}
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
                                        <td className="admin-table-cell-right" style={{ fontWeight: 'var(--font-semibold)' }}>
                                          {formatCurrency(item.price * item.quantity)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                          {/* Shipping Address Section */}
                          <div className="admin-card">
                            <div className="admin-card-header">
                              <div>
                                <h3 className="admin-card-title">Địa chỉ giao hàng</h3>
                                <p className="admin-card-description">Thông tin nhận hàng</p>
                              </div>
                            </div>
                            <div className="admin-card-content">
                              <div style={{ marginBottom: 'var(--space-4)' }}>
                                <div style={{
                                  fontSize: 'var(--text-sm)',
                                  fontWeight: 'var(--font-semibold)',
                                  color: 'var(--text)',
                                  marginBottom: 'var(--space-2)'
                                }}>
                                  {order.shipping_address?.full_name}
                                </div>
                                <div style={{
                                  fontSize: 'var(--text-sm)',
                                  color: 'var(--text-secondary)',
                                  lineHeight: 'var(--leading-relaxed)'
                                }}>
                                  <div>{order.shipping_address?.street}</div>
                                  <div>{order.shipping_address?.ward}, {order.shipping_address?.city}</div>
                                </div>
                              </div>
                              
                              <div style={{ 
                                paddingTop: 'var(--space-4)',
                                borderTop: '1px solid var(--border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-2)'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'var(--space-2)',
                                  padding: 'var(--space-2)',
                                  backgroundColor: 'var(--neutral-50)',
                                  borderRadius: 'var(--radius-md)'
                                }}>
                                  <Phone size={16} style={{ color: 'var(--success-600)' }} />
                                  <span style={{
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--font-medium)',
                                    color: 'var(--text)'
                                  }}>
                                    {order.shipping_address?.phone}
                                  </span>
                                </div>
                                {order.shipping_address?.email && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-2)',
                                    padding: 'var(--space-2)',
                                    backgroundColor: 'var(--neutral-50)',
                                    borderRadius: 'var(--radius-md)'
                                  }}>
                                    <Mail size={16} style={{ color: 'var(--success-600)' }} />
                                    <span style={{
                                      fontSize: 'var(--text-sm)',
                                      fontWeight: 'var(--font-medium)',
                                      color: 'var(--text)'
                                    }}>
                                      {order.shipping_address.email}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {order.note && (
                                <div style={{
                                  marginTop: 'var(--space-4)',
                                  paddingTop: 'var(--space-4)',
                                  borderTop: '2px solid var(--border)'
                                }}>
                                  <div style={{
                                    fontSize: 'var(--text-xs)',
                                    fontWeight: 'var(--font-semibold)',
                                    color: 'var(--text-secondary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: 'var(--space-2)'
                                  }}>
                                    Ghi chú đơn hàng
                                  </div>
                                  <div style={{
                                    fontSize: 'var(--text-sm)',
                                    color: 'var(--text)',
                                    padding: 'var(--space-4)',
                                    backgroundColor: 'var(--warning-50)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--warning-100)'
                                  }}>
                                    {order.note}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination" style={{ marginTop: 'var(--space-8)' }}>
          <div className="admin-pagination-info">
            Trang {page} / {totalPages}
          </div>
          <div className="admin-pagination-buttons">
            <button
              className="admin-pagination-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trước
            </button>
            <button
              className="admin-pagination-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
