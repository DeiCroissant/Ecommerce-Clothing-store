'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  BarChart3,
  Sparkles,
  AlertCircle,
  Lightbulb,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Package,
  Tag,
  Crown
} from 'lucide-react'
import * as analyticsAPI from '@/lib/api/adminAnalytics'
import { formatCurrency } from '@/lib/formatCurrency'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await analyticsAPI.getAnalytics(period)
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type) => {
    switch (type) {
      case 'trend': return <TrendingUp size={20} className="text-blue-500" />
      case 'warning': return <AlertCircle size={20} className="text-orange-500" />
      case 'opportunity': return <Target size={20} className="text-green-500" />
      case 'recommendation': return <Lightbulb size={20} className="text-purple-500" />
      default: return <Sparkles size={20} className="text-gray-500" />
    }
  }

  const getInsightColor = (type) => {
    switch (type) {
      case 'trend': return 'border-blue-200 bg-blue-50'
      case 'warning': return 'border-orange-200 bg-orange-50'
      case 'opportunity': return 'border-green-200 bg-green-50'
      case 'recommendation': return 'border-purple-200 bg-purple-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        color: 'var(--text-tertiary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ marginBottom: 'var(--space-4)' }} />
          <p>Đang tải dữ liệu phân tích...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="admin-card">
        <div className="admin-card-content" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Không thể tải dữ liệu phân tích</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 'var(--space-8)' 
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Sparkles size={24} />
            </div>
            <h1 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--text)',
              fontFamily: 'var(--font-display)'
            }}>
              Phân tích & AI Insights
            </h1>
          </div>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)'
          }}>
            Phân tích dữ liệu bán hàng với trí tuệ nhân tạo
          </p>
        </div>
        
        {/* Period Selector */}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {['7d', '30d', '90d', '1y'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="admin-btn admin-btn-sm"
              style={{
                backgroundColor: period === p ? 'var(--brand-600)' : 'var(--surface-secondary)',
                color: period === p ? 'white' : 'var(--text)',
                border: 'none'
              }}
            >
              {p === '7d' ? '7 ngày' : p === '30d' ? '30 ngày' : p === '90d' ? '90 ngày' : '1 năm'}
            </button>
          ))}
        </div>
      </div>

      {/* AI Insights Section */}
      {analytics.ai_insights && analytics.ai_insights.length > 0 && (
        <div className="admin-card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Sparkles size={20} style={{ color: 'var(--brand-600)' }} />
              <h2 className="admin-card-title">AI Insights & Gợi ý</h2>
            </div>
          </div>
          <div className="admin-card-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
              {analytics.ai_insights.map((insight, index) => (
                <div
                  key={index}
                  style={{
                    padding: 'var(--space-4)',
                    border: '2px solid',
                    borderRadius: 'var(--radius-md)',
                    borderColor: insight.type === 'trend' ? '#bfdbfe' :
                                 insight.type === 'warning' ? '#fed7aa' :
                                 insight.type === 'opportunity' ? '#bbf7d0' :
                                 '#e9d5ff',
                    backgroundColor: insight.type === 'trend' ? '#eff6ff' :
                                    insight.type === 'warning' ? '#fff7ed' :
                                    insight.type === 'opportunity' ? '#f0fdf4' :
                                    '#faf5ff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                    {getInsightIcon(insight.type)}
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--text)',
                        marginBottom: 'var(--space-1)'
                      }}>
                        {insight.title}
                      </h3>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--space-2)'
                      }}>
                        {insight.description}
                      </p>
                      {insight.action && (
                        <div style={{
                          padding: 'var(--space-2) var(--space-3)',
                          backgroundColor: 'white',
                          borderRadius: 'var(--radius-base)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text)',
                          fontWeight: 'var(--font-medium)'
                        }}>
                          💡 {insight.action}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="admin-grid admin-grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-card-title">Tổng doanh thu</div>
            <div className="metric-card-icon" style={{ backgroundColor: 'var(--success-50)', color: 'var(--success-600)' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="metric-card-body">
            <div className="metric-card-value" style={{ color: 'var(--success-600)' }}>
              {formatCurrency(analytics.total_revenue || 0)}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-card-title">Tổng đơn hàng</div>
            <div className="metric-card-icon" style={{ backgroundColor: 'var(--brand-50)', color: 'var(--brand-600)' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="metric-card-body">
            <div className="metric-card-value">
              {analytics.total_orders || 0}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-card-title">Giá trị đơn TB</div>
            <div className="metric-card-icon" style={{ backgroundColor: 'var(--purple-50)', color: 'var(--purple-600)' }}>
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="metric-card-body">
            <div className="metric-card-value" style={{ color: 'var(--purple-600)' }}>
              {formatCurrency(analytics.average_order_value || 0)}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-card-title">Tỷ lệ chuyển đổi</div>
            <div className="metric-card-icon" style={{ backgroundColor: 'var(--orange-50)', color: 'var(--orange-600)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="metric-card-body">
            <div className="metric-card-value" style={{ color: 'var(--orange-600)' }}>
              {(analytics.conversion_rate || 0).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="admin-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Xu hướng doanh thu</h2>
            <p className="admin-card-description">Biểu đồ doanh thu theo ngày</p>
          </div>
        </div>
        <div className="admin-card-content">
          <div style={{ height: '300px', position: 'relative' }}>
            <SimpleLineChart data={analytics.revenue_trends || []} />
          </div>
        </div>
      </div>

      <div className="admin-grid admin-grid-cols-2" style={{ gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        {/* Top Products */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Package size={20} style={{ color: 'var(--brand-600)' }} />
              <h2 className="admin-card-title">Sản phẩm bán chạy</h2>
            </div>
          </div>
          <div className="admin-card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {(analytics.top_products || []).slice(0, 10).map((product, index) => (
                <div
                  key={product.product_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--surface-secondary)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-base)',
                      backgroundColor: 'var(--brand-100)',
                      color: 'var(--brand-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'var(--font-bold)',
                      fontSize: 'var(--text-sm)'
                    }}>
                      {index + 1}
                    </div>
                    <div>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--text)',
                        marginBottom: '2px'
                      }}>
                        {product.product_name}
                      </p>
                      <p style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-secondary)'
                      }}>
                        {product.sales} sản phẩm
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--success-600)'
                    }}>
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Tag size={20} style={{ color: 'var(--brand-600)' }} />
              <h2 className="admin-card-title">Hiệu suất danh mục</h2>
            </div>
          </div>
          <div className="admin-card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {(analytics.category_performance || []).map((category) => (
                <div
                  key={category.category_id}
                  style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--surface-secondary)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--text)'
                    }}>
                      {category.category_name}
                    </p>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--success-600)'
                    }}>
                      {formatCurrency(category.revenue)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    <span>{category.sales} sản phẩm</span>
                    <span>{category.product_count} sản phẩm trong danh mục</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      {analytics.customer_segments && analytics.customer_segments.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Crown size={20} style={{ color: 'var(--brand-600)' }} />
              <h2 className="admin-card-title">Phân khúc khách hàng</h2>
            </div>
          </div>
          <div className="admin-card-content">
            <div className="admin-grid admin-grid-cols-3" style={{ gap: 'var(--space-4)' }}>
              {analytics.customer_segments.map((segment) => (
                <div
                  key={segment.segment}
                  style={{
                    padding: 'var(--space-4)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--surface)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                    {segment.segment === 'vip' && <Crown size={20} style={{ color: '#ca8a04' }} />}
                    {segment.segment === 'new' && <Users size={20} style={{ color: '#2563eb' }} />}
                    {segment.segment === 'returning' && <Users size={20} style={{ color: '#16a34a' }} />}
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--text)',
                      textTransform: 'capitalize'
                    }}>
                      {segment.segment === 'vip' ? 'VIP' : segment.segment === 'new' ? 'Mới' : 'Quay lại'}
                    </p>
                  </div>
                  <div style={{ marginBottom: 'var(--space-2)' }}>
                    <p style={{
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--text)'
                    }}>
                      {segment.count}
                    </p>
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)'
                    }}>
                      {segment.percentage.toFixed(1)}% tổng khách hàng
                    </p>
                  </div>
                  <div>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--success-600)'
                    }}>
                      {formatCurrency(segment.revenue)}
                    </p>
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)'
                    }}>
                      Doanh thu
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Simple Line Chart Component
function SimpleLineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-tertiary)'
      }}>
        <p>Chưa có dữ liệu</p>
      </div>
    )
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1)
  const chartHeight = 250
  const chartWidth = 100
  const pointRadius = 4

  return (
    <div style={{ position: 'relative', height: '100%', padding: 'var(--space-4)' }}>
      <svg width="100%" height={chartHeight + 40} style={{ overflow: 'visible' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            y1={chartHeight * ratio + 20}
            x2="100%"
            y2={chartHeight * ratio + 20}
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Line */}
        <polyline
          points={data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100
            const y = chartHeight - (d.revenue / maxRevenue) * chartHeight + 20
            return `${x}%,${y}`
          }).join(' ')}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="2"
        />

        {/* Points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100
          const y = chartHeight - (d.revenue / maxRevenue) * chartHeight + 20
          return (
            <circle
              key={i}
              cx={`${x}%`}
              cy={y}
              r={pointRadius}
              fill="#4f46e5"
            />
          )
        })}

        {/* X-axis labels */}
        {data.filter((_, i) => i % Math.ceil(data.length / 7) === 0 || i === data.length - 1).map((d, i) => {
          const index = i * Math.ceil(data.length / 7)
          const x = (index / (data.length - 1)) * 100
          const date = new Date(d.date)
          return (
            <text
              key={i}
              x={`${x}%`}
              y={chartHeight + 35}
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
            >
              {date.getDate()}/{date.getMonth() + 1}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

