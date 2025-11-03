import os
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

load_dotenv()

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_SERVER = os.getenv("MAIL_SERVER")
MAIL_PORT = os.getenv("MAIL_PORT")
MAIL_STARTTLS = os.getenv("MAIL_TLS", "false").lower() == "true"
MAIL_SSL_TLS = os.getenv("MAIL_SSL", "true").lower() == "true"
MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "Vyron Fashion")

_can_send_email = all([MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM, MAIL_SERVER, MAIL_PORT])

if _can_send_email:
    try:
        conf = ConnectionConfig(
            MAIL_USERNAME=MAIL_USERNAME,
            MAIL_PASSWORD=MAIL_PASSWORD,
            MAIL_FROM=MAIL_FROM,
            MAIL_PORT=int(MAIL_PORT),
            MAIL_SERVER=MAIL_SERVER,
            MAIL_STARTTLS=MAIL_STARTTLS,
            MAIL_SSL_TLS=MAIL_SSL_TLS,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=False,  # Bypass SSL certificate verification (DEV ONLY!)
            TEMPLATE_FOLDER=None,
            MAIL_FROM_NAME=MAIL_FROM_NAME,
        )
        print(f"[OK] SMTP config thanh cong!")
    except Exception as e:
        print(f"[ERROR] Loi khi khoi tao SMTP config: {e}")
        conf = None
        _can_send_email = False
else:
    conf = None
    print("[WARN] Thieu thong tin SMTP trong .env")


async def send_verification_email(to_email: str, username: str, code: str) -> bool:
    """Gửi email xác minh.

    Trả về True nếu gửi thành công hoặc False nếu không gửi được (thiếu config hoặc lỗi SMTP).
    """
    if not _can_send_email or not conf:
        print("[WARN] SMTP chua duoc cau hinh day du!")
        print(f"   MAIL_SERVER: {MAIL_SERVER or 'CHUA CO'}")
        print(f"   MAIL_PORT: {MAIL_PORT or 'CHUA CO'}")
        print(f"   MAIL_USERNAME: {MAIL_USERNAME or 'CHUA CO'}")
        print(f"   MAIL_PASSWORD: {'***' if MAIL_PASSWORD else 'CHUA CO'}")
        print(f"   MAIL_FROM: {MAIL_FROM or 'CHUA CO'}")
        print(f"   -> Email khong duoc gui. Su dung ma verification code trong response.")
        return False

    subject = "Xác minh tài khoản Vyron Fashion"
    body = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Xin chào {username},</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Vyron Fashion</strong>.</p>
        <p>Để hoàn tất việc đăng ký, vui lòng nhập mã xác minh dưới đây vào cửa sổ trình duyệt:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">{code}</p>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
        <p>Trân trọng,<br/>Đội ngũ Vyron Fashion</p>
    </div>
    """

    message = MessageSchema(
        subject=subject,
        recipients=[to_email],
        body=body,
        subtype="html",
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"[OK] Da gui email xac minh toi {to_email}")
        return True
    except Exception as e:
        print(f"[ERROR] Loi khi gui email: {str(e)}")
        return False
