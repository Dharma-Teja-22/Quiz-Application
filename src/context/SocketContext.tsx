import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const SocketContext = createContext<Socket | null>(null);

// export const useSocket = () => {
//   const socket = useContext(SocketContext);
//   if (!socket) {
//     throw new Error('useSocket must be used within a SocketProvider');
//   }
//   return socket;
// };

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};