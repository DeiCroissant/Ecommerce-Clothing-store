'use client'

import { ReturnCard } from './ReturnCard'

export function ReturnList({ returns }) {
  if (!returns || returns.length === 0) {
    return null
  }

  return (
    <div className="return-list">
      {returns.map((returnItem) => (
        <ReturnCard key={returnItem.id || returnItem.return_id} returnItem={returnItem} />
      ))}
    </div>
  )
}

