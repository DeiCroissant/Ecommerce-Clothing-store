const { MB } = require('mbbank');
require('dotenv').config();

async function testLogin() {
  const username = process.env.MB_USERNAME;
  const password = process.env.MB_PASSWORD;

  console.log('='.repeat(60));
  console.log('🧪 Testing MB Bank Login');
  console.log('='.repeat(60));
  console.log('📞 Username:', username);
  console.log('🔐 Password:', password ? '***' + password.slice(-4) : 'NOT SET');
  console.log('');

  if (!username || !password) {
    console.error('❌ Thiếu MB_USERNAME hoặc MB_PASSWORD trong .env');
    process.exit(1);
  }

  try {
    console.log('🔄 Khởi tạo MB client...');
    const mb = new MB({
      username: username,
      password: password,
      preferredOCRMethod: 'default',
      saveWasm: true,
    });

    console.log('🔄 Đang đăng nhập... (có thể mất 10-20 giây)');
    console.log('⏳ Đang tải OCR model...');
    
    const result = await mb.login();
    
    console.log('');
    console.log('✅ ĐĂNG NHẬP THÀNH CÔNG!');
    console.log('📊 Thông tin tài khoản:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    
    // Test get balance
    console.log('🔄 Đang lấy số dư...');
    const balance = await mb.getBalance();
    console.log('💰 Số dư:', JSON.stringify(balance, null, 2));
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Test hoàn tất! Credentials đúng.');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.log('');
    console.error('='.repeat(60));
    console.error('❌ ĐĂNG NHẬP THẤT BẠI');
    console.error('='.repeat(60));
    console.error('');
    console.error('📋 Lỗi:', error.message);
    console.error('');
    console.error('🔍 Chi tiết lỗi:');
    console.error(error);
    console.error('');
    console.error('💡 Các nguyên nhân có thể:');
    console.error('   1. Sai username hoặc password');
    console.error('   2. Tài khoản MB Bank bị khóa');
    console.error('   3. Tài khoản cần xác thực bổ sung (OTP, v.v.)');
    console.error('   4. MB Bank API có thay đổi');
    console.error('');
    console.error('✅ Hãy thử:');
    console.error('   - Đăng nhập MB Bank app để verify tài khoản');
    console.error('   - Kiểm tra email/SMS có thông báo gì không');
    console.error('   - Đổi mật khẩu MB Bank rồi cập nhật .env');
    console.error('');
    process.exit(1);
  }
}

testLogin();
