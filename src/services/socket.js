import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'http://localhost:3000';

let socket = null;

export const connectSocket = async () => {
  const token = await AsyncStorage.getItem('token');
  
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => console.log('🔌 Socket conectado'));
  socket.on('disconnect', () => console.log('❌ Socket desconectado'));
  socket.on('connect_error', (err) => console.log('Error socket:', err.message));

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};