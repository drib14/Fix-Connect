import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    let newSocket;
    if (user) {
      newSocket = io('http://localhost:5000');
      newSocket.on('connect', () => newSocket.emit('join', user._id));
      setSocket(newSocket);
    }
    return () => { if (newSocket) newSocket.disconnect(); };
  }, [user]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
