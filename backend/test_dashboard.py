"""Test dashboard API to check revenue chart data"""
import requests

try:
    resp = requests.get("http://localhost:8000/api/admin/dashboard", timeout=10)
    data = resp.json()
    
    print("=" * 50)
    print("KPIs:")
    for kpi in data.get("kpis", []):
        print(f"  - {kpi['title']}: {kpi['value']}")
    
    print("\n" + "=" * 50)
    print("Revenue Chart (30 ngày):")
    chart = data.get("revenue_chart", [])
    if chart:
        for item in chart:
            print(f"  - {item['date']}: {item['revenue']:,}đ")
    else:
        print("  (Không có dữ liệu)")
    
    print("\n" + "=" * 50)
    print(f"Pending Orders: {len(data.get('pending_orders', []))}")
    print(f"Low Stock Products: {len(data.get('low_stock_products', []))}")
    
except Exception as e:
    print(f"Error: {e}")
