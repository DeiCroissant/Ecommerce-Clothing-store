const https = require('https');
require('dotenv').config();

async function debugMBBankAPI() {
  const username = process.env.MB_USERNAME;
  const password = process.env.MB_PASSWORD;

  console.log('🔍 Debug MB Bank API Response');
  console.log('Username:', username);
  console.log('Password:', password ? '***' + password.slice(-4) : 'NOT SET');
  console.log('');

  // Thử gọi trực tiếp API login của MB Bank
  const deviceId = 'your-device-id-' + Date.now();
  
  const loginData = JSON.stringify({
    userId: username,
    password: password,
    deviceIdCommon: deviceId
  });

  const options = {
    hostname: 'online.mbbank.com.vn',
    path: '/api/retail-web-internetbankingms/getCaptchaImage',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length,
      'User-Agent': 'Mozilla/5.0',
      'Refno': deviceId,
      'DeviceId': deviceId,
      'X-Request-Id': Date.now().toString()
    }
  };

  console.log('🌐 Calling MB Bank API...');
  console.log('URL:', options.hostname + options.path);
  console.log('');

  const req = https.request(options, (res) => {
    console.log('📡 Response Status:', res.statusCode);
    console.log('📋 Response Headers:', JSON.stringify(res.headers, null, 2));
    console.log('');

    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📦 Raw Response:');
      console.log(data);
      console.log('');

      try {
        const json = JSON.parse(data);
        console.log('✅ Valid JSON Response:');
        console.log(JSON.stringify(json, null, 2));
      } catch (e) {
        console.error('❌ Response is NOT valid JSON');
        console.error('First 200 chars:', data.substring(0, 200));
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request Error:', error);
  });

  req.write(loginData);
  req.end();
}

debugMBBankAPI();
