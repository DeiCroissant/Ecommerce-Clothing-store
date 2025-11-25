import os
import hashlib
import hmac
from typing import Any, Dict
from datetime import datetime
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
    
    Format: https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NUMBER}-{TEMPLATE}.png?amount={AMOUNT}&addInfo={DESCRIPTION}
    """
    try:
        # URL QR từ VietQR API
        template = "compact2"  # compact, compact2, qr_only, print
        description_encoded = description.replace(" ", "%20")
        
        vietqr_url = f"https://img.vietqr.io/image/{bank_id}-{account_number}-{template}.png?amount={int(amount)}&addInfo={description_encoded}&accountName={VIETQR_ACCOUNT_NAME.replace(' ', '%20')}"
        
        # Nếu có thư viện qrcode, tạo QR local
        if qrcode:
            qr = qrcode.QRCode(version=1, box_size=10, border=2)
            qr.add_data(vietqr_url)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffered = BytesIO()
            img.save(buffered, format="PNG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            return {
                "success": True,
                "qr_code": img_base64,
                "qr_data_url": f"data:image/png;base64,{img_base64}",
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
        else:
            # Không có qrcode lib, chỉ trả URL
            return {
                "success": True,
                "qr_code": None,
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
    if not CASSO_WEBHOOK_SECRET:
        return True  # Skip verification nếu chưa có secret
    
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


def generate_vietqr(account_number: str, bank_id: str, amount: float, description: str) -> Dict[str, Any]:
    """Tạo QR code VietQR theo chuẩn VietQR.
    
    Format: https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NUMBER}-{TEMPLATE}.png?amount={AMOUNT}&addInfo={DESCRIPTION}
    """
    try:
        # URL QR từ VietQR API
        template = "compact2"  # compact, compact2, qr_only, print
        description_encoded = description.replace(" ", "%20")
        
        vietqr_url = f"https://img.vietqr.io/image/{bank_id}-{account_number}-{template}.png?amount={int(amount)}&addInfo={description_encoded}&accountName={VIETQR_ACCOUNT_NAME.replace(' ', '%20')}"
        
        # Tạo QR code từ URL
        qr = qrcode.QRCode(version=1, box_size=10, border=2)
        qr.add_data(vietqr_url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        return {
            "success": True,
            "qr_code": img_base64,
            "qr_data_url": f"data:image/png;base64,{img_base64}",
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
    if not CASSO_WEBHOOK_SECRET:
        return True  # Skip verification nếu chưa có secret
    
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


async def initiate_mbbank_payment(order_id: str, amount: float, to_account: str, to_name: str | None = None, description: str | None = None) -> Dict[str, Any]:
    """Initiate a payment via MB Bank service.

    Gọi MB Bank service để tạo yêu cầu thanh toán.
    Service sẽ trả về thông tin để khách hàng chuyển khoản.
    """
    if not httpx:
        return {
            "success": False,
            "message": "httpx library not installed",
            "status": "error"
        }

    if not MBBANK_SERVICE_URL:
        return {
            "success": False,
            "message": "MBBANK_SERVICE_URL not configured",
            "status": "error"
        }

    payload = {
        "order_id": order_id,
        "amount": amount,
        "to_account": to_account or MBBANK_ACCOUNT_NUMBER,
        "to_name": to_name,
        "description": description or f"Thanh toan don hang {order_id}",
    }

    url = MBBANK_SERVICE_URL.rstrip("/") + "/transfer"
    headers = {"content-type": "application/json"}
    if MBBANK_SERVICE_SECRET:
        headers["x-mbbank-secret"] = MBBANK_SERVICE_SECRET

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            
            return {
                "success": data.get("success", True),
                "message": "Yêu cầu thanh toán đã được tạo",
                "transaction_id": data.get("transaction_id"),
                "status": data.get("status", "pending"),
                "payment_info": data.get("payment_info"),
                "instructions": data.get("instructions"),
                "raw": data,
            }
    except httpx.HTTPError as e:
        return {
            "success": False,
            "message": f"Lỗi kết nối MB service: {str(e)}",
            "status": "error"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Lỗi: {str(e)}",
            "status": "error"
        }


async def check_mbbank_payment(order_id: str, amount: float, account_number: str | None = None, days_back: int = 1) -> Dict[str, Any]:
    """Kiểm tra xem đã có giao dịch thanh toán cho order_id chưa.
    
    Gọi MB Bank service để polling lịch sử giao dịch và tìm transaction khớp.
    """
    if not httpx:
        return {
            "success": False,
            "paid": False,
            "message": "httpx library not installed"
        }

    if not MBBANK_SERVICE_URL:
        return {
            "success": False,
            "paid": False,
            "message": "MBBANK_SERVICE_URL not configured"
        }

    # Tính fromDate (ngày bắt đầu tìm kiếm)
    from_date = (datetime.now() - timedelta(days=days_back)).strftime("%d/%m/%Y")
    
    payload = {
        "order_id": order_id,
        "accountNumber": account_number or MBBANK_ACCOUNT_NUMBER,
        "amount": amount,
        "fromDate": from_date,
    }

    url = MBBANK_SERVICE_URL.rstrip("/") + "/check-payment"
    headers = {"content-type": "application/json"}
    if MBBANK_SERVICE_SECRET:
        headers["x-mbbank-secret"] = MBBANK_SERVICE_SECRET

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            
            return {
                "success": data.get("success", True),
                "paid": data.get("paid", False),
                "transaction": data.get("transaction"),
                "message": data.get("message", "")
            }
    except httpx.HTTPError as e:
        return {
            "success": False,
            "paid": False,
            "message": f"Lỗi kết nối MB service: {str(e)}"
        }
    except Exception as e:
        return {
            "success": False,
            "paid": False,
            "message": f"Lỗi: {str(e)}"
        }


async def verify_mbbank_callback(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Verify and parse callback from MB service hoặc webhook.

    Trích xuất thông tin order_id, transaction_id, status từ payload.
    """
    order_id = payload.get("order_id") or payload.get("order") or payload.get("orderId")
    transaction_id = payload.get("transaction_id") or payload.get("tx_id") or payload.get("transactionId")
    status = payload.get("status") or payload.get("state") or payload.get("transaction_status")

    return {
        "order_id": order_id,
        "transaction_id": transaction_id,
        "status": status,
        "raw": payload,
    }
