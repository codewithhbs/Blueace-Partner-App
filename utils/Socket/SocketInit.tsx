import { io } from 'socket.io-client';

// ⚠️ Replace with your backend LAN IP and port
export const socket = io("http://192.168.1.8:7987", {
  transports: ["websocket"],
  autoConnect: false, // don't connect immediately
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();

    socket.on('connect', () => console.log('✅ Socket connected!', socket.id));
    socket.on('connect_error', (err) => console.error('❌ Socket connection error:', err.message));
    socket.on('disconnect', (reason) => console.log('⚠️ Socket disconnected:', reason));
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
