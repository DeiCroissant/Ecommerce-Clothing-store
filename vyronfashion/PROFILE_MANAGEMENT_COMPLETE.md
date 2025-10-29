# PROFILE MANAGEMENT - PHASE 2.2 ✅

## 📋 TỔNG QUAN

Phase 2.2 hoàn thành **Profile Management System** với form validation, avatar upload với crop, và toast notifications - tất cả sử dụng theme zinc đồng bộ với website.

---

## ✅ ĐÃ HOÀN THÀNH

### 1. Profile Form Component (`ProfileForm.js`)

**Location:** `/src/components/account/profile/ProfileForm.js`

**Features:**
- ✅ **React Hook Form Integration** - Form management với performance tối ưu
- ✅ **Zod Validation Schema** - Type-safe validation
- ✅ **Optimistic Updates** - UI cập nhật ngay lập tức
- ✅ **Undo Functionality** - Hoàn tác thay đổi trong 5 giây
- ✅ **Email Verification Tracking** - Phát hiện thay đổi email
- ✅ **Disabled State Management** - Disable fields khi đang lưu
- ✅ **Error Handling** - Hiển thị lỗi validation chi tiết

**Validation Rules:**
```javascript
{
  firstName: {
    min: 2 ký tự,
    max: 50 ký tự,
    required: true
  },
  lastName: {
    min: 2 ký tự,
    max: 50 ký tự,
    required: true
  },
  email: {
    format: email hợp lệ,
    required: true
  },
  phone: {
    regex: /^(0|\+84)[0-9]{9}$/,
    optional: true
  },
  dateOfBirth: {
    ageCheck: ≥ 13 tuổi,
    optional: true
  },
  gender: {
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    optional: true
  }
}
```

**Form Structure:**
```jsx
<form>
  {/* Avatar Section */}
  <AvatarUpload />
  
  {/* Personal Info */}
  <FormRow>
    <TextField name="firstName" required />
    <TextField name="lastName" required />
  </FormRow>
  
  <TextField name="email" required emailVerification />
  <TextField name="phone" type="tel" pattern />
  
  {/* Additional Info */}
  <FormRow>
    <DateField name="dateOfBirth" />
    <SelectField name="gender" options={[...]} />
  </FormRow>
  
  {/* Actions */}
  <FormActions>
    <Button type="reset" secondary />
    <Button type="submit" primary />
  </FormActions>
</form>
```

---

### 2. Avatar Upload Component (`AvatarUpload.js`)

**Location:** `/src/components/account/profile/AvatarUpload.js`

**Features:**
- ✅ **React Easy Crop Integration** - Crop ảnh mượt mà
- ✅ **Zoom Control** - Scale từ 1x đến 3x
- ✅ **Rotation Control** - Xoay từ 0° đến 360°
- ✅ **File Validation** - Chỉ chấp nhận JPG/PNG ≤ 2MB
- ✅ **Canvas-based Cropping** - Tạo ảnh crop với quality cao
- ✅ **Base64 Output** - Dễ dàng upload lên server
- ✅ **Modal UI** - Giao diện crop trong modal

**File Validation:**
```javascript
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
```

**Crop Algorithm:**
```javascript
function getCroppedImg(imageSrc, pixelCrop, rotation) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 1. Load image
  const image = new Image();
  image.src = imageSrc;
  
  // 2. Apply rotation
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  
  // 3. Draw cropped area
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height
  );
  
  // 4. Export as base64
  return canvas.toDataURL('image/jpeg', 0.95);
}
```

**Modal UI Structure:**
```jsx
<div className="modal-overlay">
  <div className="avatar-upload-modal">
    <ModalHeader>
      <h2>Chỉnh sửa ảnh đại diện</h2>
      <CloseButton />
    </ModalHeader>
    
    <ModalBody>
      {/* Crop Container */}
      <div className="crop-container">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1}
          cropShape="round"
          onCropChange={setCrop}
          onZoomChange={setZoom}
        />
      </div>
      
      {/* Controls */}
      <div className="crop-controls">
        <Slider label="Zoom" value={zoom} range={[1, 3]} />
        <Slider label="Xoay" value={rotation} range={[0, 360]} />
      </div>
      
      {/* Upload Button */}
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </ModalBody>
    
    <ModalFooter>
      <Button onClick={onClose} secondary>Hủy</Button>
      <Button onClick={handleSave} primary>Lưu</Button>
    </ModalFooter>
  </div>
</div>
```

