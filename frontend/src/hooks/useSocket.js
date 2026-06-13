import { useEffect } from "react";
import { socket } from "../socket";

export const useSocket = (eventName, callback) => {
  useEffect(() => {
    // If we have an eventName and callback, register it
    if (eventName && callback) {
      socket.on(eventName, callback);

      // Cleanup listener on unmount
      return () => {
        socket.off(eventName, callback);
      };
    }
  }, [eventName, callback]);

  return socket;
};

export default useSocket;
