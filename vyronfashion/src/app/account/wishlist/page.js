import { PageHeader, AccountCard } from '@/components/account'

export const metadata = {
  title: 'Sản phẩm yêu thích',
}

export default function WishlistPage() {
  return (
    <div className="wishlist-page">
      <PageHeader
        title="Sản phẩm yêu thích"
        description="Danh sách sản phẩm bạn đã lưu"
      />

      <AccountCard title="Wishlist">
        <p className="text-gray-600">
          Wishlist coming in Phase 4...
        </p>
      </AccountCard>
    </div>
  )
}
