"""Kiểm tra API response"""
import requests

try:
    resp = requests.get("http://localhost:8000/api/products/slug/ao-thun-tay-dai-line-art", timeout=5)
    if resp.status_code == 200:
        data = resp.json()
        print("Product:", data.get("name"))
        colors = data.get("variants", {}).get("colors", [])
        print(f"Colors: {len(colors)}")
        for c in colors:
            images = c.get("images", [])
            print(f"  {c.get('name')}: {len(images)} images")
            for i, img in enumerate(images[:3]):
                print(f"    [{i}]: {img[:60]}...")
    else:
        print(f"API Error: {resp.status_code}")
except Exception as e:
    print(f"Error: {e}")
    print("Backend may not be running")
