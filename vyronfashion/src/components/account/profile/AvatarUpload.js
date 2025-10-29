'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { X, RotateCw, ZoomIn, ZoomOut, Upload } from 'lucide-react'

export function AvatarUpload({ currentAvatar, onSave, onClose }) {
  const [imageSrc, setImageSrc] = useState(currentAvatar)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 2MB')
      return
    }

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      alert('Chỉ chấp nhận file JPG hoặc PNG')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setRotation(0)
    }
    reader.readAsDataURL(file)
  }

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.src = url
    })

  const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    canvas.width = safeArea
    canvas.height = safeArea

    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-safeArea / 2, -safeArea / 2)

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    )

    const data = ctx.getImageData(0, 0, safeArea, safeArea)

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.putImageData(
      data,
      0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
      0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
    )

    return canvas.toDataURL('image/jpeg', 0.9)
  }

  const handleSave = async () => {
    if (!croppedAreaPixels) return

    setIsProcessing(true)
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
      onSave(croppedImage)
    } catch (e) {
      console.error(e)
      alert('Có lỗi xảy ra khi xử lý ảnh')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="avatar-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Thay đổi ảnh đại diện</h2>
          <button onClick={onClose} className="modal-close" aria-label="Đóng">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Crop Area */}
          <div className="crop-container">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
            />
          </div>

          {/* Controls */}
          <div className="crop-controls">
            {/* Zoom Control */}
            <div className="control-group">
              <label className="control-label">
                <ZoomIn size={18} />
                Phóng to
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="control-slider"
              />
            </div>

            {/* Rotation Control */}
            <div className="control-group">
              <label className="control-label">
                <RotateCw size={18} />
                Xoay
              </label>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="control-slider"
              />
            </div>
          </div>

          {/* Upload New Image */}
          <div className="upload-section">
            <label htmlFor="avatar-file" className="upload-btn">
              <Upload size={18} />
              Chọn ảnh khác
            </label>
            <input
              id="avatar-file"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="btn-primary"
          >
            {isProcessing ? 'Đang xử lý...' : 'Lưu ảnh'}
          </button>
        </div>
      </div>
    </div>
  )
}
