import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getToken } from '../utils/helpers';

const SOCKET_URL = import.meta.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000; // Start with 1 second

  // Connect to socket
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    try {
      const token = getToken();
      
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      // Connection established
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setConnected(true);
        setError(null);
        setReconnectAttempts(0);
        setSocket(newSocket);
        socketRef.current = newSocket;
      });

      // Connection error
      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        setError(err.message);
        setConnected(false);
        
        // Attempt reconnection
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = reconnectDelay * Math.pow(2, reconnectAttempts); // Exponential backoff
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        }
      });

      // Disconnection
      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setConnected(false);
        
        // Auto-reconnect for certain disconnect reasons
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't auto-reconnect
          setSocket(null);
          socketRef.current = null;
        } else {
          // Network issues, try to reconnect
          if (reconnectAttempts < maxReconnectAttempts) {
            const delay = reconnectDelay * Math.pow(2, reconnectAttempts);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              setReconnectAttempts(prev => prev + 1);
              connect();
            }, delay);
          }
        }
      });

      // Authentication error
      newSocket.on('auth_error', (data) => {
        console.error('Socket authentication error:', data);
        setError('Authentication failed');
        newSocket.disconnect();
      });

      // Rate limit error
      newSocket.on('rate_limit', (data) => {
        console.warn('Rate limited:', data);
        setError(`Rate limited: ${data.message}`);
      });

      socketRef.current = newSocket;

    } catch (err) {
      console.error('Error creating socket:', err);
      setError(err.message);
    }
  }, [reconnectAttempts]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setSocket(null);
    setConnected(false);
    setError(null);
    setReconnectAttempts(0);
  }, []);

  // Emit event with error handling
  const emit = useCallback((event, data, callback) => {
    if (!socketRef.current || !connected) {
      console.warn('Socket not connected, cannot emit event:', event);
      return false;
    }

    try {
      if (callback) {
        socketRef.current.emit(event, data, callback);
      } else {
        socketRef.current.emit(event, data);
      }
      return true;
    } catch (err) {
      console.error('Error emitting socket event:', err);
      setError(err.message);
      return false;
    }
  }, [connected]);

  // Join room
  const joinRoom = useCallback((roomId) => {
    return emit('join-room', { roomId });
  }, [emit]);

  // Leave room
  const leaveRoom = useCallback((roomId) => {
    return emit('leave-room', { roomId });
  }, [emit]);

  // Initialize socket connection
  useEffect(() => {
    const token = getToken();
    
    if (token) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Reconnect when token changes
  useEffect(() => {
    const token = getToken();
    
    if (token && !connected && !socketRef.current) {
      connect();
    } else if (!token && socketRef.current) {
      disconnect();
    }
  }, [connect, disconnect, connected]);

  return {
    socket: socketRef.current,
    connected,
    error,
    reconnectAttempts,
    connect,
    disconnect,
    emit,
    joinRoom,
    leaveRoom,
    isReconnecting: reconnectAttempts > 0 && reconnectAttempts < maxReconnectAttempts
  };
};