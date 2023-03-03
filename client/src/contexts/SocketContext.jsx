import { createContext, useContext, useEffect, useState } from 'react';

import { io } from 'socket.io-client';

const socketContext = createContext();



export const SocketProvider = ({children}) => {
    const [socket, setSocket] = useState(null);
    useEffect(() => {
      const newSocket = io('http://localhost:4000');

      setSocket(newSocket);
    
      return () => {
       newSocket.close();
      }
    }, [])
    

      return (
  
          <socketContext.Provider value={socket}>
  
              {children}
  
          </socketContext.Provider>
  
      )
  
  }


  export const useSocket = () => useContext(socketContext);
