'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { ShoppingCartIcon, UserIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import AuthModal from '../ui/AuthModal';
import { ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

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

function AccountDropdown({ user, onLogout, onAccountOverview, onAdmin, open, onClose }) {
  const dropdownRef = useRef();

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose && onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-[49] bg-black/5" onClick={onClose}></div>
      <div ref={dropdownRef} className="animate-dropdown-scale absolute top-full right-0 mt-3 w-[280px] min-w-[220px] rounded-2xl border border-zinc-200 shadow-2xl bg-white z-[51] px-5 py-5">
        <div className="flex flex-col items-center mb-4">
          <UserCircleIcon className="w-10 h-10 text-zinc-400 mb-2"/>
          <div className="font-bold text-zinc-900 text-base leading-tight text-center">{user?.name || user?.username}</div>
          <div className="text-xs text-zinc-500 text-center truncate w-full">{user?.email}</div>
          <div className="mt-1 px-2 py-0.5 rounded bg-zinc-100 text-xs text-zinc-400 font-semibold tracking-wider mb-1 select-none">
            {user?.role?.toUpperCase()||'USER'}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={onAccountOverview}
            className="w-full flex items-center gap-2 p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-900 font-medium text-sm text-zinc-800 transition-colors"
          >
            <UserCircleIcon className="w-5 h-5 text-zinc-400"/>
            Xem tài khoản
            <span className="ml-auto"><ArrowRightOnRectangleIcon className="w-4 h-4 text-zinc-400"/></span>
          </button>
          {user?.role?.toLowerCase() === 'admin' && (
            <button
              onClick={onAdmin}
              className="w-full flex items-center gap-2 p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-900 font-semibold text-sm text-zinc-800 transition-colors"
            >
              <UserCircleIcon className="w-5 h-5 text-zinc-500"/>
              Quản trị viên
              <span className="ml-auto"><ArrowRightOnRectangleIcon className="w-4 h-4 text-zinc-400"/></span>
            </button>
          )}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 p-2 rounded-xl text-sm text-red-600 font-semibold hover:bg-red-50 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-400"/>
            Đăng xuất
          </button>
        </div>
      </div>
      <style jsx>{`
        .animate-dropdown-scale {animation:scalein .18s cubic-bezier(.71,1.8,.77,1.24);}
        @keyframes scalein {from {transform:scale(.9); opacity:0;} to {transform:scale(1); opacity:1;}}
      `}</style>
    </>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  // Simple toast state
  const [toast, setToast] = useState({ visible: false, message: '', kind: 'success' });
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userLS = localStorage.getItem('user');
      setUser(userLS ? JSON.parse(userLS) : null);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to search page with query
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setShowDropdown(false);
    setUser(null);
    setTimeout(() => setShowAuth(false), 200);
    // Toast: logout (danger style)
    setToast({ visible: true, message: 'Đăng xuất thành công', kind: 'danger' });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2000);
    // Redirect to homepage after logout
    router.push('/');
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
          <div className="flex items-center gap-4 relative">
            {/* User Icon - modal/dropdown */}
            <button
              className="text-zinc-700 hover:text-zinc-900 transition-colors"
              title={user ? 'Tài khoản' : 'Đăng nhập / Đăng ký'}
              onClick={() => {
                if (user) setShowDropdown((v) => !v);
                else setShowAuth(true);
              }}
              type="button"
            >
              <UserIcon className="w-6 h-6" />
            </button>
            <AccountDropdown
              user={user}
              open={showDropdown}
              onClose={() => setShowDropdown(false)}
              onAccountOverview={() => {
                setShowDropdown(false); router.push('/account/overview');
              }}
              onAdmin={() => {
                setShowDropdown(false); router.push('/admin');
              }}
              onLogout={handleLogout}
            />

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

      {/* Toast */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 z-[1001] px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold ${toast.kind==='success' ? 'bg-green-50 text-green-800 border-green-200' : toast.kind==='danger' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-zinc-50 text-zinc-800 border-zinc-200'}`}>
          {toast.message}
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          setShowAuth(false);
          router.push('/');
          if (typeof window !== 'undefined') {
            const userLS = localStorage.getItem('user');
            setUser(userLS ? JSON.parse(userLS) : null);
            setShowDropdown(false);
          }
          // Toast: login success
          setToast({ visible: true, message: 'Đăng nhập thành công', kind: 'success' });
          setTimeout(() => setToast(t => ({ ...t, visible: false })), 2000);
        }}
      />
    </header>
  );
}
