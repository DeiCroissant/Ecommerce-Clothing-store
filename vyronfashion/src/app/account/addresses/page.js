'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader, AccountCard, LoadingSkeleton } from '@/components/account'
import { AddressList } from '@/components/account/addresses/AddressList'
import { AddressFormModal } from '@/components/account/addresses/AddressFormModal'
import { EmptyAddresses } from '@/components/account/addresses/EmptyAddresses'
import { Plus } from 'lucide-react'
import * as addressAPI from '@/lib/api/addresses'

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Get user from localStorage
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const userData = JSON.parse(userStr)
          setUser(userData)
          fetchAddresses(userData.id || userData._id)
        } catch (e) {
          console.error('Error parsing user:', e)
          router.push('/')
        }
      } else {
        router.push('/')
      }
    }
  }, [router])

  const fetchAddresses = async (userId) => {
    try {
      setLoading(true)
      const response = await addressAPI.getUserAddresses(userId)
      setAddresses(response.addresses || [])
        setLoading(false)
    } catch (error) {
      console.error('Error fetching addresses:', error)
      setLoading(false)
    }
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    setShowModal(true)
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    setShowModal(true)
  }

  const handleSaveAddress = async (addressData) => {
    try {
      if (!user) {
        throw new Error('Không tìm thấy thông tin người dùng')
      }

      const userId = user.id || user._id

      if (editingAddress) {
        // Update existing address
        const addressId = editingAddress.id || editingAddress._id
        await addressAPI.updateAddress(addressId, {
          full_name: addressData.fullName,
          phone: addressData.phone,
          email: addressData.email,
          street: addressData.street,
          ward: addressData.ward,
          city: addressData.city,
          is_default: addressData.isDefault,
        })
      } else {
        // Create new address
        await addressAPI.createAddress({
          user_id: userId,
          full_name: addressData.fullName,
          phone: addressData.phone,
          email: addressData.email,
          street: addressData.street,
          ward: addressData.ward,
          city: addressData.city,
          is_default: addressData.isDefault,
        })
      }

      // Refresh addresses list
      await fetchAddresses(userId)
      setShowModal(false)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: editingAddress ? 'Cập nhật địa chỉ thành công!' : 'Thêm địa chỉ thành công!', type: 'success', duration: 3000 } 
        }));
      }
    } catch (error) {
      console.error('Error saving address:', error)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Có lỗi xảy ra khi lưu địa chỉ', type: 'error', duration: 3000 } 
        }));
      }
      throw error
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      return
    }

    try {
      await addressAPI.deleteAddress(addressId)
      
      // Refresh addresses list
      if (user) {
        const userId = user.id || user._id
        await fetchAddresses(userId)
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Đã xóa địa chỉ thành công!', type: 'success', duration: 3000 } 
        }));
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Có lỗi xảy ra khi xóa địa chỉ', type: 'error', duration: 3000 } 
        }));
      }
    }
  }

  if (loading) {
    return (
      <div className="addresses-page">
        <PageHeader title="Địa chỉ giao hàng" />
        <LoadingSkeleton type="card" count={2} />
      </div>
    )
  }

  return (
    <div className="addresses-page">
      <PageHeader
        title="Địa chỉ giao hàng"
        description="Quản lý địa chỉ nhận hàng của bạn"
        action={
          <button onClick={handleAddAddress} className="btn-primary">
            <Plus size={20} />
            Thêm địa chỉ mới
          </button>
        }
      />

      {addresses.length === 0 ? (
        <EmptyAddresses onAddAddress={handleAddAddress} />
      ) : (
        <AddressList
          addresses={addresses}
          onEdit={handleEditAddress}
          onDelete={handleDeleteAddress}
        />
      )}

      {showModal && (
        <AddressFormModal
          address={editingAddress}
          onSave={handleSaveAddress}
          onClose={() => setShowModal(false)}
        />
      )}

      <style jsx>{`
        .addresses-page {
          max-width: 1200px;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: #18181b;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #27272a;
          transform: translateY(-1px);
        }

        @media (max-width: 640px) {
          .btn-primary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}
