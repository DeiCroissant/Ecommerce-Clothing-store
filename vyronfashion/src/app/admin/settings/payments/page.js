'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Truck, Save, Loader, CheckCircle, XCircle } from 'lucide-react'

export default function PaymentsSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [shippingMethods, setShippingMethods] = useState([])

  // Load settings from API
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:8000/api/settings/payments')
        const data = await response.json()
        
        if (data.success) {
          setPaymentMethods(data.payment_methods || [])
          setShippingMethods(data.shipping_methods || [])
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('showToast', { 
            detail: { message: 'Lỗi khi tải cài đặt', type: 'error', duration: 3000 } 
          }))
        }
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const togglePaymentMethod = (id) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === id ? { ...method, enabled: !method.enabled } : method
    ))
  }

  const toggleShippingMethod = (id) => {
    setShippingMethods(prev => prev.map(method => 
      method.id === id ? { ...method, enabled: !method.enabled } : method
    ))
  }

  const updateShippingMethod = (id, field, value) => {
    setShippingMethods(prev => prev.map(method => 
      method.id === id ? { ...method, [field]: value } : method
    ))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const response = await fetch('http://localhost:8000/api/settings/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_methods: paymentMethods,
          shipping_methods: shippingMethods
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('showToast', { 
            detail: { message: 'Đã lưu cài đặt thanh toán & vận chuyển thành công!', type: 'success', duration: 3000 } 
          }))
        }
      } else {
        throw new Error('Lỗi khi lưu cài đặt')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Lỗi khi lưu cài đặt: ' + error.message, type: 'error', duration: 3000 } 
        }))
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Loader size={32} className="spinner" style={{ color: 'var(--brand-600)' }} />
      </div>
    )
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
          <CreditCard size={24} style={{ color: 'var(--brand-600)' }} />
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--text)',
            fontFamily: 'var(--font-display)'
          }}>
            Thanh toán & Vận chuyển
          </h1>
        </div>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)'
        }}>
          Cấu hình phương thức thanh toán và vận chuyển
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Payment Methods */}
        <div className="admin-card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Phương thức thanh toán</h2>
              <p className="admin-card-description">Bật/tắt các phương thức thanh toán</p>
            </div>
          </div>
          <div className="admin-card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-4)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: method.enabled ? 'var(--surface)' : 'var(--surface-secondary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <CreditCard size={20} style={{ color: 'var(--text-secondary)' }} />
                    <div>
                      <span style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--text)',
                        display: 'block'
                      }}>
                        {method.name}
                      </span>
                      {method.description && (
                        <span style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-secondary)',
                          display: 'block'
                        }}>
                          {method.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePaymentMethod(method.id)}
                    className="admin-btn admin-btn-sm"
                    style={{
                      backgroundColor: method.enabled ? 'var(--success-500)' : 'var(--neutral-300)',
                      color: 'white',
                      border: 'none',
                      minWidth: '80px'
                    }}
                  >
                    {method.enabled ? (
                      <>
                        <CheckCircle size={16} />
                        <span>Bật</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        <span>Tắt</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shipping Methods */}
        <div className="admin-card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Phương thức vận chuyển</h2>
              <p className="admin-card-description">Cấu hình các phương thức vận chuyển</p>
            </div>
          </div>
          <div className="admin-card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {shippingMethods.map((method) => (
                <div
                  key={method.id}
                  style={{
                    padding: 'var(--space-4)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: method.enabled ? 'var(--surface)' : 'var(--surface-secondary)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: method.enabled ? 'var(--space-4)' : 0
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <Truck size={20} style={{ color: 'var(--text-secondary)' }} />
                      <div>
                        <span style={{
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-medium)',
                          color: 'var(--text)',
                          display: 'block'
                        }}>
                          {method.name}
                        </span>
                        {method.description && (
                          <span style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--text-secondary)',
                            display: 'block'
                          }}>
                            {method.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleShippingMethod(method.id)}
                      className="admin-btn admin-btn-sm"
                      style={{
                        backgroundColor: method.enabled ? 'var(--success-500)' : 'var(--neutral-300)',
                        color: 'white',
                        border: 'none',
                        minWidth: '80px'
                      }}
                    >
                      {method.enabled ? (
                        <>
                          <CheckCircle size={16} />
                          <span>Bật</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} />
                          <span>Tắt</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {method.enabled && (
                    <div className="admin-grid admin-grid-cols-3" style={{ gap: 'var(--space-4)' }}>
                      <div className="admin-form-group">
                        <label className="admin-label">Phí vận chuyển (₫)</label>
                        <input
                          type="number"
                          value={method.price}
                          onChange={(e) => updateShippingMethod(method.id, 'price', parseInt(e.target.value) || 0)}
                          className="admin-input"
                          min="0"
                          step="1000"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-label">Thời gian giao hàng</label>
                        <input
                          type="text"
                          value={method.estimated_days}
                          onChange={(e) => updateShippingMethod(method.id, 'estimated_days', e.target.value)}
                          className="admin-input"
                          placeholder="3-5 ngày"
                        />
                      </div>
                      {method.min_order !== undefined && method.min_order !== null && (
                        <div className="admin-form-group">
                          <label className="admin-label">Đơn tối thiểu (₫)</label>
                          <input
                            type="number"
                            value={method.min_order}
                            onChange={(e) => updateShippingMethod(method.id, 'min_order', parseInt(e.target.value) || 0)}
                            className="admin-input"
                            min="0"
                            step="10000"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
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
            disabled={saving}
          >
            {saving ? (
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

