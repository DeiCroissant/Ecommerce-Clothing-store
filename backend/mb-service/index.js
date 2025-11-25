const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MB } = require('mbbank');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Secret để xác thực request từ backend Python
const SERVICE_SECRET = process.env.MBBANK_SERVICE_SECRET || '';

// Khởi tạo MB Bank client
let mbClient = null;

// Middleware kiểm tra secret
const authenticateRequest = (req, res, next) => {
  if (SERVICE_SECRET) {
    const providedSecret = req.headers['x-mbbank-secret'];
    if (providedSecret !== SERVICE_SECRET) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  }
  next();
};

// Khởi tạo MB client với credentials
const initMBClient = async () => {
  const username = process.env.MB_USERNAME;
  const password = process.env.MB_PASSWORD;

  if (!username || !password) {
    console.error('❌ Thiếu MB_USERNAME hoặc MB_PASSWORD trong .env');
    return null;
  }

  try {
    console.log('📝 Khởi tạo MB client với username:', username);
    
    mbClient = new MB({
      username: username,
      password: password,
      // Tùy chọn: sử dụng tesseract hoặc default OCR
      preferredOCRMethod: process.env.MB_OCR_METHOD || 'default',
      saveWasm: true, // Lưu WASM file để tăng tốc độ login
    });

    console.log('🔄 Đang đăng nhập vào MB Bank...');
    console.log('⏳ Đang tải OCR model (có thể mất 5-10s lần đầu)...');
    
    await mbClient.login();
    console.log('✅ Đăng nhập MB Bank thành công!');
    
    return mbClient;
  } catch (error) {
    console.error('❌ Lỗi đăng nhập MB Bank:', error.message);
    console.error('📋 Chi tiết lỗi:', error);
    console.error('💡 Gợi ý: Kiểm tra username/password, hoặc thử đăng nhập MB app để verify tài khoản');
    return null;
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'running',
    mb_connected: mbClient !== null 
  });
});

// Endpoint lấy số dư tài khoản (để test)
app.get('/balance', authenticateRequest, async (req, res) => {
  try {
    if (!mbClient) {
      mbClient = await initMBClient();
      if (!mbClient) {
        return res.status(503).json({ success: false, message: 'MB client not initialized' });
      }
    }

    const balance = await mbClient.getBalance();
    res.json({ success: true, balance });
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint lấy lịch sử giao dịch
app.post('/transactions', authenticateRequest, async (req, res) => {
  try {
    if (!mbClient) {
      mbClient = await initMBClient();
      if (!mbClient) {
        return res.status(503).json({ success: false, message: 'MB client not initialized' });
      }
    }

    const { accountNumber, fromDate, toDate } = req.body;
    
    if (!accountNumber) {
      return res.status(400).json({ success: false, message: 'Missing accountNumber' });
    }

    const transactions = await mbClient.getTransactionsHistory({
      accountNumber,
      fromDate: fromDate || new Date().toLocaleDateString('en-GB'), // dd/mm/yyyy
      toDate: toDate || new Date().toLocaleDateString('en-GB'),
    });

    res.json({ success: true, transactions });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint kiểm tra thanh toán (polling transactions để tìm order_id trong description)
app.post('/check-payment', authenticateRequest, async (req, res) => {
  try {
    if (!mbClient) {
      mbClient = await initMBClient();
      if (!mbClient) {
        return res.status(503).json({ success: false, message: 'MB client not initialized' });
      }
    }

    const { order_id, accountNumber, amount, fromDate } = req.body;
    
    if (!order_id || !accountNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing order_id or accountNumber' 
      });
    }

    // Lấy giao dịch từ ngày fromDate đến hiện tại
    const toDate = new Date().toLocaleDateString('en-GB');
    const transactions = await mbClient.getTransactionsHistory({
      accountNumber,
      fromDate: fromDate || toDate, // Mặc định chỉ lấy hôm nay
      toDate,
    });

    // Tìm giao dịch khớp với order_id trong description
    const matchedTransaction = transactions.transactionHistoryList?.find(tx => {
      const description = (tx.description || '').toLowerCase();
      const refNo = (tx.refNo || '').toLowerCase();
      const orderIdLower = order_id.toLowerCase();
      
      // Kiểm tra description hoặc refNo có chứa order_id
      const hasOrderId = description.includes(orderIdLower) || refNo.includes(orderIdLower);
      
      // Nếu có amount, kiểm tra số tiền khớp
      const amountMatches = !amount || Math.abs(parseFloat(tx.creditAmount || 0) - amount) < 1;
      
      return hasOrderId && amountMatches && tx.creditAmount > 0;
    });

    if (matchedTransaction) {
      res.json({
        success: true,
        paid: true,
        transaction: {
          transaction_id: matchedTransaction.refNo,
          amount: matchedTransaction.creditAmount,
          description: matchedTransaction.description,
          date: matchedTransaction.transactionDate,
          status: 'completed'
        }
      });
    } else {
      res.json({
        success: true,
        paid: false,
        message: 'Payment not found'
      });
    }
  } catch (error) {
    console.error('Error checking payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint tạo yêu cầu thanh toán (trả về thông tin để khách hàng chuyển khoản)
app.post('/transfer', authenticateRequest, async (req, res) => {
  try {
    const { order_id, amount, to_account, to_name, description } = req.body;

    if (!order_id || !amount || !to_account) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: order_id, amount, to_account' 
      });
    }

    // Tạo transaction_id duy nhất
    const transaction_id = `MBPAY-${order_id}-${Date.now()}`;
    
    // Tạo nội dung chuyển khoản (bao gồm order_id để dễ tra cứu)
    const transferDescription = description || `Thanh toan don hang ${order_id}`;

    // Trả về thông tin cho khách hàng chuyển khoản
    // Lưu ý: MB Bank API không hỗ trợ chuyển tiền tự động, chỉ hỗ trợ:
    // - Đăng nhập
    // - Lấy số dư
    // - Lấy lịch sử giao dịch
    // Khách hàng phải tự chuyển khoản qua app MB hoặc Internet Banking

    res.json({
      success: true,
      transaction_id,
      status: 'pending',
      payment_info: {
        bank: 'MB Bank (Ngân hàng Quân Đội)',
        account_number: to_account,
        account_name: to_name || 'CONG TY VYRON FASHION',
        amount: amount,
        description: transferDescription,
        note: `Vui lòng chuyển khoản chính xác số tiền và ghi rõ: ${transferDescription}`
      },
      instructions: [
        '1. Mở ứng dụng MB Bank hoặc Internet Banking',
        '2. Chọn chuyển khoản trong MB Bank',
        `3. Nhập số tài khoản: ${to_account}`,
        `4. Nhập số tiền: ${amount.toLocaleString('vi-VN')} VND`,
        `5. Nội dung chuyển khoản: ${transferDescription}`,
        '6. Xác nhận và hoàn tất giao dịch',
        '7. Hệ thống sẽ tự động xác nhận thanh toán trong vài phút'
      ]
    });

  } catch (error) {
    console.error('Error creating transfer request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Khởi động server
app.listen(PORT, async () => {
  console.log(`🚀 MB Bank Payment Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  
  // Khởi tạo MB client khi start
  mbClient = await initMBClient();
  
  if (!mbClient) {
    console.warn('⚠️  MB client not initialized. Please check your credentials.');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
