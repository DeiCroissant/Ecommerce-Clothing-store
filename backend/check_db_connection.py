"""
Script đơn giản để kiểm tra kết nối MongoDB và đếm sản phẩm
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def check_db_connection():
    print("=" * 80)
    print("🔍 KIỂM TRA KẾT NỐI DATABASE")
    print("=" * 80)
    
    mongodb_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
    print(f"\n📡 MongoDB URL: {mongodb_url}")
    
    try:
        client = AsyncIOMotorClient(mongodb_url)
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Kết nối MongoDB thành công!")
        
        # List databases
        db_list = await client.list_database_names()
        print(f"\n📚 Danh sách databases: {db_list}")
        
        # Check vyronfashion database
        db = client['vyronfashion']
        collections = await db.list_collection_names()
        print(f"\n📦 Collections trong 'vyronfashion': {collections}")
        
        # Count products
        if 'products' in collections:
            products_collection = db['products']
            total = await products_collection.count_documents({})
            active = await products_collection.count_documents({"status": "active"})
            
            print(f"\n📊 THỐNG KÊ SẢN PHẨM:")
            print(f"   - Tổng số sản phẩm: {total}")
            print(f"   - Sản phẩm active: {active}")
            
            if total > 0:
                # Get sample product
                sample = await products_collection.find_one()
                print(f"\n🔍 Sản phẩm mẫu:")
                print(f"   - ID: {sample.get('_id')}")
                print(f"   - Name: {sample.get('name', 'N/A')}")
                print(f"   - Created_at: {sample.get('created_at')} (type: {type(sample.get('created_at')).__name__})")
                print(f"   - Updated_at: {sample.get('updated_at')} (type: {type(sample.get('updated_at')).__name__})")
        else:
            print("\n⚠️  Collection 'products' không tồn tại!")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ LỖI: {e}")
        print(f"   Chi tiết: {str(e)}")
    
    print("\n" + "=" * 80)

if __name__ == "__main__":
    asyncio.run(check_db_connection())
