"""
Liệt kê tất cả indexes hiện tại
"""
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    MONGODB_HOST = os.getenv("MONGODB_HOST", "localhost")
    MONGODB_PORT = os.getenv("MONGODB_PORT", "27017")
    MONGODB_USERNAME = os.getenv("MONGODB_USERNAME")
    MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")
    MONGODB_AUTH_DB = os.getenv("MONGODB_AUTH_DB", "admin")
    
    if MONGODB_USERNAME and MONGODB_PASSWORD:
        MONGODB_URL = f"mongodb://{MONGODB_USERNAME}:{MONGODB_PASSWORD}@{MONGODB_HOST}:{MONGODB_PORT}/{MONGODB_AUTH_DB}?authSource={MONGODB_AUTH_DB}"
    else:
        MONGODB_URL = f"mongodb://{MONGODB_HOST}:{MONGODB_PORT}"

DATABASE_NAME = os.getenv("DATABASE_NAME", "vyronfashion_db")

client = MongoClient(MONGODB_URL)
db = client[DATABASE_NAME]

print("📦 PRODUCTS INDEXES:")
for idx in db.products.list_indexes():
    print(f"   {idx['name']}: {idx.get('key', {})}")

print("\n🛒 CARTS INDEXES:")
for idx in db.carts.list_indexes():
    print(f"   {idx['name']}: {idx.get('key', {})}")

print("\n❤️  WISHLISTS INDEXES:")
for idx in db.wishlists.list_indexes():
    print(f"   {idx['name']}: {idx.get('key', {})}")

client.close()
