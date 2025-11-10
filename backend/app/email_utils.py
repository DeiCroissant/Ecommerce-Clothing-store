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


async def send_verification_email(to_email: str, username: str, code: str, name: str = None) -> bool:
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
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: 2px; margin-bottom: 8px;">
                VYRON<span style="font-weight: 300; color: #fafafa;">FASHION</span>
            </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px; background-color: #ffffff;">
            <h2 style="color: #18181b; font-size: 20px; margin: 0 0 16px 0;">Xin chào {name or username},</h2>
            <p style="color: #52525b; margin: 0 0 16px 0;">Chúng tôi nhận được yêu cầu đăng ký tài khoản cho tài khoản <strong style="color: #18181b;">{username}</strong> tại <strong style="color: #18181b;">Vyron Fashion</strong>.</p>
            <p style="color: #52525b; margin: 0 0 24px 0;">Để hoàn tất việc đăng ký, vui lòng nhập mã xác minh dưới đây vào cửa sổ trình duyệt:</p>
            
            <!-- Verification Code Box -->
            <div style="background-color: #fafafa; border: 2px solid #e4e4e7; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #18181b; margin: 0; font-family: 'Courier New', monospace;">{code}</p>
            </div>
            
            <p style="color: #71717a; font-size: 14px; margin: 24px 0 0 0;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #fafafa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e4e4e7;">
            <p style="color: #71717a; font-size: 14px; margin: 0 0 8px 0;">Trân trọng,</p>
            <p style="color: #18181b; font-weight: 600; font-size: 14px; margin: 0;">Đội ngũ Vyron Fashion</p>
        </div>
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


async def send_reset_password_email(to_email: str, username: str, reset_token: str, reset_url: str, name: str = None) -> bool:
    """Gửi email đặt lại mật khẩu.

    Trả về True nếu gửi thành công hoặc False nếu không gửi được (thiếu config hoặc lỗi SMTP).
    """
    if not _can_send_email or not conf:
        print("[WARN] SMTP chua duoc cau hinh day du!")
        print(f"   -> Email khong duoc gui. Su dung reset token trong response: {reset_token}")
        return False

    subject = "Đặt lại mật khẩu Vyron Fashion"
    body = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: 2px; margin-bottom: 8px;">
                VYRON<span style="font-weight: 300; color: #fafafa;">FASHION</span>
            </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px; background-color: #ffffff;">
            <h2 style="color: #18181b; font-size: 20px; margin: 0 0 16px 0;">Xin chào {name or username},</h2>
            <p style="color: #52525b; margin: 0 0 16px 0;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong style="color: #18181b;">{username}</strong> tại <strong style="color: #18181b;">Vyron Fashion</strong>.</p>
            <p style="color: #52525b; margin: 0 0 24px 0;">Vui lòng click vào nút bên dưới để đặt lại mật khẩu:</p>
            
            <!-- Reset Button -->
            <div style="text-align: center; margin: 24px 0;">
                <a href="{reset_url}" style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.3s;">Đặt lại mật khẩu</a>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 24px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;"><strong>Lưu ý:</strong> Link này sẽ hết hạn sau 1 giờ.</p>
            </div>
            
            <p style="color: #71717a; font-size: 14px; margin: 24px 0 0 0;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #fafafa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e4e4e7;">
            <p style="color: #71717a; font-size: 14px; margin: 0 0 8px 0;">Trân trọng,</p>
            <p style="color: #18181b; font-weight: 600; font-size: 14px; margin: 0;">Đội ngũ Vyron Fashion</p>
        </div>
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
        print(f"[OK] Da gui email dat lai mat khau toi {to_email}")
        return True
    except Exception as e:
        print(f"[ERROR] Loi khi gui email: {str(e)}")
        return False


