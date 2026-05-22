import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://TU_IP_AQUI:3000/api', // Reemplaza con tu IPv4
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;