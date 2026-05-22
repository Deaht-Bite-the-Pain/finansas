import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Celular físico (Expo Go): usa la IPv4 de tu PC (ipconfig → Wi-Fi).
// Emulador Android en la misma PC: http://10.0.2.2:3000/api
// Solo pruebas en navegador web en la PC: http://localhost:3000/api
const API_URL = 'http://192.168.1.10:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // Sin token (registro/login) o módulo no listo aún
  }
  return config;
});

export default api;
