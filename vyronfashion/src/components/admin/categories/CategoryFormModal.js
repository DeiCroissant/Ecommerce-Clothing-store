'use client'

import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'

/**
 * Category Form Modal Component
 * Form thêm/chỉnh sửa danh mục
 */
export default function CategoryFormModal({ category, parentCategory, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: null,
    status: 'active'
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parent_id: category.parent_id || null,
        status: category.status || 'active'
      })
    } else if (parentCategory) {
      // Thêm danh mục con mới
      setFormData({
        name: '',
        slug: '',
        description: '',
        parent_id: parentCategory.id,
        status: 'active'
      })
    } else {
      // Reset form when adding new
      setFormData({
        name: '',
        slug: '',
        description: '',
        parent_id: null,
        status: 'active'
      })
    }
    setErrors({})
  }, [category])

  // Auto-generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate slug when name changes
    if (field === 'name' && !category) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Tên danh mục là bắt buộc'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug là bắt buộc'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSave(formData)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'var(--space-4)'
    }}>
      <div className="admin-card" style={{
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h2>
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-6)' }}>
          {/* Basic Information */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              marginBottom: 'var(--space-4)'
            }}>
              Thông tin cơ bản
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label className="admin-label">
                  Tên danh mục *
                  {!category && (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 'normal', marginLeft: 'var(--space-1)' }}>
                      (Slug sẽ được tạo tự động)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ví dụ: Áo Nam, Quần Nữ..."
                  required
                />
                {errors.name && (
                  <div style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--error-600)',
                    marginTop: 'var(--space-1)'
                  }}>
                    {errors.name}
                  </div>
                )}
              </div>

              <div>
                <label className="admin-label">
                  Slug *
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 'normal', marginLeft: 'var(--space-1)' }}>
                    (URL-friendly: ví dụ: ao-nam, quan-nu)
                  </span>
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="ao-nam"
                  required
                />
                {errors.slug && (
                  <div style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--error-600)',
                    marginTop: 'var(--space-1)'
                  }}>
                    {errors.slug}
                  </div>
                )}
              </div>

              <div>
                <label className="admin-label">Mô tả *</label>
                <textarea
                  className="admin-input"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Mô tả ngắn về danh mục này..."
                  rows={3}
                  required
                />
                {errors.description && (
                  <div style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--error-600)',
                    marginTop: 'var(--space-1)'
                  }}>
                    {errors.description}
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Status */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              marginBottom: 'var(--space-4)'
            }}>
              Trạng thái
            </h3>
            <div>
              <label className="admin-label">Trạng thái</label>
              <select
                className="admin-select"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--border)'
          }}>
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
            >
              <Save size={16} />
              <span>{category ? 'Cập nhật' : 'Thêm'} danh mục</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

