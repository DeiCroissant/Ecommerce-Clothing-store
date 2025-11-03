'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, XCircle, Award, Calendar } from 'lucide-react'
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
    <div className="user-welcome-card">
      <div className="welcome-content">
        <div className="avatar-section">
          <Image
            src={user.avatar || '/images/placeholders/avatar-placeholder.jpg'}
            alt={user.name}
            width={80}
            height={80}
            className="avatar"
          />
        </div>

        <div className="user-info">
          <h2 className="user-name">
            {user.name}
          </h2>
          
          <div className="email-status">
            <span className="email">{user.email}</span>
            {user.emailVerified ? (
              <span className="badge verified">
                <CheckCircle size={14} />
                Đã xác thực
              </span>
            ) : (
              <span className="badge unverified">
                <XCircle size={14} />
                Chưa xác thực
              </span>
            )}
          </div>

          {/* Thông tin bổ sung từ API */}
          <div className="user-details">
            {user.phone && (
              <div className="detail-item">
                <span className="label">Số điện thoại:</span>
                <span className="value">{user.phone}</span>
              </div>
            )}
            {user.address && (
              <div className="detail-item">
                <span className="label">Địa chỉ:</span>
                <span className="value">{user.address}</span>
              </div>
            )}
            <div className="detail-item">
              <span className="label">Cấp thành viên:</span>
              <span className="value capitalize">{user.memberLevel || 'Bronze'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Vai trò:</span>
              <span className="value capitalize">{user.role || 'User'}</span>
            </div>
          </div>

          <div className="user-stats">
            <div className="stat">
              <Calendar size={16} className="stat-icon" />
              <div>
                <span className="label">Thành viên từ</span>
                <span className="value">
                  {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: vi })}
                </span>
              </div>
            </div>
            <div className="stat">
              <Award size={16} className="stat-icon" />
              <div>
                <span className="label">Cấp độ</span>
                <span className="value capitalize">{user.memberLevel || 'Bronze'}</span>
              </div>
            </div>
          </div>

          <ProfileCompleteness percentage={profileCompleteness} />

          <Link href="/account/profile" className="edit-profile-btn">
            Chỉnh sửa hồ sơ
          </Link>
        </div>
      </div>
    </div>
  )
}
