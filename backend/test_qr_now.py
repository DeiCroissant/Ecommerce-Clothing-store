"""Test VietQR response"""
import asyncio
import sys
sys.path.insert(0, '/Users/quangvinh3020/Desktop/web/Ecommerce-Clothing-store/backend')

from dotenv import load_dotenv
load_dotenv()

from app import payment_vietqr

async def test():
    result = await payment_vietqr.create_vietqr_payment(
        order_id='6925cbfb512c7be7437c5470',
        amount=338700,
        description='Thanh toan don 6925cbfb512c7be7437c5470'
    )
    
    print("✅ Success:", result.get('success'))
    print("📷 QR URL:", result.get('vietqr_url'))
    print("\n💳 Payment Info:")
    info = result.get('payment_info', {})
    for key, value in info.items():
        print(f"   {key}: {value}")

asyncio.run(test())
