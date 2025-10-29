'use client'

import { AddressCard } from './AddressCard'

export function AddressList({ addresses, onEdit, onDelete, onSetDefault }) {
  return (
    <div className="addresses-grid">
      {addresses.map((address) => (
        <AddressCard
          key={address.id}
          address={address}
          onEdit={onEdit}
          onDelete={onDelete}
          onSetDefault={onSetDefault}
        />
      ))}
    </div>
  )
}
