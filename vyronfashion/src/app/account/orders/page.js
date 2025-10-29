'use client';

import { useState, useEffect, useMemo } from 'react';
import { OrderList } from '@/features/orders/components/OrderList';
import { OrderFilters } from '@/features/orders/components/OrderFilters';
import { OrderSearch } from '@/features/orders/components/OrderSearch';
import { OrderPagination } from '@/features/orders/components/OrderPagination';
import { EmptyOrders } from '@/features/orders/components/EmptyOrders';
import { 
  mockOrders, 
  ORDERS_PER_PAGE,
  paginateOrders
} from '@/lib/mockOrdersData';
import '@/styles/account-orders.css';

export default function OrdersPage() {
  // State
  const [activeStatus, setActiveStatus] = useState('all');
  const [activeDateRange, setActiveDateRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    let result = mockOrders;

    // Apply status filter
    if (activeStatus !== 'all') {
      result = result.filter(order => order.status === activeStatus);
    }

    // Apply date range filter
    if (activeDateRange !== 'all') {
      const days = Number(activeDateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      result = result.filter(order => new Date(order.orderDate) >= cutoffDate);
    }

    // Apply search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(order => {
        const orderIdLower = order.id.toLowerCase();
        return orderIdLower.includes(lowerQuery) ||
          order.items.some(item => item.name.toLowerCase().includes(lowerQuery));
      });
    }

    return result;
  }, [activeStatus, activeDateRange, searchQuery]);

  // Pagination
  const paginatedData = useMemo(() => {
    return paginateOrders(filteredOrders, currentPage, ORDERS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus, activeDateRange, searchQuery]);

  // Handlers
  const handleStatusChange = (status) => {
    setActiveStatus(status);
  };

  const handleDateRangeChange = (range) => {
    setActiveDateRange(range);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReorder = (order) => {
    // Add all items from order to cart
    console.log('Reorder:', order.id);
    alert(`Đã thêm ${order.itemsCount} sản phẩm vào giỏ hàng!`);
    // TODO: Implement add to cart logic
  };

  // Calculate display range
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = startIndex + paginatedData.orders.length;

  // Determine empty state type
  const hasOrders = mockOrders.length > 0;
  const hasFilteredResults = filteredOrders.length > 0;

  return (
    <div className="orders-page">
      {/* Page Header */}
      <div className="orders-header">
        <div className="header-content">
          <h1 className="page-title">Đơn Hàng Của Tôi</h1>
          <p className="page-description">Theo dõi và quản lý đơn hàng của bạn</p>
        </div>
        
        {hasOrders && (
          <OrderSearch onSearch={handleSearch} />
        )}
      </div>

      {/* Filters */}
      {hasOrders && (
        <OrderFilters
          activeStatus={activeStatus}
          activeDateRange={activeDateRange}
          onStatusChange={handleStatusChange}
          onDateRangeChange={handleDateRangeChange}
        />
      )}

      {/* Results Summary */}
      {hasOrders && hasFilteredResults && (
        <div className="results-summary">
          <p>
            Hiển thị <strong>{startIndex + 1}-{endIndex}</strong> trong tổng số{' '}
            <strong>{filteredOrders.length}</strong> đơn hàng
          </p>
        </div>
      )}

      {/* Orders List or Empty State */}
      {!hasOrders ? (
        <EmptyOrders type="no-orders" />
      ) : !hasFilteredResults ? (
        <EmptyOrders type="no-results" />
      ) : (
        <>
          <OrderList 
            orders={paginatedData.orders}
            onReorder={handleReorder}
          />
          
          <OrderPagination
            currentPage={paginatedData.currentPage}
            totalPages={paginatedData.totalPages}
            totalOrders={filteredOrders.length}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
