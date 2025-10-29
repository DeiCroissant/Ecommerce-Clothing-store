'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/account/ui/PageHeader'
import { AddressList } from '@/components/account/addresses/AddressList'
import { AddressFormModal } from '@/components/account/addresses/AddressFormModal'
import { DeleteConfirmModal } from '@/components/account/addresses/DeleteConfirmModal'
import { EmptyAddresses } from '@/components/account/addresses/EmptyAddresses'
import { Toast } from '@/components/account/ui/Toast'
import '@/styles/account-addresses.css'
import { mockAddresses, MAX_ADDRESSES } from '@/lib/account/mockAddressData'

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(mockAddresses)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ type: 'success', text: '' })

  // Add new address
  const handleAddAddress = (data) => {
    const newAddress = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }

    // If set as default, remove default from others
    if (data.isDefault) {
      setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })))
    }

    setAddresses(prev => [...prev, newAddress])
    setShowAddModal(false)

    setToastMessage({
      type: 'success',
      text: 'Đã thêm địa chỉ mới thành công!'
    })
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Edit address
  const handleEditAddress = (data) => {
    setAddresses(prev =>
      prev.map(addr => {
        if (addr.id === selectedAddress.id) {
          // If set as default, remove default from others
          if (data.isDefault && !addr.isDefault) {
            return data.isDefault ? { ...data, id: addr.id, createdAt: addr.createdAt } : addr
          }
          return { ...data, id: addr.id, createdAt: addr.createdAt }
        }
        // Remove default from other addresses if this one is set as default
        if (data.isDefault) {
          return { ...addr, isDefault: false }
        }
        return addr
      })
    )

    setShowEditModal(false)
    setSelectedAddress(null)

    setToastMessage({
      type: 'success',
      text: 'Đã cập nhật địa chỉ thành công!'
    })
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Delete address
  const handleDeleteAddress = () => {
    const wasDefault = selectedAddress.isDefault

    setAddresses(prev => {
      const filtered = prev.filter(addr => addr.id !== selectedAddress.id)
      
      // If deleted default address, set first as default
      if (wasDefault && filtered.length > 0) {
        filtered[0].isDefault = true
      }
      
      return filtered
    })

    setShowDeleteModal(false)
    setSelectedAddress(null)

    setToastMessage({
      type: 'success',
      text: 'Đã xóa địa chỉ thành công!'
    })
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Set as default
  const handleSetDefault = (id) => {
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }))
    )

    setToastMessage({
      type: 'success',
      text: 'Đã đặt làm địa chỉ mặc định!'
    })
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Open edit modal
  const openEditModal = (id) => {
    const address = addresses.find(addr => addr.id === id)
    setSelectedAddress(address)
    setShowEditModal(true)
  }

  // Open delete modal
  const openDeleteModal = (id) => {
    const address = addresses.find(addr => addr.id === id)
    setSelectedAddress(address)
    setShowDeleteModal(true)
  }

  // Check if can add more addresses
  const canAddMore = addresses.length < MAX_ADDRESSES

  return (
    <>
      <PageHeader
        title="Địa chỉ giao hàng"
        description="Quản lý địa chỉ nhận hàng của bạn"
      />

      {addresses.length === 0 ? (
        <EmptyAddresses onAddAddress={() => setShowAddModal(true)} />
      ) : (
        <>
          <div className="addresses-header">
            <p className="addresses-count">
              {addresses.length} / {MAX_ADDRESSES} địa chỉ
            </p>
            {canAddMore && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
                type="button"
              >
                <Plus size={20} />
                Thêm địa chỉ mới
              </button>
            )}
            {!canAddMore && (
              <p className="addresses-limit">
                Bạn đã đạt giới hạn {MAX_ADDRESSES} địa chỉ
              </p>
            )}
          </div>

          <AddressList
            addresses={addresses}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onSetDefault={handleSetDefault}
          />
        </>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddressFormModal
          onSave={handleAddAddress}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAddress && (
        <AddressFormModal
          address={selectedAddress}
          onSave={handleEditAddress}
          onCancel={() => {
            setShowEditModal(false)
            setSelectedAddress(null)
          }}
        />
      )}

      {/* Delete Confirm Modal */}
      {showDeleteModal && selectedAddress && (
        <DeleteConfirmModal
          address={selectedAddress}
          onConfirm={handleDeleteAddress}
          onCancel={() => {
            setShowDeleteModal(false)
            setSelectedAddress(null)
          }}
        />
      )}

      {/* Toast */}
      {showToast && (
        <Toast
          type={toastMessage.type}
          message={toastMessage.text}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  )
}
