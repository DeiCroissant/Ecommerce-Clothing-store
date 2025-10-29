# User Profile - PHASE 1: Foundation & Layout

## 🎯 Mục tiêu Phase 1

Xây dựng nền tảng UI/UX và routing cơ bản cho toàn bộ hệ thống Account, đảm bảo:
- Responsive layout (desktop 2-col, mobile tabs)
- Navigation mượt mà
- A11y foundation
- Reusable components

---

## 📐 Layout Architecture

### Desktop (≥1024px)
```
┌─────────────────────────────────────────┐
│  Header (from global layout)            │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │  Main Content                │
│ 280px    │  (flex-grow)                 │
│ sticky   │                              │
│          │  ┌────────────────────────┐  │
│ [Nav]    │  │  Page Header           │  │
│          │  ├────────────────────────┤  │
│          │  │  Content Cards         │  │
│          │  │                        │  │
│          │  └────────────────────────┘  │
│          │                              │
└──────────┴──────────────────────────────┘
```

### Mobile (<1024px)
```
┌─────────────────────────────────────────┐
│  Account Header                          │
├─────────────────────────────────────────┤
│                                          │
│  Tab Navigation (Horizontal Scroll)      │
│  [Overview] [Profile] [Orders] ...       │
├─────────────────────────────────────────┤
│                                          │
│  Content (Full Width)                    │
│                                          │
│  Forms open in Sheet/Modal               │
│                                          │
└─────────────────────────────────────────┘
```

---

## 🗂️ File Structure

```
src/
├── app/
│   └── account/
│       ├── layout.js ← Main account layout
│       ├── page.js ← Redirect to /account/overview
│       ├── overview/
│       │   └── page.js
│       ├── profile/
│       │   └── page.js
│       ├── addresses/
│       │   └── page.js
│       ├── orders/
│       │   ├── page.js
│       │   └── [orderId]/
│       │       └── page.js
│       ├── returns/
│       │   └── page.js
│       ├── wishlist/
│       │   └── page.js
│       ├── payments/
│       │   └── page.js
│       ├── security/
│       │   └── page.js
│       ├── notifications/
│       │   └── page.js
│       ├── preferences/
│       │   └── page.js
│       ├── credits/
│       │   └── page.js
│       ├── fit-profile/
│       │   └── page.js
│       └── privacy/
│           └── page.js
│
├── components/
│   └── account/
│       ├── layout/
│       │   ├── AccountLayout.js ← 2-col desktop wrapper
│       │   ├── AccountSidebar.js ← Desktop nav
│       │   ├── MobileAccountNav.js ← Mobile tabs
│       │   ├── AccountBreadcrumbs.js ← A11y breadcrumbs
│       │   └── SkipToContent.js ← A11y skip link
│       ├── ui/
│       │   ├── AccountCard.js ← Reusable card
│       │   ├── PageHeader.js ← Title + actions
│       │   ├── EmptyState.js ← Empty illustrations
│       │   ├── LoadingSkeleton.js ← Skeleton loaders
│       │   └── SectionTitle.js ← Section headings
│       └── index.js ← Barrel export
│
├── lib/
│   └── account/
│       ├── navigation.js ← Nav menu config
│       └── mockUserData.js ← Mock user data
│
└── styles/
    └── account.css ← Account-specific styles
```

---

## 🧩 Component Specs

### 1. AccountLayout (Main Container)

**File:** `src/app/account/layout.js`

```jsx
import { AccountSidebar } from '@/components/account/layout/AccountSidebar'
import { MobileAccountNav } from '@/components/account/layout/MobileAccountNav'
import { SkipToContent } from '@/components/account/layout/SkipToContent'
import '@/styles/account.css'

export const metadata = {
  title: {
    template: '%s | Tài khoản | VyronFashion',
    default: 'Tài khoản của tôi',
  },
}

export default function AccountLayout({ children }) {
  return (
    <>
      <SkipToContent />
      
      {/* Mobile Nav - visible < 1024px */}
      <MobileAccountNav />
      
      <div className="account-container">
        {/* Desktop Sidebar - visible ≥ 1024px */}
        <AccountSidebar />
        
        {/* Main Content */}
        <main id="account-main" className="account-main">
          {children}
        </main>
      </div>
    </>
  )
}
```

**Styles:**
```css
/* Desktop 2-column */
.account-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  gap: 32px;
}

.account-main {
  flex: 1;
  min-width: 0; /* Prevent flex overflow */
}

/* Mobile: stack */
@media (max-width: 1023px) {
  .account-container {
    flex-direction: column;
    padding: 16px;
    gap: 16px;
  }
}
```

---

### 2. AccountSidebar (Desktop Navigation)

**File:** `src/components/account/layout/AccountSidebar.js`

**Features:**
- Sticky positioning (top: 24px)
- Icon + label menu items
- Active state highlighting
- Smooth scroll behavior

