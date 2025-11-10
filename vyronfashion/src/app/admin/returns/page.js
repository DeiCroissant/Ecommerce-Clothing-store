'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, PackageX, Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/formatCurrency'
import * as adminReturnsAPI from '@/lib/api/adminReturns'
import Link from 'next/link'
import '@/styles/admin-design-system.css'
import '@/styles/admin-components.css'
import { X } from 'lucide-react'

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
    label: 'Chờ xử lý',
    color: 'var(--text-secondary)',
    bgColor: 'var(--surface-secondary)',
  },
  approved: {
    label: 'Đã duyệt',
    color: 'var(--success-600)',
    bgColor: 'var(--success-50)',
  },
  processing: {
    label: 'Đang xử lý',
    color: 'var(--brand-600)',
    bgColor: 'var(--brand-50)',
  },
  completed: {
    label: 'Hoàn thành',
    color: 'var(--success-600)',
    bgColor: 'var(--success-50)',
  },
  rejected: {
    label: 'Từ chối',
    color: 'var(--error-600)',
    bgColor: 'var(--error-50)',
  },
}

export default function AdminReturnsPage() {
  const router = useRouter()
  const [returns, setReturns] = useState([])
  const [allReturns, setAllReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReturn, setSelectedReturn] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [refundDate, setRefundDate] = useState('')

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchReturns();
  }, [router, statusFilter]);

  useEffect(() => {
    filterReturns();
  }, [allReturns, searchQuery, statusFilter]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await adminReturnsAPI.getAllReturns({
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      
      const returnsData = response.returns || [];
      setAllReturns(returnsData);
    } catch (error) {
      console.error('Error fetching returns:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Lỗi khi tải danh sách yêu cầu trả hàng', type: 'error', duration: 3000 } 
        }));
      }
      setAllReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReturns = () => {
    let filtered = [...allReturns];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.return_number?.toLowerCase().includes(query) ||
        r.order_id?.toLowerCase().includes(query) ||
        r.user_id?.toLowerCase().includes(query)
      );
    }
    
    setReturns(filtered);
  };

  const handleStatusUpdate = (returnItem) => {
    setSelectedReturn(returnItem);
    setNewStatus(returnItem.status);
    setAdminNote(returnItem.admin_note || '');
    setRefundAmount(returnItem.refund_amount?.toString() || '');
    setRefundDate(returnItem.refund_date || '');
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedReturn) return;
    
    try {
      await adminReturnsAPI.updateReturnStatus(
        selectedReturn.id,
        newStatus,
        adminNote || null,
        refundAmount ? parseFloat(refundAmount) : null,
        refundDate || null
      );
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Đã cập nhật trạng thái thành công', type: 'success', duration: 3000 } 
        }));
        window.dispatchEvent(new CustomEvent('returnsChanged'));
      }
      
      setShowStatusModal(false);
      setSelectedReturn(null);
      fetchReturns();
    } catch (error) {
      console.error('Error updating return status:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Lỗi khi cập nhật trạng thái', type: 'error', duration: 3000 } 
        }));
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading && returns.length === 0) {
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
          flexDirection: 'column', 
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
              Yêu cầu đổi trả & Hoàn tiền
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)'
            }}>
              Quản lý tất cả yêu cầu đổi trả và hoàn tiền
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="admin-grid admin-grid-cols-5" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="metric-card">
            <div className="metric-card-header">
              <div className="metric-card-title">Tất cả</div>
              <div className="metric-card-icon" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>
                <PackageX size={20} />
              </div>
            </div>
            <div className="metric-card-body">
              <div className="metric-card-value">
                {allReturns.length}
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-card-header">
              <div className="metric-card-title">Chờ xử lý</div>
              <div className="metric-card-icon" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>
                <Clock size={20} />
              </div>
            </div>
            <div className="metric-card-body">
              <div className="metric-card-value" style={{ color: 'var(--text-secondary)' }}>
                {allReturns.filter(r => r.status === 'pending').length}
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-card-header">
              <div className="metric-card-title">Đã duyệt</div>
              <div className="metric-card-icon green">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="metric-card-body">
              <div className="metric-card-value" style={{ color: 'var(--success-600)' }}>
                {allReturns.filter(r => r.status === 'approved').length}
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-card-header">
              <div className="metric-card-title">Hoàn thành</div>
              <div className="metric-card-icon green">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="metric-card-body">
              <div className="metric-card-value" style={{ color: 'var(--success-600)' }}>
                {allReturns.filter(r => r.status === 'completed').length}
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-card-header">
              <div className="metric-card-title">Từ chối</div>
              <div className="metric-card-icon" style={{ backgroundColor: 'var(--error-50)', color: 'var(--error-600)' }}>
                <XCircle size={20} />
              </div>
            </div>
            <div className="metric-card-body">
              <div className="metric-card-value" style={{ color: 'var(--error-600)' }}>
                {allReturns.filter(r => r.status === 'rejected').length}
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
            <p className="admin-card-description">Tìm kiếm và lọc yêu cầu đổi trả theo tiêu chí</p>
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
                  placeholder="Số yêu cầu, mã đơn hàng, ID khách hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Trạng thái</label>
              <select
                className="admin-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="approved">Đã duyệt</option>
                <option value="processing">Đang xử lý</option>
                <option value="completed">Hoàn thành</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Returns List */}
      <div>
        {returns.length === 0 && !loading ? (
          <div className="admin-card">
            <div className="admin-card-content" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
              <div className="admin-table-empty-icon">
                <PackageX size={48} />
              </div>
              <h3 className="admin-table-empty-title">Không có yêu cầu trả hàng nào</h3>
              <p className="admin-table-empty-description">
                {statusFilter !== 'all' 
                  ? `Không có yêu cầu nào với trạng thái "${statusConfig[statusFilter]?.label || statusFilter}"`
                  : 'Chưa có yêu cầu trả hàng nào trong hệ thống'}
              </p>
              {searchQuery && (
                <button
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setSearchQuery('')}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Danh sách yêu cầu trả hàng</h2>
                <p className="admin-card-description">
                  {returns.length} yêu cầu {statusFilter !== 'all' && `(${statusConfig[statusFilter]?.label})`}
                </p>
              </div>
            </div>
            <div className="admin-table-container">
              {returns.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 'var(--space-8)',
                  color: 'var(--text-tertiary)'
                }}>
                  Đang tải...
                </div>
              ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Số yêu cầu</th>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Số tiền hoàn</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th className="admin-table-cell-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((returnItem) => {
                  const status = statusConfig[returnItem.status] || statusConfig.pending;
                  const itemsCount = returnItem.items?.length || 0;
                  
                  return (
                    <tr key={returnItem.id}>
                      <td>
                        <div style={{ fontWeight: 'var(--font-semibold)' }}>
                          #{returnItem.return_number || returnItem.id}
                        </div>
                      </td>
                      <td>
                        <Link 
                          href={`/admin/orders?orderId=${returnItem.order_id}`}
                          style={{ color: 'var(--brand-600)', textDecoration: 'none' }}
                        >
                          #{returnItem.order_id}
                        </Link>
                      </td>
                      <td>
                        <div style={{ fontSize: 'var(--text-sm)' }}>
                          {returnItem.user_id}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 'var(--text-sm)' }}>
                          {itemsCount} sản phẩm
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--success-600)' }}>
                          {returnItem.refund_amount 
                            ? formatCurrency(returnItem.refund_amount)
                            : 'Chưa tính'
                          }
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                          {formatDate(returnItem.created_at)}
                        </div>
                      </td>
                      <td>
                        <span className="admin-badge" style={{
                          backgroundColor: status.bgColor,
                          color: status.color
                        }}>
                          {status.label}
                        </span>
                      </td>
                      <td className="admin-table-cell-center">
                        <div className="admin-table-actions">
                          <Link
                            href={`/account/returns/${returnItem.id}`}
                            className="admin-btn admin-btn-sm admin-btn-ghost"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            className="admin-btn admin-btn-sm admin-btn-primary"
                            onClick={() => handleStatusUpdate(returnItem)}
                            title="Cập nhật trạng thái"
                          >
                            <CheckCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedReturn && (
        <div className="modal-overlay" onClick={() => {
          setShowStatusModal(false);
          setSelectedReturn(null);
          setAdminNote('');
          setRefundAmount('');
          setRefundDate('');
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Cập nhật trạng thái yêu cầu trả hàng</h2>
              <button 
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedReturn(null);
                  setAdminNote('');
                  setRefundAmount('');
                  setRefundDate('');
                }} 
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fafafa', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Số yêu cầu: <strong>#{selectedReturn.return_number || selectedReturn.id}</strong>
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Mã đơn hàng: <strong>#{selectedReturn.order_id}</strong>
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Số tiền hoàn: <strong style={{ color: 'var(--success-600)' }}>
                    {selectedReturn.refund_amount ? formatCurrency(selectedReturn.refund_amount) : 'Chưa tính'}
                  </strong>
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)' }}>
                  Trạng thái *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="admin-select"
                  style={{ width: '100%' }}
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)' }}>
                  Ghi chú của admin
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="admin-input"
                  rows={3}
                  placeholder="Nhập ghi chú..."
                />
              </div>

              {newStatus === 'completed' && (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)' }}>
                      Số tiền hoàn (₫)
                    </label>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="admin-input"
                      placeholder="Nhập số tiền hoàn..."
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)' }}>
                      Ngày hoàn tiền
                    </label>
                    <input
                      type="date"
                      value={refundDate}
                      onChange={(e) => setRefundDate(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedReturn(null);
                  setAdminNote('');
                  setRefundAmount('');
                  setRefundDate('');
                }} 
                className="btn-cancel"
              >
                Hủy
              </button>
              <button 
                onClick={confirmStatusUpdate} 
                className="btn-confirm-default"
              >
                Cập nhật
              </button>
            </div>
          </div>

          <style jsx>{`
            .modal-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 9999;
              padding: 1rem;
            }

            .modal-content {
              background: white;
              border-radius: 1rem;
              width: 100%;
              max-width: 600px;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            }

            .modal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 1.5rem;
              border-bottom: 1px solid #e4e4e7;
            }

            .modal-title {
              font-size: 1.125rem;
              font-weight: 600;
              color: #18181b;
              margin: 0;
            }

            .btn-close {
              width: 2rem;
              height: 2rem;
              display: flex;
              align-items: center;
              justify-content: center;
              background: transparent;
              border: none;
              border-radius: 0.5rem;
              color: #71717a;
              cursor: pointer;
              transition: all 0.2s;
            }

            .btn-close:hover {
              background: #f4f4f5;
            }

            .modal-body {
              padding: 1.5rem;
              max-height: 70vh;
              overflow-y: auto;
            }

            .modal-actions {
              display: flex;
              gap: 0.75rem;
              padding: 1.5rem;
              border-top: 1px solid #e4e4e7;
            }

            .btn-cancel,
            .btn-confirm-default {
              flex: 1;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
              font-size: 0.9375rem;
              border: none;
            }

            .btn-cancel {
              background: white;
              border: 1px solid #e4e4e7;
              color: #18181b;
            }

            .btn-cancel:hover {
              background: #f4f4f5;
            }

            .btn-confirm-default {
              background: #18181b;
              color: white;
            }

            .btn-confirm-default:hover {
              background: #27272a;
            }
          `}</style>
        </div>
      )}
    </div>
  )
}

