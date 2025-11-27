from pymongo import MongoClient

print("Connecting to MongoDB...")
c = MongoClient('mongodb://159.223.32.252:27017', serverSelectionTimeoutMS=5000)
db = c['vyronfashion_db']

print("Fetching orders...")
orders = list(db.orders.find().limit(5))
print(f"Found {len(orders)} orders")

for o in orders:
    print(f"  - status={o.get('status')}, amount={o.get('total_amount')}, created_at={o.get('created_at')}, type={type(o.get('created_at'))}")

c.close()
print("Done!")
