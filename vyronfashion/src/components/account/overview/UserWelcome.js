'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, XCircle, Award, Calendar } from 'lucide-react'
import { ProfileCompleteness } from './ProfileCompleteness'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

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

          <div className="user-stats">
            <div className="stat">
              <Award size={16} className="stat-icon" />
              <div>
                <span className="label">Điểm tích lũy</span>
                <span className="value">{user.points.toLocaleString('vi-VN')}</span>
              </div>
            </div>
            <div className="stat">
              <div>
                <span className="label">Đơn hàng</span>
                <span className="value">{user.totalOrders}</span>
              </div>
            </div>
            <div className="stat">
              <Calendar size={16} className="stat-icon" />
              <div>
                <span className="label">Thành viên từ</span>
                <span className="value">
                  {format(new Date(user.memberSince), 'dd/MM/yyyy', { locale: vi })}
                </span>
              </div>
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
