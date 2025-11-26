import os
import hashlib
import hmac
from typing import Any, Dict
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    import qrcode
except ImportError:
    qrcode = None
from io import BytesIO
import base64

try:
    import httpx
except Exception:
    httpx = None

# VietQR Configuration
VIETQR_BANK_ID = os.getenv("VIETQR_BANK_ID", "970422")  # MB Bank code
VIETQR_ACCOUNT_NUMBER = os.getenv("VIETQR_ACCOUNT_NUMBER", "")
VIETQR_ACCOUNT_NAME = os.getenv("VIETQR_ACCOUNT_NAME", "VYRON FASHION")

# Casso Configuration
CASSO_API_KEY = os.getenv("CASSO_API_KEY", "")
CASSO_WEBHOOK_SECRET = os.getenv("CASSO_WEBHOOK_SECRET", "")


def generate_vietqr(account_number: str, bank_id: str, amount: float, description: str) -> Dict[str, Any]:
    """Tạo QR code VietQR theo chuẩn VietQR.
    
    Dùng API img.vietqr.io để tạo QR code chuẩn VietQR
    """
    try:
        # Encode parameters cho URL
        import urllib.parse
        description_encoded = urllib.parse.quote(description)
        account_name_encoded = urllib.parse.quote(VIETQR_ACCOUNT_NAME)
        
        # URL QR từ VietQR API - compact = chỉ có QR code, không có thông tin text
        template = "compact"
        vietqr_url = f"https://img.vietqr.io/image/{bank_id}-{account_number}-{template}.png?amount={int(amount)}&addInfo={description_encoded}&accountName={account_name_encoded}"
        
        # Luôn dùng URL từ VietQR service vì nó generate QR chuẩn
        # Không tự generate local vì format phức tạp
        return {
            "success": True,
            "qr_code": None,  # Không generate local
            "qr_data_url": vietqr_url,  # Dùng trực tiếp URL từ VietQR
            "vietqr_url": vietqr_url,
            "payment_info": {
                "bank_name": "MB Bank (Ngân hàng Quân Đội)",
                "bank_id": bank_id,
                "account_number": account_number,
                "account_name": VIETQR_ACCOUNT_NAME,
                "amount": amount,
                "description": description
            }
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Lỗi tạo QR: {str(e)}"
        }


async def create_vietqr_payment(order_id: str, amount: float, description: str = None) -> Dict[str, Any]:
    """Tạo thanh toán VietQR cho order."""
    if not VIETQR_ACCOUNT_NUMBER:
        return {
            "success": False,
            "message": "Chưa cấu hình VIETQR_ACCOUNT_NUMBER"
        }
    
    if not description:
        description = f"Thanh toan don {order_id}"
    
    result = generate_vietqr(
        account_number=VIETQR_ACCOUNT_NUMBER,
        bank_id=VIETQR_BANK_ID,
        amount=amount,
        description=description
    )
    
    result["order_id"] = order_id
    return result


def verify_casso_webhook(payload: str, signature: str) -> bool:
    """Xác thực webhook từ Casso bằng HMAC."""
    # Nếu không có secret hoặc không có signature, cho phép (test mode)
    if not CASSO_WEBHOOK_SECRET or not signature:
        return True  # Skip verification nếu chưa có secret hoặc test webhook
    
    try:
        expected_signature = hmac.new(
            CASSO_WEBHOOK_SECRET.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
    except Exception:
        return False


async def get_casso_transactions(from_date: str = None, to_date: str = None) -> Dict[str, Any]:
    """Lấy danh sách giao dịch từ Casso API (nếu cần)."""
    if not CASSO_API_KEY or not httpx:
        return {"success": False, "message": "Casso API key not configured"}
    
    try:
        headers = {
            "Authorization": f"Apikey {CASSO_API_KEY}",
            "Content-Type": "application/json"
        }
        
        params = {}
        if from_date:
            params["fromDate"] = from_date
        if to_date:
            params["toDate"] = to_date
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                "https://oauth.casso.vn/v2/transactions",
                headers=headers,
                params=params
            )
            resp.raise_for_status()
            data = resp.json()
            
            return {
                "success": True,
                "transactions": data.get("data", {}).get("records", [])
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"Lỗi gọi Casso API: {str(e)}"
        }
