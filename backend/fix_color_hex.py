"""
Script để sửa hex code của màu sắc trong database
Chạy: python fix_color_hex.py
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import unicodedata

# Load environment variables
load_dotenv()

# Lấy connection string từ .env
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "vyronfashion_db")

# Color name to hex mapping (hỗ trợ cả có dấu và không dấu)
COLOR_HEX_MAP = {
    # Black / Đen
    'black': '#000000', 'đen': '#000000', 'den': '#000000',
    # White / Trắng
    'white': '#FFFFFF', 'trắng': '#FFFFFF', 'trang': '#FFFFFF',
    # Gray / Xám
    'gray': '#9CA3AF', 'grey': '#9CA3AF', 'xám': '#9CA3AF', 'xam': '#9CA3AF',
    # Red / Đỏ
    'red': '#EF4444', 'đỏ': '#EF4444', 'do': '#EF4444',
    # Blue / Xanh dương
    'blue': '#3B82F6', 'xanh dương': '#3B82F6', 'xanh duong': '#3B82F6', 'xanh': '#3B82F6',
    # Green / Xanh lá
    'green': '#22C55E', 'xanh lá': '#22C55E', 'xanh la': '#22C55E',
    # Yellow / Vàng
    'yellow': '#EAB308', 'vàng': '#EAB308', 'vang': '#EAB308',
    # Pink / Hồng
    'pink': '#EC4899', 'hồng': '#EC4899', 'hong': '#EC4899',
    # Purple / Tím
    'purple': '#A855F7', 'tím': '#A855F7', 'tim': '#A855F7',
    # Orange / Cam
    'orange': '#F97316', 'cam': '#F97316',
    # Brown / Nâu
    'brown': '#92400E', 'nâu': '#92400E', 'nau': '#92400E',
    # Beige / Be / Kem
    'beige': '#D4B896', 'be': '#D4B896', 'kem': '#D4B896',
    # Navy
    'navy': '#1E3A8A',
    # Olive
    'olive': '#6B8E23',
    # Khaki
    'khaki': '#C3B091',
}

def remove_accents(input_str):
    return ''.join((c for c in unicodedata.normalize('NFKD', input_str) if not unicodedata.combining(c)))

def get_hex_from_color_name(color_name: str, color_slug: str = None) -> str:
    """Lấy hex code từ tên màu hoặc slug"""
    if not color_name and not color_slug:
        return '#808080'  # Default gray
    
    # Thử với slug trước (thường không dấu)
    if color_slug:
        slug_lower = color_slug.lower().strip()
        if slug_lower in COLOR_HEX_MAP:
            return COLOR_HEX_MAP[slug_lower]
    
    # Thử với tên màu
    if color_name:
        name_lower = color_name.lower().strip()
        if name_lower in COLOR_HEX_MAP:
            return COLOR_HEX_MAP[name_lower]
        
        # Thử remove accents và tìm lại
        name_no_accent = remove_accents(name_lower)
        if name_no_accent in COLOR_HEX_MAP:
            return COLOR_HEX_MAP[name_no_accent]
    
    return '#808080'  # Default gray nếu không tìm thấy


async def fix_color_hex():
    """Fix hex code cho tất cả sản phẩm trong database"""
    print(f"🔗 Đang kết nối đến MongoDB Atlas...")
    print(f"   Database: {DATABASE_NAME}")
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    products = db['products']
    
    # Đếm tổng số sản phẩm
    total = await products.count_documents({})
    print(f"📦 Tổng số sản phẩm: {total}")
    
    if total == 0:
        print("❌ Không có sản phẩm nào trong database!")
        return
    
    updated_count = 0
    skipped_count = 0
    
    cursor = products.find({})
    async for product in cursor:
        product_id = product.get('_id')
        product_name = product.get('name', 'Unknown')
        colors = product.get('variants', {}).get('colors', [])
        
        if 'Polo' in product_name or 'Xám' in product_name:
            print(f"\n📦 {product_name}")
            print(f"   Raw colors from DB: {colors}")
        
        if not colors:
            skipped_count += 1
            continue
        
        needs_update = False
        updated_colors = []
        
        for color in colors:
            color_name = color.get('name', '')
            color_slug = color.get('slug', '')
            current_hex = color.get('hex', '')
            
            # Kiểm tra xem hex có hợp lệ không
            # Hex không hợp lệ: rỗng, #000000 (default cũ), hoặc không bắt đầu bằng #
            is_invalid_hex = (
                not current_hex or 
                not current_hex.startswith('#') or
                current_hex == '#000000'  # Default cũ có thể sai
            )
            
            if is_invalid_hex:
                new_hex = get_hex_from_color_name(color_name, color_slug)
                
                # Nếu tên màu thực sự là đen thì giữ nguyên #000000
                if color_name.lower() in ['đen', 'den', 'black'] or color_slug.lower() in ['den', 'black']:
                    new_hex = '#000000'
                
                if new_hex != current_hex:
                    print(f"  🎨 '{color_name}' (slug: {color_slug}): {current_hex} → {new_hex}")
                    color['hex'] = new_hex
                    needs_update = True
            
            updated_colors.append(color)
        
        if needs_update:
            # Cập nhật database
            result = await products.update_one(
                {'_id': product_id},
                {'$set': {'variants.colors': updated_colors}}
            )
            if result.modified_count > 0:
                print(f"✅ Đã cập nhật: {product_name}")
                updated_count += 1
        else:
            skipped_count += 1
    
    print(f"\n📊 Kết quả:")
    print(f"   ✅ Đã cập nhật: {updated_count} sản phẩm")
    print(f"   ⏭️  Bỏ qua: {skipped_count} sản phẩm")


if __name__ == "__main__":
    print("🔧 Bắt đầu sửa hex code màu sắc...\n")
    asyncio.run(fix_color_hex())
    print("\n✨ Hoàn tất!")
