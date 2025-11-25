# 🚀 Hướng Dẫn Deploy Web Lên VPS

## 📋 Yêu Cầu Hệ Thống

- VPS Ubuntu 20.04/22.04 hoặc CentOS
- Python 3.10+
- Node.js 18+
- RAM: Tối thiểu 2GB
- Storage: Tối thiểu 20GB

## 🔐 Ports Cần Mở

### **Backend (FastAPI):**
- **Port 8000** - API Backend

### **Frontend (Next.js):**
- **Port 3000** - Web Application (development)
- **Port 80** - HTTP (production with Nginx)
- **Port 443** - HTTPS (production with Nginx + SSL)

### **SSH:**
- **Port 22** - SSH (để quản lý VPS)

---

## 🛠️ Cách Mở Port Trên VPS

### **Ubuntu/Debian (UFW Firewall):**
```bash
# Cài đặt UFW nếu chưa có
sudo apt install ufw

# Cho phép SSH trước (quan trọng!)
sudo ufw allow 22/tcp

# Mở port cho backend
sudo ufw allow 8000/tcp

# Mở port cho frontend
sudo ufw allow 3000/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Kiểm tra status
sudo ufw status
```

### **CentOS/RHEL (Firewalld):**
```bash
# Mở port cho backend
sudo firewall-cmd --permanent --add-port=8000/tcp

# Mở port cho frontend
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp

# Reload firewall
sudo firewall-cmd --reload

# Kiểm tra
sudo firewall-cmd --list-ports
```

---

## 📦 Cài Đặt Trên VPS

### 1️⃣ **Cài Đặt Dependencies**

```bash
# Update hệ thống
sudo apt update && sudo apt upgrade -y

# Cài Python 3.10+
sudo apt install python3 python3-pip python3-venv -y

# Cài Node.js 18+ (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Kiểm tra version
python3 --version
node --version
npm --version
```

### 2️⃣ **Clone Project**

```bash
# Clone repo (thay YOUR_REPO_URL)
git clone https://github.com/DeiCroissant/Ecommerce-Clothing-store.git
cd Ecommerce-Clothing-store
```

### 3️⃣ **Setup Backend**

```bash
cd backend

# Tạo virtual environment
python3 -m venv venv
source venv/bin/activate

# Cài dependencies
pip install -r requirements.txt

# Chỉnh sửa .env
nano .env
# Đảm bảo có:
# HOST=0.0.0.0
# PORT=8000
```

### 4️⃣ **Setup Frontend**

```bash
cd ../vyronfashion

# Cài dependencies
npm install

# Tạo file .env.local
nano .env.local
# Thêm (thay YOUR_VPS_IP):
# NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8000

# Build production
npm run build
```

---

## 🚀 Chạy Application

### **Option 1: Chạy Manual (Testing)**

#### Backend:
```bash
cd backend
source venv/bin/activate
python app/main.py
# Hoặc:
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Frontend:
```bash
cd vyronfashion
npm start
# Hoặc production:
npm run build && npm start
```

### **Option 2: Chạy Với PM2 (Recommended)**

```bash
# Cài PM2
sudo npm install -g pm2

# Start Backend
cd backend
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name vyron-backend

# Start Frontend
cd ../vyronfashion
pm2 start npm --name vyron-frontend -- start

# Lưu config PM2
pm2 save
pm2 startup

# Quản lý
pm2 list          # Xem status
pm2 logs          # Xem logs
pm2 restart all   # Restart
pm2 stop all      # Stop
```

---

## 🌐 Cấu Hình Nginx (Production)

### 1. Cài Nginx:
```bash
sudo apt install nginx -y
```

### 2. Tạo config:
```bash
sudo nano /etc/nginx/sites-available/vyronfashion
```

### 3. Nội dung config:
```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;  # Hoặc YOUR_VPS_IP

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;  # Hoặc YOUR_VPS_IP

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/vyronfashion /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Cài SSL (Let's Encrypt)

```bash
# Cài Certbot
sudo apt install certbot python3-certbot-nginx -y

# Cài SSL cho domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto renewal
sudo certbot renew --dry-run
```

---

## 🔍 Kiểm Tra & Troubleshooting

### **Kiểm tra Backend:**
```bash
curl http://YOUR_VPS_IP:8000/api/products
```

### **Kiểm tra Frontend:**
```bash
curl http://YOUR_VPS_IP:3000
```

### **Xem logs PM2:**
```bash
pm2 logs vyron-backend
pm2 logs vyron-frontend
```

### **Xem logs Nginx:**
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### **Kiểm tra ports đang mở:**
```bash
sudo netstat -tulpn | grep LISTEN
# Hoặc
sudo ss -tulpn | grep LISTEN
```

---

## 📝 Cấu Hình Quan Trọng

### **Backend .env:**
```env
HOST=0.0.0.0  # ← Quan trọng: cho phép truy cập từ bên ngoài
PORT=8000
MONGODB_URL=your_mongodb_connection_string
DATABASE_NAME=vyronfashion_db
```

### **Frontend .env.local:**
```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:8000

# Production (thay YOUR_VPS_IP)
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8000
# Hoặc với domain:
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 🎯 Quick Start Commands

### **Khởi động nhanh sau khi config:**
```bash
# Backend
cd backend && source venv/bin/activate
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name vyron-backend

# Frontend
cd ../vyronfashion
pm2 start npm --name vyron-frontend -- start

pm2 save
```

---

## ✅ Checklist Deploy

- [ ] VPS đã cài Python 3.10+ và Node.js 18+
- [ ] Đã mở ports: 8000, 3000, 80, 443, 22
- [ ] Backend .env có `HOST=0.0.0.0`
- [ ] Frontend .env.local có `NEXT_PUBLIC_API_URL` đúng
- [ ] MongoDB đã kết nối được (Atlas hoặc local)
- [ ] PM2 đã start cả backend và frontend
- [ ] Nginx đã config và restart (nếu dùng)
- [ ] SSL đã cài (nếu có domain)

---

## 🆘 Support

Nếu gặp lỗi:
1. Kiểm tra logs: `pm2 logs`
2. Kiểm tra firewall: `sudo ufw status`
3. Kiểm tra ports: `sudo netstat -tulpn`
4. Restart services: `pm2 restart all`
