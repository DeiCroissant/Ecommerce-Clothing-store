from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection settings
# Prefer .env with key MONGODB_URL
MONGODB_URL = os.getenv("MONGODB_URL")

# Nếu không có MONGODB_URL, sẽ tạo từ các biến riêng lẻ
if not MONGODB_URL:
    MONGODB_HOST = os.getenv("MONGODB_HOST", "localhost")
    MONGODB_PORT = os.getenv("MONGODB_PORT", "27017")
    MONGODB_USERNAME = os.getenv("MONGODB_USERNAME")
    MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")
    MONGODB_AUTH_DB = os.getenv("MONGODB_AUTH_DB", "admin")
    
    # Tạo connection string
    if MONGODB_USERNAME and MONGODB_PASSWORD:
        MONGODB_URL = f"mongodb://{MONGODB_USERNAME}:{MONGODB_PASSWORD}@{MONGODB_HOST}:{MONGODB_PORT}/{MONGODB_AUTH_DB}?authSource={MONGODB_AUTH_DB}"
    else:
        MONGODB_URL = f"mongodb://{MONGODB_HOST}:{MONGODB_PORT}"

DATABASE_NAME = os.getenv("DATABASE_NAME", "vyronfashion_db")

# Async MongoDB client
client = AsyncIOMotorClient(MONGODB_URL)
database = client[DATABASE_NAME]

# Collections
users_collection = database.users
categories_collection = database.categories
products_collection = database.products
reviews_collection = database.reviews
orders_collection = database.orders
cart_collection = database.cart
addresses_collection = database.addresses
coupons_collection = database.coupons
returns_collection = database.returns
settings_collection = database.settings

# Sync MongoDB client for validation (optional)
sync_client = MongoClient(MONGODB_URL)
sync_database = sync_client[DATABASE_NAME]

async def close_db():
    """Đóng kết nối database"""
    client.close()
    sync_client.close()

