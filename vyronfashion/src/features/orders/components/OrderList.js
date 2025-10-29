import { OrderCard } from './OrderCard';

export function OrderList({ orders, onReorder }) {
  return (
    <div className="orders-list">
      {orders.map(order => (
        <OrderCard 
          key={order.id} 
          order={order}
          onReorder={onReorder}
        />
      ))}
    </div>
  );
}
