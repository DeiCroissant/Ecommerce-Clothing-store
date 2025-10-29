# User Profile - PHASE 2: Core User Info

## 🎯 Mục tiêu Phase 2

Xây dựng 2 modules cốt lõi:
1. **Overview Dashboard** - Tổng quan tài khoản với quick actions
2. **Profile Management** - Quản lý thông tin cá nhân + avatar

---

## 📋 Scope Phase 2

### 2.1. Overview (Dashboard)

**Components cần tạo:**
- `OverviewDashboard.js` - Main container
- `UserWelcome.js` - Avatar + tên + email verification
- `ProfileCompleteness.js` - Progress bar
- `QuickActionCard.js` - Reusable quick action cards
- `EmailVerificationBanner.js` - Banner gửi lại email
- `RecentOrdersWidget.js` - Widget đơn hàng gần đây

**Features:**
- ✅ Hiển thị avatar, tên, email với verification badge
- ✅ Profile completeness progress bar (0-100%)
- ✅ Email verification banner (nếu chưa verify)
- ✅ 4 Quick action cards:
  - Recent orders (last 3)
  - Vouchers available
  - Wishlist count
  - Default address
- ✅ Stats summary: Total orders, Points, Member since

**Acceptance Criteria:**
- ✅ Email unverified → show "Gửi lại email xác minh" banner
- ✅ Quick links tap targets ≥ 44px (mobile)
- ✅ Recent order shows: status, total, CTA "Xem chi tiết"
- ✅ Profile completeness updates dynamically
- ✅ Skeleton loading states

---

### 2.2. Profile (Thông tin cá nhân)

**Components cần tạo:**
- `ProfileForm.js` - Main form with validation
- `AvatarUpload.js` - Avatar upload + crop
- `FormField.js` - Reusable form field
- `ToastNotification.js` - Success/Error toasts
- `UndoButton.js` - Undo changes within 5s

**Features:**
- ✅ Avatar upload với crop modal (react-easy-crop)
- ✅ Form fields:
  - First Name / Last Name
  - Email (with verification status)
  - Phone
  - Date of Birth
  - Gender (optional select)
- ✅ Real-time validation (email/phone format)
- ✅ Optimistic updates + toast notifications
- ✅ Undo functionality (5 seconds)
- ✅ Email change → pending verification state

**Acceptance Criteria:**
- ✅ Validation rules:
  - Email: valid format
  - Phone: Vietnamese format (0xxx xxx xxx)
  - DOB: age ≥ 13
- ✅ Save button disabled if no changes
- ✅ Loading state during save
- ✅ Toast "Đã lưu" with Undo button
- ✅ Email change shows "Pending verification" badge

---

## 🎨 UI Design Specs

### Overview Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│  Welcome Card                                       │
│  ┌────────┬──────────────────────────────────────┐ │
│  │ Avatar │  Nguyễn Văn A                         │ │
│  │        │  user@example.com [Chưa xác thực]    │ │
│  │        │  Profile: 75% ████████░░             │ │
│  └────────┴──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ⚠️ Email chưa được xác thực                        │
│  [Gửi lại email xác minh]                          │
└─────────────────────────────────────────────────────┘

┌───────────────┬───────────────┬───────────────┬─────┐
│ 📦 Đơn hàng   │ 🎟️ Voucher    │ ❤️ Yêu thích  │ 📍  │
│ 8 đơn         │ 3 khả dụng    │ 12 sản phẩm   │ Địa │
│ Xem tất cả    │ Sử dụng ngay  │ Xem wishlist  │ chỉ │
└───────────────┴───────────────┴───────────────┴─────┘

┌─────────────────────────────────────────────────────┐
│  Đơn hàng gần đây                                   │
│  ┌─────────────────────────────────────────────────┐│
│  │ #VF2025001  |  Đã giao  |  2,500,000đ  | [Xem] ││
│  │ #VF2025002  |  Đang giao |  1,800,000đ  | [Xem] ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Profile Form Layout

```
┌─────────────────────────────────────────────────────┐
│  Thông tin cá nhân                    [Lưu thay đổi]│
├─────────────────────────────────────────────────────┤
│                                                      │
│         ┌─────────┐                                 │
│         │ Avatar  │  [Thay đổi ảnh]                │
│         └─────────┘                                 │
│                                                      │
│  Họ *              Tên *                            │
│  [Nguyễn      ]    [Văn A      ]                    │
│                                                      │
│  Email *           [✓ Đã xác thực]                  │
│  [user@example.com                  ]               │
│                                                      │
│  Số điện thoại                                      │
│  [0901 234 567                      ]               │
│                                                      │
│  Ngày sinh         Giới tính                        │
│  [01/01/1990  ]    [Nam ▼]                         │
│                                                      │
│                              [Hủy]  [Lưu thay đổi]  │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Dependencies

```bash
npm install react-hook-form zod date-fns react-easy-crop
```

- **react-hook-form**: Form state management
- **zod**: Schema validation
- **date-fns**: Date formatting
- **react-easy-crop**: Avatar crop functionality

---

## 🧩 Component Implementation

### 1. Overview Dashboard

**File:** `src/app/account/overview/page.js`

```jsx
import { PageHeader } from '@/components/account'
import { 
  UserWelcome,
  EmailVerificationBanner,
  QuickActionsGrid,
  RecentOrdersWidget 
} from '@/components/account/overview'
import { mockUser, mockOrders } from '@/lib/account/mockUserData'

export const metadata = {
  title: 'Tổng quan',
}

