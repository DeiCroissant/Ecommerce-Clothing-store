'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import Image from 'next/image'

export function AvatarUpload({ user, onUpdate }) {
  const [preview, setPreview] = useState(user?.avatar || null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 2MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result)
    }
    reader.readAsDataURL(file)

    // Upload
    try {
      setUploading(true)
      // TODO: Implement actual upload
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await onUpdate({ avatar: preview })
    } catch (error) {
      console.error('Error uploading:', error)
      alert('Tải ảnh lên thất bại')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    try {
      setPreview(null)
      await onUpdate({ avatar: null })
    } catch (error) {
      console.error('Error removing avatar:', error)
    }
  }

  return (
    <div className="avatar-upload">
      <div className="avatar-preview">
        {preview ? (
          <div className="avatar-image">
            <Image
              src={preview}
              alt="Avatar"
              fill
              className="object-cover"
            />
            <button
              onClick={handleRemove}
              className="avatar-remove"
              aria-label="Xóa ảnh"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="avatar-placeholder">
            <Camera size={32} strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="avatar-actions">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn-upload"
        >
          <Upload size={18} />
          {uploading ? 'Đang tải...' : preview ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
        </button>

        <p className="avatar-hint">
          JPG, PNG tối đa 2MB
        </p>
      </div>

      <style jsx>{`
        .avatar-upload {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .avatar-preview {
          position: relative;
          width: 150px;
          height: 150px;
        }

        .avatar-image {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid #f4f4f5;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #f4f4f5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a1a1aa;
          border: 2px dashed #d4d4d8;
        }

        .avatar-remove {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .avatar-remove:hover {
          background: rgba(0, 0, 0, 0.9);
        }

        .avatar-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .btn-upload {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #18181b;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-upload:hover:not(:disabled) {
          background: #27272a;
        }

        .btn-upload:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .avatar-hint {
          font-size: 0.875rem;
          color: #71717a;
          margin: 0;
        }

        .hidden {
          display: none;
        }
      `}</style>
    </div>
  )
}
