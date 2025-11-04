'use client'

import { AddressCard } from './AddressCard'

export function AddressList({ addresses, onEdit, onDelete }) {
  return (
    <div className="address-list">
      {addresses.map((address) => (
        <AddressCard
          key={address.id}
          address={address}
          onEdit={() => onEdit(address)}
          onDelete={() => onDelete(address.id)}
        />
      ))}

      <style jsx>{`
        .address-list {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        }

        @media (max-width: 640px) {
          .address-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
