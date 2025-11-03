'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    try {
      const userLS = localStorage.getItem('user')
      if (!userLS) {
        router.replace('/')
        return
      }
      const user = JSON.parse(userLS)
      if (user?.role?.toLowerCase() !== 'admin') {
        router.replace('/')
        return
      }
      setAuthorized(true)
    } catch {
      router.replace('/')
    }
  }, [router])

  if (!authorized) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Bảng điều khiển Quản trị</h1>
        <p className="text-zinc-600">Trang quản trị toàn hệ thống. (Placeholder)</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/" className="p-5 rounded-xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-colors">
          Về trang chủ
        </Link>
        {/* TODO: Thêm các widget quản trị thực tế ở đây */}
      </div>
    </div>
  )
}


