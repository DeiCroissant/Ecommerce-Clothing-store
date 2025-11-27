"""
WebSocket Manager for Admin Dashboard Realtime Updates
Manages WebSocket connections and broadcasts dashboard updates
"""

from fastapi import WebSocket
from typing import List, Dict, Any
import json
import asyncio
from datetime import datetime


class ConnectionManager:
    """Manages WebSocket connections for admin dashboard"""
    
    def __init__(self):
        # Store active connections
        self.active_connections: List[WebSocket] = []
        # Store connection metadata
        self.connection_info: Dict[WebSocket, Dict] = {}
        
    async def connect(self, websocket: WebSocket, client_id: str = None):
        """Accept and store a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        self.connection_info[websocket] = {
            "client_id": client_id,
            "connected_at": datetime.now().isoformat(),
            "last_ping": datetime.now().isoformat()
        }
        print(f"🔌 WebSocket connected: {client_id} (Total: {len(self.active_connections)})")
        
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.connection_info:
            client_id = self.connection_info[websocket].get("client_id", "unknown")
            del self.connection_info[websocket]
            print(f"🔌 WebSocket disconnected: {client_id} (Total: {len(self.active_connections)})")
            
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to a specific client"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"❌ Error sending personal message: {e}")
            self.disconnect(websocket)
            
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        if not self.active_connections:
            return
            
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"❌ Error broadcasting to client: {e}")
                disconnected.append(connection)
                
        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
            
    async def broadcast_dashboard_update(self, data: dict, event_type: str = "dashboard_update"):
        """Broadcast dashboard data update to all admin clients"""
        message = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(message)
        print(f"📡 Broadcasted {event_type} to {len(self.active_connections)} clients")
        
    def get_connection_count(self) -> int:
        """Get number of active connections"""
        return len(self.active_connections)
        
    def get_connection_stats(self) -> dict:
        """Get statistics about active connections"""
        return {
            "active_connections": len(self.active_connections),
            "connections": [
                {
                    "client_id": info.get("client_id"),
                    "connected_at": info.get("connected_at"),
                    "last_ping": info.get("last_ping")
                }
                for info in self.connection_info.values()
            ]
        }


# Singleton instance
dashboard_manager = ConnectionManager()


async def notify_new_order(order_data: dict):
    """Notify all admin clients about a new order"""
    await dashboard_manager.broadcast_dashboard_update(
        data={"order": order_data},
        event_type="new_order"
    )


async def notify_order_update(order_id: str, new_status: str):
    """Notify all admin clients about an order status change"""
    await dashboard_manager.broadcast_dashboard_update(
        data={"order_id": order_id, "status": new_status},
        event_type="order_update"
    )


async def notify_low_stock(product_data: dict):
    """Notify all admin clients about low stock"""
    await dashboard_manager.broadcast_dashboard_update(
        data={"product": product_data},
        event_type="low_stock_alert"
    )


async def notify_dashboard_refresh():
    """Signal all admin clients to refresh dashboard data"""
    await dashboard_manager.broadcast_dashboard_update(
        data={"action": "refresh"},
        event_type="refresh_required"
    )
