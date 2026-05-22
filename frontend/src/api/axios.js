import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ IMPORTANTE: Cambia esta IP a la de tu PC
// Para obtener tu IP: abre PowerShell y corre: ipconfig
// Busca "IPv4 Address" y reemplaza el número abajo
// Ejemplo: 192.168.1.50 → http://192.168.1.50:3000/api

const API_URL = 'http://192.168.1.106:3000/api';

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
