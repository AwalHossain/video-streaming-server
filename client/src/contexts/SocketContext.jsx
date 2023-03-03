import { createContext, useContext, useMemo } from 'react';

import { io } from 'socket.io-client';

const socketContext = createContext();



export const SocketProvider = ({children}) => {

// useEffect(() => {
//   console.log("Socket object created:", newSocket);
//   setSocket(newSocket);

//   console.log("Socket object set to:", newSocket);

//   return () => {
//     newSocket.close();
//   };
// }, [newSocket]);

    const socket = useMemo(() => io("http://127.0.0.1:4000"), []);

      return (
  
          <socketContext.Provider value={socket}>
  
              {children}
  
          </socketContext.Provider>
  
      )
  
  }


export const useSocket = () => {
  const socket = useContext(socketContext);

  console.log("Socket object retrieved from context:", socket);

  if (!socket) {
    throw new Error("Socket context not found");
  }
  return socket;
};

