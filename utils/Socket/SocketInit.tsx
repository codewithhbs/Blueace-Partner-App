// utils/Socket/SocketInit.ts
import { io } from "socket.io-client";

export const socket = io("https://api.blueaceindia.com", {
  transports: ["websocket"],
  autoConnect: false,
});

export const connectSocket = (vendorId: string) => {
  if (!socket.connected) {
    socket.connect();

    // ✅ Clear old listeners before attaching new ones
    socket.removeAllListeners("connect");
    socket.removeAllListeners("connect_error");
    socket.removeAllListeners("disconnect");

    socket.on("connect", () => {
      console.log("Socket connected", socket.id);
      socket.emit("vendor:identify", { vendorId });
    });

    socket.on("connect_error", (err) =>
      console.error("Connect error", err.message)
    );

    socket.on("disconnect", (reason) =>
      console.log("Socket disconnected", reason)
    );
  } else {
    // ensure identified if reconnect happened
    socket.emit("vendor:identify", { vendorId });
  }
};

export const disconnectSocket = async (vendorId?: string, lastLocation?: any) => {
  if (socket.connected) {
    if (vendorId && lastLocation) {
      socket.emit("vendor:go:offline", { vendorId, lastLocation });
    }
    socket.disconnect();
  }
};
