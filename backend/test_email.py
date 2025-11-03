"""Test gửi email với cấu hình TenTen"""
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def test_email():
    from app.email_utils import send_verification_email
    
    print("[*] Testing email configuration...")
    print(f"MAIL_SERVER: {os.getenv('MAIL_SERVER')}")
    print(f"MAIL_PORT: {os.getenv('MAIL_PORT')}")
    print(f"MAIL_USERNAME: {os.getenv('MAIL_USERNAME')}")
    print(f"MAIL_FROM: {os.getenv('MAIL_FROM')}")
    print(f"MAIL_TLS: {os.getenv('MAIL_TLS')}")
    print(f"MAIL_SSL: {os.getenv('MAIL_SSL')}")
    print("\n" + "="*50)
    
    # Test gửi email
    test_email_address = "quangvinh3020@wuangvinh.id.vn"  # Thay bằng email thật của bạn
    test_username = "testuser"
    test_code = "ABC123"
    
    print(f"\n[>] Gui email test toi: {test_email_address}")
    result = await send_verification_email(test_email_address, test_username, test_code)
    
    if result:
        print("[OK] GUI EMAIL THANH CONG!")
    else:
        print("[FAIL] GUI EMAIL THAT BAI!")
        print("Kiểm tra lại:")
        print("  1. SMTP credentials có đúng không?")
        print("  2. Port có đúng không? (Thử 465 hoặc 587)")
        print("  3. Email server có cho phép SMTP không?")
    
    return result

if __name__ == "__main__":
    asyncio.run(test_email())

