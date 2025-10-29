import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export function OrderSearch({ onSearch, placeholder = "Tìm theo mã đơn hàng hoặc tên sản phẩm..." }) {
  const [query, setQuery] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="order-search">
      <Search size={20} className="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button 
          className="clear-button"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
