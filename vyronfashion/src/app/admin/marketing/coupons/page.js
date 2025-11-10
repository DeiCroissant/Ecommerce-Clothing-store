'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Tag, Percent, DollarSign, Calendar, X, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/formatCurrency'
import * as adminCouponAPI from '@/lib/api/adminCoupons'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
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

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return 'N/A';
  }
}

export default function AdminCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  
  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchCoupons();
  }, [router]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await adminCouponAPI.getAllCoupons();
      setCoupons(response.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Lỗi khi tải danh sách mã giảm giá', type: 'error', duration: 3000 } 
        }));
      }
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinOrderAmount('');
    setMaxDiscount('');
    setUsageLimit('');
    setIsActive(true);
    setEditingCoupon(null);
  };

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCode(coupon.code);
      setDiscountType(coupon.discount_type);
      setDiscountValue(coupon.discount_value.toString());
      setMinOrderAmount(coupon.min_order_amount?.toString() || '');
      setMaxDiscount(coupon.max_discount?.toString() || '');
      setUsageLimit(coupon.usage_limit?.toString() || '');
      setIsActive(coupon.is_active);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'Vui lòng nhập mã giảm giá', type: 'error', duration: 3000 } 
      }));
      return;
    }

    if (!discountValue) {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'Vui lòng nhập giá trị giảm giá', type: 'error', duration: 3000 } 
      }));
      return;
    }

    try {
      const couponData = {
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
        max_discount: maxDiscount ? parseFloat(maxDiscount) : null,
        usage_limit: usageLimit ? parseInt(usageLimit) : null,
        is_active: isActive,
      };

      if (editingCoupon) {
        await adminCouponAPI.updateCoupon(editingCoupon.id, couponData);
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Đã cập nhật mã giảm giá thành công', type: 'success', duration: 3000 } 
        }));
      } else {
        await adminCouponAPI.createCoupon(couponData);
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Đã tạo mã giảm giá thành công', type: 'success', duration: 3000 } 
        }));
      }

      handleCloseModal();
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: error.message || 'Lỗi khi lưu mã giảm giá', type: 'error', duration: 3000 } 
      }));
    }
  };

  const handleDeleteClick = (couponId, code) => {
    setCouponToDelete({ id: couponId, code });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;

    try {
      await adminCouponAPI.deleteCoupon(couponToDelete.id);
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'Đã xóa mã giảm giá thành công', type: 'success', duration: 3000 } 
      }));
      setShowDeleteConfirm(false);
      setCouponToDelete(null);
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: error.message || 'Lỗi khi xóa mã giảm giá', type: 'error', duration: 3000 } 
      }));
    }
  };

  if (loading && coupons.length === 0) {
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
          marginBottom: 'var(--space-6)'
        }}>
          <div>
            <h1 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--text)',
              marginBottom: 'var(--space-1)',
              fontFamily: 'var(--font-display)'
            }}>
              Quản lý mã giảm giá
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)'
            }}>
              Tạo và quản lý mã giảm giá cho khách hàng
            </p>
          </div>
          
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => handleOpenModal()}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <Plus size={18} />
            Tạo mã mới
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="admin-card">
        {coupons.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-12)',
            color: 'var(--text-secondary)'
          }}>
            <Tag size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }} />
            <p>Chưa có mã giảm giá nào</p>
            <button
              className="admin-btn admin-btn-primary admin-btn-sm"
              onClick={() => handleOpenModal()}
              style={{ marginTop: 'var(--space-4)' }}
            >
              Tạo mã đầu tiên
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã giảm giá</th>
                  <th>Loại giảm giá</th>
                  <th>Giá trị</th>
                  <th>Đơn tối thiểu</th>
                  <th>Giảm tối đa</th>
                  <th>Số lượng</th>
                  <th>Đã sử dụng</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th style={{ width: '120px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Tag size={16} style={{ color: 'var(--text-secondary)' }} />
                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '1px' }}>
                          {coupon.code}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge" style={{
                        backgroundColor: coupon.discount_type === 'percentage' ? '#f0f9ff' : '#fef3c7',
                        color: coupon.discount_type === 'percentage' ? '#1e40af' : '#92400e'
                      }}>
                        {coupon.discount_type === 'percentage' ? 'Phần trăm' : 'Số tiền'}
                      </span>
                    </td>
                    <td>
                      {coupon.discount_type === 'percentage' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                          <Percent size={16} />
                          {coupon.discount_value}%
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                          <DollarSign size={16} />
                          {formatCurrency(coupon.discount_value)}
                        </span>
                      )}
                    </td>
                    <td>
                      {coupon.min_order_amount > 0 ? formatCurrency(coupon.min_order_amount) : 'Không có'}
                    </td>
                    <td>
                      {coupon.max_discount ? formatCurrency(coupon.max_discount) : 'Không có'}
                    </td>
                    <td>
                      {coupon.usage_limit ? coupon.usage_limit : 'Không giới hạn'}
                    </td>
                    <td>
                      <span style={{ 
                        color: coupon.usage_limit && coupon.used_count >= coupon.usage_limit ? 'var(--error-600)' : 'var(--text)'
                      }}>
                        {coupon.used_count}
                      </span>
                    </td>
                    <td>
                      <span className="admin-badge" style={{
                        backgroundColor: coupon.is_active ? 'var(--success-50)' : 'var(--error-50)',
                        color: coupon.is_active ? 'var(--success-600)' : 'var(--error-600)'
                      }}>
                        {coupon.is_active ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
                        <span>{formatDate(coupon.created_at)}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                          className="admin-btn admin-btn-sm admin-btn-ghost"
                          onClick={() => handleOpenModal(coupon)}
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="admin-btn admin-btn-sm admin-btn-ghost"
                          onClick={() => handleDeleteClick(coupon.id, coupon.code)}
                          title="Xóa"
                          style={{
                            color: 'var(--error-600)'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingCoupon ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}</h2>
              <button
                className="admin-btn admin-btn-ghost admin-btn-icon"
                onClick={handleCloseModal}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="admin-label">
                    Mã giảm giá <span style={{ color: 'var(--error-600)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="VD: SUMMER2024"
                    style={{ fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '2px' }}
                    required
                    disabled={!!editingCoupon}
                  />
                  <p style={{ 
                    marginTop: 'var(--space-1)', 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--text-secondary)' 
                  }}>
                    {editingCoupon ? 'Không thể thay đổi mã sau khi tạo' : 'Mã sẽ tự động chuyển thành chữ hoa'}
                  </p>
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="admin-label">Loại giảm giá</label>
                  <select
                    className="admin-select"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (đ)</option>
                  </select>
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="admin-label">
                    Giá trị giảm giá <span style={{ color: 'var(--error-600)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    className="admin-input"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? 'VD: 20 (cho 20%)' : 'VD: 50000 (cho 50.000đ)'}
                    min="0"
                    max={discountType === 'percentage' ? '100' : undefined}
                    step={discountType === 'percentage' ? '1' : '1000'}
                    required
                  />
                  <p style={{ 
                    marginTop: 'var(--space-1)', 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--text-secondary)' 
                  }}>
                    {discountType === 'percentage' 
                      ? 'Nhập số phần trăm (tối đa 100%)' 
                      : 'Nhập số tiền giảm (đ)'}
                  </p>
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="admin-label">
                    Số tiền đơn hàng tối thiểu
                  </label>
                  <input
                    type="number"
                    className="admin-input"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="VD: 200000"
                    min="0"
                    step="1000"
                  />
                  <p style={{ 
                    marginTop: 'var(--space-1)', 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--text-secondary)' 
                  }}>
                    Đơn hàng phải có giá trị tối thiểu này mới áp dụng được mã
                  </p>
                </div>

                {discountType === 'percentage' && (
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <label className="admin-label">Giảm tối đa (tùy chọn)</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value)}
                      placeholder="VD: 500000"
                      min="0"
                      step="1000"
                    />
                    <p style={{ 
                      marginTop: 'var(--space-1)', 
                      fontSize: 'var(--text-xs)', 
                      color: 'var(--text-secondary)' 
                    }}>
                      Giới hạn số tiền giảm tối đa (ví dụ: 20% nhưng tối đa 500.000đ)
                    </p>
                  </div>
                )}

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="admin-label">Số lượng sử dụng (tùy chọn)</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="VD: 100"
                    min="1"
                  />
                  <p style={{ 
                    marginTop: 'var(--space-1)', 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--text-secondary)' 
                  }}>
                    Số lần mã có thể được sử dụng (để trống = không giới hạn)
                  </p>
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Kích hoạt mã giảm giá</span>
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                >
                  {editingCoupon ? 'Cập nhật' : 'Tạo mã'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCouponToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xóa mã giảm giá"
        message={couponToDelete ? `Bạn có chắc chắn muốn xóa mã giảm giá "${couponToDelete.code}"?` : ''}
        confirmText="Xóa"
        cancelText="Hủy"
        confirmButtonClass="btn-confirm-delete"
      />
    </div>
  )
}

