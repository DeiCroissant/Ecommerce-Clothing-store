'use client'

/**
 * Admin Dashboard Page - VyronFashion
 * MVP Dashboard with KPIs, Charts, and Quick Actions
 * Now with WebSocket realtime updates!
 */

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { DollarSign, ShoppingCart, Users, TrendingUp, TrendingDown, ArrowUpRight, Package, Eye, Folder, Plus, Trash2, Edit, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { formatCurrency } from '@/lib/formatCurrency'
import * as categoryAPI from '@/lib/api/categories'
import * as dashboardAPI from '@/lib/api/adminDashboard'
import CategoryFormModal from '@/components/admin/categories/CategoryFormModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useAdminWebSocket } from '@/hooks/useAdminWebSocket'

function KPICard({ data }) {
  const Icon = data.icon
  const TrendIcon = data.trend === 'up' ? TrendingUp : TrendingDown
  
  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <div className="metric-card-title">{data.title}</div>
        <div className={`metric-card-icon ${data.color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="metric-card-body">
        <div className="metric-card-value">
          {data.isCurrency ? formatCurrency(data.value) : data.value.toLocaleString('vi-VN')}
        </div>
        <div className={`metric-card-change ${data.trend === 'up' ? 'positive' : 'negative'}`}>
          <TrendIcon className="metric-card-change-icon" />
          <span>{Math.abs(data.change)}% vs hôm qua</span>
        </div>
      </div>
    </div>
  )
}

function SimpleRevenueChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: 'var(--space-16)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        Chưa có dữ liệu doanh thu
      </div>
    )
  }
  
  const maxRevenue = Math.max(...data.map(d => d.revenue))
  const minRevenue = Math.min(...data.map(d => d.revenue))
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
  const avgRevenue = totalRevenue / data.length
  
  // Chart dimensions - fixed pixel values for precise positioning
  const chartWidth = 800
  const chartHeight = 250
  const paddingTop = 50
  const paddingBottom = 40
  const paddingLeft = 40
  const paddingRight = 40
  const graphHeight = chartHeight - paddingTop - paddingBottom
  const graphWidth = chartWidth - paddingLeft - paddingRight
  
  // Calculate positions
  const getX = (index) => {
    if (data.length === 1) return paddingLeft + graphWidth / 2
    return paddingLeft + (index / (data.length - 1)) * graphWidth
  }
  
  const getY = (revenue) => {
    if (maxRevenue === minRevenue) return paddingTop + graphHeight / 2
    const range = maxRevenue - minRevenue
    const padding = range * 0.1
    return paddingTop + ((maxRevenue + padding - revenue) / (range + padding * 2)) * graphHeight
  }
  
  // Generate points with pixel positions
  const points = data.map((item, index) => ({
    x: getX(index),
    y: getY(item.revenue),
    ...item
  }))
  
  // Create line path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + graphHeight} L ${points[0].x} ${paddingTop + graphHeight} Z`
  
  return (
    <div style={{ padding: 'var(--space-6)' }}>
      {/* Summary Stats */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--neutral-50)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
            Tổng doanh thu
          </div>
          <div style={{ 
            fontSize: 'var(--text-xl)', 
            fontWeight: 'var(--font-bold)',
            color: 'var(--brand-600)'
          }}>
            {formatCurrency(totalRevenue)}
          </div>
        </div>
        <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
            Trung bình/ngày
          </div>
          <div style={{ 
            fontSize: 'var(--text-xl)', 
            fontWeight: 'var(--font-bold)',
            color: 'var(--text)'
          }}>
            {formatCurrency(avgRevenue)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
            Cao nhất
          </div>
          <div style={{ 
            fontSize: 'var(--text-xl)', 
            fontWeight: 'var(--font-bold)',
            color: 'var(--success-600)'
          }}>
            {formatCurrency(maxRevenue)}
          </div>
        </div>
      </div>

      {/* Line Chart - SVG with viewBox for responsive scaling */}
      <div style={{ 
        backgroundColor: 'var(--neutral-50)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-2)',
        overflow: 'hidden'
      }}>
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{ 
            width: '100%',
            height: 'auto',
            display: 'block'
          }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Horizontal grid lines */}
          {[0, 1, 2, 3, 4].map(i => {
            const y = paddingTop + (graphHeight / 4) * i
            return (
              <line
                key={i}
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            )
          })}
          
          {/* Vertical grid lines at each data point */}
          {points.map((point, index) => (
            <line
              key={index}
              x1={point.x}
              y1={paddingTop}
              x2={point.x}
              y2={paddingTop + graphHeight}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          ))}
          
          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#areaGradient)"
          />
          
          {/* Main line */}
          <path
            d={linePath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points and labels */}
          {points.map((point, index) => {
            const isHighest = point.revenue === maxRevenue
            const isToday = index === data.length - 1
            return (
              <g key={index}>
                {/* Point circle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  fill="white"
                  stroke={isHighest ? "#22c55e" : "#6366f1"}
                  strokeWidth="3"
                />
                
                {/* Revenue label - positioned directly above the point */}
                <g transform={`translate(${point.x}, ${point.y - 20})`}>
                  <rect
                    x="-45"
                    y="-12"
                    width="90"
                    height="20"
                    rx="4"
                    fill="white"
                    stroke={isHighest ? "#bbf7d0" : "#e0e7ff"}
                    strokeWidth="1"
                    filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill={isHighest ? "#16a34a" : "#4338ca"}
                  >
                    {formatCurrency(point.revenue)}
                  </text>
                </g>
                
                {/* Date label - positioned below the chart, aligned with point */}
                <text
                  x={point.x}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isToday || isHighest ? "600" : "400"}
                  fill={isHighest ? "#16a34a" : isToday ? "#6366f1" : "#6b7280"}
                >
                  {point.date}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        gap: 'var(--space-6)',
        paddingTop: 'var(--space-4)',
        marginTop: 'var(--space-4)',
        borderTop: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '24px', 
            height: '3px', 
            borderRadius: '2px',
            backgroundColor: '#6366f1'
          }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Doanh thu theo ngày
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%',
            backgroundColor: 'white',
            border: '2px solid #22c55e'
          }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Cao nhất
          </span>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [categories, setCategories] = useState([])
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Dashboard data states
  const [dashboardData, setDashboardData] = useState({
    kpis: [],
    revenue_chart: [],
    pending_orders: [],
    low_stock_products: []
  })
  const [loadingDashboard, setLoadingDashboard] = useState(true)

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  // Load dashboard data function (extracted for reuse)
  const loadDashboard = useCallback(async (showLoading = true) => {
    if (showLoading) setLoadingDashboard(true)
    try {
      const data = await dashboardAPI.getDashboardStats()
      
      console.log('📊 Dashboard API Response:', data)
      console.log('📈 Revenue Chart Data:', data.revenue_chart)
      
      // Transform KPIs để match với component structure
      const transformedKPIs = data.kpis.map(kpi => ({
        id: kpi.id,
        title: kpi.title,
        value: kpi.value,
        change: Math.abs(kpi.change),
        trend: kpi.trend,
        icon: kpi.id === 'revenue' ? DollarSign : 
              kpi.id === 'orders' ? ShoppingCart :
              kpi.id === 'customers' ? Users : TrendingUp,
        color: kpi.id === 'revenue' ? 'blue' :
               kpi.id === 'orders' ? 'green' :
               kpi.id === 'customers' ? 'purple' : 'orange',
        isCurrency: kpi.is_currency
      }))
      
      setDashboardData({
        kpis: transformedKPIs,
        revenue_chart: data.revenue_chart || [],
        pending_orders: data.pending_orders || [],
        low_stock_products: data.low_stock_products || []
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
      // Keep empty state on error
      setDashboardData({
        kpis: [],
        revenue_chart: [],
        pending_orders: [],
        low_stock_products: []
      })
    } finally {
      setLoadingDashboard(false)
      setIsRefreshing(false)
    }
  }, [])

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await loadDashboard(false)
    
    // Show toast notification
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: '✅ Đã cập nhật dữ liệu!', type: 'success', duration: 2000 } 
      }))
    }
  }, [loadDashboard])

  // WebSocket handlers
  const handleNewOrder = useCallback((orderData) => {
    console.log('🔔 New order received:', orderData)
    
    // Show notification
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { 
          message: `🛒 Đơn hàng mới: ${orderData.order_number} - ${formatCurrency(orderData.total_amount)}`, 
          type: 'info', 
          duration: 5000 
        } 
      }))
    }
    
    // Refresh dashboard data
    loadDashboard(false)
  }, [loadDashboard])

  const handleOrderUpdate = useCallback((data) => {
    console.log('📦 Order updated:', data)
    
    // Refresh dashboard data
    loadDashboard(false)
  }, [loadDashboard])

  const handleRefreshRequired = useCallback(() => {
    console.log('🔄 Refresh required from server')
    loadDashboard(false)
  }, [loadDashboard])

  // WebSocket connection
  const { isConnected, connectionStatus, reconnect } = useAdminWebSocket({
    onNewOrder: handleNewOrder,
    onOrderUpdate: handleOrderUpdate,
    onRefreshRequired: handleRefreshRequired,
    autoReconnect: true,
    reconnectInterval: 5000
  })
  
  // Initial load
  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  // Load categories từ API
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true)
      try {
        const mainCategories = await categoryAPI.getMainCategories()
        setCategories(mainCategories || [])
      } catch (error) {
        console.error('Error loading categories:', error)
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()

    // Listen for category changes
    const handleCategoryChange = () => {
      loadCategories()
    }
    window.addEventListener('categoryChanged', handleCategoryChange)

    return () => {
      window.removeEventListener('categoryChanged', handleCategoryChange)
    }
  }, [])

  const handleDeleteCategory = (categoryId) => {
    setDeleteTargetId(categoryId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteCategory = async () => {
    if (!deleteTargetId) return
    
    try {
      await categoryAPI.deleteCategory(deleteTargetId)
      // Reload categories
      const mainCategories = await categoryAPI.getMainCategories()
      setCategories(mainCategories || [])
      
      // Dispatch event để Header cập nhật
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('categoryChanged'))
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Đã xóa danh mục thành công!', type: 'success', duration: 3000 } 
        }));
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Lỗi khi xóa danh mục: ' + error.message, type: 'error', duration: 3000 } 
        }));
      }
    } finally {
      setDeleteTargetId(null)
      setShowDeleteConfirm(false)
    }
  }

  const handleSaveCategory = async (categoryData) => {
    try {
      if (selectedCategory) {
        // Cập nhật danh mục
        await categoryAPI.updateCategory(selectedCategory.id, categoryData)
      } else {
        // Thêm danh mục mới
        await categoryAPI.createCategory(categoryData)
      }
      
      // Reload categories từ API
      const mainCategories = await categoryAPI.getMainCategories()
      setCategories(mainCategories || [])
      
      setShowCategoryForm(false)
      setSelectedCategory(null)
      
      // Dispatch event để Header cập nhật
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('categoryChanged'))
      }
    } catch (error) {
      console.error('Error saving category:', error)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Lỗi khi lưu danh mục: ' + error.message, type: 'error', duration: 3000 } 
        }));
      }
    }
  }

  return (
    <div>
      {/* Page Header with Refresh Button and Connection Status */}
      <div style={{ 
        marginBottom: 'var(--space-8)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--text)',
            marginBottom: 'var(--space-1)',
            fontFamily: 'var(--font-display)'
          }}>
            Bảng điều khiển
          </h1>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)'
          }}>
            {currentDate}
          </p>
        </div>
        
        {/* Refresh Button & Connection Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* WebSocket Connection Status */}
          <button 
            onClick={connectionStatus === 'error' ? reconnect : undefined}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isConnected ? 'var(--success-50)' : connectionStatus === 'error' ? 'var(--error-50)' : 'var(--warning-50)',
              border: `1px solid ${isConnected ? 'var(--success-200)' : connectionStatus === 'error' ? 'var(--error-200)' : 'var(--warning-200)'}`,
              cursor: connectionStatus === 'error' ? 'pointer' : 'default',
              outline: 'none'
            }}
            title={isConnected ? 'Realtime: Đang kết nối' : connectionStatus === 'error' ? 'Click để kết nối lại' : 'Realtime: Đang kết nối...'}
          >
            {isConnected ? (
              <Wifi size={14} style={{ color: 'var(--success-600)' }} />
            ) : (
              <WifiOff size={14} style={{ color: connectionStatus === 'error' ? 'var(--error-600)' : 'var(--warning-600)' }} />
            )}
            <span style={{ 
              fontSize: 'var(--text-xs)', 
              fontWeight: 'var(--font-medium)',
              color: isConnected ? 'var(--success-700)' : connectionStatus === 'error' ? 'var(--error-700)' : 'var(--warning-700)'
            }}>
              {isConnected ? 'Live' : connectionStatus === 'error' ? 'Offline - Click để thử lại' : 'Đang kết nối...'}
            </span>
          </button>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loadingDashboard}
            className="admin-btn admin-btn-secondary admin-btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Cập nhật dữ liệu ngay"
          >
            <RefreshCw 
              size={16} 
              style={{ 
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
              }} 
            />
            <span>{isRefreshing ? 'Đang cập nhật...' : 'Cập nhật'}</span>
          </button>
        </div>
      </div>

      {/* Spin animation style */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* KPI Cards */}
      <div className="admin-grid admin-grid-cols-4" style={{ marginBottom: 'var(--space-8)' }}>
        {loadingDashboard ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="metric-card">
              <div className="metric-card-header">
                <div className="metric-card-title">Đang tải...</div>
              </div>
              <div className="metric-card-body">
                <div className="metric-card-value">-</div>
              </div>
            </div>
          ))
        ) : (
          dashboardData.kpis.map(kpi => (
            <KPICard key={kpi.id} data={kpi} />
          ))
        )}
      </div>

      {/* Revenue Chart */}
      <div className="admin-grid admin-grid-cols-1" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Doanh thu 30 ngày qua</h2>
              <p className="admin-card-description">Biểu đồ doanh thu theo ngày (chỉ hiển thị ngày có đơn hàng)</p>
            </div>
          </div>
          {loadingDashboard ? (
            <div style={{ padding: 'var(--space-16)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              Đang tải biểu đồ...
            </div>
          ) : (
            <SimpleRevenueChart data={dashboardData.revenue_chart} />
          )}
        </div>
      </div>

      {/* Orders & Stock Grid */}
      <div className="admin-grid admin-grid-cols-2" style={{ marginBottom: 'var(--space-8)' }}>
        {/* Pending Orders */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Đơn cần xử lý</h2>
              <p className="admin-card-description">
                {dashboardData.pending_orders.length > 0 
                  ? `${dashboardData.pending_orders.length} đơn hàng${dashboardData.pending_orders.length > 1 ? '' : ''} chờ xác nhận`
                  : 'Chưa có đơn hàng nào chờ xử lý'
                }
              </p>
            </div>
            {dashboardData.pending_orders.length > 0 && (
              <span className="admin-badge admin-badge-warning">
                {dashboardData.pending_orders.length} đơn
              </span>
            )}
          </div>
          <div className="admin-table-container" style={{ border: 'none' }}>
            {loadingDashboard ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                Đang tải...
              </div>
            ) : dashboardData.pending_orders.length === 0 ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                Không có đơn hàng nào chờ xử lý
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th className="admin-table-cell-right">Tổng tiền</th>
                    <th>Thời gian</th>
                    <th className="admin-table-cell-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.pending_orders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <span style={{ 
                          fontWeight: 'var(--font-semibold)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)'
                        }}>
                          {order.order_number}
                        </span>
                      </td>
                      <td>{order.customer_name}</td>
                      <td className="admin-table-cell-right">
                        <span style={{ fontWeight: 'var(--font-semibold)' }}>
                          {formatCurrency(order.total_amount)}
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-tertiary)'
                        }}>
                          {order.time_ago}
                        </span>
                      </td>
                      <td className="admin-table-cell-center">
                        <div className="admin-table-actions">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="admin-btn admin-btn-sm admin-btn-ghost"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="admin-card-footer">
            <Link href="/admin/orders" className="admin-btn admin-btn-ghost admin-btn-sm">
              Xem tất cả đơn hàng
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Sản phẩm sắp hết hàng</h2>
              <p className="admin-card-description">
                {dashboardData.low_stock_products.length > 0
                  ? `${dashboardData.low_stock_products.length} sản phẩm${dashboardData.low_stock_products.length > 1 ? '' : ''} cần nhập thêm hàng`
                  : 'Tất cả sản phẩm đều đủ hàng'
                }
              </p>
            </div>
            {dashboardData.low_stock_products.length > 0 && (
              <span className="admin-badge admin-badge-danger">
                {dashboardData.low_stock_products.length} sản phẩm
              </span>
            )}
          </div>
          <div className="admin-table-container" style={{ border: 'none' }}>
            {loadingDashboard ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                Đang tải...
              </div>
            ) : dashboardData.low_stock_products.length === 0 ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                Tất cả sản phẩm đều đủ hàng
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>SKU</th>
                    <th className="admin-table-cell-center">Tồn kho</th>
                    <th className="admin-table-cell-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.low_stock_products.map(product => {
                    const stockPercentage = (product.stock / product.threshold) * 100
                    const stockColor = stockPercentage < 30 ? 'var(--error-600)' : 'var(--warning-600)'
                    
                    return (
                      <tr key={product.id}>
                        <td>
                          <div style={{ fontWeight: 'var(--font-medium)' }}>
                            {product.name}
                          </div>
                        </td>
                        <td>
                          <span style={{ 
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-tertiary)'
                          }}>
                            {product.sku}
                          </span>
                        </td>
                        <td className="admin-table-cell-center">
                          <span style={{ 
                            fontWeight: 'var(--font-bold)',
                            color: stockColor
                          }}>
                            {product.stock}
                          </span>
                          <span style={{ 
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-tertiary)'
                          }}>
                            {' '}/ {product.threshold}
                          </span>
                        </td>
                        <td className="admin-table-cell-center">
                          <Link
                            href={`/admin/products`}
                            className="admin-btn admin-btn-sm admin-btn-secondary"
                            title="Quản lý sản phẩm"
                          >
                            <Package size={14} />
                            Nhập hàng
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div className="admin-card-footer">
            <Link href="/admin/products" className="admin-btn admin-btn-ghost admin-btn-sm">
              Xem tất cả sản phẩm
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Management Section */}
      <div className="admin-grid admin-grid-cols-1" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Quản lý Danh mục</h2>
              <p className="admin-card-description">
                Quản lý danh mục sản phẩm - {categories.length} danh mục
              </p>
            </div>
            <button
              className="admin-btn admin-btn-primary admin-btn-sm"
              onClick={() => {
                setSelectedCategory(null)
                setShowCategoryForm(true)
              }}
            >
              <Plus size={16} />
              <span>Thêm danh mục</span>
            </button>
          </div>
          <div className="admin-table-container" style={{ border: 'none' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Danh mục</th>
                  <th>Slug</th>
                  <th className="admin-table-cell-center">Số sản phẩm</th>
                  <th className="admin-table-cell-center">Trạng thái</th>
                  <th className="admin-table-cell-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loadingCategories ? (
                  <tr>
                    <td colSpan="5" style={{ 
                      textAlign: 'center', 
                      padding: 'var(--space-8)',
                      color: 'var(--text-tertiary)'
                    }}>
                      Đang tải...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ 
                      textAlign: 'center', 
                      padding: 'var(--space-8)',
                      color: 'var(--text-tertiary)'
                    }}>
                      Chưa có danh mục nào. Hãy thêm danh mục đầu tiên!
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-base)',
                            backgroundColor: 'var(--neutral-100)',
                            backgroundImage: category.image ? `url(${category.image})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {!category.image && (
                              <Folder size={20} style={{ color: 'var(--text-tertiary)' }} />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: '2px' }}>
                              {category.name}
                            </div>
                            <div style={{ 
                              fontSize: 'var(--text-xs)', 
                              color: 'var(--text-tertiary)',
                              maxWidth: '300px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {category.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-secondary)'
                        }}>
                          {category.slug}
                        </span>
                      </td>
                      <td className="admin-table-cell-center">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <Package size={14} style={{ color: 'var(--text-tertiary)' }} />
                          <span style={{ fontWeight: 'var(--font-medium)' }}>
                            {category.product_count}
                          </span>
                        </div>
                      </td>
                      <td className="admin-table-cell-center">
                        <span className={`admin-badge ${
                          category.status === 'active' 
                            ? 'admin-badge-success' 
                            : 'admin-badge-secondary'
                        }`}>
                          {category.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                        </span>
                      </td>
                      <td className="admin-table-cell-center">
                        <div className="admin-table-actions">
                          <button 
                            className="admin-btn admin-btn-sm admin-btn-ghost"
                            title="Chỉnh sửa"
                            onClick={() => {
                              setSelectedCategory(category)
                              setShowCategoryForm(true)
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="admin-btn admin-btn-sm admin-btn-ghost"
                            title="Xóa"
                            onClick={() => handleDeleteCategory(category.id)}
                            style={{ color: 'var(--error-600)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {categories.length > 0 && (
            <div className="admin-card-footer">
              <button 
                className="admin-btn admin-btn-ghost admin-btn-sm"
                onClick={() => window.location.href = '/admin/products/categories'}
              >
                Xem tất cả danh mục
                <ArrowUpRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryFormModal
          category={selectedCategory}
          onClose={() => {
            setShowCategoryForm(false)
            setSelectedCategory(null)
          }}
          onSave={handleSaveCategory}
        />
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeleteTargetId(null)
        }}
        onConfirm={confirmDeleteCategory}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa danh mục này?"
        confirmText="Xóa"
        cancelText="Hủy"
        confirmButtonClass="btn-confirm-delete"
      />
    </div>
  )
}