async def send_promotion_email(to_email: str, username: str, name: str, subject: str, content: str) -> bool:
    """Gửi email khuyến mãi cho khách hàng.

    Trả về True nếu gửi thành công hoặc False nếu không gửi được (thiếu config hoặc lỗi SMTP).
    """
    if not _can_send_email or not conf:
        print("[WARN] SMTP chua duoc cau hinh day du!")
        print(f"   -> Email khong duoc gui cho {to_email}")
        return False

    body = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: #fafafa; padding: 20px;">
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: 2px; margin-bottom: 8px;">
                VYRON<span style="font-weight: 300; color: #fafafa;">FASHION</span>
            </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px; background-color: #ffffff; border-radius: 0 0 8px 8px;">
            <h2 style="color: #18181b; font-size: 24px; margin: 0 0 16px 0; font-weight: 600;">Xin chào {name or username},</h2>
            <div style="color: #52525b; margin: 0 0 24px 0; font-size: 16px;">
                {content}
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #ffffff; padding: 20px; text-align: center; border-radius: 8px; margin-top: 20px; border-top: 1px solid #e4e4e7;">
            <p style="color: #71717a; font-size: 14px; margin: 0 0 8px 0;">Trân trọng,</p>
            <p style="color: #18181b; font-weight: 600; font-size: 14px; margin: 0;">Đội ngũ Vyron Fashion</p>
            <p style="color: #a1a1aa; font-size: 12px; margin: 16px 0 0 0;">
                Email này được gửi từ hệ thống Vyron Fashion. Nếu bạn không muốn nhận email này, vui lòng liên hệ với chúng tôi.
            </p>
        </div>
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
        print(f"[OK] Da gui email khuyen mai toi {to_email}")
        return True
    except Exception as e:
        print(f"[ERROR] Loi khi gui email: {str(e)}")
        return False


async def send_2fa_code_email(to_email: str, username: str, code: str, name: str = None) -> bool:
    """Gửi email mã 2FA khi đăng nhập.

    Trả về True nếu gửi thành công hoặc False nếu không gửi được (thiếu config hoặc lỗi SMTP).
    """
    if not _can_send_email or not conf:
        print("[WARN] SMTP chua duoc cau hinh day du!")
        print(f"   -> Email khong duoc gui. Ma 2FA: {code}")
        return False

    subject = "Mã xác thực 2FA - Vyron Fashion"
    body = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: 2px; margin-bottom: 8px;">
                VYRON<span style="font-weight: 300; color: #fafafa;">FASHION</span>
            </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px; background-color: #ffffff;">
            <h2 style="color: #18181b; font-size: 20px; margin: 0 0 16px 0;">Xin chào {name or username},</h2>
            <p style="color: #52525b; margin: 0 0 16px 0;">Chúng tôi nhận được yêu cầu đăng nhập vào tài khoản <strong style="color: #18181b;">{username}</strong> tại <strong style="color: #18181b;">Vyron Fashion</strong>.</p>
            <p style="color: #52525b; margin: 0 0 24px 0;">Để hoàn tất việc đăng nhập, vui lòng nhập mã xác thực 2FA dưới đây:</p>
            
            <!-- 2FA Code Box -->
            <div style="background-color: #fafafa; border: 2px solid #e4e4e7; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #18181b; margin: 0; font-family: 'Courier New', monospace;">{code}</p>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 24px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;"><strong>Lưu ý:</strong> Mã này sẽ hết hạn sau 10 phút.</p>
            </div>
            
            <p style="color: #71717a; font-size: 14px; margin: 24px 0 0 0;">Nếu bạn không thực hiện yêu cầu đăng nhập này, vui lòng bỏ qua email này và kiểm tra bảo mật tài khoản của bạn.</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #fafafa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e4e4e7;">
            <p style="color: #71717a; font-size: 14px; margin: 0 0 8px 0;">Trân trọng,</p>
            <p style="color: #18181b; font-weight: 600; font-size: 14px; margin: 0;">Đội ngũ Vyron Fashion</p>
        </div>
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
        print(f"[OK] Da gui email ma 2FA toi {to_email}")
        return True
    except Exception as e:
        print(f"[ERROR] Loi khi gui email: {str(e)}")
        return False
