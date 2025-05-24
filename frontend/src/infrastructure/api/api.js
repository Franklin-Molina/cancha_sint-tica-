import axios from 'axios';

// TODO: Configurar la URL base de la API desde una variable de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/api';

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
     // console.log("Enviando token en header Authorization:", accessToken);
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
    const originalRequest = error.config;

    // Verificar si es un error 401 y no es una solicitud de refresh token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marcar para evitar bucles de reintento

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No hay refreshToken, no se puede refrescar, desloguear o redirigir
          console.error('No refresh token available for token refresh.');
          // Aquí se podría llamar a una función de logout del AuthContext si estuviera disponible
          // o emitir un evento para que AuthContext maneje el logout.
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // Podríamos redirigir al login aquí, pero es mejor que lo maneje el componente/contexto que usa la API.
          return Promise.reject(error);
        }

        // Solicitar un nuevo accessToken usando el refreshToken
        const response = await axios.post(`${API_BASE_URL}/api/users/login/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('accessToken', newAccessToken);

        // Actualizar el encabezado de autorización de la solicitud original y reintentarla
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest); // Reintentar la solicitud original con el nuevo token

      } catch (refreshError) {
      //  console.error('Error refreshing token:', refreshError);
        // Si el refresh falla (ej. refreshToken expirado), desloguear o redirigir
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Aquí también se podría llamar a una función de logout o emitir un evento.
        return Promise.reject(refreshError); // O el error original, dependiendo de la política
      }
    }

    // Si no es un error 401 o ya se intentó refrescar, rechazar la promesa
    return Promise.reject(error);
  }
);

export default api;
