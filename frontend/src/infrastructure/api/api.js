import axios from 'axios';

// TODO: Configurar la URL base de la API desde una variable de entorno
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Configuración para incluir la cookie CSRF automáticamente
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  withCredentials: true, // Importante para enviar cookies a través de dominios/puertos
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken'); // Asumiendo que el token se guarda en localStorage
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log("Enviando token en header Authorization:", accessToken);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // TODO: Implementar lógica para manejar errores de autenticación (ej. 401 Unauthorized)
    // Si es un error 401 y no es la ruta de login o refresh, intentar refrescar el token
    // Si el refresh falla o no es un error 401, rechazar la promesa del error original
    return Promise.reject(error);
  }
);

export default api;
