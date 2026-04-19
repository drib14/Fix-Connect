import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (token && userId) {
            // In a real production setup, you should proxy via Nginx/Vite or pass token in auth
            const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
                withCredentials: true,
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                // Automatically join the user's personal room for direct notifications
                newSocket.emit('joinRoom', userId);
            });

            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
