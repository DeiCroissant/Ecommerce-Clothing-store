'use client'

/**
 * Admin Dashboard Page - VyronFashion
 * MVP Dashboard with KPIs, Charts, and Quick Actions
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DollarSign, ShoppingCart, Users, TrendingUp, TrendingDown, ArrowUpRight, Package, Eye, Folder, Plus, Trash2, Edit } from 'lucide-react'
import { formatCurrency } from '@/lib/formatCurrency'
import * as categoryAPI from '@/lib/api/categories'
import * as dashboardAPI from '@/lib/api/adminDashboard'
import CategoryFormModal from '@/components/admin/categories/CategoryFormModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

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
  
  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: 'var(--space-2)', 
        height: '280px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: 'var(--space-2)'
      }}>
        {data.map((item, index) => {
          const height = (item.revenue / maxRevenue) * 100
          return (
            <div 
              key={index}
              style={{ 
                flex: 1, 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: `${height}%`,
                  backgroundColor: 'var(--brand-500)',
                  borderRadius: 'var(--radius-base) var(--radius-base) 0 0',
                  transition: 'all var(--transition-base)',
                  cursor: 'pointer'
                }}
                title={`${item.date}: ${formatCurrency(item.revenue)}`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--brand-600)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--brand-500)'
                }}
              />
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--text-tertiary)',
                fontWeight: 'var(--font-medium)'
              }}>
                {item.date}
              </div>
            </div>
          )
        })}
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
  
  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      setLoadingDashboard(true)
      try {
        const data = await dashboardAPI.getDashboardStats()
        
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
      }
    }
    
    loadDashboard()
    
    // Refresh dashboard every 5 minutes
    const interval = setInterval(loadDashboard, 300000)
    
    return () => clearInterval(interval)
  }, [])

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
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
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
              <p className="admin-card-description">Biểu đồ doanh thu theo ngày (14 ngày gần nhất)</p>
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
