export function getApiErrorMessage(error, fallback = 'Ocurrió un error') {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    return (
      'No se pudo conectar al servidor.\n\n' +
      '• ¿Está encendido el backend? (node index.js)\n' +
      '• ¿La IP en axios.js es correcta? (ipconfig)\n' +
      '• ¿Celular y PC en la misma Wi‑Fi?\n' +
      '• Prueba en el navegador del celular: http://TU_IP:3000/api/health'
    );
  }
  return error.message || fallback;
}
