'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, XCircle, Award, Calendar, User } from 'lucide-react'
import { ProfileCompleteness } from './ProfileCompleteness'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export function UserWelcome({ user }) {
  // Tính toán profile completeness dựa trên dữ liệu thật
  const calculateProfileCompleteness = (user) => {
    const fields = [
      user.name,
      user.email,
      user.emailVerified,
      user.phone,
      user.avatar,
      user.dateOfBirth,
      user.address,
    ]
    
    const completed = fields.filter(Boolean).length
    return Math.round((completed / fields.length) * 100)
  }

  const profileCompleteness = calculateProfileCompleteness(user)

  return (
    <div className="user-profile-modern">
      {/* Header Section with Avatar */}
      <div className="profile-header">
        <div className="avatar-container">
          {user.avatar && user.avatar.trim() ? (
            user.avatar.startsWith('data:image/') || user.avatar.startsWith('http') || user.avatar.startsWith('/') ? (
              <div className="avatar-wrapper-modern">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={120}
                  height={120}
                  className="avatar-modern"
                  unoptimized={user.avatar.startsWith('data:image/')}
                />
              </div>
            ) : (
              <div className="avatar-wrapper-modern">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="avatar-modern"
                />
              </div>
            )
          ) : (
            <div className="avatar-placeholder-modern">
              <User size={56} />
            </div>
          )}
        </div>
        
        <div className="profile-header-info">
          <h2 className="profile-name">{user.name}</h2>
          <div className="profile-email-row">
            <span className="profile-email">{user.email}</span>
            {user.emailVerified ? (
              <span className="badge-modern verified">
                <CheckCircle size={14} />
                Đã xác thực
              </span>
            ) : (
              <span className="badge-modern unverified">
                <XCircle size={14} />
                Chưa xác thực
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modern Table-like Info Section */}
      <div className="profile-info-table">
        <div className="info-row">
          <div className="info-cell">
            <div className="info-label">Số điện thoại</div>
            <div className="info-value">{user.phone || 'Chưa cập nhật'}</div>
          </div>
          <div className="info-cell">
            <div className="info-label">Cấp thành viên</div>
            <div className="info-value">
              <span className="member-badge">{user.memberLevel || 'Bronze'}</span>
            </div>
          </div>
        </div>

        <div className="info-row">
          <div className="info-cell">
            <div className="info-label">Vai trò</div>
            <div className="info-value">
              <span className="role-badge">{user.role || 'User'}</span>
            </div>
          </div>
          <div className="info-cell">
            <div className="info-label">Thành viên từ</div>
            <div className="info-value">
              <Calendar size={14} className="inline-icon" />
              {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: vi })}
            </div>
          </div>
        </div>

        {user.address && (
          <div className="info-row info-row-full">
            <div className="info-cell">
              <div className="info-label">Địa chỉ</div>
              <div className="info-value">{user.address}</div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Completion Section */}
      <div className="profile-completion-section">
        <ProfileCompleteness percentage={profileCompleteness} />
      </div>

      {/* Action Button */}
      <div className="profile-actions">
        <Link href="/account/profile" className="edit-btn-modern">
          Chỉnh sửa hồ sơ
        </Link>
      </div>
    </div>
  )
}