---

### 3. Toast Notification Component (`Toast.js`)

**Location:** `/src/components/account/ui/Toast.js`

**Features:**
- ✅ **4 Type Variants** - success, error, warning, info
- ✅ **Auto Dismiss** - Tự động đóng sau 5 giây
- ✅ **Undo Button** - Hoàn tác hành động (optional)
- ✅ **Icon Mapping** - Icon phù hợp với từng type
- ✅ **Slide Animation** - Trượt vào từ phải
- ✅ **Manual Close** - Nút đóng thủ công

**Type Variants:**
```javascript
{
  success: {
    icon: <CheckCircle2 />,
    color: '#10b981',
    message: 'Thao tác thành công'
  },
  error: {
    icon: <XCircle />,
    color: '#ef4444',
    message: 'Có lỗi xảy ra'
  },
  warning: {
    icon: <AlertTriangle />,
    color: '#f59e0b',
    message: 'Cảnh báo'
  },
  info: {
    icon: <Info />,
    color: '#3b82f6',
    message: 'Thông tin'
  }
}
```

**Usage Example:**
```jsx
// Success với undo
<Toast
  type="success"
  message="Đã cập nhật thông tin thành công"
  onUndo={handleUndo}
  onClose={closeToast}
/>

// Error không undo
<Toast
  type="error"
  message="Không thể lưu thay đổi. Vui lòng thử lại."
  onClose={closeToast}
/>
```

---

### 4. Profile Page Integration (`profile/page.js`)

**Location:** `/src/app/account/profile/page.js`

**Implementation:**
```jsx
'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/account/ui/PageHeader'
import { ProfileForm } from '@/components/account/profile/ProfileForm'
import { mockUser } from '@/lib/account/mockUserData'

export default function ProfilePage() {
  const [user, setUser] = useState(mockUser);

  const handleUpdate = async (updatedData) => {
    // 1. Optimistic update
    setUser({ ...user, ...updatedData });
    
    // 2. Call API
    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) throw new Error('Update failed');
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      // 3. Rollback on error
      setUser(user);
      return { success: false, error: error.message };
    }
  };

  return (
    <>
      <PageHeader
        title="Thông tin cá nhân"
        description="Quản lý thông tin cá nhân và cài đặt tài khoản của bạn"
      />
      
      <ProfileForm user={user} onUpdate={handleUpdate} />
    </>
  );
}
```

**Flow:**
1. **Render Form** - Load user data từ state
2. **User Edits** - React Hook Form quản lý form state
3. **Validation** - Zod schema validate real-time
4. **Submit** - `handleUpdate` gọi API
5. **Optimistic Update** - UI cập nhật ngay
6. **Toast Notification** - Hiển thị kết quả với undo button
7. **Undo (optional)** - Rollback nếu user bấm undo trong 5s
8. **API Confirmation** - Server xác nhận hoặc rollback nếu lỗi

---

### 5. CSS Styling (`account-profile.css`)

**Location:** `/src/styles/account-profile.css`

**Theme Colors (Zinc Palette):**
```css
:root {
  --background: #fafafa;
  --foreground: #27272a;
  --accent: #18181b;
  --accent-hover: #09090b;
  --border: #e4e4e7;
  --muted: #71717a;
}
```

**Key Styles:**

**1. Form Layout:**
```css
.profile-form {
  max-width: 800px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
```

**2. Input Fields:**
```css
.form-input {
  padding: 12px 16px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.form-input:disabled {
  background: var(--background);
  color: var(--muted);
  cursor: not-allowed;
}
```

**3. Avatar Section:**
```css
.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.profile-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 3px solid var(--border);
}

.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
}

.avatar-upload-btn:hover {
  background: var(--accent-hover);
  transform: scale(1.1);
}
```

**4. Modal:**
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.avatar-upload-modal {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.crop-container {
  position: relative;
  height: 400px;
  background: #f9fafb;
  border-radius: 12px;
}
```

**5. Toast:**
```css
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  min-width: 320px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  animation: slideInRight 0.3s ease;
  z-index: 2000;
}

