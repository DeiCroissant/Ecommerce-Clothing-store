'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/account/ui/PageHeader';
import { ReturnList } from '@/features/returns/components/ReturnList';
import { ReturnFilters } from '@/features/returns/components/ReturnFilters';
import { EmptyReturns } from '@/features/returns/components/EmptyReturns';
import { 
  mockReturns, 
  getReturnsByStatus, 
  canCancelReturn,
  RETURNS_PER_PAGE 
} from '@/lib/mockReturnsData';
import { RotateCcw, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import '@/styles/account-returns.css';

export default function ReturnsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeStatus, setActiveStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [returns, setReturns] = useState(mockReturns);

  // Filter returns by status
  const filteredReturns = getReturnsByStatus(activeStatus);

  // Pagination
  const totalPages = Math.ceil(filteredReturns.length / RETURNS_PER_PAGE);
  const startIndex = (currentPage - 1) * RETURNS_PER_PAGE;
  const endIndex = startIndex + RETURNS_PER_PAGE;
  const paginatedReturns = filteredReturns.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  const handleStatusChange = (status) => {
    setActiveStatus(status);
    setCurrentPage(1);
  };

  // Handle cancel return
  const handleCancelReturn = (returnId) => {
    const returnItem = returns.find(r => r.returnId === returnId);
    
    if (!canCancelReturn(returnItem)) {
      alert('Không thể hủy yêu cầu trả hàng này');
      return;
    }

    const confirmed = window.confirm('Bạn có chắc muốn hủy yêu cầu trả hàng này?');
    
    if (confirmed) {
      // Update return status to rejected
      setReturns(returns.map(r => 
        r.returnId === returnId 
          ? { ...r, status: 'rejected', rejectReason: 'Khách hàng hủy yêu cầu' }
          : r
      ));
    }
  };

  // Show success message if redirected from create page
  const showSuccessMessage = searchParams.get('status') === 'success';

  return (
    <div className="returns-page">
      <PageHeader
        title="Quản Lý Trả Hàng"
        description="Theo dõi các yêu cầu trả hàng và hoàn tiền của bạn"
        actions={
          <Link href="/account/returns/new" className="btn btn-primary">
            <Plus size={20} />
            Tạo yêu cầu trả hàng
          </Link>
        }
      />

      <div className="returns-page-container">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <div>
              <strong>Gửi yêu cầu thành công!</strong>
              <p>Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ.</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <ReturnFilters 
          activeStatus={activeStatus} 
          onStatusChange={handleStatusChange}
        />

        {/* Returns List or Empty State */}
        {filteredReturns.length === 0 ? (
          <EmptyReturns type={activeStatus === 'all' ? 'no-returns' : 'no-results'} />
        ) : (
          <>
            <ReturnList 
              returns={paginatedReturns} 
              onCancel={handleCancelReturn}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="pagination-info">
                  Trang {currentPage} / {totalPages}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                  aria-label="Trang sau"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* Results Summary */}
            <div className="results-summary">
              Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredReturns.length)} trong tổng số {filteredReturns.length} yêu cầu
            </div>
          </>
        )}
      </div>
    </div>
  );
}
