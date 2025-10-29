import { RotateCcw, Plus } from 'lucide-react';
import Link from 'next/link';

export function EmptyReturns({ type = 'no-returns' }) {
  if (type === 'no-results') {
    return (
      <div className="empty-returns empty-results">
        <RotateCcw size={64} className="empty-icon" />
        <h3 className="empty-title">Không tìm thấy yêu cầu trả hàng</h3>
        <p className="empty-description">
          Không có yêu cầu trả hàng nào phù hợp với bộ lọc của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="empty-returns empty-no-returns">
      <RotateCcw size={64} className="empty-icon" />
      <h3 className="empty-title">Chưa có yêu cầu trả hàng nào</h3>
      <p className="empty-description">
        Bạn chưa có yêu cầu trả hàng nào. Nếu có vấn đề với đơn hàng, bạn có thể tạo yêu cầu trả hàng trong vòng 7 ngày sau khi nhận hàng.
      </p>
      <Link href="/account/returns/new" className="btn-primary btn-create-return">
        <Plus size={20} />
        Tạo yêu cầu trả hàng
      </Link>
    </div>
  );
}
