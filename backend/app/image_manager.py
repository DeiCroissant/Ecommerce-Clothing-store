"""
Image Manager - Quản lý ảnh sản phẩm
Xử lý upload, delete, resize ảnh sản phẩm
"""

import os
import shutil
from pathlib import Path
from typing import List, Optional, Tuple
from datetime import datetime
import hashlib
import re
from PIL import Image
import io
from .logger_config import setup_logging

# Setup logger
logger = setup_logging("image_manager")

class ImageManager:
    """Class quản lý ảnh sản phẩm"""
    
    def __init__(self, base_dir: str = "uploads/products"):
        """
        Khởi tạo ImageManager
        
        Args:
            base_dir: Thư mục gốc lưu ảnh (mặc định: uploads/products)
        """
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
        
        # Các format ảnh được chấp nhận
        self.allowed_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
        
        # Kích thước ảnh tối đa (pixels)
        self.max_dimensions = {
            'large': (1200, 1200),
            'medium': (600, 600),
            'thumbnail': (200, 200)
        }
    
    def extract_filename_from_url(self, url: str) -> Optional[str]:
        """
        Lấy tên file từ URL
        
        Args:
            url: URL ảnh (vd: /uploads/products/abc.jpg hoặc https://domain.com/uploads/products/abc.jpg)
        
        Returns:
            Tên file (vd: abc.jpg) hoặc None nếu không tìm thấy
        """
        if not url:
            return None
        
        # Xử lý URL có dạng /uploads/products/abc.jpg
        if '/uploads/products/' in url:
            filename = url.split('/uploads/products/')[-1]
            # Loại bỏ query params nếu có (vd: abc.jpg?v=123)
            filename = filename.split('?')[0]
            return filename if filename else None
        
        # Xử lý URL có dạng domain.com/abc.jpg
        if '/' in url:
            filename = url.split('/')[-1]
            filename = filename.split('?')[0]
            return filename if filename else None
        
        # URL chỉ là tên file
        return url.split('?')[0] if url else None
    
    def get_file_path(self, filename: str) -> Path:
        """
        Lấy đường dẫn đầy đủ của file
        
        Args:
            filename: Tên file
        
        Returns:
            Path object của file
        """
        return self.base_dir / filename
    
    def file_exists(self, filename: str) -> bool:
        """
        Kiểm tra file có tồn tại không
        
        Args:
            filename: Tên file
        
        Returns:
            True nếu file tồn tại
        """
        return self.get_file_path(filename).exists()
    
    def delete_image(self, image_url: str) -> bool:
        """
        Xóa 1 ảnh
        
        Args:
            image_url: URL hoặc path của ảnh
        
        Returns:
            True nếu xóa thành công, False nếu không tìm thấy file
        """
        filename = self.extract_filename_from_url(image_url)
        if not filename:
            return False
        
        file_path = self.get_file_path(filename)
        
        if file_path.exists():
            try:
                file_path.unlink()
                logger.info(f"Deleted image: {filename}")
                return True
            except Exception as e:
                logger.error(f"Error deleting image {filename}: {str(e)}")
                return False
        else:
            logger.warning(f"Image not found: {filename}")
            return False
    
    def delete_product_images(self, product: dict) -> dict:
        """
        Xóa tất cả ảnh của 1 sản phẩm
        
        Args:
            product: Dict chứa thông tin sản phẩm từ MongoDB
        
        Returns:
            Dict chứa thống kê {
                'total': tổng số ảnh cần xóa,
                'deleted': số ảnh đã xóa thành công,
                'failed': số ảnh xóa thất bại
            }
        """
        images_to_delete = []
        stats = {'total': 0, 'deleted': 0, 'failed': 0}
        
        # 1. Ảnh chính (image)
        if product.get('image'):
            images_to_delete.append(product['image'])
        
        # 2. Gallery images (images array)
        if product.get('images') and isinstance(product['images'], list):
            images_to_delete.extend(product['images'])
        
        # 3. Ảnh trong color variants
        variants = product.get('variants', {})
        if isinstance(variants, dict) and 'colors' in variants:
            colors = variants['colors']
            if isinstance(colors, list):
                for color in colors:
                    if isinstance(color, dict) and 'images' in color:
                        color_images = color['images']
                        if isinstance(color_images, list):
                            images_to_delete.extend(color_images)
        
        # Loại bỏ URL trùng lặp
        unique_images = list(set(filter(None, images_to_delete)))
        stats['total'] = len(unique_images)
        
        logger.info(f"Deleting {stats['total']} images for product: {product.get('name', 'N/A')}")
        
        # Xóa từng ảnh
        for image_url in unique_images:
            if self.delete_image(image_url):
                stats['deleted'] += 1
            else:
                stats['failed'] += 1
        
        logger.info(f"Result: {stats['deleted']} success, {stats['failed']} failed")
        
        return stats
    
    def save_uploaded_file(
        self, 
        file_content: bytes, 
        original_filename: str,
        product_id: str = None,
        optimize: bool = True
    ) -> Tuple[str, dict]:
        """
        Lưu file upload từ frontend
        
        Args:
            file_content: Nội dung file (bytes)
            original_filename: Tên file gốc
            product_id: ID sản phẩm (optional, để tạo tên file unique)
            optimize: Có optimize ảnh không (resize, compress)
        
        Returns:
            Tuple (url, metadata) - URL để lưu vào DB và metadata ảnh
        """
        # Validate extension
        ext = Path(original_filename).suffix.lower()
        if ext not in self.allowed_extensions:
            raise ValueError(f"File extension {ext} không được hỗ trợ. Chỉ chấp nhận: {', '.join(self.allowed_extensions)}")
        
        # Tạo tên file unique
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_hash = hashlib.md5(file_content).hexdigest()[:8]
        
        if product_id:
            new_filename = f"product_{product_id}_{timestamp}_{file_hash}{ext}"
        else:
            new_filename = f"upload_{timestamp}_{file_hash}{ext}"
        
        file_path = self.get_file_path(new_filename)
        
        # Optimize ảnh nếu cần
        if optimize and ext in {'.jpg', '.jpeg', '.png', '.webp'}:
            try:
                img = Image.open(io.BytesIO(file_content))
                
                # Resize nếu quá lớn
                max_width, max_height = self.max_dimensions['large']
                if img.width > max_width or img.height > max_height:
                    img.thumbnail((max_width, max_height), Image.LANCZOS)
                
                # Convert RGBA -> RGB nếu là JPEG
                if ext in {'.jpg', '.jpeg'} and img.mode in ('RGBA', 'LA', 'P'):
                    bg = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    bg.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                    img = bg
                
                # Lưu với compression
                output = io.BytesIO()
                if ext in {'.jpg', '.jpeg'}:
                    save_format = 'JPEG'
                elif ext == '.webp':
                    save_format = 'WEBP'
                else:
                    save_format = 'PNG'
                img.save(output, format=save_format, quality=85, optimize=True)
                file_content = output.getvalue()
                
                metadata = {
                    'width': img.width,
                    'height': img.height,
                    'format': img.format,
                    'size': len(file_content)
                }
            except Exception as e:
                logger.warning(f"Cannot optimize image: {str(e)}. Saving original.")
                metadata = {'size': len(file_content)}
        else:
            metadata = {'size': len(file_content)}
        
        # Lưu file
        with open(file_path, 'wb') as f:
            f.write(file_content)
        
        # Tạo URL
        url = f"/uploads/products/{new_filename}"
        
        logger.info(f"Saved image: {new_filename} ({metadata.get('size', 0) / 1024:.1f}KB)")
        
        return url, metadata
    
    def cleanup_unused_images(self, products: list) -> dict:
        """
        Xóa các ảnh không được sử dụng bởi bất kỳ sản phẩm nào
        
        Args:
            products: List tất cả sản phẩm từ MongoDB
        
        Returns:
            Dict thống kê {
                'total_files': tổng số file trong thư mục,
                'used_files': số file đang được dùng,
                'deleted': số file đã xóa,
                'freed_space': dung lượng giải phóng (bytes)
            }
        """
        # Thu thập tất cả URL ảnh đang được sử dụng
        used_images = set()
        
        for product in products:
            # Ảnh chính
            if product.get('image'):
                filename = self.extract_filename_from_url(product['image'])
                if filename:
                    used_images.add(filename)
            
            # Gallery images
            if product.get('images') and isinstance(product['images'], list):
                for img_url in product['images']:
                    filename = self.extract_filename_from_url(img_url)
                    if filename:
                        used_images.add(filename)
            
            # Color variant images
            variants = product.get('variants', {})
            if isinstance(variants, dict) and 'colors' in variants:
                colors = variants['colors']
                if isinstance(colors, list):
                    for color in colors:
                        if isinstance(color, dict) and 'images' in color:
                            color_images = color['images']
                            if isinstance(color_images, list):
                                for img_url in color_images:
                                    filename = self.extract_filename_from_url(img_url)
                                    if filename:
                                        used_images.add(filename)
        
        # Lấy tất cả file trong thư mục
        all_files = [f for f in self.base_dir.iterdir() if f.is_file()]
        
        stats = {
            'total_files': len(all_files),
            'used_files': len(used_images),
            'deleted': 0,
            'freed_space': 0
        }
        
        logger.info(f"Cleanup: {stats['total_files']} files, {stats['used_files']} in use")
        
        # Xóa các file không được sử dụng
        for file_path in all_files:
            if file_path.name not in used_images:
                try:
                    file_size = file_path.stat().st_size
                    file_path.unlink()
                    stats['deleted'] += 1
                    stats['freed_space'] += file_size
                    logger.debug(f"Deleted unused: {file_path.name} ({file_size / 1024:.1f}KB)")
                except Exception as e:
                    logger.error(f"Error deleting {file_path.name}: {str(e)}")
        
        logger.info(f"Cleanup complete: Deleted {stats['deleted']} files, freed {stats['freed_space'] / 1024 / 1024:.2f}MB")
        
        return stats
    
    def get_storage_stats(self) -> dict:
        """
        Lấy thống kê dung lượng
        
        Returns:
            Dict chứa {
                'total_files': tổng số file,
                'total_size': tổng dung lượng (bytes),
                'average_size': kích thước trung bình (bytes)
            }
        """
        files = [f for f in self.base_dir.iterdir() if f.is_file()]
        
        total_size = sum(f.stat().st_size for f in files)
        
        return {
            'total_files': len(files),
            'total_size': total_size,
            'average_size': total_size // len(files) if files else 0,
            'total_size_mb': total_size / 1024 / 1024
        }


# Singleton instance
image_manager = ImageManager()


# Helper functions để sử dụng trực tiếp
def delete_product_images(product: dict) -> dict:
    """Xóa tất cả ảnh của 1 sản phẩm"""
    return image_manager.delete_product_images(product)


def delete_image(image_url: str) -> bool:
    """Xóa 1 ảnh"""
    return image_manager.delete_image(image_url)


def save_uploaded_file(file_content: bytes, original_filename: str, product_id: str = None, optimize: bool = True) -> Tuple[str, dict]:
    """Lưu file upload"""
    return image_manager.save_uploaded_file(file_content, original_filename, product_id, optimize)


def cleanup_unused_images(products: list) -> dict:
    """Xóa ảnh không sử dụng"""
    return image_manager.cleanup_unused_images(products)


def get_storage_stats() -> dict:
    """Lấy thống kê storage"""
    return image_manager.get_storage_stats()
