import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const userId = user?._id || user?.id;

    if (isAuthenticated && userId) {
      // Prevent reconnecting if we already have a socket for this user (optimization)
      if (socket?.connected && socket.userId === userId) {
         return; 
      }

      
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000', {
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        withCredentials: true,
      });

      // Tag socket with userId to track it
      newSocket.userId = userId;

      newSocket.on('connect', () => {
        newSocket.emit('join', userId);
      });

      newSocket.on('connect_error', (err) => {
        console.error("Socket connection error:", err.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user?._id, user?.id]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};



