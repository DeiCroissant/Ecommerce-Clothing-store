'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCartIcon, UserIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const categories = [
  {
    name: 'Áo Nam',
    slug: 'ao-nam',
    subcategories: ['Áo Thun', 'Áo Sơ Mi', 'Áo Khoác', 'Áo Hoodie']
  },
  {
    name: 'Váy Nữ',
    slug: 'vay-nu',
    subcategories: ['Váy Ngắn', 'Váy Dài', 'Váy Công Sở', 'Váy Dạ Hội']
  },
  {
    name: 'Quần',
    slug: 'quan',
    subcategories: ['Quần Jean', 'Quần Kaki', 'Quần Short', 'Quần Âu']
  },
  {
    name: 'Phụ Kiện',
    slug: 'phu-kien',
    subcategories: ['Túi Xách', 'Giày Dép', 'Mũ Nón', 'Thắt Lưng']
  }
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to search page with query
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-zinc-200">
      {/* Top Bar */}
      <div className="bg-zinc-900 text-white text-sm py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <p>Miễn phí vận chuyển cho đơn hàng trên 500.000đ</p>
          <div className="flex gap-4">
            <Link href="/help" className="hover:text-zinc-300 transition-colors">Trợ giúp</Link>
            <Link href="/contact" className="hover:text-zinc-300 transition-colors">Liên hệ</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-zinc-900 font-serif tracking-tight">
              VYRON<span className="font-light">FASHION</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {categories.map((category) => (
              <div
                key={category.slug}
                className="relative group"
              >
                <Link
                  href={`/category/${category.slug}`}
                  className="text-zinc-700 hover:text-zinc-900 font-medium transition-colors py-6 block relative after:absolute after:bottom-4 after:left-0 after:w-0 after:h-0.5 after:bg-zinc-900 after:transition-all hover:after:w-full"
                >
                  {category.name}
                </Link>
                
                {/* Dropdown Subcategories */}
                <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-lg py-2 border border-zinc-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub}
                      href={`/category/${category.slug}?sub=${encodeURIComponent(sub)}`}
                      className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-zinc-300 rounded-full focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent bg-white text-zinc-900 placeholder:text-zinc-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {/* User Icon */}
            <Link 
              href="/account/overview" 
              className="text-zinc-700 hover:text-zinc-900 transition-colors"
              title="Tài khoản của tôi"
            >
              <UserIcon className="w-6 h-6" />
            </Link>

            {/* Cart Icon with Badge */}
            <Link 
              href="/cart" 
              className="relative text-zinc-700 hover:text-zinc-900 transition-colors"
              data-cart-icon
              title="Giỏ hàng"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-zinc-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                0
              </span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-zinc-700 hover:text-zinc-900 transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden mt-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-zinc-300 rounded-full focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent bg-white text-zinc-900 placeholder:text-zinc-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white">
          <nav className="container mx-auto px-4 py-4">
            {categories.map((category) => (
              <div key={category.slug} className="mb-4">
                <Link
                  href={`/category/${category.slug}`}
                  className="block text-zinc-700 hover:text-zinc-900 font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
                <div className="pl-4 space-y-2">
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub}
                      href={`/category/${category.slug}?sub=${encodeURIComponent(sub)}`}
                      className="block text-sm text-zinc-600 hover:text-zinc-900 py-1 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
