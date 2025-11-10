'use client'

import Link from 'next/link'
import { OrderCard } from './OrderCard'

export function OrderList({ orders }) {
  if (!orders || orders.length === 0) {
    return null
  }

  return (
    <div className="order-list">
      {orders.map((order) => (
        <OrderCard key={order.id || order.orderNumber} order={order} />
      ))}
    </div>
  )
}

