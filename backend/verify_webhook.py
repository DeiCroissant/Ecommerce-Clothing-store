"""
Script test webhook endpoint - verify code đã deploy chưa
"""
import requests
import json

VPS_URL = "http://157.66.80.32:8000"

# Test 1: Check endpoint tồn tại
print("="*60)
print("TEST 1: Check webhook endpoint")
print("="*60)

# Giả lập webhook từ Casso
webhook_payload = {
    "error": 0,
    "data": [{
        "id": 12345,
        "tid": "TEST123",
        "description": "test giao dich 673e5a1b2c3d4e5f6a7b8c9d",
        "amount": 150000,
        "when": "2025-11-25 22:00:00",
        "bank_sub_acc_id": "88888888"
    }]
}

try:
    response = requests.post(
        f"{VPS_URL}/api/payments/casso/webhook",
        json=webhook_payload,
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    
    if response.status_code == 422:
        print("\n❌ VPS VẪN CHẠY CODE CŨ!")
        print("Code cũ expect schema với id, tid ở root level")
        print("\n✅ Giải pháp: Copy file main.py lên VPS và restart backend!")
    elif response.status_code == 200:
        print("\n✅ Code mới đã deploy!")
        print("Webhook endpoint hoạt động với format mới")
    else:
        print(f"\n⚠️  Unexpected status: {response.status_code}")
        
except Exception as e:
    print(f"\n❌ Lỗi: {e}")

print("\n" + "="*60)
