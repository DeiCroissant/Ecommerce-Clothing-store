'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, AlertCircle } from 'lucide-react'
import {
  vietnamProvinces,
  getDistrictsByProvince,
  getWardsByDistrict,
  addressLabels
} from '@/lib/account/mockAddressData'

// Validation schema
const addressSchema = z.object({
  label: z.enum(['home', 'office', 'other']),
  recipientName: z.string()
    .min(1, 'Vui lòng nhập họ tên')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được quá 100 ký tự'),
  phone: z.string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ (VD: 0901234567)'),
  province: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  district: z.string().min(1, 'Vui lòng chọn quận/huyện'),
  ward: z.string().min(1, 'Vui lòng chọn phường/xã'),
  address: z.string()
    .min(1, 'Vui lòng nhập địa chỉ chi tiết')
    .min(10, 'Địa chỉ phải có ít nhất 10 ký tự')
    .max(200, 'Địa chỉ không được quá 200 ký tự'),
  isDefault: z.boolean().optional()
})

export function AddressFormModal({ address, onSave, onCancel }) {
  const isEditMode = !!address
  const [isSaving, setIsSaving] = useState(false)
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: address || {
      label: 'home',
      recipientName: '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      address: '',
      isDefault: false
    }
  })

  const selectedProvince = watch('province')
  const selectedDistrict = watch('district')
  const selectedLabel = watch('label')

  // Update districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const newDistricts = getDistrictsByProvince(selectedProvince)
      setDistricts(newDistricts)
      
      // Reset district and ward if province changed
      if (!isEditMode || selectedProvince !== address?.province) {
        setValue('district', '')
        setValue('ward', '')
        setWards([])
      }
    } else {
      setDistricts([])
      setWards([])
    }
  }, [selectedProvince, isEditMode, address, setValue])

  // Update wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const newWards = getWardsByDistrict(selectedDistrict)
      setWards(newWards)
      
      // Reset ward if district changed
      if (!isEditMode || selectedDistrict !== address?.district) {
        setValue('ward', '')
      }
    } else {
      setWards([])
    }
  }, [selectedDistrict, isEditMode, address, setValue])

  const onSubmit = async (data) => {
    setIsSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onSave(data)
    setIsSaving(false)
  }

  const handleCancel = () => {
    reset()
    onCancel()
  }

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="address-form-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditMode ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </h2>
          <button
            onClick={handleCancel}
            className="modal-close"
            aria-label="Đóng"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="modal-body">
          {/* Label Selection */}
          <div className="form-field">
            <label className="form-label">Loại địa chỉ</label>
            <div className="radio-group">
              {Object.entries(addressLabels).map(([value, info]) => (
                <label key={value} className="radio-label">
                  <input
                    type="radio"
                    value={value}
                    {...register('label')}
                    className="radio-input"
                  />
                  <span className="radio-custom">
                    <span className="radio-icon">{info.icon}</span>
                    <span className="radio-text">{info.text}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Recipient Name */}
          <div className="form-field">
            <label htmlFor="recipientName" className="form-label">
              Họ và tên <span className="required">*</span>
            </label>
            <input
              id="recipientName"
              type="text"
              className={`form-input ${errors.recipientName ? 'error' : ''}`}
              placeholder="Nguyễn Văn A"
              {...register('recipientName')}
            />
            {errors.recipientName && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.recipientName.message}
              </span>
            )}
          </div>

          {/* Phone */}
          <div className="form-field">
            <label htmlFor="phone" className="form-label">
              Số điện thoại <span className="required">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="0901234567"
              {...register('phone')}
            />
            {errors.phone && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.phone.message}
              </span>
            )}
          </div>

          {/* Province */}
          <div className="form-field">
            <label htmlFor="province" className="form-label">
              Tỉnh/Thành phố <span className="required">*</span>
            </label>
            <select
              id="province"
              className={`form-input form-select ${errors.province ? 'error' : ''}`}
              {...register('province')}
            >
              <option value="">Chọn tỉnh/thành phố</option>
              {vietnamProvinces.map((province) => (
                <option key={province.code} value={province.name}>
                  {province.name}
                </option>
              ))}
            </select>
            {errors.province && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.province.message}
              </span>
            )}
          </div>

          {/* District */}
          <div className="form-field">
            <label htmlFor="district" className="form-label">
              Quận/Huyện <span className="required">*</span>
            </label>
            <select
              id="district"
              className={`form-input form-select ${errors.district ? 'error' : ''}`}
              disabled={!selectedProvince}
              {...register('district')}
            >
              <option value="">Chọn quận/huyện</option>
              {districts.map((district) => (
                <option key={district.code} value={district.name}>
                  {district.name}
                </option>
              ))}
            </select>
            {errors.district && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.district.message}
              </span>
            )}
          </div>

          {/* Ward */}
          <div className="form-field">
            <label htmlFor="ward" className="form-label">
              Phường/Xã <span className="required">*</span>
            </label>
            <select
              id="ward"
              className={`form-input form-select ${errors.ward ? 'error' : ''}`}
              disabled={!selectedDistrict}
              {...register('ward')}
            >
              <option value="">Chọn phường/xã</option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.name}>
                  {ward.name}
                </option>
              ))}
            </select>
            {errors.ward && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.ward.message}
              </span>
            )}
          </div>

          {/* Address Detail */}
          <div className="form-field">
            <label htmlFor="address" className="form-label">
              Địa chỉ chi tiết <span className="required">*</span>
            </label>
            <textarea
              id="address"
              className={`form-input form-textarea ${errors.address ? 'error' : ''}`}
              placeholder="Số nhà, tên đường..."
              rows={3}
              {...register('address')}
            />
            {errors.address && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.address.message}
              </span>
            )}
            <p className="field-hint">
              Ví dụ: 123 Đường Nguyễn Huệ, Tòa nhà ABC, Tầng 5
            </p>
          </div>

          {/* Set as Default */}
          <div className="form-field checkbox-field">
            <label className="checkbox-label">
              <input
                type="checkbox"
                {...register('isDefault')}
                className="checkbox-input"
              />
              <span className="checkbox-text">Đặt làm địa chỉ mặc định</span>
            </label>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              disabled={isSaving}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving}
            >
              <Save size={18} />
              {isSaving ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Lưu địa chỉ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
