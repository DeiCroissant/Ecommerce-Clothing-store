"""
Script tối ưu API admin dashboard
Sử dụng aggregation pipeline và caching
"""

# Thêm vào backend/app/main.py

# Import thêm
from functools import lru_cache
import asyncio

# Cache dashboard data trong 2 phút
dashboard_cache = {"data": None, "timestamp": None}
CACHE_DURATION = 120  # seconds

@app.get("/api/admin/dashboard-optimized", response_model=DashboardResponse)
async def get_dashboard_stats_optimized():
    """Lấy thống kê dashboard cho admin - VERSION TỐI ƯU"""
    try:
        # Check cache
        now = datetime.now()
        if dashboard_cache["data"] and dashboard_cache["timestamp"]:
            cache_age = (now - dashboard_cache["timestamp"]).total_seconds()
            if cache_age < CACHE_DURATION:
                print(f"✅ Returning cached dashboard data (age: {cache_age:.1f}s)")
                return dashboard_cache["data"]
        
        print("🔄 Generating fresh dashboard data...")
        
        # Tính toán ngày
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday = today - timedelta(days=1)
        today_end = today + timedelta(days=1)
        
        # ========== AGGREGATION PIPELINE - TỐI ƯU ==========
        
        # 1. Doanh thu và đơn hàng - 1 query duy nhất cho tất cả
        revenue_pipeline = [
            {
                "$match": {
                    "created_at": {"$gte": (today - timedelta(days=14)).isoformat()},
                    "status": {"$in": ["completed", "delivered", "processing", "shipped"]}
                }
            },
            {
                "$project": {
                    "total_amount": 1,
                    "created_at": 1,
                    "status": 1,
                    "day": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": {"$dateFromString": {"dateString": "$created_at"}}
                        }
                    },
                    "is_today": {
                        "$eq": [
                            {"$dateToString": {
                                "format": "%Y-%m-%d", 
                                "date": {"$dateFromString": {"dateString": "$created_at"}}
                            }},
                            today.strftime("%Y-%m-%d")
                        ]
                    },
                    "is_yesterday": {
                        "$eq": [
                            {"$dateToString": {
                                "format": "%Y-%m-%d",
                                "date": {"$dateFromString": {"dateString": "$created_at"}}
                            }},
                            yesterday.strftime("%Y-%m-%d")
                        ]
                    }
                }
            },
            {
                "$group": {
                    "_id": "$day",
                    "revenue": {"$sum": "$total_amount"},
                    "orders_count": {"$sum": 1},
                    "is_today": {"$first": "$is_today"},
                    "is_yesterday": {"$first": "$is_yesterday"}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        # 2. Customers mới
        customers_pipeline = [
            {
                "$match": {
                    "createdAt": {"$gte": yesterday}
                }
            },
            {
                "$project": {
                    "is_today": {
                        "$gte": ["$createdAt", today]
                    }
                }
            },
            {
                "$group": {
                    "_id": "$is_today",
                    "count": {"$sum": 1}
                }
            }
        ]
        
        # 3. Pending orders với customer info - 1 query với lookup
        pending_orders_pipeline = [
            {
                "$match": {"status": "pending"}
            },
            {"$sort": {"created_at": -1}},
            {"$limit": 5},
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "_id",
                    "as": "user_info"
                }
            },
            {
                "$project": {
                    "order_number": 1,
                    "total_amount": 1,
                    "created_at": 1,
                    "status": 1,
                    "items": 1,
                    "customer_name": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$user_info.name", 0]},
                            {"$arrayElemAt": ["$user_info.username", 0]}
                        ]
                    }
                }
            }
        ]
        
        # 4. Low stock products - với điều kiện trong query
        low_stock_pipeline = [
            {
                "$match": {
                    "status": "active",
                    "$expr": {
                        "$lte": [
                            "$inventory.quantity",
                            "$inventory.low_stock_threshold"
                        ]
                    }
                }
            },
            {
                "$project": {
                    "name": 1,
                    "sku": 1,
                    "quantity": "$inventory.quantity",
                    "threshold": "$inventory.low_stock_threshold"
                }
            },
            {"$sort": {"quantity": 1}},
            {"$limit": 10}
        ]
        
        # ========== CHẠY TẤT CẢ QUERIES SONG SONG ==========
        revenue_data, customers_data, pending_orders_data, low_stock_data = await asyncio.gather(
            orders_collection.aggregate(revenue_pipeline).to_list(length=None),
            users_collection.aggregate(customers_pipeline).to_list(length=None),
            orders_collection.aggregate(pending_orders_pipeline).to_list(length=None),
            products_collection.aggregate(low_stock_pipeline).to_list(length=None)
        )
        
        # ========== XỬ LÝ KẾT QUẢ ==========
        
        # Revenue & Orders
        today_revenue = 0
        yesterday_revenue = 0
        today_orders_count = 0
        yesterday_orders_count = 0
        revenue_chart_data = []
        
        for item in revenue_data:
            revenue = item.get("revenue", 0)
            orders = item.get("orders_count", 0)
            
            if item.get("is_today"):
                today_revenue = revenue
                today_orders_count = orders
            if item.get("is_yesterday"):
                yesterday_revenue = revenue
                yesterday_orders_count = orders
            
            # Chart data (14 ngày gần nhất)
            date_str = datetime.strptime(item["_id"], "%Y-%m-%d").strftime("%d/%m")
            revenue_chart_data.append(DashboardRevenueData(
                date=date_str,
                revenue=revenue
            ))
        
        # Tính % thay đổi
        revenue_change = ((today_revenue - yesterday_revenue) / yesterday_revenue * 100) if yesterday_revenue > 0 else 0
        orders_change = ((today_orders_count - yesterday_orders_count) / yesterday_orders_count * 100) if yesterday_orders_count > 0 else 0
        
        # Customers
        today_customers_count = 0
        yesterday_customers_count = 0
        for item in customers_data:
            if item["_id"]:  # is_today = true
                today_customers_count = item["count"]
            else:
                yesterday_customers_count = item["count"]
        
        customers_change = ((today_customers_count - yesterday_customers_count) / yesterday_customers_count * 100) if yesterday_customers_count > 0 else 0
        
        # Mock visits
        today_visits = today_orders_count * 60
        yesterday_visits = yesterday_orders_count * 60
        visits_change = ((today_visits - yesterday_visits) / yesterday_visits * 100) if yesterday_visits > 0 else 0
        
        # Pending Orders
        pending_orders = []
        for order in pending_orders_data:
            created_at = datetime.fromisoformat(order.get("created_at", datetime.now().isoformat()))
            time_diff = now - created_at
            
            if time_diff.total_seconds() < 3600:
                time_ago = f"{int(time_diff.total_seconds() / 60)} phút trước"
            elif time_diff.total_seconds() < 86400:
                time_ago = f"{int(time_diff.total_seconds() / 3600)} giờ trước"
            else:
                time_ago = f"{int(time_diff.total_seconds() / 86400)} ngày trước"
            
            pending_orders.append(DashboardPendingOrder(
                id=str(order["_id"]),
                order_number=order.get("order_number", f"ORD{str(order['_id'])[:8].upper()}"),
                customer_name=order.get("customer_name", "Khách hàng"),
                total_amount=order.get("total_amount", 0),
                items_count=len(order.get("items", [])),
                time_ago=time_ago,
                status=order.get("status", "pending")
            ))
        
        # Low Stock Products
        low_stock_products = [
            DashboardLowStockProduct(
                id=str(product["_id"]),
                name=product.get("name", ""),
                sku=product.get("sku", ""),
                stock=product.get("quantity", 0),
                threshold=product.get("threshold", 10)
            )
            for product in low_stock_data
        ]
        
        # KPIs
        kpis = [
            DashboardKPIMetric(
                id="revenue",
                title="Doanh thu hôm nay",
                value=today_revenue,
                change=revenue_change,
                trend="up" if revenue_change >= 0 else "down",
                is_currency=True
            ),
            DashboardKPIMetric(
                id="orders",
                title="Đơn hôm nay",
                value=today_orders_count,
                change=orders_change,
                trend="up" if orders_change >= 0 else "down",
                is_currency=False
            ),
            DashboardKPIMetric(
                id="customers",
                title="Khách mới",
                value=today_customers_count,
                change=customers_change,
                trend="up" if customers_change >= 0 else "down",
                is_currency=False
            ),
            DashboardKPIMetric(
                id="visits",
                title="Lượt truy cập",
                value=today_visits,
                change=visits_change,
                trend="up" if visits_change >= 0 else "down",
                is_currency=False
            )
        ]
        
        response = DashboardResponse(
            success=True,
            kpis=kpis,
            revenue_chart=revenue_chart_data,
            pending_orders=pending_orders,
            low_stock_products=low_stock_products
        )
        
        # Cache response
        dashboard_cache["data"] = response
        dashboard_cache["timestamp"] = now
        
        print(f"✅ Dashboard data generated and cached")
        return response
        
    except Exception as e:
        print(f"❌ Error in dashboard: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )
