"""
Create MongoDB indexes for product queries optimization
Run this script once to create indexes
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ecommerce_db")

async def create_indexes():
    """Create indexes for products collection"""
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    products_collection = db["products"]
    
    print("Creating indexes for products collection...")
    
    indexes_to_create = [
        ([("category.slug", 1), ("status", 1)], "category.slug + status"),
        ([("created_at", -1)], "created_at"),
        ([("pricing.sale", 1)], "pricing.sale"),
        ([("wishlist_count", -1)], "wishlist_count"),
        ([("sold_count", -1)], "sold_count"),
        ([("variants.sizes.name", 1)], "variants.sizes.name"),
        ([("variants.colors.slug", 1)], "variants.colors.slug"),
        ([("brand.slug", 1)], "brand.slug"),
        ([("status", 1), ("category.slug", 1), ("pricing.sale", 1)], "status + category.slug + pricing.sale"),
        ([("status", 1), ("variants.sizes.name", 1), ("created_at", -1)], "status + sizes + created_at"),
    ]
    
    for index_keys, description in indexes_to_create:
        try:
            await products_collection.create_index(index_keys)
            print(f"✓ Created index: {description}")
        except Exception as e:
            if "already exists" in str(e) or "IndexKeySpecsConflict" in str(e):
                print(f"⊙ Index already exists: {description}")
            else:
                print(f"✗ Error creating index {description}: {e}")
    
    print("\n✅ All indexes created successfully!")
    
    # List all indexes
    indexes = await products_collection.index_information()
    print("\nCurrent indexes:")
    for name, info in indexes.items():
        print(f"  - {name}: {info.get('key', [])}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_indexes())