**Props:**
```jsx
// No props needed - self-contained
```

**Structure:**
```jsx
<aside className="account-sidebar">
  <nav role="navigation" aria-label="Account navigation">
    <ul>
      {menuGroups.map(group => (
        <li key={group.id}>
          <div className="menu-group-title">{group.title}</div>
          <ul>
            {group.items.map(item => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={isActive ? 'active' : ''}
                >
                  <Icon /> {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  </nav>
</aside>
```

**Styles:**
```css
.account-sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 24px;
  height: fit-content;
}

/* Hide on mobile */
@media (max-width: 1023px) {
  .account-sidebar {
    display: none;
  }
}
```

---

### 3. MobileAccountNav (Mobile Tabs)

**File:** `src/components/account/layout/MobileAccountNav.js`

**Features:**
- Horizontal scrollable tabs
- Active tab indicator (underline)
- Tap targets ≥ 44px
- Icon-only on small screens, icon+label on tablet

**Structure:**
```jsx
<nav className="mobile-account-nav" role="navigation">
  <div className="nav-header">
    <h1>Tài khoản</h1>
  </div>
  
  <div className="nav-tabs" role="tablist">
    {navItems.map(item => (
      <Link
        key={item.href}
        href={item.href}
        role="tab"
        aria-selected={isActive}
        className={`nav-tab ${isActive ? 'active' : ''}`}
      >
        <Icon />
        <span>{item.label}</span>
      </Link>
    ))}
  </div>
</nav>
```

**Styles:**
```css
.mobile-account-nav {
  display: none; /* Hidden on desktop */
}

@media (max-width: 1023px) {
  .mobile-account-nav {
    display: block;
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .nav-tabs {
    display: flex;
    overflow-x: auto;
    gap: 8px;
    padding: 0 16px;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
  }
  
  .nav-tabs::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }
  
  .nav-tab {
    min-width: 44px; /* A11y tap target */
    min-height: 44px;
    padding: 8px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }
  
  .nav-tab.active {
    border-bottom-color: #000;
  }
}
```

---

### 4. Navigation Config

**File:** `src/lib/account/navigation.js`

```js
import {
  User,
  MapPin,
  ShoppingBag,
  RefreshCw,
  Heart,
  CreditCard,
  Shield,
  Bell,
  Settings,
  Gift,
  Ruler,
  Lock,
} from 'lucide-react'

export const accountNavigation = [
  {
    id: 'account',
    title: 'Tài khoản',
    items: [
      {
        href: '/account/overview',
        label: 'Tổng quan',
        icon: User,
        description: 'Dashboard và thông tin tổng quan',
      },
      {
        href: '/account/profile',
        label: 'Thông tin cá nhân',
        icon: User,
        description: 'Cập nhật thông tin và avatar',
      },
      {
        href: '/account/addresses',
        label: 'Địa chỉ',
        icon: MapPin,
        description: 'Quản lý địa chỉ giao hàng',
      },
    ],
  },
  {
    id: 'orders',
    title: 'Đơn hàng',
    items: [
      {
        href: '/account/orders',
        label: 'Đơn hàng của tôi',
        icon: ShoppingBag,
        description: 'Xem lịch sử đơn hàng',
      },
      {
        href: '/account/returns',
        label: 'Đổi trả hàng',
        icon: RefreshCw,
        description: 'Yêu cầu đổi/trả sản phẩm',
      },
    ],
  },
  {
    id: 'shopping',
    title: 'Mua sắm',
    items: [
      {
        href: '/account/wishlist',
        label: 'Yêu thích',
        icon: Heart,
        description: 'Sản phẩm đã lưu',
      },
      {
        href: '/account/credits',
        label: 'Ví & Voucher',
        icon: Gift,
        description: 'Quản lý voucher và store credit',
      },
      {
        href: '/account/fit-profile',
        label: 'Size của tôi',
        icon: Ruler,
        description: 'Thông tin số đo để gợi ý size',
      },
    ],
  },
  {
    id: 'settings',
    title: 'Cài đặt',
    items: [
      {
        href: '/account/payments',
        label: 'Thanh toán',
        icon: CreditCard,
        description: 'Quản lý phương thức thanh toán',
      },
      {
        href: '/account/security',
        label: 'Bảo mật',
        icon: Shield,
        description: 'Mật khẩu và 2FA',
      },
      {
        href: '/account/notifications',
        label: 'Thông báo',
        icon: Bell,
        description: 'Tùy chỉnh thông báo',
      },
      {
        href: '/account/preferences',
        label: 'Tùy chọn',
        icon: Settings,
        description: 'Ngôn ngữ, tiền tệ, chủ đề',
      },
      {
        href: '/account/privacy',
        label: 'Quyền riêng tư',
        icon: Lock,
        description: 'Tải dữ liệu & xóa tài khoản',
      },
    ],
  },
]

// Flat list for mobile nav (only top-level items)
export const mobileNavItems = accountNavigation.flatMap(group => group.items)
```