.toast-success .toast-icon { color: #10b981; }
.toast-error .toast-icon { color: #ef4444; }
.toast-warning .toast-icon { color: #f59e0b; }
.toast-info .toast-icon { color: #3b82f6; }
```

**6. Buttons:**
```css
.btn-primary {
  background: var(--accent);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 24, 27, 0.2);
}

.btn-secondary {
  background: white;
  border: 1.5px solid var(--border);
}

.btn-secondary:hover {
  background: var(--background);
  border-color: var(--foreground);
}
```

**7. Responsive Breakpoints:**
```css
@media (max-width: 767px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .avatar-section {
    flex-direction: column;
    text-align: center;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
  }
  
  .crop-container {
    height: 300px;
  }
  
  .toast {
    left: 16px;
    right: 16px;
  }
}

@media (max-width: 479px) {
  .profile-avatar {
    width: 80px;
    height: 80px;
  }
}
```

**8. Accessibility:**
```css
/* Focus visible */
.form-input:focus-visible,
.btn-primary:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .modal-overlay,
  .toast,
  .btn-primary:hover {
    animation: none;
    transform: none;
  }
}
```

---

## 🎨 DESIGN SYSTEM

### Color Palette

**Primary (Zinc):**
- Background: `#fafafa` - Nền sáng
- Foreground: `#27272a` - Text chính
- Accent: `#18181b` - Buttons, highlights
- Border: `#e4e4e7` - Viền, dividers
- Muted: `#71717a` - Text phụ, disabled

**Semantic:**
- Success: `#10b981` (green) - Thành công
- Error: `#ef4444` (red) - Lỗi
- Warning: `#f59e0b` (orange) - Cảnh báo
- Info: `#3b82f6` (blue) - Thông tin

### Typography

**Font Sizes:**
- Title: `1.25rem` (20px)
- Body: `0.9375rem` (15px)
- Small: `0.875rem` (14px)
- Tiny: `0.8125rem` (13px)

**Font Weights:**
- Regular: `400`
- Medium: `600`
- Bold: `700`

### Spacing Scale

```
4px, 8px, 12px, 16px, 20px, 24px, 32px
```

### Border Radius

- Small: `6px` - Buttons, badges
- Medium: `8px` - Inputs, cards
- Large: `12px` - Modals, sections
- XLarge: `16px` - Containers
- Full: `50%` - Avatars, icons

---

## 📱 RESPONSIVE BEHAVIOR

### Desktop (≥ 768px)
- ✅ Form row: 2 columns
- ✅ Avatar: 96px × 96px
- ✅ Crop modal: 600px wide
- ✅ Toast: Fixed bottom-right

### Tablet (480px - 767px)
- ✅ Form row: 1 column
- ✅ Avatar section: Column layout
- ✅ Buttons: Full width
- ✅ Toast: Full width with margin

### Mobile (< 480px)
- ✅ Avatar: 80px × 80px
- ✅ Crop container: 300px height
- ✅ Modal: Bottom sheet style
- ✅ Toast: Stack vertically

---

## ♿ ACCESSIBILITY FEATURES

### Keyboard Navigation
- ✅ Tab order logic
- ✅ Enter/Space submit form
- ✅ Escape close modal
- ✅ Arrow keys for sliders

### Screen Readers
- ✅ Label associations với `htmlFor`
- ✅ Error messages với `aria-describedby`
- ✅ Required fields với `aria-required`
- ✅ Disabled states với `aria-disabled`

### Visual
- ✅ Focus visible outlines (2px accent)
- ✅ Color contrast ≥ 4.5:1
- ✅ Error states với icon + text
- ✅ Loading states với disabled + cursor

### Motion
- ✅ `prefers-reduced-motion` respect
- ✅ Disable animations nếu requested
- ✅ Transform none cho reduced motion

---

## 🧪 TESTING CHECKLIST

### Form Validation
- [ ] First name: Min 2 chars, max 50, required
- [ ] Last name: Min 2 chars, max 50, required
- [ ] Email: Valid format, required
- [ ] Phone: Vietnamese format `/^(0|\+84)[0-9]{9}$/`, optional
- [ ] DOB: Age ≥ 13, optional
- [ ] Gender: One of enum values, optional
- [ ] Error messages hiển thị đúng field
- [ ] Required asterisk hiển thị

### Avatar Upload
- [ ] Click avatar → modal mở
- [ ] Choose file → preview trong crop
- [ ] Zoom slider hoạt động (1x - 3x)
- [ ] Rotation slider hoạt động (0° - 360°)
- [ ] File > 2MB → error
- [ ] File không phải JPG/PNG → error
- [ ] Crop và save → avatar cập nhật
- [ ] Close modal → changes discarded
- [ ] Keyboard: Escape close modal

### Form Submission
- [ ] Fill all required → submit enabled
- [ ] Missing required → submit disabled
- [ ] Submit → loading state (buttons disabled)
- [ ] Success → toast success với undo
- [ ] Error → toast error không undo
- [ ] Email change → warning message
- [ ] Form resets sau submit thành công

### Undo Functionality
- [ ] Toast hiển thị với undo button
- [ ] Click undo trong 5s → rollback
- [ ] Sau 5s → undo button biến mất
- [ ] Undo → form quay về giá trị cũ
- [ ] Toast close tự động sau undo

### Responsive
- [ ] Desktop: 2 column form row
- [ ] Tablet: 1 column form row
- [ ] Mobile: Full width buttons
- [ ] Avatar section stack vertically on mobile
- [ ] Modal responsive trên mọi devices
- [ ] Toast không overflow viewport

### Accessibility
- [ ] Tab navigation logic
- [ ] Focus visible outlines
- [ ] Screen reader labels
- [ ] Error announcements
- [ ] Keyboard shortcuts hoạt động
- [ ] Reduced motion respected

---

## 📦 DEPENDENCIES

**Added in Phase 2.2:**
```json
{
  "react-hook-form": "^7.x.x",
  "zod": "^3.x.x",
  "@hookform/resolvers": "^3.x.x",
  "react-easy-crop": "^5.x.x"
}
```

**Install command:**
```bash
npm install react-hook-form zod @hookform/resolvers react-easy-crop
```

---

## 🚀 NEXT STEPS (Phase 3)

### Phase 3.1: Address Management
- [ ] Address list với cards
- [ ] Add/Edit/Delete addresses
- [ ] Default address selection
- [ ] Address validation
- [ ] Map integration (optional)

### Phase 3.2: Order History
- [ ] Order list với pagination
- [ ] Status filters
- [ ] Search orders
- [ ] Order detail page
- [ ] Tracking information
- [ ] Reorder functionality

### Phase 3.3: Order Detail
- [ ] Product list trong order
- [ ] Timeline tracking
- [ ] Invoice download
- [ ] Cancel order (nếu pending)
- [ ] Contact support

---

## 📝 NOTES

### Form State Management
- Dùng `react-hook-form` cho performance
- `mode: 'onBlur'` để validate khi blur
- Optimistic updates cho UX tốt hơn
- Undo trong 5s để user có cơ hội rollback

### Avatar Crop
- Dùng `react-easy-crop` thay vì tự build
- Crop shape `round` cho avatar
- Rotation hữu ích khi ảnh bị nghiêng
- File validation quan trọng cho security

### Toast System
- Position fixed bottom-right (desktop)
- Full width on mobile
- Auto dismiss sau 5s
- Undo button chỉ hiển thị khi có onUndo prop

### Email Verification
- Track khi user thay đổi email
- Hiển thị warning message
- Có thể gửi verification email
- Badge status (verified/pending)

---

## ✅ PHASE 2.2 HOÀN TẤT

**Đã tạo:**
- ✅ ProfileForm.js (350 lines) - Full validation form
- ✅ AvatarUpload.js - Crop modal với controls
- ✅ Toast.js - Notification system
- ✅ account-profile.css - Complete styling
- ✅ Updated profile/page.js - Integration

**Ready for:**
- ✅ Testing form validation
- ✅ Testing avatar upload
- ✅ Testing toast notifications
- ✅ User acceptance testing

**Theme:**
- ✅ Zinc color palette đồng bộ
- ✅ Consistent với website
- ✅ Professional và clean

🎉 **Phase 2.2 Profile Management hoàn thành!**
