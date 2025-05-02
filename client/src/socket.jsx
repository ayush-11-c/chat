/* eslint-disable react/prop-types */
import { createContext, useMemo } from "react";
import io from "socket.io-client";
import { server } from "./constants/config";
import { useSelector } from "react-redux";
const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  const socket = useMemo(() => {
    if (!user) return null;
    return io(server, {
      withCredentials: true,
    });
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider, SocketContext };
