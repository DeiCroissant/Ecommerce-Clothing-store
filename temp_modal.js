'use client'

import { useState, useEffect } from 'react'
import { X, Save, Upload, Plus, Trash2 } from 'lucide-react'
import { mockCategories, getSubCategories } from '@/lib/admin/mockCategoriesData'

/**
 * Product Form Modal Component
 * Form thêm/chỉnh sửa sản phẩm dựa trên cấu trúc mock data
 */
export default function ProductFormModal({ product, defaultCategory, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    brand: { name: 'VYRON', slug: 'vyron' },
    category: { name: '', slug: '' },
    pricing: {
      original: '',
      sale: '',
      discount_percent: 0,
      currency: 'VND'
    },
    short_description: '',
    image: '',
    images: [],
    variants: {
      colors: [],
      sizes: []
    },
    inventory: {
      in_stock: true,
      quantity: 0,
      low_stock_threshold: 10
    },
    status: 'active'
  })

  // Lấy danh sách danh mục con nếu có defaultCategory
  const availableCategories = defaultCategory 
    ? getSubCategories(defaultCategory.id).map(cat => ({
        name: cat.name,
        slug: cat.slug,
        id: cat.id
      }))
    : mockCategories.filter(c => c.parent_id !== null).map(cat => ({
        name: cat.name,
        slug: cat.slug,
        id: cat.id
      }))

  useEffect(() => {
    if (defaultCategory && !product) {
      // Set category mặc định khi thêm sản phẩm mới
      setFormData(prev => ({
        ...prev,
        category: {
          name: defaultCategory.name,
          slug: defaultCategory.slug
        }
      }))
    } else if (product) {
      // Ensure colors have images field
      const normalizedColors = (product.variants?.colors || []).map(color => ({
        ...color,
        images: color.images || []
      }))
      
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        sku: product.sku || '',
        brand: product.brand || { name: 'VYRON', slug: 'vyron' },
        category: product.category || { name: '', slug: '' },
        pricing: product.pricing || {
          original: '',
          sale: '',
          discount_percent: 0,
          currency: 'VND'
        },
        short_description: product.short_description || '',
        image: product.image || '',
        images: product.images || [],
        variants: {
          colors: normalizedColors,
          sizes: product.variants?.sizes || []
        },
        inventory: product.inventory || {
          in_stock: true,
          quantity: 0,
          low_stock_threshold: 10
        },
        status: product.status || 'active'
      })
    }
  }, [product])

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleNestedInputChange = (parent, child, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }))
  }

  const handleCategoryChange = (categorySlug) => {
    const category = categories.find(c => c.slug === categorySlug)
    if (category) {
      setFormData(prev => ({
        ...prev,
        category: category
      }))
    }
  }

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      variants: {
        ...prev.variants,
        colors: [...prev.variants.colors, { name: '', slug: '', hex: '#000000', available: true, images: [] }]
      }
    }))
  }

  const removeColor = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: {
        ...prev.variants,
        colors: prev.variants.colors.filter((_, i) => i !== index)
      }
    }))
  }

  // Danh sách size phổ biến
  const commonSizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  
  const addSize = (sizeName = '') => {
    // Kiểm tra size đã tồn tại chưa
    const existingSize = formData.variants.sizes.find(s => s.name === sizeName)
    if (existingSize) {
      return // Không thêm nếu đã có
    }
    
    setFormData(prev => ({
      ...prev,
      variants: {
        ...prev.variants,
        sizes: [...prev.variants.sizes, { name: sizeName, available: true, stock: 0 }]
      }
    }))
  }

  const removeSize = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: {
        ...prev.variants,
        sizes: prev.variants.sizes.filter((_, i) => i !== index)
      }
    }))
  }

  const calculateDiscount = () => {
    const original = parseFloat(formData.pricing.original) || 0
    const sale = parseFloat(formData.pricing.sale) || 0
    if (original > 0 && sale > 0) {
      const discount = Math.round(((original - sale) / original) * 100)
      handleNestedInputChange('pricing', 'discount_percent', discount)
    }
  }

  useEffect(() => {
    if (formData.pricing.original && formData.pricing.sale) {
      calculateDiscount()
    }
  }, [formData.pricing.original, formData.pricing.sale])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
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
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
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
            <div className="admin-grid admin-grid-cols-2" style={{ gap: 'var(--space-4)' }}>
              <div>
                <label className="admin-label">Tên sản phẩm *</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="admin-label">SKU *</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="VRN-AT-001"
                  required
                />
              </div>
              <div>
                <label className="admin-label">Slug *</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="ao-thun-basic-cotton-nam"
                  required
                />
              </div>
              {/* Chỉ hiển thị field danh mục nếu không có defaultCategory (không phải đang ở trong subcategory) */}
              {!defaultCategory && (
                <div>
                  <label className="admin-label">
                    Danh mục *
                  </label>
                  <select
                    className="admin-select"
                    value={formData.category.slug}
                    onChange={(e) => {
                      const selectedCat = availableCategories.find(c => c.slug === e.target.value)
                      if (selectedCat) {
                        setFormData(prev => ({
                          ...prev,
                          category: {
                            name: selectedCat.name,
                            slug: selectedCat.slug
                          }
                        }))
                      }
                    }}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {availableCategories.map(cat => (
                      <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Hiển thị thông tin category khi có defaultCategory (đang ở trong subcategory) */}
              {defaultCategory && (
                <div>
                  <label className="admin-label">
                    Danh mục
                  </label>
                  <div style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--neutral-50)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-base)',
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)'
                  }}>
                    {formData.category.name || defaultCategory.name}
                  </div>
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-tertiary)',
                    marginTop: 'var(--space-1)'
                  }}>
                    Sản phẩm sẽ được thêm vào danh mục này
                  </p>
                </div>
              )}
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="admin-label">Mô tả ngắn</label>
                <textarea
                  className="admin-input"
                  value={formData.short_description}
                  onChange={(e) => handleInputChange('short_description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              marginBottom: 'var(--space-4)'
            }}>
              Giá bán
            </h3>
            <div className="admin-grid admin-grid-cols-3" style={{ gap: 'var(--space-4)' }}>
              <div>
                <label className="admin-label">Giá gốc (VND) *</label>
                <input
                  type="number"
                  className="admin-input"
                  value={formData.pricing.original}
                  onChange={(e) => handleNestedInputChange('pricing', 'original', e.target.value)}
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="admin-label">Giá bán (VND) *</label>
                <input
                  type="number"
                  className="admin-input"
                  value={formData.pricing.sale}
                  onChange={(e) => handleNestedInputChange('pricing', 'sale', e.target.value)}
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="admin-label">Giảm giá (%)</label>
                <input
                  type="number"
                  className="admin-input"
                  value={formData.pricing.discount_percent}
                  readOnly
                  style={{ backgroundColor: 'var(--neutral-50)' }}
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              marginBottom: 'var(--space-4)'
            }}>
              Tồn kho
            </h3>
            <div className="admin-grid admin-grid-cols-3" style={{ gap: 'var(--space-4)' }}>
              <div>
                <label className="admin-label">Số lượng *</label>
                <input
                  type="number"
                  className="admin-input"
                  value={formData.inventory.quantity}
                  onChange={(e) => handleNestedInputChange('inventory', 'quantity', parseInt(e.target.value) || 0)}
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="admin-label">Ngưỡng cảnh báo *</label>
                <input
                  type="number"
                  className="admin-input"
                  value={formData.inventory.low_stock_threshold}
                  onChange={(e) => handleNestedInputChange('inventory', 'low_stock_threshold', parseInt(e.target.value) || 0)}
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="admin-label">Trạng thái</label>
                <select
                  className="admin-select"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-3)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input
                  type="checkbox"
                  checked={formData.inventory.in_stock}
                  onChange={(e) => handleNestedInputChange('inventory', 'in_stock', e.target.checked)}
                />
                <span>Còn hàng</span>
              </label>
            </div>
          </div>

          {/* Variants - Colors */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-semibold)'
              }}>
                Màu sắc
              </h3>
              <button
                type="button"
                className="admin-btn admin-btn-sm admin-btn-secondary"
                onClick={addColor}
              >
                <Plus size={16} />
                Thêm màu
              </button>
            </div>
            {formData.variants.colors.map((color, index) => (
              <div key={index} style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)', border: '1px solid var(--border)', borderRadius: 'var(--radius-base)' }}>
                <div className="admin-grid admin-grid-cols-4" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Tên màu"
                    value={color.name || ''}
                    onChange={(e) => {
                      const newColors = [...formData.variants.colors]
                      if (!newColors[index]) newColors[index] = { name: '', slug: '', hex: '#000000', images: [] }
                      newColors[index].name = e.target.value
                      setFormData(prev => ({
                        ...prev,
                        variants: { ...prev.variants, colors: newColors }
                      }))
                    }}
                  />
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Slug"
                    value={color.slug || ''}
                    onChange={(e) => {
                      const newColors = [...formData.variants.colors]
                      if (!newColors[index]) newColors[index] = { name: '', slug: '', hex: '#000000', images: [] }
                      newColors[index].slug = e.target.value
                      setFormData(prev => ({
                        ...prev,
                        variants: { ...prev.variants, colors: newColors }
                      }))
                    }}
                  />
                  <input
                    type="color"
                    className="admin-input"
                    value={color.hex || '#000000'}
                    onChange={(e) => {
                      const newColors = [...formData.variants.colors]
                      if (!newColors[index]) newColors[index] = { name: '', slug: '', hex: '#000000', images: [] }
                      newColors[index].hex = e.target.value
                      setFormData(prev => ({
                        ...prev,
                        variants: { ...prev.variants, colors: newColors }
                      }))
                    }}
                    style={{ height: '42px' }}
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-ghost"
                    onClick={() => removeColor(index)}
                    style={{ color: 'var(--error-600)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                {/* Upload ảnh cho màu này */}
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <label className="admin-label" style={{ marginBottom: 'var(--space-2)' }}>
                    Hình ảnh cho màu này
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files)
                      if (files.length === 0) return
                      
                      // Validate all files
                      for (const file of files) {
                        if (file.size > 5 * 1024 * 1024) {
                          if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('showToast', { 
                              detail: { message: `File "${file.name}" có kích thước vượt quá 5MB`, type: 'warning', duration: 3000 } 
                            }));
                          }
                          return
                        }
                        if (!file.type.startsWith('image/')) {
                          if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('showToast', { 
                              detail: { message: `File "${file.name}" không phải là hình ảnh`, type: 'warning', duration: 3000 } 
                            }));
                          }
                          return
                        }
                      }
                      
                      // Convert all files to base64
                      const promises = files.map(file => {
                        return new Promise((resolve) => {
                          const reader = new FileReader()
                          reader.onloadend = () => resolve(reader.result)
                          reader.readAsDataURL(file)
                        })
                      })
                      
                      Promise.all(promises).then(base64Images => {
                        const newColors = [...formData.variants.colors]
                        if (!newColors[index]) newColors[index] = { name: '', slug: '', hex: '#000000', images: [] }
                        newColors[index].images = [...(newColors[index].images || []), ...base64Images]
                        setFormData(prev => ({
                          ...prev,
                          variants: { ...prev.variants, colors: newColors }
                        }))
                        e.target.value = ''
                      })
                    }}
                    style={{ display: 'none' }}
                    id={`color-images-upload-${index}`}
                  />
                  <label
                    htmlFor={`color-images-upload-${index}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      padding: 'var(--space-2) var(--space-3)',
                      backgroundColor: 'var(--neutral-100)',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius-base)',
                      cursor: 'pointer',
                      fontSize: 'var(--text-xs)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <Upload size={14} />
                    Thêm ảnh cho màu này
                  </label>
                  
                  {/* Preview ảnh của màu */}
                  {(color.images && color.images.length > 0) && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                      gap: 'var(--space-2)',
                      marginTop: 'var(--space-3)'
                    }}>
                      {color.images.map((img, imgIndex) => (
                        <div key={imgIndex} style={{ position: 'relative' }}>
                          <img
                            src={img}
                            alt={`${color.name || 'Màu'} - ${imgIndex + 1}`}
                            style={{
                              width: '100%',
                              height: '80px',
                              objectFit: 'cover',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newColors = [...formData.variants.colors]
                              newColors[index].images = newColors[index].images.filter((_, i) => i !== imgIndex)
                              setFormData(prev => ({
                                ...prev,
                                variants: { ...prev.variants, colors: newColors }
                              }))
                            }}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--error-600)',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Variants - Sizes */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-semibold)',
                marginBottom: 'var(--space-3)'
              }}>
                Kích thước
              </h3>
              
              {/* Các nút size có sẵn */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-4)'
              }}>
                {commonSizes.map(sizeName => {
                  const isSelected = formData.variants.sizes.some(s => s.name === sizeName)
                  return (
                    <button
                      key={sizeName}
                      type="button"
                      onClick={() => addSize(sizeName)}
                      disabled={isSelected}
                      style={{
                        padding: 'var(--space-2) var(--space-4)',
                        borderRadius: 'var(--radius-base)',
                        border: `1px solid ${isSelected ? 'var(--brand-500)' : 'var(--border)'}`,
                        backgroundColor: isSelected ? 'var(--brand-500)' : 'transparent',
                        color: isSelected ? 'white' : 'var(--text)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-medium)',
                        cursor: isSelected ? 'not-allowed' : 'pointer',
                        opacity: isSelected ? 0.7 : 1,
                        transition: 'all var(--transition-base)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.target.style.backgroundColor = 'var(--brand-50)'
                          e.target.style.borderColor = 'var(--brand-500)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.target.style.backgroundColor = 'transparent'
                          e.target.style.borderColor = 'var(--border)'
                        }
                      }}
                    >
                      {sizeName}
                    </button>
                  )
                })}
              </div>
              
              {/* Danh sách size đã chọn */}
              {formData.variants.sizes.length > 0 && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-3)'
                  }}>
                    Các size đã chọn:
                  </p>
                  {formData.variants.sizes.map((size, index) => (
                    <div key={index} className="admin-grid admin-grid-cols-4" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                      <div style={{
                        padding: 'var(--space-3)',
                        backgroundColor: 'var(--brand-50)',
                        border: '1px solid var(--brand-200)',
                        borderRadius: 'var(--radius-base)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--brand-700)'
                      }}>
                        {size.name}
                      </div>
                      <input
                        type="number"
                        className="admin-input"
                        placeholder="Tồn kho"
                        value={size.stock}
                        onChange={(e) => {
                          const newSizes = [...formData.variants.sizes]
                          newSizes[index].stock = parseInt(e.target.value) || 0
                          setFormData(prev => ({
                            ...prev,
                            variants: { ...prev.variants, sizes: newSizes }
                          }))
                        }}
                        min="0"
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <input
                          type="checkbox"
                          checked={size.available}
                          onChange={(e) => {
                            const newSizes = [...formData.variants.sizes]
                            newSizes[index].available = e.target.checked
                            setFormData(prev => ({
                              ...prev,
                              variants: { ...prev.variants, sizes: newSizes }
                            }))
                          }}
                        />
                        <span>Có sẵn</span>
                      </label>
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm admin-btn-ghost"
                        onClick={() => removeSize(index)}
                        style={{ color: 'var(--error-600)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              marginBottom: 'var(--space-4)'
            }}>
              Hình ảnh sản phẩm
            </h3>
            <div>
              <label className="admin-label">
                Hình ảnh chính * (Ảnh đầu tiên sẽ là ảnh chính)
              </label>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files)
                    if (files.length === 0) return
                    
                    // Validate all files
                    for (const file of files) {
                      // Validate file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('showToast', { 
                            detail: { message: `File "${file.name}" có kích thước vượt quá 5MB`, type: 'warning', duration: 3000 } 
                          }));
                        }
                        return
                      }
                      
                      // Validate file type
                      if (!file.type.startsWith('image/')) {
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('showToast', { 
                            detail: { message: `File "${file.name}" không phải là hình ảnh`, type: 'warning', duration: 3000 } 
                          }));
                        }
                        return
                      }
                    }
                    
                    // Convert all files to base64
                    const promises = files.map(file => {
                      return new Promise((resolve) => {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          resolve(reader.result)
                        }
                        reader.readAsDataURL(file)
                      })
                    })
                    
                    Promise.all(promises).then(base64Images => {
                      // Ảnh đầu tiên là ảnh chính
                      const mainImage = base64Images[0]
                      // Các ảnh còn lại vào images array
                      const otherImages = base64Images.slice(1)
                      
                      // Merge với images hiện có
                      const existingImages = formData.images || []
                      const newImages = [...existingImages, ...otherImages]
                      
                      setFormData(prev => ({
                        ...prev,
                        image: prev.image || mainImage, // Chỉ set nếu chưa có
                        images: newImages
                      }))
                      
                      // Nếu chưa có ảnh chính, set ảnh đầu tiên làm ảnh chính
                      if (!formData.image) {
                        setFormData(prev => ({
                          ...prev,
                          image: mainImage
                        }))
                      } else {
                        // Nếu đã có ảnh chính, thêm tất cả vào images
                        setFormData(prev => ({
                          ...prev,
                          images: [...prev.images, ...base64Images]
                        }))
                      }
                      
                      // Reset input
                      e.target.value = ''
                    })
                  }}
                  style={{ display: 'none' }}
                  id="images-upload"
                />
                <label
                  htmlFor="images-upload"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--brand-500)',
                    color: 'white',
                    borderRadius: 'var(--radius-base)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    transition: 'background-color var(--transition-base)'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--brand-600)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--brand-500)'}
                >
                  <Upload size={16} />
                  Chọn nhiều hình ảnh
                </label>
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-tertiary)',
                  marginTop: 'var(--space-2)'
                }}>
                  Có thể chọn nhiều ảnh cùng lúc. Ảnh đầu tiên sẽ là ảnh chính.
                </p>
              </div>
              
              {/* Gallery Preview */}
              {(formData.image || (formData.images && formData.images.length > 0)) && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <label className="admin-label" style={{ marginBottom: 'var(--space-3)' }}>
                    Gallery ảnh ({formData.image ? 1 : 0} + {formData.images?.length || 0} ảnh)
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--neutral-50)',
                    borderRadius: 'var(--radius-base)',
                    border: '1px solid var(--border)'
                  }}>
                    {/* Ảnh chính */}
                    {formData.image && (
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          padding: 'var(--space-1)',
                          backgroundColor: 'var(--brand-500)',
                          color: 'white',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-semibold)',
                          borderRadius: 'var(--radius-base) var(--radius-base) 0 0',
                          textAlign: 'center'
                        }}>
                          Ảnh chính
                        </div>
                        <img
                          src={formData.image}
                          alt="Main"
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '0 0 var(--radius-base) var(--radius-base)',
                            border: '2px solid var(--brand-500)'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            // Nếu có images, lấy ảnh đầu tiên làm ảnh chính
                            if (formData.images && formData.images.length > 0) {
                              setFormData(prev => ({
                                ...prev,
                                image: prev.images[0],
                                images: prev.images.slice(1)
                              }))
                            } else {
                              handleInputChange('image', '')
                            }
                          }}
                          style={{
                            position: 'absolute',
                            top: 'var(--space-2)',
                            right: 'var(--space-2)',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--error-600)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )}
                    
                    {/* Các ảnh khác */}
                    {formData.images && formData.images.map((img, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img
                          src={img}
                          alt={`Gallery ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-base)',
                            border: '1px solid var(--border)',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            // Set làm ảnh chính khi click
                            setFormData(prev => ({
                              ...prev,
                              image: img,
                              images: prev.images.filter((_, i) => i !== index)
                            }))
                          }}
                          title="Click để đặt làm ảnh chính"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }))
                          }}
                          style={{
                            position: 'absolute',
                            top: 'var(--space-1)',
                            right: 'var(--space-1)',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--error-600)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              <span>{product ? 'Cập nhật' : 'Thêm'} sản phẩm</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

