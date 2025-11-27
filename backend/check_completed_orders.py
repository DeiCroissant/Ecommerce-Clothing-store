"""Check completed orders in database"""
from pymongo import MongoClient
from datetime import datetime, timedelta

# Connect to MongoDB
client = MongoClient("mongodb://157.66.80.32:27017", serverSelectionTimeoutMS=5000)
db = client["vyronfashion_db"]
orders = db["orders"]

# Check completed orders
print("=" * 60)
print("CHECKING COMPLETED ORDERS IN DATABASE")
print("=" * 60)

# Get all completed orders
completed = list(orders.find({"status": "completed"}).limit(10))
print(f"\nTotal completed orders found: {orders.count_documents({'status': 'completed'})}")

if completed:
    for i, order in enumerate(completed[:5], 1):
        print(f"\n--- Order {i} ---")
        print(f"  _id: {order.get('_id')}")
        print(f"  order_number: {order.get('order_number')}")
        print(f"  status: {order.get('status')}")
        print(f"  total_amount: {order.get('total_amount')}")
        print(f"  created_at: {order.get('created_at')} (type: {type(order.get('created_at')).__name__})")
        print(f"  updated_at: {order.get('updated_at')} (type: {type(order.get('updated_at')).__name__})")
else:
    print("\n❌ No completed orders found!")
    
    # Check what statuses exist
    print("\nChecking all order statuses:")
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_counts = list(orders.aggregate(pipeline))
    for s in status_counts:
        print(f"  - {s['_id']}: {s['count']} orders")

# Check 30 days filter
print("\n" + "=" * 60)
date_30_days_ago = datetime.now() - timedelta(days=30)
date_str = date_30_days_ago.strftime("%Y-%m-%d")
print(f"30 days ago date string: {date_str}")

# Test the aggregation pipeline
pipeline = [
    {"$match": {"status": "completed"}},
    {
        "$addFields": {
            "amount": {"$ifNull": ["$total_amount", 0]},
            "day_str": {
                "$switch": {
                    "branches": [
                        {
                            "case": {"$eq": [{"$type": "$updated_at"}, "date"]},
                            "then": {"$dateToString": {"format": "%Y-%m-%d", "date": "$updated_at"}}
                        },
                        {
                            "case": {"$eq": [{"$type": "$updated_at"}, "string"]},
                            "then": {"$substr": ["$updated_at", 0, 10]}
                        }
                    ],
                    "default": "unknown"
                }
            }
        }
    },
    {
        "$match": {
            "day_str": {
                "$gte": date_str,
                "$ne": "unknown"
            }
        }
    },
    {
        "$group": {
            "_id": "$day_str",
            "revenue": {"$sum": "$amount"},
            "orders_count": {"$sum": 1}
        }
    },
    {"$sort": {"_id": 1}}
]

print("\nRunning revenue chart pipeline...")
result = list(orders.aggregate(pipeline))
print(f"Results: {len(result)} days with data")
for item in result:
    print(f"  - {item['_id']}: {item['revenue']:,.0f}đ ({item['orders_count']} orders)")

client.close()
