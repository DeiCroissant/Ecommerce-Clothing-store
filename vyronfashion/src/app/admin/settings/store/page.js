'use client'

import { useState, useEffect } from 'react'
import { Store, Save, Loader } from 'lucide-react'

export default function StoreSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    storeName: 'VyronFashion',
    storeEmail: 'contact@vyronfashion.com',
    storePhone: '1900 1234',
    storeAddress: '',
    storeCity: '',
    storeDistrict: '',
    storeWard: '',
    storeDescription: '',
    storeLogo: '',
    storeFavicon: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // TODO: Implement API call to save store settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Đã lưu cài đặt cửa hàng thành công!', type: 'success', duration: 3000 } 
        }))
      }
    } catch (error) {
      console.error('Error saving store settings:', error)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Lỗi khi lưu cài đặt: ' + error.message, type: 'error', duration: 3000 } 
        }))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-2)'
        }}>
          <Store size={24} style={{ color: 'var(--brand-600)' }} />
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--text)',
            fontFamily: 'var(--font-display)'
          }}>
            Cài đặt cửa hàng
          </h1>
        </div>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)'
        }}>
          Quản lý thông tin cửa hàng, logo, địa chỉ và thông tin liên hệ
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit}>
        <div className="admin-card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Thông tin cửa hàng</h2>
              <p className="admin-card-description">Thông tin cơ bản về cửa hàng</p>
            </div>
          </div>
          <div className="admin-card-content">
            <div className="admin-grid admin-grid-cols-2" style={{ gap: 'var(--space-6)' }}>
              <div className="admin-form-group">
                <label className="admin-label">Tên cửa hàng *</label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  className="admin-input"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Email cửa hàng *</label>
                <input
                  type="email"
                  name="storeEmail"
                  value={formData.storeEmail}
                  onChange={handleChange}
                  className="admin-input"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Số điện thoại *</label>
                <input
                  type="tel"
                  name="storePhone"
                  value={formData.storePhone}
                  onChange={handleChange}
                  className="admin-input"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Logo cửa hàng</label>
                <input
                  type="url"
                  name="storeLogo"
                  value={formData.storeLogo}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="admin-label">Mô tả cửa hàng</label>
                <textarea
                  name="storeDescription"
                  value={formData.storeDescription}
                  onChange={handleChange}
                  className="admin-input"
                  rows={4}
                  placeholder="Nhập mô tả về cửa hàng..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Địa chỉ cửa hàng</h2>
              <p className="admin-card-description">Địa chỉ liên hệ của cửa hàng</p>
            </div>
          </div>
          <div className="admin-card-content">
            <div className="admin-grid admin-grid-cols-2" style={{ gap: 'var(--space-6)' }}>
              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="admin-label">Địa chỉ</label>
                <input
                  type="text"
                  name="storeAddress"
                  value={formData.storeAddress}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="Số nhà, tên đường"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Phường/Xã</label>
                <input
                  type="text"
                  name="storeWard"
                  value={formData.storeWard}
                  onChange={handleChange}
                  className="admin-input"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Quận/Huyện</label>
                <input
                  type="text"
                  name="storeDistrict"
                  value={formData.storeDistrict}
                  onChange={handleChange}
                  className="admin-input"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Tỉnh/Thành phố</label>
                <input
                  type="text"
                  name="storeCity"
                  value={formData.storeCity}
                  onChange={handleChange}
                  className="admin-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 'var(--space-3)'
        }}>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={18} className="spinner" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Lưu cài đặt</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

