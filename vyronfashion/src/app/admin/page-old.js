/**
 * Admin Dashboard Page
 * Main overview page with key metrics and widgets
 */

import { DollarSign, ShoppingCart, Users, TrendingUp, Sparkles } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/ui/PageHeader'
import { AdminCard, AdminCardHeader, AdminCardTitle } from '@/components/admin/ui/Card'
import { MetricCard } from '@/components/admin/dashboard/MetricCard'
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart'
import { LatestOrdersTable } from '@/components/admin/dashboard/LatestOrdersTable'
import { 
  mockDashboardMetrics, 
  mockRevenueData, 
  mockLatestOrders 
} from '@/lib/admin/mockDashboardData'

export default function AdminDashboardPage() {
  const { todayRevenue, todayOrders, newCustomers, websiteVisits } = mockDashboardMetrics
  
  // Get current time for greeting
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Chào buổi sáng' : currentHour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  return (
    <>
      {/* Welcome Section */}
      <div className="admin-welcome-section">
        <div className="admin-welcome-content">
          <div className="admin-welcome-icon">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="admin-welcome-title">{greeting}, Admin!</h1>
            <p className="admin-welcome-description">
              Đây là tổng quan về hoạt động kinh doanh của VyronFashion hôm nay
            </p>
          </div>
        </div>
        <div className="admin-welcome-date">
          {new Date().toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="admin-grid admin-grid-cols-4" style={{ marginBottom: 'var(--admin-space-2xl)' }}>
        <MetricCard
          title="Doanh thu hôm nay"
          value={todayRevenue.value}
          change={todayRevenue.change}
          trend={todayRevenue.trend}
          icon={DollarSign}
          isCurrency
          color="blue"
        />
        <MetricCard
          title="Đơn hàng hôm nay"
          value={todayOrders.value}
          change={todayOrders.change}
          trend={todayOrders.trend}
          icon={ShoppingCart}
          color="green"
        />
        <MetricCard
          title="Khách hàng mới"
          value={newCustomers.value}
          change={newCustomers.change}
          trend={newCustomers.trend}
          icon={Users}
          color="purple"
        />
        <MetricCard
          title="Lượt truy cập"
          value={websiteVisits.value}
          change={websiteVisits.change}
          trend={websiteVisits.trend}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Charts & Tables Grid */}
      <div className="admin-grid admin-grid-cols-1">
        {/* Revenue Chart */}
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle>Doanh thu 30 ngày qua</AdminCardTitle>
            <p className="admin-card-description">
              Biểu đồ doanh thu theo ngày (14 ngày gần nhất)
            </p>
          </AdminCardHeader>
          <RevenueChart data={mockRevenueData} />
        </AdminCard>

        {/* Latest Orders */}
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle>Đơn hàng mới nhất</AdminCardTitle>
            <p className="admin-card-description">
              5 đơn hàng gần đây nhất cần xử lý
            </p>
          </AdminCardHeader>
          <LatestOrdersTable orders={mockLatestOrders} />
        </AdminCard>
      </div>
    </>
  )
}


