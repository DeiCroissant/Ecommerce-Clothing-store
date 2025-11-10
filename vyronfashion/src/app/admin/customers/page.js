'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, User, Mail, Phone, Calendar, DollarSign, Package, Ban, Shield, Send, Check, X, Users, ChevronDown } from 'lucide-react'
import { formatCurrency } from '@/lib/formatCurrency'
import * as adminCustomerAPI from '@/lib/api/adminCustomers'
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

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [banFilter, setBanFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [selectedCustomers, setSelectedCustomers] = useState(new Set());
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionSubject, setPromotionSubject] = useState('');
  const [promotionContent, setPromotionContent] = useState('');
  const [sendingPromotion, setSendingPromotion] = useState(false);
  
  // Form fields for promotion email
  const [promoCode, setPromoCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'fixed'
  const [discountValue, setDiscountValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [validDays, setValidDays] = useState('30');
  const [description, setDescription] = useState('');

  const [openRoleDropdown, setOpenRoleDropdown] = useState(null); // Track which customer's dropdown is open

  // Generate HTML content from form fields
  const generatePromotionHTML = () => {
    const discountText = discountType === 'percentage' 
      ? `Giảm ${discountValue}% cho đơn hàng`
      : `Giảm ${parseInt(discountValue || 0).toLocaleString('vi-VN')}đ cho đơn hàng`;
    
    const maxDiscountText = maxDiscount 
      ? (discountType === 'percentage' 
          ? `Giảm tối đa ${parseInt(maxDiscount).toLocaleString('vi-VN')}đ`
          : `Áp dụng cho đơn hàng từ ${parseInt(maxDiscount).toLocaleString('vi-VN')}đ`)
      : '';

    return `
<p style="margin-bottom: 20px;">${description || 'Chúng tôi có một tin vui dành riêng cho bạn!'}</p>

<div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px dashed #f59e0b; border-radius: 12px; padding: 30px; text-align: center; margin: 24px 0;">
  <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Mã giảm giá của bạn</p>
  <div style="background: #ffffff; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 16px 0;">
    <p style="font-size: 36px; font-weight: 700; color: #18181b; letter-spacing: 4px; margin: 0; font-family: 'Courier New', monospace;">${promoCode || 'MÃKHUYẾNMÃI'}</p>
  </div>
  <p style="margin: 16px 0 0 0; color: #92400e; font-size: 18px; font-weight: 700;">${discountText}</p>
</div>

<div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin: 24px 0;">
  <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: 600;">📌 Thông tin ưu đãi:</p>
  <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #1e3a8a;">
    <li>Áp dụng cho tất cả sản phẩm</li>
    ${maxDiscountText ? `<li>${maxDiscountText}</li>` : ''}
    <li>Thời hạn: ${validDays} ngày kể từ ngày nhận email</li>
    <li>Không áp dụng đồng thời với các chương trình khác</li>
  </ul>
</div>

<div style="text-align: center; margin: 32px 0;">
  <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://your-website.com'}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #18181b 0%, #27272a 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.3s;">
    Mua sắm ngay
  </a>
</div>

<p style="margin-top: 32px; color: #71717a; font-size: 14px; line-height: 1.6;">
  Cảm ơn bạn đã tin tưởng và đồng hành cùng Vyron Fashion. Chúng tôi luôn mong muốn mang đến những sản phẩm chất lượng nhất với giá cả hợp lý nhất dành cho bạn.
</p>
    `.trim();
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchCustomers();
  }, [router, roleFilter, banFilter, page, searchQuery]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        is_banned: banFilter === 'banned' ? true : banFilter === 'active' ? false : undefined,
      };
      
      const response = await adminCustomerAPI.getAllCustomers(params);
      
      setCustomers(response.customers || []);
      setTotal(response.total || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Lỗi khi tải danh sách khách hàng', type: 'error', duration: 3000 } 
        }));
      }
      setCustomers([]);
      setTotal(0);
      setLoading(false);
    }
  };

  const handleBanToggle = async (customerId, currentBannedStatus) => {
    try {
      await adminCustomerAPI.banCustomer(customerId, !currentBannedStatus);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { 
            message: !currentBannedStatus ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản', 
            type: 'success', 
            duration: 3000 
          } 
        }));
      }
      fetchCustomers();
    } catch (error) {
      console.error('Error toggling ban:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Lỗi khi cập nhật trạng thái ban', type: 'error', duration: 3000 } 
        }));
      }
    }
  };

  const handleRoleUpdate = async (customerId, newRole) => {
    try {
      await adminCustomerAPI.updateCustomerRole(customerId, newRole);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Đã cập nhật role thành công', type: 'success', duration: 3000 } 
        }));
      }
      setOpenRoleDropdown(null); // Close dropdown
      fetchCustomers();
    } catch (error) {
      console.error('Error updating role:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Lỗi khi cập nhật role', type: 'error', duration: 3000 } 
        }));
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openRoleDropdown && !event.target.closest('.role-dropdown-container')) {
        setOpenRoleDropdown(null);
      }
    };

    if (openRoleDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openRoleDropdown]);

  const handleSendPromotion = async () => {
    if (!promoCode.trim()) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Vui lòng nhập mã khuyến mãi', type: 'error', duration: 3000 } 
        }));
      }
      return;
    }

    if (!discountValue.trim()) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Vui lòng nhập mức giảm giá', type: 'error', duration: 3000 } 
        }));
      }
      return;
    }

    try {
      setSendingPromotion(true);
      
      // Generate subject if not provided
      const subject = promotionSubject.trim() || `🎉 Mã khuyến mãi đặc biệt: ${promoCode}`;
      
      // Generate HTML content from form
      const content = generatePromotionHTML();
      
      const userIds = selectedCustomers.size > 0 ? Array.from(selectedCustomers) : null;
      const response = await adminCustomerAPI.sendPromotionEmail(userIds, subject, content);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { 
            message: response.message || `Đã gửi ${response.sent_count} email thành công`, 
            type: 'success', 
            duration: 5000 
          } 
        }));
      }
      
      // Reset form
      setShowPromotionModal(false);
      setPromotionSubject('');
      setPromoCode('');
      setDiscountValue('');
      setMaxDiscount('');
      setValidDays('30');
      setDescription('');
      setDiscountType('percentage');
      setSelectedCustomers(new Set());
    } catch (error) {
      console.error('Error sending promotion:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Lỗi khi gửi email khuyến mãi', type: 'error', duration: 3000 } 
        }));
      }
    } finally {
      setSendingPromotion(false);
    }
  };

  const toggleSelectCustomer = (customerId) => {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedCustomers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedCustomers.size === customers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(customers.map(c => c.id)));
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && customers.length === 0) {
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
              Quản lý khách hàng
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)'
            }}>
              Quản lý tài khoản, phân quyền và gửi email khuyến mãi cho khách hàng
            </p>
          </div>
          
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => {
              // Nếu có khách hàng được chọn, gửi cho họ, nếu không thì gửi cho tất cả
              setShowPromotionModal(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <Send size={18} />
            {selectedCustomers.size > 0 ? `Gửi email (${selectedCustomers.size})` : 'Gửi email cho tất cả'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="admin-grid admin-grid-cols-4" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="metric-card">
            <div className="metric-card-header">
              <div className="metric-card-title">Tổng khách hàng</div>
              <div className="metric-card-icon blue">
                <Users size={20} />
              </div>
            </div>
            <div className="metric-card-body">
              <div className="metric-card-value" style={{ color: 'var(--brand-600)' }}>
                {total}
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-card-header">
              <div className="metric-card-title">Khách hàng</div>
              <div className="metric-card-icon green">
                <User size={20} />
              </div>
            </div>
            <div className="metric-card-body">
              <div className="metric-card-value" style={{ color: 'var(--success-600)' }}>
                {customers.filter(c => c.role === 'user').length}
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-card-header">
              <div className="metric-card-title">Quản trị viên</div>
              <div className="metric-card-icon purple" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                <Shield size={20} />
              </div>
            </div>
            <div className="metric-card-body">
              <div className="metric-card-value" style={{ color: '#9333ea' }}>
                {customers.filter(c => c.role === 'admin').length}
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-card-header">
              <div className="metric-card-title">Tài khoản bị khóa</div>
              <div className="metric-card-icon" style={{ backgroundColor: 'var(--error-50)', color: 'var(--error-600)' }}>
                <Ban size={20} />
              </div>
            </div>
            <div className="metric-card-body">
              <div className="metric-card-value" style={{ color: 'var(--error-600)' }}>
                {customers.filter(c => c.is_banned).length}
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="admin-card" style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ 
            display: 'flex', 
            gap: 'var(--space-4)', 
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div className="admin-input-group">
                <Search size={18} className="admin-input-icon" />
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Tìm kiếm theo tên, email, username..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
            
            <select
              className="admin-select"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              style={{ minWidth: '150px' }}
            >
              <option value="all">Tất cả role</option>
              <option value="user">Khách hàng</option>
              <option value="admin">Quản trị viên</option>
            </select>
            
            <select
              className="admin-select"
              value={banFilter}
              onChange={(e) => {
                setBanFilter(e.target.value);
                setPage(1);
              }}
              style={{ minWidth: '150px' }}
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="banned">Bị khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="admin-card">
        {customers.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-12)',
            color: 'var(--text-secondary)'
          }}>
            <User size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }} />
            <p>Không tìm thấy khách hàng nào</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>
                      <input
                        type="checkbox"
                        checked={selectedCustomers.size === customers.length && customers.length > 0}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th>Khách hàng</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Đơn hàng</th>
                    <th>Tổng chi tiêu</th>
                    <th>Role</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th style={{ width: '240px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedCustomers.has(customer.id)}
                          onChange={() => toggleSelectCustomer(customer.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {customer.avatar ? (
                            <img 
                              src={customer.avatar} 
                              alt={customer.name}
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--bg-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--text-secondary)'
                            }}>
                              <User size={20} />
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text)' }}>
                              {customer.name}
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                              @{customer.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                          <span>{customer.email}</span>
                        </div>
                      </td>
                      <td>
                        {customer.phone ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Phone size={16} style={{ color: 'var(--text-secondary)' }} />
                            <span>{customer.phone}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>N/A</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <Package size={16} style={{ color: 'var(--text-secondary)' }} />
                          <span>{customer.total_orders || 0}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <DollarSign size={16} style={{ color: 'var(--text-secondary)' }} />
                          <span>{formatCurrency(customer.total_spent || 0)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="admin-badge" style={{
                          backgroundColor: customer.role === 'admin' ? '#f3e8ff' : 'var(--brand-50)',
                          color: customer.role === 'admin' ? '#9333ea' : 'var(--brand-600)'
                        }}>
                          {customer.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td>
                        {customer.is_banned ? (
                          <span className="admin-badge" style={{
                            backgroundColor: 'var(--error-50)',
                            color: 'var(--error-600)'
                          }}>
                            Bị khóa
                          </span>
                        ) : (
                          <span className="admin-badge" style={{
                            backgroundColor: 'var(--success-50)',
                            color: 'var(--success-600)'
                          }}>
                            Hoạt động
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
                          <span>{formatDate(customer.createdAt)}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', position: 'relative' }}>
                          <button
                            className="admin-btn admin-btn-sm admin-btn-ghost"
                            onClick={() => {
                              // Gửi email cho khách hàng này
                              setSelectedCustomers(new Set([customer.id]));
                              setShowPromotionModal(true);
                            }}
                            title="Gửi email"
                          >
                            <Send size={16} />
                          </button>
                          <button
                            className="admin-btn admin-btn-sm admin-btn-ghost"
                            onClick={() => handleBanToggle(customer.id, customer.is_banned)}
                            title={customer.is_banned ? 'Mở khóa' : 'Khóa'}
                            style={{
                              color: customer.is_banned ? 'var(--error-600)' : 'var(--text-secondary)',
                              backgroundColor: customer.is_banned ? 'var(--error-50)' : 'transparent'
                            }}
                          >
                            <Ban size={16} />
                          </button>
                          <div className="role-dropdown-container" style={{ position: 'relative' }}>
                            <button
                              className="admin-btn admin-btn-sm admin-btn-ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenRoleDropdown(openRoleDropdown === customer.id ? null : customer.id);
                              }}
                              title="Thay đổi role"
                              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}
                            >
                              <Shield size={16} />
                              <ChevronDown size={12} style={{ 
                                transform: openRoleDropdown === customer.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s'
                              }} />
                            </button>
                            {openRoleDropdown === customer.id && (
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: 'var(--space-1)',
                                backgroundColor: '#ffffff',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                zIndex: 1000,
                                minWidth: '150px',
                                overflow: 'hidden'
                              }}>
                                <button
                                  className="admin-btn admin-btn-ghost"
                                  onClick={() => {
                                    if (customer.role !== 'user') {
                                      handleRoleUpdate(customer.id, 'user');
                                    }
                                  }}
                                  style={{
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    padding: 'var(--space-2) var(--space-3)',
                                    borderRadius: 0,
                                    backgroundColor: customer.role === 'user' ? 'var(--brand-50)' : 'transparent',
                                    color: customer.role === 'user' ? 'var(--brand-600)' : 'var(--text)',
                                    fontWeight: customer.role === 'user' ? 'var(--font-semibold)' : 'var(--font-normal)'
                                  }}
                                  disabled={customer.role === 'user'}
                                >
                                  <User size={16} style={{ marginRight: 'var(--space-2)' }} />
                                  User
                                  {customer.role === 'user' && <Check size={16} style={{ marginLeft: 'auto' }} />}
                                </button>
                                <button
                                  className="admin-btn admin-btn-ghost"
                                  onClick={() => {
                                    if (customer.role !== 'admin') {
                                      handleRoleUpdate(customer.id, 'admin');
                                    }
                                  }}
                                  style={{
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    padding: 'var(--space-2) var(--space-3)',
                                    borderRadius: 0,
                                    backgroundColor: customer.role === 'admin' ? '#f3e8ff' : 'transparent',
                                    color: customer.role === 'admin' ? '#9333ea' : 'var(--text)',
                                    fontWeight: customer.role === 'admin' ? 'var(--font-semibold)' : 'var(--font-normal)'
                                  }}
                                  disabled={customer.role === 'admin'}
                                >
                                  <Shield size={16} style={{ marginRight: 'var(--space-2)' }} />
                                  Admin
                                  {customer.role === 'admin' && <Check size={16} style={{ marginLeft: 'auto' }} />}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginTop: 'var(--space-6)',
                paddingTop: 'var(--space-6)',
                borderTop: '1px solid var(--border)'
              }}>
                <button
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Trước
                </button>
                <span style={{ color: 'var(--text-secondary)', padding: '0 var(--space-4)' }}>
                  Trang {page} / {totalPages}
                </span>
                <button
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Promotion Email Modal */}
      {showPromotionModal && (
        <div className="admin-modal-overlay" onClick={() => setShowPromotionModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Gửi email khuyến mãi</h2>
              <button
                className="admin-btn admin-btn-ghost admin-btn-icon"
                onClick={() => setShowPromotionModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ 
                marginBottom: 'var(--space-4)',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)'
              }}>
                <p style={{ margin: 0, color: 'var(--text)', fontWeight: 'var(--font-semibold)' }}>
                  {selectedCustomers.size > 0 
                    ? `📧 Gửi email cho ${selectedCustomers.size} khách hàng đã chọn`
                    : '📧 Gửi email cho tất cả khách hàng'}
                </p>
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="admin-label">
                  Mã khuyến mãi <span style={{ color: 'var(--error-600)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="VD: SUMMER2024"
                  style={{ fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '2px' }}
                />
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
                  Mức giảm giá <span style={{ color: 'var(--error-600)' }}>*</span>
                </label>
                <input
                  type="number"
                  className="admin-input"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'percentage' ? 'VD: 20' : 'VD: 50000'}
                  min="0"
                />
                <p style={{ 
                  marginTop: 'var(--space-1)', 
                  fontSize: 'var(--text-xs)', 
                  color: 'var(--text-secondary)' 
                }}>
                  {discountType === 'percentage' 
                    ? 'Nhập số phần trăm (ví dụ: 20 cho 20%)' 
                    : 'Nhập số tiền giảm (ví dụ: 50000 cho 50.000đ)'}
                </p>
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="admin-label">Giảm tối đa / Đơn hàng tối thiểu (tùy chọn)</label>
                <input
                  type="number"
                  className="admin-input"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  placeholder={discountType === 'percentage' ? 'VD: 500000 (giảm tối đa)' : 'VD: 200000 (đơn hàng tối thiểu)'}
                  min="0"
                />
                <p style={{ 
                  marginTop: 'var(--space-1)', 
                  fontSize: 'var(--text-xs)', 
                  color: 'var(--text-secondary)' 
                }}>
                  {discountType === 'percentage' 
                    ? 'Giảm tối đa bao nhiêu tiền (ví dụ: 500000 cho 500.000đ)' 
                    : 'Áp dụng cho đơn hàng từ bao nhiêu tiền (ví dụ: 200000 cho 200.000đ)'}
                </p>
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="admin-label">Thời hạn (ngày)</label>
                <input
                  type="number"
                  className="admin-input"
                  value={validDays}
                  onChange={(e) => setValidDays(e.target.value)}
                  placeholder="30"
                  min="1"
                />
                <p style={{ 
                  marginTop: 'var(--space-1)', 
                  fontSize: 'var(--text-xs)', 
                  color: 'var(--text-secondary)' 
                }}>
                  Số ngày mã có hiệu lực kể từ ngày nhận email
                </p>
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="admin-label">Mô tả (tùy chọn)</label>
                <textarea
                  className="admin-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả hoặc lời chào..."
                />
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="admin-label">Tiêu đề email (tùy chọn)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={promotionSubject}
                  onChange={(e) => setPromotionSubject(e.target.value)}
                  placeholder="Để trống sẽ tự động tạo tiêu đề"
                />
                <p style={{ 
                  marginTop: 'var(--space-1)', 
                  fontSize: 'var(--text-xs)', 
                  color: 'var(--text-secondary)' 
                }}>
                  Nếu để trống, tiêu đề sẽ là: &quot;🎉 Mã khuyến mãi đặc biệt: [mã khuyến mãi]&quot;
                </p>
              </div>

              {/* Preview Section */}
              {(promoCode || discountValue) && (
                <div style={{ 
                  marginTop: 'var(--space-6)',
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)'
                }}>
                  <p style={{ 
                    margin: '0 0 var(--space-3) 0', 
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--text)'
                  }}>
                    👁️ Xem trước email:
                  </p>
                  <div 
                    style={{ 
                      backgroundColor: '#ffffff',
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}
                    dangerouslySetInnerHTML={{ __html: generatePromotionHTML() }}
                  />
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button
                className="admin-btn admin-btn-ghost"
                onClick={() => {
                  setShowPromotionModal(false);
                  setPromotionSubject('');
                  setPromoCode('');
                  setDiscountValue('');
                  setMaxDiscount('');
                  setValidDays('30');
                  setDescription('');
                  setDiscountType('percentage');
                }}
              >
                Hủy
              </button>
              <button
                className="admin-btn admin-btn-primary"
                onClick={handleSendPromotion}
                disabled={sendingPromotion || !promoCode.trim() || !discountValue.trim()}
              >
                {sendingPromotion ? 'Đang gửi...' : 'Gửi email'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

