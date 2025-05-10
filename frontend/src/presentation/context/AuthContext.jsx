import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate

// Importar los casos de uso y la implementación del repositorio
import { ApiAuthRepository } from '../../infrastructure/repositories/api-auth-repository.js';
import { LoginUserUseCase } from '../../application/use-cases/login-user.js';
import { LogoutUserUseCase } from '../../application/use-cases/logout-user.js';
import { GetAuthenticatedUserUseCase } from '../../application/use-cases/get-authenticated-user.js';
import { LoginWithGoogleUseCase } from '../../application/use-cases/login-with-google.js';

// Crear el contexto de autenticación
const AuthContext = createContext(null);

/**
 * Proveedor de contexto de autenticación.
 * Maneja el estado de autenticación del usuario y los tokens JWT
 * utilizando casos de uso de la capa de Aplicación.
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

  // Crear instancias del repositorio y casos de uso
  // En una aplicación real, esto se haría a través de inyección de dependencias
  const authRepository = new ApiAuthRepository();
  const loginUserUseCase = new LoginUserUseCase(authRepository);
  const logoutUserUseCase = new LogoutUserUseCase(authRepository);
  const getAuthenticatedUserUseCase = new GetAuthenticatedUserUseCase(authRepository);
  const loginWithGoogleUseCase = new LoginWithGoogleUseCase(authRepository);


  // Función para obtener la información completa del usuario usando el caso de uso
  const fetchUser = async () => {
    setLoading(true); // Indicar que se está cargando el usuario

    try {
      // Llamar al caso de uso para obtener el usuario autenticado
      const authenticatedUser = await getAuthenticatedUserUseCase.execute();

      if (authenticatedUser) {
        setUser(authenticatedUser);
        setIsAuthenticated(true);

        // Redirigir después de obtener la información del usuario
        if (authenticatedUser.is_staff) {
            navigate('/dashboard'); // Redirigir a administradores al dashboard
        } else {
            navigate('/profile'); // Redirigir a usuarios normales al perfil
        }

      } else {
        // Si no hay usuario autenticado (ej. no hay tokens o son inválidos)
        setUser(null);
        setIsAuthenticated(false);
        // No redirigir aquí, la redirección al login se maneja en ProtectedRoute
      }

    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      // Si hay un error al obtener el usuario (ej. token expirado), el repositorio ya debería haber limpiado los tokens
      setUser(null);
      setIsAuthenticated(false);
      // No redirigir aquí, ProtectedRoute manejará la redirección si isAuthenticated es false
    } finally {
      setLoading(false); // Asegurar que loading se establezca en false siempre
    }
  };


  // Función para iniciar sesión con credenciales usando el caso de uso
  const login = async (username, password) => {
    try {
      // Llamar al caso de uso para iniciar sesión
      const tokens = await loginUserUseCase.execute(username, password);
      console.log("Login exitoso, tokens obtenidos:", tokens);
      // Después de obtener los tokens, obtener la información del usuario
      await fetchUser(); // fetchUser ahora maneja la redirección después de obtener el usuario

    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      // Relanzar el error para que el componente de UI que llamó a login lo maneje (ej. muestre un mensaje de error)
      throw error;
    }
  };

  // Función para cerrar sesión usando el caso de uso
  const logout = async () => {
    try {
      // Llamar al caso de uso para cerrar sesión
      await logoutUserUseCase.execute();
      console.log("Sesión cerrada.");
      // Limpiar estado local
      setIsAuthenticated(false);
      setUser(null);
      // Redirigir al home después de cerrar sesión
      navigate('/');

    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Manejar el error si es necesario, aunque logout local debería ser robusto
    }
  };

  // Función para iniciar sesión con Google usando el caso de uso
  const loginWithGoogle = async (googleAccessToken) => {
    try {
      // Llamar al caso de uso para iniciar sesión con Google
      const tokens = await loginWithGoogleUseCase.execute(googleAccessToken);
      console.log("Login con Google exitoso, tokens obtenidos:", tokens);
      // Después de obtener los tokens, obtener la información del usuario
      await fetchUser(); // fetchUser ahora maneja la redirección después de obtener el usuario

    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      // Relanzar el error para que el componente de UI lo maneje
      throw error;
    }
  };


  // Efecto para cargar la sesión al iniciar la aplicación
  useEffect(() => {
    // Intentar obtener el usuario autenticado al cargar la app
    fetchUser();
  }, []); // Se ejecuta solo una vez al montar el componente


  // TODO: Implementar lógica para refrescar tokens usando el refreshToken en el repositorio

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
