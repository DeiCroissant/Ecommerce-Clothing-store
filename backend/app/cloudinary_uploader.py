"""
Cloudinary Uploader - Xử lý upload ảnh lên Cloudinary
"""

import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import Optional, Dict, List, Tuple
from datetime import datetime
import hashlib
from dotenv import load_dotenv

load_dotenv()

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

# Configure Cloudinary
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True
)


def is_cloudinary_configured() -> bool:
    """Kiểm tra Cloudinary đã được cấu hình chưa"""
    return all([CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET])


def generate_public_id(
    product_slug: Optional[str] = None,
    color_name: Optional[str] = None,
    image_index: int = 0,
    is_main: bool = False
) -> str:
    """
    Tạo public_id cho ảnh trên Cloudinary
    
    Format:
    - Ảnh chính: vyron-fashion/products/{product-slug}/main
    - Ảnh màu: vyron-fashion/products/{product-slug}/colors/{color-name}/img-{index}
    - Ảnh tạm: vyron-fashion/temp/{timestamp}_{hash}
    """
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    
    if product_slug:
        if is_main:
            return f"vyron-fashion/products/{product_slug}/main"
        elif color_name:
            return f"vyron-fashion/products/{product_slug}/colors/{color_name}/img-{image_index}"
        else:
            return f"vyron-fashion/products/{product_slug}/gallery/img-{image_index}"
    else:
        # Ảnh tạm khi chưa có product_slug
        file_hash = hashlib.md5(f"{timestamp}".encode()).hexdigest()[:8]
        return f"vyron-fashion/temp/{timestamp}_{file_hash}"


def upload_image(
    file_content: bytes,
    product_slug: Optional[str] = None,
    color_name: Optional[str] = None,
    image_index: int = 0,
    is_main: bool = False,
    folder: Optional[str] = None
) -> Tuple[str, Dict]:
    """
    Upload ảnh lên Cloudinary
    
    Args:
        file_content: Nội dung file ảnh (bytes)
        product_slug: Slug của sản phẩm
        color_name: Tên màu (nếu là ảnh màu)
        image_index: Index của ảnh trong gallery
        is_main: True nếu là ảnh chính
        folder: Custom folder (override default)
    
    Returns:
        Tuple[url, metadata]
    """
    if not is_cloudinary_configured():
        raise Exception("Cloudinary chưa được cấu hình. Vui lòng kiểm tra .env")
    
    # Tạo public_id
    public_id = generate_public_id(product_slug, color_name, image_index, is_main)
    
    # Upload options
    upload_options = {
        "public_id": public_id,
        "overwrite": True,
        "resource_type": "image",
        "quality": "auto:good",  # Tự động tối ưu chất lượng
        "fetch_format": "auto",  # Tự động chọn format tốt nhất (WebP, AVIF)
    }
    
    # Thêm transformation để resize ảnh lớn
    upload_options["transformation"] = [
        {"width": 1200, "height": 1200, "crop": "limit"},  # Max 1200x1200
        {"quality": "auto:good"}
    ]
    
    if folder:
        upload_options["folder"] = folder
    
    try:
        # Upload lên Cloudinary
        result = cloudinary.uploader.upload(file_content, **upload_options)
        
        url = result.get("secure_url", "")
        metadata = {
            "public_id": result.get("public_id"),
            "width": result.get("width"),
            "height": result.get("height"),
            "format": result.get("format"),
            "size": result.get("bytes"),
            "created_at": result.get("created_at")
        }
        
        print(f"✅ Upload thành công: {public_id}")
        print(f"   URL: {url[:60]}...")
        
        return url, metadata
        
    except Exception as e:
        print(f"❌ Lỗi upload Cloudinary: {str(e)}")
        raise Exception(f"Lỗi upload Cloudinary: {str(e)}")


def upload_multiple_images(
    files: List[Tuple[bytes, str]],  # List of (content, filename)
    product_slug: Optional[str] = None,
    color_name: Optional[str] = None
) -> List[Dict]:
    """
    Upload nhiều ảnh lên Cloudinary
    
    Args:
        files: List of (file_content, original_filename)
        product_slug: Slug sản phẩm
        color_name: Tên màu (nếu là ảnh màu)
    
    Returns:
        List of {url, metadata}
    """
    results = []
    
    for index, (content, filename) in enumerate(files):
        try:
            url, metadata = upload_image(
                file_content=content,
                product_slug=product_slug,
                color_name=color_name,
                image_index=index,
                is_main=(index == 0 and not color_name)
            )
            results.append({
                "success": True,
                "url": url,
                "metadata": metadata,
                "original_filename": filename
            })
        except Exception as e:
            results.append({
                "success": False,
                "error": str(e),
                "original_filename": filename
            })
    
    return results


def delete_image(public_id: str) -> bool:
    """
    Xóa ảnh khỏi Cloudinary
    
    Args:
        public_id: Public ID của ảnh
    
    Returns:
        True nếu xóa thành công
    """
    if not is_cloudinary_configured():
        return False
    
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception as e:
        print(f"❌ Lỗi xóa ảnh Cloudinary: {str(e)}")
        return False


def delete_product_images(product_slug: str) -> Dict:
    """
    Xóa tất cả ảnh của một sản phẩm
    
    Args:
        product_slug: Slug sản phẩm
    
    Returns:
        Dict thống kê {deleted: số ảnh đã xóa, failed: số ảnh lỗi}
    """
    if not is_cloudinary_configured():
        return {"deleted": 0, "failed": 0, "error": "Cloudinary not configured"}
    
    try:
        # Xóa tất cả ảnh trong folder của sản phẩm
        prefix = f"vyron-fashion/products/{product_slug}"
        result = cloudinary.api.delete_resources_by_prefix(prefix)
        
        deleted_count = len(result.get("deleted", {}))
        
        return {
            "deleted": deleted_count,
            "failed": 0
        }
    except Exception as e:
        print(f"❌ Lỗi xóa ảnh sản phẩm: {str(e)}")
        return {"deleted": 0, "failed": 0, "error": str(e)}


def get_image_url(public_id: str, transformations: Optional[Dict] = None) -> str:
    """
    Tạo URL ảnh với transformations
    
    Args:
        public_id: Public ID của ảnh
        transformations: Dict các transformation (width, height, crop, etc.)
    
    Returns:
        URL ảnh
    """
    if transformations:
        return cloudinary.CloudinaryImage(public_id).build_url(**transformations)
    return cloudinary.CloudinaryImage(public_id).build_url()


# Utility functions
def extract_public_id_from_url(url: str) -> Optional[str]:
    """
    Lấy public_id từ Cloudinary URL
    
    Args:
        url: URL Cloudinary (https://res.cloudinary.com/xxx/image/upload/v123/public_id.jpg)
    
    Returns:
        public_id hoặc None
    """
    if not url or "cloudinary.com" not in url:
        return None
    
    try:
        # URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{ext}
        parts = url.split("/upload/")
        if len(parts) < 2:
            return None
        
        # Lấy phần sau /upload/, bỏ version (v123456/)
        path = parts[1]
        if path.startswith("v"):
            # Bỏ v123456/
            path = "/".join(path.split("/")[1:])
        
        # Bỏ extension
        public_id = path.rsplit(".", 1)[0]
        return public_id
    except:
        return None
