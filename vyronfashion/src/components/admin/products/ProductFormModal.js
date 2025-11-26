'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Save, Upload, Plus, Trash2, Loader2, GripVertical } from 'lucide-react'
import { mockCategories, getSubCategories } from '@/lib/admin/mockCategoriesData'
import { API_BASE_URL } from '@/lib/config'
import { getImageUrl } from '@/lib/imageHelper'

/**
 * Product Form Modal Component
 * Form thêm/chỉnh sửa sản phẩm dựa trên cấu trúc mock data
 * 
 * LOGIC UPLOAD ẢNH:
 * - Ảnh được lưu tạm dưới dạng File object + preview URL trong state
 * - Chỉ upload lên server khi user bấm "Thêm sản phẩm"
 * - Tránh ảnh rác khi user hủy form
 */
export default function ProductFormModal({ product, defaultCategory, onClose, onSave }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // State lưu file ảnh tạm (chưa upload)
  // Format: { file: File, preview: string (blob URL) }
  const [pendingMainImage, setPendingMainImage] = useState(null)
  const [pendingGalleryImages, setPendingGalleryImages] = useState([])
  const [pendingColorImages, setPendingColorImages] = useState({}) // { colorIndex: [{file, preview}] }
  
  // Drag & Drop state cho gallery chính
  const [draggedItem, setDraggedItem] = useState(null) // { type: 'uploaded'|'pending', index: number }
  const [dragOverItem, setDragOverItem] = useState(null)
  
  // Drag & Drop state cho ảnh màu sắc
  const [draggedColorImage, setDraggedColorImage] = useState(null) // { colorIndex, type: 'uploaded'|'pending', imgIndex }
  const [dragOverColorImage, setDragOverColorImage] = useState(null)
  
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
      console.log('📦 Loading product for edit:', product.name)
      console.log('📸 Product variants:', JSON.stringify(product.variants, null, 2))
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
        variants: product.variants || { colors: [], sizes: [] },
        inventory: product.inventory || {
          in_stock: true,
          quantity: 0,
          low_stock_threshold: 10
        },
        status: product.status || 'active'
      })
    }
  }, [product])

  // Cleanup blob URLs khi component unmount để tránh memory leak
  useEffect(() => {
    return () => {
      if (pendingMainImage) {
        URL.revokeObjectURL(pendingMainImage.preview)
      }
      pendingGalleryImages.forEach(item => URL.revokeObjectURL(item.preview))
      Object.values(pendingColorImages).forEach(items => {
        items.forEach(item => URL.revokeObjectURL(item.preview))
      })
    }
  }, [])

  // ===== DRAG & DROP HANDLERS =====
  const handleDragStart = (e, type, index) => {
    setDraggedItem({ type, index })
    e.dataTransfer.effectAllowed = 'move'
    // Thêm hiệu ứng ghost khi kéo
    e.target.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDragOver = (e, type, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverItem({ type, index })
  }

  const handleDragLeave = () => {
    setDragOverItem(null)
  }

  const handleDrop = (e, targetType, targetIndex) => {
    e.preventDefault()
    
    if (!draggedItem) return
    
    const { type: sourceType, index: sourceIndex } = draggedItem
    
    // Không làm gì nếu thả vào chính nó
    if (sourceType === targetType && sourceIndex === targetIndex) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    // Xử lý reorder trong cùng nhóm (uploaded hoặc pending)
    if (sourceType === targetType) {
      if (sourceType === 'uploaded') {
        // Reorder trong formData.images
        setFormData(prev => {
          const newImages = [...prev.images]
          const [removed] = newImages.splice(sourceIndex, 1)
          newImages.splice(targetIndex, 0, removed)
          return { ...prev, images: newImages }
        })
      } else if (sourceType === 'pending') {
        // Reorder trong pendingGalleryImages
        setPendingGalleryImages(prev => {
          const newImages = [...prev]
          const [removed] = newImages.splice(sourceIndex, 1)
          newImages.splice(targetIndex, 0, removed)
          return newImages
        })
      }
    }
    
    setDraggedItem(null)
    setDragOverItem(null)
  }

  // Đặt ảnh làm ảnh chính (cho cả uploaded và pending)
  const setAsMainImage = (type, index) => {
    if (type === 'uploaded') {
      const img = formData.images[index]
      setFormData(prev => ({
        ...prev,
        image: img,
        images: prev.images.filter((_, i) => i !== index)
      }))
    } else if (type === 'pending') {
      const item = pendingGalleryImages[index]
      if (pendingMainImage) {
        // Đưa main cũ về gallery
        setPendingGalleryImages(prev => [
          ...prev.filter((_, i) => i !== index),
          pendingMainImage
        ])
      } else {
        setPendingGalleryImages(prev => prev.filter((_, i) => i !== index))
      }
      setPendingMainImage(item)
    }
  }
  // ===== END DRAG & DROP =====

  // ===== DRAG & DROP CHO ẢNH MÀU SẮC =====
  const handleColorImageDragStart = (e, colorIndex, type, imgIndex) => {
    setDraggedColorImage({ colorIndex, type, imgIndex })
    e.dataTransfer.effectAllowed = 'move'
    e.target.style.opacity = '0.5'
  }

  const handleColorImageDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedColorImage(null)
    setDragOverColorImage(null)
  }

  const handleColorImageDragOver = (e, colorIndex, type, imgIndex) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColorImage({ colorIndex, type, imgIndex })
  }

  const handleColorImageDragLeave = () => {
    setDragOverColorImage(null)
  }

  const handleColorImageDrop = (e, targetColorIndex, targetType, targetImgIndex) => {
    e.preventDefault()
    
    if (!draggedColorImage) return
    
    const { colorIndex: sourceColorIndex, type: sourceType, imgIndex: sourceImgIndex } = draggedColorImage
    
    // Chỉ cho phép reorder trong cùng 1 màu
    if (sourceColorIndex !== targetColorIndex) {
      setDraggedColorImage(null)
      setDragOverColorImage(null)
      return
    }
    
    // Không làm gì nếu thả vào chính nó
    if (sourceType === targetType && sourceImgIndex === targetImgIndex) {
      setDraggedColorImage(null)
      setDragOverColorImage(null)
      return
    }

    // Xử lý reorder trong cùng nhóm
    if (sourceType === targetType) {
      if (sourceType === 'uploaded') {
        // Reorder trong formData.variants.colors[colorIndex].images
        setFormData(prev => {
          const newColors = [...prev.variants.colors]
          const colorImages = [...(newColors[sourceColorIndex].images || [])]
          const [removed] = colorImages.splice(sourceImgIndex, 1)
          colorImages.splice(targetImgIndex, 0, removed)
          newColors[sourceColorIndex].images = colorImages
          return { ...prev, variants: { ...prev.variants, colors: newColors } }
        })
      } else if (sourceType === 'pending') {
        // Reorder trong pendingColorImages[colorIndex]
        setPendingColorImages(prev => {
          const colorImages = [...(prev[sourceColorIndex] || [])]
          const [removed] = colorImages.splice(sourceImgIndex, 1)
          colorImages.splice(targetImgIndex, 0, removed)
          return { ...prev, [sourceColorIndex]: colorImages }
        })
      }
    }
    
    setDraggedColorImage(null)
    setDragOverColorImage(null)
  }
  // ===== END DRAG & DROP CHO ẢNH MÀU SẮC =====

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Bắt đầu submit
    setIsSubmitting(true)
    
    try {
      let finalFormData = { ...formData }
      
      // 1. Upload ảnh chính (nếu có pending)
      if (pendingMainImage) {
        const mainFormData = new FormData()
        mainFormData.append('files', pendingMainImage.file)
        
        const response = await fetch(`${API_BASE_URL}/api/products/upload-images`, {
          method: 'POST',
          body: mainFormData
        })
        
        if (!response.ok) throw new Error('Upload main image failed')
        
        const result = await response.json()
        if (result.urls && result.urls.length > 0) {
          finalFormData.image = result.urls[0]
        }
      }
      
      // 2. Upload ảnh gallery (nếu có pending)
      if (pendingGalleryImages.length > 0) {
        const galleryFormData = new FormData()
        pendingGalleryImages.forEach(item => {
          galleryFormData.append('files', item.file)
        })
        
        const response = await fetch(`${API_BASE_URL}/api/products/upload-images`, {
          method: 'POST',
          body: galleryFormData
        })
        
        if (!response.ok) throw new Error('Upload gallery images failed')
        
        const result = await response.json()
        if (result.urls && result.urls.length > 0) {
          // Merge với ảnh gallery đã có (nếu edit sản phẩm cũ)
          finalFormData.images = [...(finalFormData.images || []), ...result.urls]
        }
      }
      
      // 3. Upload ảnh màu sắc (nếu có pending)
      const colorIndexes = Object.keys(pendingColorImages)
      console.log('🎨 Color indexes with pending images:', colorIndexes)
      if (colorIndexes.length > 0) {
        for (const indexStr of colorIndexes) {
          const index = parseInt(indexStr)
          const colorPendingImages = pendingColorImages[index]
          
          console.log(`   Color ${index}: ${colorPendingImages?.length || 0} pending images`)
          
          if (colorPendingImages && colorPendingImages.length > 0) {
            const colorFormData = new FormData()
            colorPendingImages.forEach(item => {
              colorFormData.append('files', item.file)
            })
            
            const response = await fetch(`${API_BASE_URL}/api/products/upload-images`, {
              method: 'POST',
              body: colorFormData
            })
            
            if (!response.ok) throw new Error(`Upload color ${index} images failed`)
            
            const result = await response.json()
            console.log(`   Color ${index} upload result:`, result)
            if (result.urls && result.urls.length > 0) {
              // Merge với ảnh màu đã có
              if (!finalFormData.variants.colors[index].images) {
                finalFormData.variants.colors[index].images = []
              }
              finalFormData.variants.colors[index].images = [
                ...finalFormData.variants.colors[index].images,
                ...result.urls
              ]
              console.log(`   Color ${index} final images:`, finalFormData.variants.colors[index].images)
            }
          }
        }
      }
      
      console.log('📦 Final form data before save:', JSON.stringify(finalFormData.variants, null, 2))
      
      // 4. Cleanup blob URLs và clear pending states SAU KHI upload thành công
      if (pendingMainImage) {
        URL.revokeObjectURL(pendingMainImage.preview)
        setPendingMainImage(null)
      }
      pendingGalleryImages.forEach(item => URL.revokeObjectURL(item.preview))
      setPendingGalleryImages([])
      
      Object.values(pendingColorImages).forEach(items => {
        items.forEach(item => URL.revokeObjectURL(item.preview))
      })
      setPendingColorImages({})
      
      // 5. Update formData với URLs đã upload (để tránh duplicate nếu onSave fail)
      setFormData(finalFormData)
      
      // 6. Gọi onSave với dữ liệu đã upload
      onSave(finalFormData)
      
    } catch (error) {
      console.error('Submit error:', error)
      alert('Lỗi khi upload ảnh. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
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
              <div key={index} style={{ marginBottom: 'var(--space-4)' }}>
                <div className="admin-grid admin-grid-cols-4" style={{ gap: 'var(--space-3)' }}>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Tên màu"
                    value={color.name}
                    onChange={(e) => {
                      const newColors = [...formData.variants.colors]
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
                    value={color.slug}
                    onChange={(e) => {
                      const newColors = [...formData.variants.colors]
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
                    value={color.hex}
                    onChange={(e) => {
                      const newColors = [...formData.variants.colors]
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
                <div style={{ marginTop: 'var(--space-3)', paddingLeft: 'var(--space-2)' }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isSubmitting}
                    onChange={(e) => {
                      const files = Array.from(e.target.files)
                      if (files.length === 0) return
                      
                      // Validate all files
                      for (const file of files) {
                        if (file.size > 10 * 1024 * 1024) {
                          alert(`File "${file.name}" có kích thước vượt quá 10MB`)
                          return
                        }
                        if (!file.type.startsWith('image/')) {
                          alert(`File "${file.name}" không phải là hình ảnh`)
                          return
                        }
                      }
                      
                      // Tạo preview URLs và lưu vào pending state (KHÔNG upload ngay)
                      const newPendingImages = files.map(file => ({
                        file,
                        preview: URL.createObjectURL(file)
                      }))
                      
                      setPendingColorImages(prev => ({
                        ...prev,
                        [index]: [...(prev[index] || []), ...newPendingImages]
                      }))
                      
                      e.target.value = ''
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
                
                {/* Preview ảnh của màu - cả đã upload và pending - có drag & drop */}
                {((color.images && color.images.length > 0) || (pendingColorImages[index] && pendingColorImages[index].length > 0)) && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: 'var(--space-2)',
                    marginTop: 'var(--space-3)'
                  }}>
                    {/* Ảnh đã upload - có drag & drop */}
                    {color.images && color.images.map((img, imgIndex) => (
                      <div 
                        key={`uploaded-${imgIndex}`} 
                        style={{ 
                          position: 'relative',
                          border: dragOverColorImage?.colorIndex === index && 
                                  dragOverColorImage?.type === 'uploaded' && 
                                  dragOverColorImage?.imgIndex === imgIndex 
                            ? '2px dashed var(--brand-500)' 
                            : 'none',
                          borderRadius: 'var(--radius-sm)',
                          transition: 'border 0.2s ease'
                        }}
                        draggable
                        onDragStart={(e) => handleColorImageDragStart(e, index, 'uploaded', imgIndex)}
                        onDragEnd={handleColorImageDragEnd}
                        onDragOver={(e) => handleColorImageDragOver(e, index, 'uploaded', imgIndex)}
                        onDragLeave={handleColorImageDragLeave}
                        onDrop={(e) => handleColorImageDrop(e, index, 'uploaded', imgIndex)}
                      >
                        {/* Drag handle */}
                        <div style={{
                          position: 'absolute',
                          top: '2px',
                          left: '2px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '3px',
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'grab',
                          zIndex: 2
                        }}>
                          <GripVertical size={12} />
                        </div>
                        <img
                          src={getImageUrl(img)}
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
                            top: '2px',
                            right: '2px',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--error-600)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            zIndex: 2
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    
                    {/* Ảnh pending (chờ upload) - có drag & drop */}
                    {pendingColorImages[index] && pendingColorImages[index].map((item, imgIndex) => (
                      <div 
                        key={`pending-${imgIndex}`} 
                        style={{ 
                          position: 'relative',
                          border: dragOverColorImage?.colorIndex === index && 
                                  dragOverColorImage?.type === 'pending' && 
                                  dragOverColorImage?.imgIndex === imgIndex 
                            ? '2px dashed var(--brand-500)' 
                            : 'none',
                          borderRadius: 'var(--radius-sm)',
                          transition: 'border 0.2s ease'
                        }}
                        draggable
                        onDragStart={(e) => handleColorImageDragStart(e, index, 'pending', imgIndex)}
                        onDragEnd={handleColorImageDragEnd}
                        onDragOver={(e) => handleColorImageDragOver(e, index, 'pending', imgIndex)}
                        onDragLeave={handleColorImageDragLeave}
                        onDrop={(e) => handleColorImageDrop(e, index, 'pending', imgIndex)}
                      >
                        {/* Drag handle */}
                        <div style={{
                          position: 'absolute',
                          top: '2px',
                          left: '2px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '3px',
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'grab',
                          zIndex: 2
                        }}>
                          <GripVertical size={12} />
                        </div>
                        <img
                          src={item.preview}
                          alt={`${color.name || 'Màu'} pending - ${imgIndex + 1}`}
                          style={{
                            width: '100%',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-sm)',
                            border: '2px dashed var(--warning-400)',
                            opacity: 0.9
                          }}
                        />
                        <span style={{
                          position: 'absolute',
                          bottom: '2px',
                          left: '22px',
                          padding: '1px 4px',
                          fontSize: '9px',
                          backgroundColor: 'var(--warning-500)',
                          color: 'white',
                          borderRadius: 'var(--radius-sm)',
                          zIndex: 2
                        }}>
                          Chờ
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(item.preview)
                            setPendingColorImages(prev => ({
                              ...prev,
                              [index]: prev[index].filter((_, i) => i !== imgIndex)
                            }))
                          }}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--error-600)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            zIndex: 2
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
                  disabled={isSubmitting}
                  onChange={(e) => {
                    const files = Array.from(e.target.files)
                    if (files.length === 0) return
                    
                    // Validate all files
                    for (const file of files) {
                      // Validate file size (max 10MB)
                      if (file.size > 10 * 1024 * 1024) {
                        alert(`File "${file.name}" có kích thước vượt quá 10MB`)
                        return
                      }
                      
                      // Validate file type
                      if (!file.type.startsWith('image/')) {
                        alert(`File "${file.name}" không phải là hình ảnh`)
                        return
                      }
                    }
                    
                    // Tạo preview URLs và lưu vào pending states (KHÔNG upload ngay)
                    const newPendingImages = files.map(file => ({
                      file,
                      preview: URL.createObjectURL(file)
                    }))
                    
                    // Ảnh đầu tiên là ảnh chính (nếu chưa có)
                    if (!formData.image && !pendingMainImage && newPendingImages.length > 0) {
                      // Chưa có ảnh chính - lấy file đầu tiên làm ảnh chính
                      setPendingMainImage(newPendingImages[0])
                      // Còn lại là gallery
                      if (newPendingImages.length > 1) {
                        setPendingGalleryImages(prev => [...prev, ...newPendingImages.slice(1)])
                      }
                    } else {
                      // Đã có ảnh chính - thêm tất cả vào gallery
                      setPendingGalleryImages(prev => [...prev, ...newPendingImages])
                    }
                    
                    // Reset input
                    e.target.value = ''
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
                  Có thể chọn nhiều ảnh cùng lúc. Ảnh đầu tiên sẽ là ảnh chính. <strong>Kéo thả</strong> để sắp xếp lại thứ tự.
                </p>
              </div>
              
              {/* Gallery Preview - hiển thị cả ảnh đã upload và ảnh pending */}
              {(formData.image || (formData.images && formData.images.length > 0) || pendingMainImage || pendingGalleryImages.length > 0) && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <label className="admin-label" style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span>Gallery ảnh ({(formData.image ? 1 : 0) + (pendingMainImage ? 1 : 0)} ảnh chính + {(formData.images?.length || 0) + pendingGalleryImages.length} ảnh gallery)</span>
                    <span style={{ 
                      fontSize: 'var(--text-xs)', 
                      color: 'var(--text-tertiary)',
                      fontWeight: 'normal',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <GripVertical size={12} /> Kéo để sắp xếp
                    </span>
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
                    {/* Ảnh chính đã upload (từ formData) */}
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
                          src={getImageUrl(formData.image)}
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
                    
                    {/* Ảnh chính pending (chưa upload) */}
                    {pendingMainImage && (
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          padding: 'var(--space-1)',
                          backgroundColor: 'var(--warning-500)',
                          color: 'white',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-semibold)',
                          borderRadius: 'var(--radius-base) var(--radius-base) 0 0',
                          textAlign: 'center'
                        }}>
                          Ảnh chính (chờ upload)
                        </div>
                        <img
                          src={pendingMainImage.preview}
                          alt="Pending Main"
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '0 0 var(--radius-base) var(--radius-base)',
                            border: '2px dashed var(--warning-500)'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(pendingMainImage.preview)
                            // Nếu có pending gallery, lấy cái đầu làm main
                            if (pendingGalleryImages.length > 0) {
                              setPendingMainImage(pendingGalleryImages[0])
                              setPendingGalleryImages(prev => prev.slice(1))
                            } else {
                              setPendingMainImage(null)
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
                    
                    {/* Các ảnh gallery đã upload - có drag & drop */}
                    {formData.images && formData.images.map((img, index) => (
                      <div 
                        key={`uploaded-${index}`} 
                        style={{ 
                          position: 'relative',
                          border: dragOverItem?.type === 'uploaded' && dragOverItem?.index === index 
                            ? '2px dashed var(--brand-500)' 
                            : 'none',
                          borderRadius: 'var(--radius-base)',
                          transition: 'border 0.2s ease'
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'uploaded', index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, 'uploaded', index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'uploaded', index)}
                      >
                        {/* Drag handle */}
                        <div style={{
                          position: 'absolute',
                          top: 'var(--space-1)',
                          left: 'var(--space-1)',
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'grab',
                          zIndex: 2
                        }}>
                          <GripVertical size={14} />
                        </div>
                        <img
                          src={getImageUrl(img)}
                          alt={`Gallery ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-base)',
                            border: '1px solid var(--border)',
                            cursor: 'pointer'
                          }}
                          onClick={() => setAsMainImage('uploaded', index)}
                          title="Click để đặt làm ảnh chính | Kéo để sắp xếp"
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
                            fontSize: '12px',
                            zIndex: 2
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    
                    {/* Các ảnh gallery pending (chờ upload) - có drag & drop */}
                    {pendingGalleryImages.map((item, index) => (
                      <div 
                        key={`pending-${index}`} 
                        style={{ 
                          position: 'relative',
                          border: dragOverItem?.type === 'pending' && dragOverItem?.index === index 
                            ? '2px dashed var(--brand-500)' 
                            : 'none',
                          borderRadius: 'var(--radius-base)',
                          transition: 'border 0.2s ease'
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'pending', index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, 'pending', index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'pending', index)}
                      >
                        {/* Drag handle */}
                        <div style={{
                          position: 'absolute',
                          top: 'var(--space-1)',
                          left: 'var(--space-1)',
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'grab',
                          zIndex: 2
                        }}>
                          <GripVertical size={14} />
                        </div>
                        <img
                          src={item.preview}
                          alt={`Pending ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-base)',
                            border: '2px dashed var(--warning-400)',
                            cursor: 'pointer',
                            opacity: 0.9
                          }}
                          onClick={() => setAsMainImage('pending', index)}
                          title="Click để đặt làm ảnh chính | Kéo để sắp xếp"
                        />
                        <span style={{
                          position: 'absolute',
                          bottom: 'var(--space-1)',
                          left: '32px',
                          padding: '2px 6px',
                          fontSize: '10px',
                          backgroundColor: 'var(--warning-500)',
                          color: 'white',
                          borderRadius: 'var(--radius-sm)',
                          zIndex: 2
                        }}>
                          Chờ upload
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(item.preview)
                            setPendingGalleryImages(prev => prev.filter((_, i) => i !== index))
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
                            fontSize: '12px',
                            zIndex: 2
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
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={isSubmitting}
              style={{
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Đang upload ảnh...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{product ? 'Cập nhật' : 'Thêm'} sản phẩm</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

