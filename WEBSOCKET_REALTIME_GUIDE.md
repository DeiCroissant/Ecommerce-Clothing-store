# 🔌 WebSocket Realtime Dashboard - Hướng dẫn

## Tổng quan

Đã implement WebSocket để Admin Dashboard nhận cập nhật realtime:
- ✅ Thông báo khi có đơn hàng mới
- ✅ Cập nhật khi trạng thái đơn thay đổi
- ✅ Nút refresh thủ công
- ✅ Hiển thị trạng thái kết nối (Live/Offline)
- ✅ Tự động reconnect khi mất kết nối

## Cấu trúc Files

### Backend
```
backend/app/
├── websocket_manager.py    # WebSocket connection manager
└── main.py                 # Thêm WebSocket endpoint
```

### Frontend
```
vyronfashion/src/
├── hooks/
│   └── useAdminWebSocket.js    # Custom WebSocket hook
└── app/admin/
    └── page.js                 # Dashboard với WebSocket integration
```

## Cách hoạt động

### 1. WebSocket Endpoint (Backend)
```
ws://localhost:8000/ws/admin/dashboard?client_id=xxx
```

### 2. Message Types

**Server → Client:**
- `connected` - Kết nối thành công
- `new_order` - Đơn hàng mới
- `order_update` - Cập nhật trạng thái đơn
- `low_stock_alert` - Cảnh báo hết hàng
- `refresh_required` - Yêu cầu refresh
- `pong` - Heartbeat response

**Client → Server:**
- `ping` - Heartbeat
- `request_refresh` - Yêu cầu refresh data

## Sử dụng

### 1. Khởi động Backend
```bash
cd backend
python app/main.py
```

### 2. Khởi động Frontend
```bash
cd vyronfashion
npm run dev
```

### 3. Truy cập Admin Dashboard
```
http://localhost:3000/admin
```

## Tính năng UI

### Connection Status
- 🟢 **Live** - WebSocket đang kết nối, nhận realtime updates
- 🟡 **Đang kết nối...** - Đang reconnect

### Nút Cập nhật
- Click để refresh data ngay lập tức
- Hiển thị animation khi đang load

## Environment Variables

```env
# vyronfashion/.env.local
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Production (HTTPS)
NEXT_PUBLIC_WS_URL=wss://your-domain.com
```

## API Endpoints

### WebSocket Stats
```
GET /ws/admin/stats
```
Trả về thống kê connections:
```json
{
  "active_connections": 2,
  "connections": [
    {
      "client_id": "admin_123456",
      "connected_at": "2025-11-27T10:30:00",
      "last_ping": "2025-11-27T10:35:00"
    }
  ]
}
```

## Troubleshooting

### WebSocket không kết nối
1. Kiểm tra backend đang chạy
2. Kiểm tra CORS settings
3. Kiểm tra URL trong `.env.local`

### Không nhận realtime updates
1. Kiểm tra Console cho WebSocket errors
2. Kiểm tra Network tab → WS connections
3. Đảm bảo không có firewall block

## Mở rộng

### Thêm notification type mới

**Backend (websocket_manager.py):**
```python
async def notify_custom_event(data: dict):
    await dashboard_manager.broadcast_dashboard_update(
        data=data,
        event_type="custom_event"
    )
```

**Frontend (useAdminWebSocket.js):**
```javascript
case 'custom_event':
  onCustomEvent?.(message.data)
  break
```

### Gọi notification từ API

```python
from app.websocket_manager import notify_new_order

@app.post("/api/orders")
async def create_order(order_data: OrderCreate):
    # ... create order logic ...
    
    # Notify WebSocket clients
    await notify_new_order(order_data)
```

## Performance Notes

- WebSocket giữ connection mở → ít overhead hơn polling
- Heartbeat mỗi 30s để giữ connection alive
- Auto reconnect sau 3s nếu mất kết nối
- Max 10 lần reconnect attempts

## So sánh với Polling

| Feature | Polling (trước) | WebSocket (sau) |
|---------|-----------------|-----------------|
| Latency | 5 phút | < 1 giây |
| Server load | Cao (nhiều requests) | Thấp |
| Realtime | ❌ | ✅ |
| Battery/CPU | Cao | Thấp |
