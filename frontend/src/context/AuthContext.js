import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import axios from 'axios';

// Crear el contexto de autenticación
const AuthContext = createContext(null);

/**
 * Proveedor de contexto de autenticación.
 * Maneja el estado de autenticación del usuario y los tokens JWT.
 * @param {object} props - Las props del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos que tendrán acceso al contexto.
 * @returns {JSX.Element} El proveedor de contexto.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Estado para indicar si se está cargando la sesión inicial

  // Obtener la función de navegación
  const navigate = useNavigate();

  // Función para obtener la información completa del usuario desde el backend
  const fetchUser = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    try {
      // Endpoint para obtener el perfil del usuario autenticado
      const response = await axios.get('http://localhost:8000/api/users/users/me/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      // Si hay un error (ej. token inválido o expirado), cerrar sesión
      logout();
    }
  };


  // Función para iniciar sesión (ej. después de recibir tokens del backend)
  const login = (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    console.log("Tokens guardados en localStorage:", accessToken, refreshToken);
    // setIsAuthenticated(true); // Se establecerá en fetchUser si el token es válido
    fetchUser(); // Obtener información del usuario después del login
    navigate('/profile'); // Redirigir al usuario a la página de perfil después del login
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/auth'); // Redirigir al usuario a la página de login
  };

  // Función para iniciar sesión con Google a través del backend
  const loginWithGoogle = async (googleResponse) => {
    try {
      // Extraer el access_token de la respuesta de Google
      const accessToken = googleResponse.access_token;

      // Enviar el access_token de Google al endpoint del backend
      // El endpoint correcto es /api/users/google/
      const response = await axios.post('http://localhost:8000/api/users/google/', { access_token: accessToken });

      // Si la solicitud al backend es exitosa, obtener los tokens JWT
      const { access_token: jwtAccessToken, refresh_token: jwtRefreshToken } = response.data;

      // Usar la función login existente para guardar los tokens JWT y actualizar el estado
      login(jwtAccessToken, jwtRefreshToken);

    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      // Manejar el error (ej. mostrar un mensaje al usuario)
      // TODO: Implementar manejo de errores más robusto
    }
  };


  // Efecto para cargar la sesión al iniciar la aplicación
  useEffect(() => {
    const loadInitialUser = async () => {
      try {
        await fetchUser(); // Intentar obtener la información del usuario al cargar la app
      } finally {
        setLoading(false); // Asegurar que loading se establezca en false siempre
      }
    };

    loadInitialUser();
  }, []); // Se ejecuta solo una vez al montar el componente


  // TODO: Implementar lógica para refrescar tokens usando el refreshToken

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, loginWithGoogle, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para usar el contexto de autenticación.
 * @returns {object} El valor del contexto de autenticación.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
