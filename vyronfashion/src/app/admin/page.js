'use client'

/**
 * Admin Dashboard Page - VyronFashion
 * MVP Dashboard with KPIs, Charts, and Quick Actions
 */

import { useState, useEffect } from 'react'
import { DollarSign, ShoppingCart, Users, TrendingUp, TrendingDown, ArrowUpRight, Package, Eye, Folder, Plus, Trash2, Edit } from 'lucide-react'
import { formatCurrency } from '@/lib/formatCurrency'
import * as categoryAPI from '@/lib/api/categories'
import CategoryFormModal from '@/components/admin/categories/CategoryFormModal'

// Mock data
const dashboardData = {
  kpis: [
    {
      id: 'revenue',
      title: 'Doanh thu hôm nay',
      value: 45230000,
      change: 12.5,
      trend: 'up',
      icon: DollarSign,
      color: 'blue',
      isCurrency: true
    },
    {
      id: 'orders',
      title: 'Đơn hôm nay',
      value: 24,
      change: 8.3,
      trend: 'up',
      icon: ShoppingCart,
      color: 'green'
    },
    {
      id: 'customers',
      title: 'Khách mới',
      value: 12,
      change: -3.2,
      trend: 'down',
      icon: Users,
      color: 'purple'
    },
    {
      id: 'visits',
      title: 'Lượt truy cập',
      value: 1432,
      change: 15.8,
      trend: 'up',
      icon: TrendingUp,
      color: 'orange'
    }
  ],
  pendingOrders: [
    {
      id: 'ORD-001234',
      customer: 'Nguyễn Văn A',
      total: 1250000,
      items: 3,
      time: '10 phút trước',
      status: 'pending'
    },
    {
      id: 'ORD-001235',
      customer: 'Trần Thị B',
      total: 2340000,
      items: 5,
      time: '25 phút trước',
      status: 'pending'
    },
    {
      id: 'ORD-001236',
      customer: 'Lê Văn C',
      total: 890000,
      items: 2,
      time: '1 giờ trước',
      status: 'pending'
    },
    {
      id: 'ORD-001237',
      customer: 'Phạm Thị D',
      total: 3450000,
      items: 7,
      time: '2 giờ trước',
      status: 'pending'
    },
    {
      id: 'ORD-001238',
      customer: 'Hoàng Văn E',
      total: 1560000,
      items: 4,
      time: '3 giờ trước',
      status: 'pending'
    }
  ],
  lowStockProducts: [
    { id: 1, name: 'Áo Sơ Mi Nam Classic', sku: 'ASM-001', stock: 5, threshold: 10 },
    { id: 2, name: 'Quần Jean Nữ Skinny', sku: 'QJ-002', stock: 3, threshold: 10 },
    { id: 3, name: 'Áo Khoác Nam Bomber', sku: 'AK-003', stock: 7, threshold: 15 }
  ]
}

// Chart data (last 14 days)
const revenueChartData = [
  { date: '01/11', revenue: 35000000 },
  { date: '02/11', revenue: 42000000 },
  { date: '03/11', revenue: 38000000 },
  { date: '04/11', revenue: 45000000 },
  { date: '05/11', revenue: 41000000 },
  { date: '06/11', revenue: 48000000 },
  { date: '07/11', revenue: 52000000 },
  { date: '08/11', revenue: 39000000 },
  { date: '09/11', revenue: 43000000 },
  { date: '10/11', revenue: 47000000 },
  { date: '11/11', revenue: 51000000 },
  { date: '12/11', revenue: 46000000 },
  { date: '13/11', revenue: 49000000 },
  { date: '14/11', revenue: 45230000 }
]

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

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

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

  const handleDeleteCategory = async (categoryId) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await categoryAPI.deleteCategory(categoryId)
        // Reload categories
        const mainCategories = await categoryAPI.getMainCategories()
        setCategories(mainCategories || [])
        
        // Dispatch event để Header cập nhật
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('categoryChanged'))
        }
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Lỗi khi xóa danh mục: ' + error.message)
      }
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
      alert('Lỗi khi lưu danh mục: ' + error.message)
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
        {dashboardData.kpis.map(kpi => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
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
          <SimpleRevenueChart data={revenueChartData} />
        </div>
      </div>

      {/* Orders & Stock Grid */}
      <div className="admin-grid admin-grid-cols-2" style={{ marginBottom: 'var(--space-8)' }}>
        {/* Pending Orders */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Đơn cần xử lý</h2>
              <p className="admin-card-description">5 đơn hàng mới nhất chờ xác nhận</p>
            </div>
            <span className="admin-badge admin-badge-warning">
              {dashboardData.pendingOrders.length} đơn
            </span>
          </div>
          <div className="admin-table-container" style={{ border: 'none' }}>
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
                {dashboardData.pendingOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <span style={{ 
                        fontWeight: 'var(--font-semibold)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)'
                      }}>
                        {order.id}
                      </span>
                    </td>
                    <td>{order.customer}</td>
                    <td className="admin-table-cell-right">
                      <span style={{ fontWeight: 'var(--font-semibold)' }}>
                        {formatCurrency(order.total)}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-tertiary)'
                      }}>
                        {order.time}
                      </span>
                    </td>
                    <td className="admin-table-cell-center">
                      <div className="admin-table-actions">
                        <button 
                          className="admin-btn admin-btn-sm admin-btn-primary"
                          title="Xác nhận đơn hàng"
                        >
                          Xác nhận
                        </button>
                        <button 
                          className="admin-btn admin-btn-sm admin-btn-ghost"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-card-footer">
            <button className="admin-btn admin-btn-ghost admin-btn-sm">
              Xem tất cả đơn hàng
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Sản phẩm sắp hết hàng</h2>
              <p className="admin-card-description">Cần nhập thêm hàng</p>
            </div>
            <span className="admin-badge admin-badge-danger">
              {dashboardData.lowStockProducts.length} sản phẩm
            </span>
          </div>
          <div className="admin-table-container" style={{ border: 'none' }}>
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
                {dashboardData.lowStockProducts.map(product => {
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
                        <button className="admin-btn admin-btn-sm admin-btn-secondary">
                          <Package size={14} />
                          Nhập hàng
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="admin-card-footer">
            <button className="admin-btn admin-btn-ghost admin-btn-sm">
              Xem tất cả sản phẩm
              <ArrowUpRight size={16} />
            </button>
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
    </div>
  )
}
