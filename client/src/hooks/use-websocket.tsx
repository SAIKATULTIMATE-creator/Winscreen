import { useEffect, useRef, useState } from 'react';
import { APP_CONFIG } from '@/config/app-config';

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 10;
  const reconnectAttempts = useRef(0);
  const pingInterval = 30000; // 30 seconds

  const connect = () => {
    try {
      const wsUrl = APP_CONFIG.getWebSocketUrl();
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        console.log('WebSocket connected');
        
        // Start heartbeat
        const startHeartbeat = () => {
          pingTimeoutRef.current = setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }));
              startHeartbeat();
            }
          }, pingInterval);
        };
        startHeartbeat();
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setSocket(null);
        
        // Clear heartbeat
        if (pingTimeoutRef.current) {
          clearTimeout(pingTimeoutRef.current);
        }
        
        console.log('WebSocket disconnected:', event.code, event.reason);

        // Attempt to reconnect unless it was a manual close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`);
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error('Max reconnection attempts reached. Please refresh the page.');
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'pong') {
            // Connection is alive, continue
            return;
          }
          // Handle other messages normally
        } catch (error) {
          // Handle non-JSON messages
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setSocket(ws);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (pingTimeoutRef.current) {
        clearTimeout(pingTimeoutRef.current);
      }
      
      if (socket) {
        socket.close(1000, 'Component unmounting');
      }
    };
  }, []);

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (pingTimeoutRef.current) {
      clearTimeout(pingTimeoutRef.current);
    }
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close(1000, 'Manual disconnect');
    }
  };

  return {
    socket,
    isConnected,
    disconnect,
  };
}