export default function OverviewPage() {
  const user = mockUser
  const recentOrders = mockOrders.slice(0, 3)

  return (
    <div className="overview-page">
      <PageHeader
        title={`Xin chào, ${user.firstName}!`}
        description="Chào mừng trở lại tài khoản của bạn"
      />

      <div className="space-y-6">
        {/* Welcome Card */}
        <UserWelcome user={user} />

        {/* Email Verification Banner */}
        {!user.emailVerified && <EmailVerificationBanner />}

        {/* Quick Actions Grid */}
        <QuickActionsGrid />

        {/* Recent Orders */}
        <RecentOrdersWidget orders={recentOrders} />
      </div>
    </div>
  )
}
```

---

### 2. User Welcome Component

**File:** `src/components/account/overview/UserWelcome.js`

```jsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ProfileCompleteness } from './ProfileCompleteness'
import { CheckCircleIcon, XCircleIcon } from 'lucide-react'

export function UserWelcome({ user }) {
  return (
    <div className="user-welcome-card">
      <div className="welcome-content">
        <div className="avatar-section">
          <Image
            src={user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
            width={80}
            height={80}
            className="avatar"
          />
        </div>

        <div className="user-info">
          <h2 className="user-name">
            {user.firstName} {user.lastName}
          </h2>
          
          <div className="email-status">
            <span className="email">{user.email}</span>
            {user.emailVerified ? (
              <span className="badge verified">
                <CheckCircleIcon size={14} />
                Đã xác thực
              </span>
            ) : (
              <span className="badge unverified">
                <XCircleIcon size={14} />
                Chưa xác thực
              </span>
            )}
          </div>

          <div className="user-stats">
            <div className="stat">
              <span className="label">Điểm tích lũy:</span>
              <span className="value">{user.points.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="label">Đơn hàng:</span>
              <span className="value">{user.totalOrders}</span>
            </div>
            <div className="stat">
              <span className="label">Thành viên từ:</span>
              <span className="value">
                {new Date(user.memberSince).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>

          <ProfileCompleteness percentage={user.profileCompleteness} />

          <Link href="/account/profile" className="edit-profile-btn">
            Chỉnh sửa hồ sơ
          </Link>
        </div>
      </div>
    </div>
  )
}
```

---

### 3. Profile Completeness Bar

**File:** `src/components/account/overview/ProfileCompleteness.js`

```jsx
export function ProfileCompleteness({ percentage }) {
  const getColor = (pct) => {
    if (pct >= 80) return '#10b981' // green
    if (pct >= 50) return '#f59e0b' // orange
    return '#ef4444' // red
  }

  return (
    <div className="profile-completeness">
      <div className="completeness-header">
        <span className="label">Hoàn thiện hồ sơ</span>
        <span className="percentage">{percentage}%</span>
      </div>
      
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: getColor(percentage),
          }}
        />
      </div>
      
      {percentage < 100 && (
        <p className="completion-hint">
          Hoàn thiện hồ sơ để có trải nghiệm mua sắm tốt hơn
        </p>
      )}
    </div>
  )
}
```

---

## 🎨 CSS Styles for Phase 2

**File:** `src/styles/account-overview.css`

```css
/* User Welcome Card */
.user-welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
}

.welcome-content {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.avatar-section .avatar {
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.email-status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.email {
  font-size: 0.9375rem;
  opacity: 0.9;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.verified {
  background: rgba(16, 185, 129, 0.2);
  color: #d1fae5;
}

.badge.unverified {
  background: rgba(239, 68, 68, 0.2);
  color: #fecaca;
}

/* User Stats */
.user-stats {
  display: flex;
  gap: 32px;
  margin: 16px 0;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat .label {
  font-size: 0.8125rem;
  opacity: 0.8;
}

.stat .value {
  font-size: 1.25rem;
  font-weight: 700;
}

/* Profile Completeness */
.profile-completeness {
  margin: 16px 0;
}

.completeness-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.875rem;
  font-weight: 600;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.completion-hint {
  margin-top: 8px;
  font-size: 0.8125rem;
  opacity: 0.8;
}

/* Edit Profile Button */
.edit-profile-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all 0.2s;
  margin-top: 16px;
}

.edit-profile-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Mobile Responsive */
@media (max-width: 767px) {
  .user-welcome-card {
    padding: 24px;
  }

  .welcome-content {
    flex-direction: column;
    text-align: center;
  }

  .avatar-section {
    align-self: center;
  }

  .user-stats {
    flex-direction: column;
    gap: 12px;
  }

  .email-status {
    flex-direction: column;
    gap: 8px;
  }
}
```

---

## ✅ Phase 2 Checklist

### Overview Dashboard
- [ ] Create `UserWelcome` component
- [ ] Create `ProfileCompleteness` component
- [ ] Create `EmailVerificationBanner` component
- [ ] Create `QuickActionsGrid` component
- [ ] Create `RecentOrdersWidget` component
- [ ] Implement skeleton loading states
- [ ] Add responsive styles
- [ ] Test mobile tap targets (≥44px)

### Profile Management
- [ ] Create `ProfileForm` component
- [ ] Create `AvatarUpload` component with crop
- [ ] Install dependencies (react-hook-form, zod, etc.)
- [ ] Implement form validation
- [ ] Add optimistic updates
- [ ] Create toast notification system
- [ ] Implement undo functionality (5s)
- [ ] Email verification state handling
- [ ] Mobile sheet for editing

### Testing
- [ ] Desktop layout (1920px, 1440px)
- [ ] Tablet layout (1024px, 768px)
- [ ] Mobile layout (375px, 428px)
- [ ] Form validation edge cases
- [ ] Avatar upload/crop flow
- [ ] Undo functionality
- [ ] Email verification flow

---

**Phase 2 Status:** 🚧 Ready to implement  
**Estimated time:** 3-4 days  
**Next:** Start implementing components
