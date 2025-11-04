'use client'

import { useState, useEffect } from 'react'
import { PageHeader, AccountCard, LoadingSkeleton } from '@/components/account'
import { AddressList } from '@/components/account/addresses/AddressList'
import { AddressFormModal } from '@/components/account/addresses/AddressFormModal'
import { EmptyAddresses } from '@/components/account/addresses/EmptyAddresses'
import { Plus } from 'lucide-react'

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      // TODO: Replace with actual API call
      setLoading(true)
      // const response = await fetch('/api/addresses')
      // const data = await response.json()
      // setAddresses(data)
      
      // Mock data for now
      setTimeout(() => {
        setAddresses([])
        setLoading(false)
      }, 500)
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
      if (editingAddress) {
        // Update existing address
        const updated = addresses.map(addr =>
          addr.id === editingAddress.id ? { ...addr, ...addressData } : addr
        )
        setAddresses(updated)
      } else {
        // Add new address
        const newAddress = {
          id: Date.now().toString(),
          ...addressData,
        }
        setAddresses([...addresses, newAddress])
      }
      setShowModal(false)
    } catch (error) {
      console.error('Error saving address:', error)
      throw error
    }
  }

  const handleDeleteAddress = async (addressId) => {
    try {
      setAddresses(addresses.filter(addr => addr.id !== addressId))
    } catch (error) {
      console.error('Error deleting address:', error)
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
