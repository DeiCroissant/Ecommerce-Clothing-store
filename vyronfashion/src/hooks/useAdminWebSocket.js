/**
 * useAdminWebSocket - Custom Hook for Admin Dashboard Realtime Updates
 * Connects to WebSocket server and handles dashboard data updates
 */

import { useState, useEffect, useRef, useCallback } from 'react'

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined'

export function useAdminWebSocket(options = {}) {
  const {
    onNewOrder,
    onOrderUpdate,
    onLowStock,
    onDashboardUpdate,
    onRefreshRequired,
    autoReconnect = true,
    reconnectInterval = 5000, // Increased to 5 seconds
    maxReconnectAttempts = 5  // Reduced max attempts
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('disconnected') // 'connecting', 'connected', 'disconnected', 'error'
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const pingIntervalRef = useRef(null)
  const isConnectingRef = useRef(false)

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Skip if not in browser or already connecting/connected
    if (!isBrowser) return
    if (isConnectingRef.current) return
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected')
      return
    }
    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      return
    }

    try {
      isConnectingRef.current = true
      setConnectionStatus('connecting')
      
      const clientId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const wsUrl = `${WS_BASE_URL}/ws/admin/dashboard?client_id=${clientId}`
      
      // Only log on first attempt
      if (reconnectAttempts === 0) {
        console.log('🔌 Connecting to WebSocket...', wsUrl)
      }
      
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected')
        isConnectingRef.current = false
        setIsConnected(true)
        setConnectionStatus('connected')
        setReconnectAttempts(0)
        
        // Start ping interval to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }))
          }
        }, 30000) // Ping every 30 seconds
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          setLastMessage(message)

          // Handle different message types
          switch (message.type) {
            case 'new_order':
              console.log('🔔 New order received')
              onNewOrder?.(message.data)
              break
            case 'order_update':
              console.log('📦 Order updated')
              onOrderUpdate?.(message.data)
              break
            case 'low_stock_alert':
              onLowStock?.(message.data)
              break
            case 'dashboard_update':
              onDashboardUpdate?.(message.data)
              break
            case 'refresh_required':
              onRefreshRequired?.()
              break
            case 'pong':
              // Heartbeat response - silent
              break
            case 'connected':
              console.log('🎉 WebSocket handshake complete')
              break
            default:
              // Ignore unknown types silently
              break
          }
        } catch (error) {
          // Silent parse error
        }
      }

      wsRef.current.onclose = (event) => {
        isConnectingRef.current = false
        setIsConnected(false)
        setConnectionStatus('disconnected')
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current)
          pingIntervalRef.current = null
        }

        // Auto reconnect with exponential backoff
        if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(reconnectInterval * Math.pow(1.5, reconnectAttempts), 30000)
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1)
            connect()
          }, delay)
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.log('⚠️ WebSocket: Max reconnect attempts reached. Click refresh to retry.')
          setConnectionStatus('error')
        }
      }

      wsRef.current.onerror = () => {
        // Don't log error to console - onclose will handle reconnection
        isConnectingRef.current = false
        setConnectionStatus('error')
      }

    } catch (error) {
      isConnectingRef.current = false
      setConnectionStatus('error')
    }
  }, [autoReconnect, reconnectInterval, maxReconnectAttempts, reconnectAttempts, onNewOrder, onOrderUpdate, onLowStock, onDashboardUpdate, onRefreshRequired])

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    isConnectingRef.current = false
    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [])

  // Manual reconnect (resets attempts)
  const reconnect = useCallback(() => {
    disconnect()
    setReconnectAttempts(0)
    setTimeout(() => connect(), 100)
  }, [disconnect, connect])

  // Send message through WebSocket
  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  // Request dashboard refresh
  const requestRefresh = useCallback(() => {
    return sendMessage({ type: 'request_refresh' })
  }, [sendMessage])

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      connect()
    }, 500)
    
    return () => {
      clearTimeout(timer)
      disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle visibility change (reconnect when tab becomes visible)
  useEffect(() => {
    if (!isBrowser) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected && connectionStatus !== 'connecting') {
        setReconnectAttempts(0)
        connect()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isConnected, connect])

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    reconnectAttempts,
    connect,
    disconnect,
    reconnect,
    sendMessage,
    requestRefresh
  }
}

export default useAdminWebSocket
