import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REACT_APP_API_URL } from '@env';

// Lee la URL de la API desde el archivo .env
// Cada usuario debe crear su propio .env basado en .env.example
const API_URL = REACT_APP_API_URL || 'http://localhost:3000/api';

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
