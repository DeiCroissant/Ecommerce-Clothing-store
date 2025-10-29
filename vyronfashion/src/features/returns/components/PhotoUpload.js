import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { MAX_PHOTOS } from '@/lib/mockReturnsData';

export function PhotoUpload({ photos, onChange, error }) {
  const [previews, setPreviews] = useState(photos || []);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const remainingSlots = MAX_PHOTOS - previews.length;
    const filesToAdd = files.slice(0, remainingSlots);

    filesToAdd.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPreviews = [...previews, e.target.result];
          setPreviews(newPreviews);
          onChange?.(newPreviews);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleRemove = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onChange?.(newPreviews);
  };

  const canAddMore = previews.length < MAX_PHOTOS;

  return (
    <div className="photo-upload-container">
      <div className="upload-header">
        <label className="upload-label">
          Hình ảnh sản phẩm <span className="optional">(Tùy chọn)</span>
        </label>
        <span className="photo-count">
          {previews.length}/{MAX_PHOTOS} ảnh
        </span>
      </div>

      <div className="previews-grid">
        {previews.map((preview, index) => (
          <div key={index} className="preview-item">
            <img src={preview} alt={`Preview ${index + 1}`} className="preview-image" />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="remove-button"
              aria-label="Xóa ảnh"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {canAddMore && (
          <div
            className={`upload-zone ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="upload-input"
            />
            <label htmlFor="photo-upload" className="upload-label-zone">
              <Upload size={24} />
              <span className="upload-text">
                Chọn hoặc kéo ảnh vào đây
              </span>
              <span className="upload-hint">
                PNG, JPG lên đến 10MB
              </span>
            </label>
          </div>
        )}
      </div>

      {error && (
        <div className="upload-error">
          {error}
        </div>
      )}

      <div className="upload-tips">
        <ImageIcon size={16} />
        <div className="tips-text">
          <strong>Gợi ý chụp ảnh:</strong>
          <ul>
            <li>Chụp rõ nét khuyết điểm sản phẩm (nếu có)</li>
            <li>Bao gồm ảnh nhãn mác, thẻ sản phẩm</li>
            <li>Chụp toàn bộ sản phẩm để dễ đối chiếu</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