---

### 5. Reusable UI Components

#### AccountCard
```jsx
// src/components/account/ui/AccountCard.js
export function AccountCard({ 
  title, 
  description, 
  actions, 
  children,
  className = '' 
}) {
  return (
    <div className={`account-card ${className}`}>
      {(title || actions) && (
        <div className="card-header">
          {title && (
            <div>
              <h2 className="card-title">{title}</h2>
              {description && <p className="card-description">{description}</p>}
            </div>
          )}
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-content">{children}</div>
    </div>
  )
}
```

#### PageHeader
```jsx
// src/components/account/ui/PageHeader.js
export function PageHeader({ title, description, actions }) {
  return (
    <header className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  )
}
```

#### EmptyState
```jsx
// src/components/account/ui/EmptyState.js
export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-icon">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-description">{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  )
}
```

---

## ♿ A11y Implementation

### 1. Skip to Content Link

```jsx
// src/components/account/layout/SkipToContent.js
export function SkipToContent() {
  return (
    <a href="#account-main" className="skip-to-content">
      Bỏ qua đến nội dung chính
    </a>
  )
}
```

```css
.skip-to-content {
  position: absolute;
  left: -9999px;
  z-index: 999;
  padding: 12px 16px;
  background: #000;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
}

.skip-to-content:focus {
  left: 16px;
  top: 16px;
}
```

### 2. Focus Visible Styles

```css
/* Focus ring for keyboard navigation */
:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remove default focus outline for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 3. ARIA Labels & Roles

- `role="navigation"` on nav elements
- `aria-label` for navigation landmarks
- `aria-current="page"` for active links
- `aria-selected` for tabs
- `role="tablist"` and `role="tab"` for mobile nav

---

## 🎨 Styling Standards

### CSS Custom Properties

```css
/* src/styles/account.css */
:root {
  --account-sidebar-width: 280px;
  --account-sticky-top: 24px;
  --account-gap: 32px;
  --account-gap-mobile: 16px;
  
  --card-bg: #ffffff;
  --card-border: #e5e7eb;
  --card-radius: 12px;
  --card-padding: 24px;
  
  --nav-active-color: #000000;
  --nav-hover-bg: #f3f4f6;
  
  --focus-ring-color: #3b82f6;
  --focus-ring-width: 2px;
}
```

### Responsive Breakpoints

```css
/* Desktop first approach */
@media (max-width: 1279px) { /* Large tablets */ }
@media (max-width: 1023px) { /* Tablets & mobile */ }
@media (max-width: 767px) { /* Small mobile */ }
@media (max-width: 479px) { /* Extra small */ }
```

---

## ✅ Phase 1 Checklist

### Routing & Structure
- [ ] Create `/app/account/` folder structure
- [ ] Set up all route pages (placeholder content)
- [ ] Configure account layout.js
- [ ] Test navigation flow

### Components
- [ ] AccountSidebar (desktop nav)
- [ ] MobileAccountNav (mobile tabs)
- [ ] SkipToContent (A11y)
- [ ] AccountBreadcrumbs
- [ ] AccountCard (reusable)
- [ ] PageHeader
- [ ] EmptyState
- [ ] LoadingSkeleton

### Navigation
- [ ] Create navigation config
- [ ] Implement active state detection
- [ ] Test keyboard navigation
- [ ] Verify tap targets ≥ 44px (mobile)

### Styling
- [ ] Create account.css
- [ ] Implement responsive breakpoints
- [ ] Add focus-visible styles
- [ ] Test sticky sidebar
- [ ] Verify mobile scrolling

### A11y
- [ ] Skip to content link
- [ ] ARIA roles & labels
- [ ] Keyboard navigation (Tab, Enter, Arrow keys)
- [ ] Focus management
- [ ] Screen reader testing (basic)

### Testing
- [ ] Desktop layout (1920px, 1440px, 1280px)
- [ ] Tablet layout (1024px, 768px)
- [ ] Mobile layout (375px, 390px, 428px)
- [ ] Navigation on all breakpoints
- [ ] Browser testing (Chrome, Firefox, Safari, Edge)

---

## 🚀 Next Steps (Phase 2)

After completing Phase 1:
1. ✅ Verify all routes are accessible
2. ✅ Navigation works smoothly
3. ✅ Responsive layout tested
4. ➡️ Move to Phase 2: Overview & Profile

---

## 📝 Notes

- Use `lucide-react` for icons (consistent with existing project)
- Keep bundle size small (lazy load when possible)
- Mock data structure ready for API integration
- Focus on UX polish and smooth transitions

---

**Phase Status:** 🚧 Ready to implement  
**Estimated time:** 3-4 days  
**Dependencies:** None (foundation phase)
