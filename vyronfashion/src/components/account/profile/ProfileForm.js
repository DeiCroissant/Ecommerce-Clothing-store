'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Save, X, CheckCircle, AlertCircle } from 'lucide-react'
import { AvatarUpload } from './AvatarUpload'
import { Toast } from '../ui/Toast'

// Validation schema
const profileSchema = z.object({
  firstName: z.string()
    .min(1, 'Họ không được để trống')
    .min(2, 'Họ phải có ít nhất 2 ký tự')
    .max(50, 'Họ không được quá 50 ký tự'),
  lastName: z.string()
    .min(1, 'Tên không được để trống')
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(50, 'Tên không được quá 50 ký tự'),
  email: z.string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
  phone: z.string()
    .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ (VD: 0901234567)')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true
      const age = Math.floor((new Date() - new Date(date)) / (365.25 * 24 * 60 * 60 * 1000))
      return age >= 13
    }, 'Bạn phải đủ 13 tuổi trở lên'),
  gender: z.enum(['male', 'female', 'other', '']).optional(),
})

export function ProfileForm({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ type: 'success', text: '' })
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [pendingChanges, setPendingChanges] = useState(null)
  const [undoTimeout, setUndoTimeout] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || '',
    },
  })

  const emailValue = watch('email')
  const emailChanged = emailValue !== user.email

  const onSubmit = async (data) => {
    setIsSaving(true)

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Store changes for undo
    setPendingChanges({ previous: user, new: data })

    // Optimistic update
    if (onUpdate) {
      onUpdate(data)
    }

    setIsSaving(false)
    setIsEditing(false)

    // Show success toast with undo
    setToastMessage({
      type: 'success',
      text: emailChanged 
        ? 'Đã lưu! Email mới cần xác thực.' 
        : 'Đã lưu thay đổi thành công!'
    })
    setShowToast(true)

    // Auto-hide toast after 5s
    const timeout = setTimeout(() => {
      setShowToast(false)
      setPendingChanges(null)
    }, 5000)
    setUndoTimeout(timeout)
  }

  const handleUndo = () => {
    if (pendingChanges && onUpdate) {
      onUpdate(pendingChanges.previous)
      reset(pendingChanges.previous)
      clearTimeout(undoTimeout)
      setShowToast(false)
      setPendingChanges(null)
      
      setToastMessage({
        type: 'info',
        text: 'Đã hoàn tác thay đổi'
      })
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  const handleAvatarChange = (newAvatar) => {
    if (onUpdate) {
      onUpdate({ ...user, avatar: newAvatar })
    }
    setShowAvatarModal(false)
    
    setToastMessage({
      type: 'success',
      text: 'Đã cập nhật ảnh đại diện!'
    })
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
        {/* Avatar Section */}
        <div className="form-section avatar-section">
          <div className="avatar-wrapper">
            <img 
              src={user.avatar} 
              alt={`${user.firstName} ${user.lastName}`}
              className="profile-avatar"
            />
            <button
              type="button"
              onClick={() => setShowAvatarModal(true)}
              className="avatar-upload-btn"
              aria-label="Thay đổi ảnh đại diện"
            >
              <Camera size={18} />
            </button>
          </div>
          <div className="avatar-info">
            <h3>Ảnh đại diện</h3>
            <p>Kích thước tối đa: 2MB. Định dạng: JPG, PNG</p>
          </div>
        </div>

        {/* Name Fields */}
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="firstName" className="form-label">
              Họ <span className="required">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              className={`form-input ${errors.firstName ? 'error' : ''}`}
              disabled={!isEditing}
              {...register('firstName')}
            />
            {errors.firstName && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.firstName.message}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="lastName" className="form-label">
              Tên <span className="required">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              className={`form-input ${errors.lastName ? 'error' : ''}`}
              disabled={!isEditing}
              {...register('lastName')}
            />
            {errors.lastName && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.lastName.message}
              </span>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="form-field">
          <label htmlFor="email" className="form-label">
            Email <span className="required">*</span>
            {user.emailVerified && !emailChanged && (
              <span className="verified-badge">
                <CheckCircle size={14} />
                Đã xác thực
              </span>
            )}
            {emailChanged && (
              <span className="pending-badge">
                <AlertCircle size={14} />
                Cần xác thực
              </span>
            )}
          </label>
          <input
            id="email"
            type="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            disabled={!isEditing}
            {...register('email')}
          />
          {errors.email && (
            <span className="error-message">
              <AlertCircle size={14} />
              {errors.email.message}
            </span>
          )}
          {emailChanged && isEditing && (
            <p className="field-hint warning">
              ⚠️ Thay đổi email sẽ yêu cầu xác thực lại
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div className="form-field">
          <label htmlFor="phone" className="form-label">
            Số điện thoại
          </label>
          <input
            id="phone"
            type="tel"
            className={`form-input ${errors.phone ? 'error' : ''}`}
            placeholder="0901234567"
            disabled={!isEditing}
            {...register('phone')}
          />
          {errors.phone && (
            <span className="error-message">
              <AlertCircle size={14} />
              {errors.phone.message}
            </span>
          )}
          <p className="field-hint">Định dạng: 0XXXXXXXXX hoặc +84XXXXXXXXX</p>
        </div>

        {/* Date of Birth & Gender */}
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="dateOfBirth" className="form-label">
              Ngày sinh
            </label>
            <input
              id="dateOfBirth"
              type="date"
              className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
              disabled={!isEditing}
              {...register('dateOfBirth')}
            />
            {errors.dateOfBirth && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.dateOfBirth.message}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="gender" className="form-label">
              Giới tính
            </label>
            <select
              id="gender"
              className="form-input form-select"
              disabled={!isEditing}
              {...register('gender')}
            >
              <option value="">Không muốn chia sẻ</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn-primary"
            >
              Chỉnh sửa thông tin
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                <X size={18} />
                Hủy
              </button>
              <button
                type="submit"
                disabled={!isDirty || isSaving}
                className="btn-primary"
              >
                <Save size={18} />
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </>
          )}
        </div>
      </form>

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <AvatarUpload
          currentAvatar={user.avatar}
          onSave={handleAvatarChange}
          onClose={() => setShowAvatarModal(false)}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          type={toastMessage.type}
          message={toastMessage.text}
          onClose={() => setShowToast(false)}
          onUndo={pendingChanges ? handleUndo : null}
        />
      )}
    </>
  )
}
