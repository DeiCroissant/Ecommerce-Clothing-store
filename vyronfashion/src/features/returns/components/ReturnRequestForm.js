'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { PhotoUpload } from './PhotoUpload';
import { 
  RETURN_REASONS, 
  REFUND_METHODS, 
  getEligibleOrders,
  formatCurrency 
} from '@/lib/mockReturnsData';
import { AlertCircle, ChevronDown } from 'lucide-react';

// Zod validation schema
const returnRequestSchema = z.object({
  orderId: z.string().min(1, 'Vui lòng chọn đơn hàng'),
  products: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất 1 sản phẩm'),
  reason: z.string().min(1, 'Vui lòng chọn lý do trả hàng'),
  description: z.string()
    .min(10, 'Mô tả phải có ít nhất 10 ký tự')
    .max(500, 'Mô tả không được quá 500 ký tự'),
  refundMethod: z.enum(['original_payment', 'store_credit'], {
    required_error: 'Vui lòng chọn phương thức hoàn tiền'
  }),
  photos: z.array(z.string()).max(5, 'Tối đa 5 ảnh').optional()
});

export function ReturnRequestForm() {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eligibleOrders = getEligibleOrders();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(returnRequestSchema),
    defaultValues: {
      orderId: '',
      products: [],
      reason: '',
      description: '',
      refundMethod: 'original_payment',
      photos: []
    }
  });

  const watchOrderId = watch('orderId');
  const watchProducts = watch('products');
  const watchRefundMethod = watch('refundMethod');

  // Update selected order when orderId changes
  useEffect(() => {
    if (watchOrderId) {
      const order = eligibleOrders.find(o => o.orderId === watchOrderId);
      setSelectedOrder(order);
      // Reset selected products when order changes
      setValue('products', []);
    }
  }, [watchOrderId, eligibleOrders, setValue]);

  const handleProductToggle = (productId) => {
    const currentProducts = watchProducts;
    if (currentProducts.includes(productId)) {
      setValue('products', currentProducts.filter(id => id !== productId));
    } else {
      setValue('products', [...currentProducts, productId]);
    }
  };

  const calculateRefundAmount = () => {
    if (!selectedOrder || watchProducts.length === 0) return 0;
    
    const selectedItems = selectedOrder.products.filter(p => 
      watchProducts.includes(p.productId)
    );
    
    const baseAmount = selectedItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    const refundMethodData = REFUND_METHODS[watchRefundMethod];
    const bonus = refundMethodData?.bonusPercentage ? baseAmount * refundMethodData.bonusPercentage : 0;
    
    return baseAmount + bonus;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Return request submitted:', data);
      
      // Redirect to returns list
      router.push('/account/returns?status=success');
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="return-request-form">
      {/* Order Selection */}
      <div className="form-section">
        <label className="form-label">
          Chọn đơn hàng <span className="required">*</span>
        </label>
        <div className="select-wrapper">
          <select
            {...register('orderId')}
            className={`form-select ${errors.orderId ? 'error' : ''}`}
          >
            <option value="">-- Chọn đơn hàng cần trả --</option>
            {eligibleOrders.map(order => (
              <option key={order.orderId} value={order.orderId}>
                {order.orderId} - {formatCurrency(order.total)} ({order.products.length} sản phẩm)
              </option>
            ))}
          </select>
          <ChevronDown size={20} className="select-icon" />
        </div>
        {errors.orderId && (
          <div className="form-error">
            <AlertCircle size={16} />
            {errors.orderId.message}
          </div>
        )}
        {eligibleOrders.length === 0 && (
          <div className="form-info">
            <AlertCircle size={16} />
            Bạn không có đơn hàng nào đủ điều kiện trả hàng (đơn hàng phải được giao trong vòng 7 ngày)
          </div>
        )}
      </div>

      {/* Product Selection */}
      {selectedOrder && (
        <div className="form-section">
          <label className="form-label">
            Chọn sản phẩm <span className="required">*</span>
          </label>
          <div className="products-selection">
            {selectedOrder.products.map(product => (
              <label
                key={product.productId}
                className={`product-checkbox-item ${
                  watchProducts.includes(product.productId) ? 'selected' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={watchProducts.includes(product.productId)}
                  onChange={() => handleProductToggle(product.productId)}
                  className="product-checkbox"
                />
                <div className="product-checkbox-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-checkbox-info">
                  <h4 className="product-checkbox-name">{product.name}</h4>
                  <div className="product-checkbox-meta">
                    {product.color && <span>Màu: {product.color}</span>}
                    {product.size && <span>Size: {product.size}</span>}
                    <span>x{product.quantity}</span>
                  </div>
                  <span className="product-checkbox-price">
                    {formatCurrency(product.price * product.quantity)}
                  </span>
                </div>
              </label>
            ))}
          </div>
          {errors.products && (
            <div className="form-error">
              <AlertCircle size={16} />
              {errors.products.message}
            </div>
          )}
        </div>
      )}

      {/* Return Reason */}
      {selectedOrder && watchProducts.length > 0 && (
        <>
          <div className="form-section">
            <label className="form-label">
              Lý do trả hàng <span className="required">*</span>
            </label>
            <div className="select-wrapper">
              <select
                {...register('reason')}
                className={`form-select ${errors.reason ? 'error' : ''}`}
              >
                <option value="">-- Chọn lý do --</option>
                {RETURN_REASONS.map(reason => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={20} className="select-icon" />
            </div>
            {errors.reason && (
              <div className="form-error">
                <AlertCircle size={16} />
                {errors.reason.message}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="form-section">
            <label className="form-label">
              Mô tả chi tiết <span className="required">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Vui lòng mô tả rõ lý do trả hàng, tình trạng sản phẩm..."
              className={`form-textarea ${errors.description ? 'error' : ''}`}
            />
            <div className="textarea-meta">
              <span className={`char-count ${watch('description')?.length > 500 ? 'error' : ''}`}>
                {watch('description')?.length || 0}/500
              </span>
            </div>
            {errors.description && (
              <div className="form-error">
                <AlertCircle size={16} />
                {errors.description.message}
              </div>
            )}
          </div>

          {/* Photo Upload */}
          <div className="form-section">
            <Controller
              name="photos"
              control={control}
              render={({ field }) => (
                <PhotoUpload
                  photos={field.value}
                  onChange={field.onChange}
                  error={errors.photos?.message}
                />
              )}
            />
          </div>

          {/* Refund Method */}
          <div className="form-section">
            <label className="form-label">
              Phương thức hoàn tiền <span className="required">*</span>
            </label>
            <div className="refund-methods">
              {Object.entries(REFUND_METHODS).map(([key, method]) => (
                <label
                  key={key}
                  className={`refund-method-option ${
                    watchRefundMethod === key ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    value={key}
                    {...register('refundMethod')}
                    className="refund-radio"
                  />
                  <div className="refund-method-content">
                    <div className="refund-method-header">
                      <span className="refund-method-label">{method.label}</span>
                      {method.bonusPercentage > 0 && (
                        <span className="refund-bonus-badge">
                          +{method.bonusPercentage * 100}% thưởng
                        </span>
                      )}
                    </div>
                    <p className="refund-method-desc">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.refundMethod && (
              <div className="form-error">
                <AlertCircle size={16} />
                {errors.refundMethod.message}
              </div>
            )}
          </div>

          {/* Refund Summary */}
          {watchProducts.length > 0 && (
            <div className="form-refund-summary">
              <div className="summary-row">
                <span>Số sản phẩm trả:</span>
                <span className="summary-value">{watchProducts.length}</span>
              </div>
              {REFUND_METHODS[watchRefundMethod]?.bonusPercentage > 0 && (
                <div className="summary-row bonus">
                  <span>
                    Bao gồm thưởng {REFUND_METHODS[watchRefundMethod].bonusPercentage * 100}%:
                  </span>
                  <span className="summary-value">
                    +{formatCurrency(
                      calculateRefundAmount() - 
                      selectedOrder.products
                        .filter(p => watchProducts.includes(p.productId))
                        .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                    )}
                  </span>
                </div>
              )}
              <div className="summary-row total">
                <span>Tổng hoàn tiền:</span>
                <span className="summary-value">
                  {formatCurrency(calculateRefundAmount())}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Submit Button */}
      {selectedOrder && watchProducts.length > 0 && (
        <div className="form-actions">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu trả hàng'}
          </button>
        </div>
      )}
    </form>
  );
}
