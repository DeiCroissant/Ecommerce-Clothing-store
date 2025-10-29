import { ReturnCard } from './ReturnCard';

export function ReturnList({ returns, onCancel }) {
  return (
    <div className="returns-list">
      {returns.map(returnItem => (
        <ReturnCard 
          key={returnItem.id} 
          returnItem={returnItem}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}
