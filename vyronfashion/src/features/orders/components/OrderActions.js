'use client'

import { useState } from 'react'
import { Download, X, RotateCcw, MessageCircle } from 'lucide-react'

export function OrderActions({ order }) {
  const status = order?.status || 'pending'

  const handleDownloadInvoice = () => {
    // TODO: Implement invoice download
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'Tính năng tải hóa đơn sẽ sớm có mặt', type: 'info', duration: 3000 } 
      }));
    }
  }

  const handleCancelOrder = () => {
    // TODO: Implement cancel order
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'Tính năng hủy đơn hàng sẽ sớm có mặt', type: 'info', duration: 3000 } 
      }));
    }
  }

  const handleReturnOrder = () => {
    // TODO: Implement return order
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'Tính năng trả hàng sẽ sớm có mặt', type: 'info', duration: 3000 } 
      }));
    }
  }

  const handleContactSupport = () => {
    // TODO: Implement contact support
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'Tính năng liên hệ hỗ trợ sẽ sớm có mặt', type: 'info', duration: 3000 } 
      }));
    }
  }

  return (
    <div className="order-actions-container">
      <div className="actions-list">
        <button
          onClick={handleDownloadInvoice}
          className="action-button"
          title="Tải hóa đơn"
        >
          <Download size={18} />
          <span>Tải hóa đơn</span>
        </button>

        {(status === 'pending' || status === 'processing') && (
          <button
            onClick={handleCancelOrder}
            className="action-button action-cancel"
            title="Hủy đơn hàng"
          >
            <X size={18} />
            <span>Hủy đơn hàng</span>
          </button>
        )}

        {status === 'delivered' && (
          <button
            onClick={handleReturnOrder}
            className="action-button action-return"
            title="Trả hàng"
          >
            <RotateCcw size={18} />
            <span>Trả hàng</span>
          </button>
        )}

        <button
          onClick={handleContactSupport}
          className="action-button action-support"
          title="Liên hệ hỗ trợ"
        >
          <MessageCircle size={18} />
          <span>Liên hệ hỗ trợ</span>
        </button>
      </div>
    </div>
  )
}

