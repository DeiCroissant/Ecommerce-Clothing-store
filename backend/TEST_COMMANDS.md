# Hướng dẫn Test Backend API

## 1. Khởi động Server

```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Hoặc:

```bash
cd backend
python app/main.py
```

Server sẽ chạy tại: `http://localhost:8000`

---

## 2. Test bằng PowerShell (Windows)

### Test Health Check
```powershell
Invoke-RestMethod -Uri http://localhost:8000/health -Method Get
```

### Test Root Endpoint
```powershell
Invoke-RestMethod -Uri http://localhost:8000/ -Method Get
```

### Test Register API
```powershell
$body = @{
    username = "testuser123"
    email = "testuser123@example.com"
    password = "Password123!"
    name = "Test User"
    dateOfBirth = "1990-01-01"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8000/api/auth/register -Method Post -Body $body -ContentType "application/json"
```

### Test Login API
```powershell
$body = @{
    username = "testuser123"
    password = "Password123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8000/api/auth/login -Method Post -Body $body -ContentType "application/json"
```

---

## 3. Test bằng cURL (Windows/Linux/Mac)

### Test Health Check
```bash
curl http://localhost:8000/health
```

### Test Root Endpoint
```bash
curl http://localhost:8000/
```

### Test Register API (Windows)
```bash
curl -X POST http://localhost:8000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser123\",\"email\":\"testuser123@example.com\",\"password\":\"Password123!\",\"name\":\"Test User\",\"dateOfBirth\":\"1990-01-01\"}"
```

### Test Login API (Windows)
```bash
curl -X POST http://localhost:8000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser123\",\"password\":\"Password123!\"}"
```

---

## 4. Test bằng trình duyệt

### Swagger UI (Interactive API Documentation)
Mở trình duyệt và truy cập:
```
http://localhost:8000/docs
```

Tại đây bạn có thể:
- Xem tất cả các API endpoints
- Test trực tiếp từ trình duyệt
- Xem request/response examples

### ReDoc (Alternative Documentation)
```
http://localhost:8000/redoc
```

---

## 5. Test Cases

### Test Register - Success Case
```powershell
$body = @{
    username = "john_doe"
    email = "john@example.com"
    password = "Password123!"
    name = "John Doe"
    dateOfBirth = "1990-05-15"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8000/api/auth/register -Method Post -Body $body -ContentType "application/json"
```

### Test Register - Password Too Short (Expected Error)
```powershell
$body = @{
    username = "testuser2"
    email = "test2@example.com"
    password = "Pass1!"  # Chỉ có 6 ký tự, thiếu 2 ký tự
    name = "Test User 2"
    dateOfBirth = "1991-01-01"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8000/api/auth/register -Method Post -Body $body -ContentType "application/json"
```

### Test Register - Password No Uppercase (Expected Error)
```powershell
$body = @{
    username = "testuser3"
    email = "test3@example.com"
    password = "password123!"  # Không có chữ hoa
    name = "Test User 3"
    dateOfBirth = "1992-01-01"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8000/api/auth/register -Method Post -Body $body -ContentType "application/json"
```

### Test Register - Password No Special Character (Expected Error)
```powershell
$body = @{
    username = "testuser4"
    email = "test4@example.com"
    password = "Password123"  # Không có ký tự đặc biệt
    name = "Test User 4"
    dateOfBirth = "1993-01-01"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8000/api/auth/register -Method Post -Body $body -ContentType "application/json"
```

### Test Login - Success Case
```powershell
$body = @{
    username = "john_doe"  # Hoặc có thể dùng email
    password = "Password123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8000/api/auth/login -Method Post -Body $body -ContentType "application/json"
```

### Test Login - Wrong Password (Expected Error)
```powershell
$body = @{
    username = "john_doe"
    password = "WrongPassword123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8000/api/auth/login -Method Post -Body $body -ContentType "application/json"
```

---

## 6. Test từ JavaScript/TypeScript (Frontend)

```javascript
// Register
const register = async () => {
  const response = await fetch('http://localhost:8000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
      dateOfBirth: '1990-01-01'
    })
  });
  
  const data = await response.json();
  console.log(data);
};

// Login
const login = async () => {
  const response = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'testuser',
      password: 'Password123!'
    })
  });
  
  const data = await response.json();
  console.log(data);
};
```

---

## 7. Kiểm tra MongoDB

### Kiểm tra xem MongoDB có đang chạy không
```powershell
# Windows
Get-Service -Name MongoDB

# Hoặc kiểm tra port
netstat -an | findstr :27017
```

### Xem dữ liệu trong MongoDB (nếu có MongoDB Compass hoặc mongo shell)
```javascript
// Kết nối MongoDB
mongodb://localhost:27017

// Database: vyronfashion_db
// Collection: users
```

---

## Lưu ý

1. **MongoDB phải đang chạy** trước khi test API
2. **Đảm bảo port 8000 không bị chiếm** bởi ứng dụng khác
3. **File .env** có thể cần cấu hình nếu MongoDB không ở localhost:27017
4. **Swagger UI** là cách dễ nhất để test API interactively

