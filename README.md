# 🛍️ VyronFashion - Website Thương Mại Điện Tử Thời Trang

<div align="center">

![VyronFashion Logo](https://img.shields.io/badge/VyronFashion-Thời%20Trang%20Hiện%20Đại-black?style=for-the-badge)

**Đồ án môn học - Trường Đại học Văn Lang**

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## 📖 Giới thiệu

**VyronFashion** là một website thương mại điện tử chuyên về thời trang, được phát triển bởi sinh viên Trường Đại học Văn Lang. Website cung cấp trải nghiệm mua sắm trực tuyến hiện đại với đầy đủ các tính năng từ quản lý sản phẩm, giỏ hàng, thanh toán đến quản trị hệ thống.

### ✨ Tính năng chính

- 🛒 **Mua sắm trực tuyến** - Duyệt và mua sản phẩm thời trang
- 🔍 **Tìm kiếm thông minh** - Tìm kiếm sản phẩm nhanh chóng
- 🛍️ **Giỏ hàng** - Quản lý sản phẩm trong giỏ hàng
- 💳 **Thanh toán VietQR** - Tích hợp thanh toán qua mã QR ngân hàng
- 👤 **Quản lý tài khoản** - Đăng ký, đăng nhập, quản lý thông tin cá nhân
- 📦 **Theo dõi đơn hàng** - Xem trạng thái và lịch sử đơn hàng
- 🤖 **Tích hợp AI** - Hỗ trợ khách hàng thông minh
- 🔐 **Bảo mật** - Xác thực email, Cloudflare Turnstile
- 📊 **Admin Dashboard** - Quản lý toàn bộ hệ thống

---

## 👥 Thành viên nhóm

| STT | Họ và Tên | Vai trò | Công việc |
|:---:|-----------|---------|-----------|
| 1 | **Trần Quang Vinh** | 👑 Leader | Backend Development |
| 2 | **Phạm Mạnh Hà** | Thành viên | Frontend Development & AI Features |
| 3 | **Trần Minh Khoa** | Thành viên | Frontend Development |
| 4 | **Bùi Gia Phát** | Thành viên | Slide thuyết trình |

---

## 🛠️ Công nghệ sử dụng

### Frontend
- **Next.js 15** - React Framework
- **React 19** - UI Library
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **FastAPI** - Python Web Framework
- **MongoDB** - NoSQL Database
- **Cloudinary** - Image Storage
- **JWT** - Authentication

### Tích hợp
- **VietQR** - Thanh toán QR
- **Cloudflare Turnstile** - Bot Protection
- **Nodemailer** - Email Service

---

## 🚀 Hướng dẫn cài đặt và khởi động

### Yêu cầu hệ thống

- **Node.js** >= 18.x
- **Python** >= 3.9
- **MongoDB** (local hoặc MongoDB Atlas)
- **Git**

### Bước 1: Clone dự án

```bash
git clone https://github.com/DeiCroissant/Ecommerce-Clothing-store.git
cd Ecommerce-Clothing-store
```

### Bước 2: Cài đặt Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Tạo môi trường ảo Python
python -m venv venv

# Kích hoạt môi trường ảo
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt
```

### Bước 3: Cấu hình Backend

Tạo file `.env` trong thư mục `backend/`:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=vyronfashion
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Bước 4: Khởi động Backend

```bash
# Trong thư mục backend
uvicorn app.main:app --reload --port 8000
```

Backend sẽ chạy tại: `http://localhost:8000`

### Bước 5: Cài đặt Frontend

```bash
# Mở terminal mới, di chuyển vào thư mục frontend
cd vyronfashion

# Cài đặt dependencies
npm install
```

### Bước 6: Cấu hình Frontend

Tạo file `.env.local` trong thư mục `vyronfashion/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_key
```

### Bước 7: Khởi động Frontend

```bash
# Trong thư mục vyronfashion
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

---

## 📁 Cấu trúc dự án

```
Ecommerce-Clothing-store/
├── backend/                 # Backend API (FastAPI + Python)
│   ├── app/
│   │   ├── main.py         # Entry point
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utilities
│   └── requirements.txt
│
├── vyronfashion/           # Frontend (Next.js)
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities & API
│   │   └── styles/        # CSS styles
│   └── package.json
│
├── START_ALL.bat           # Script khởi động
└── README.md
```

---


## 📄 License

Dự án này được phát triển cho mục đích học tập tại **Trường Đại học Văn Lang**.

---

<div align="center">

**Made with ❤️ by VyronFashion Team - Đại học Văn Lang**

*© 2025 - Đồ án môn học*

</div>
