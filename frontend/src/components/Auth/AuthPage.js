import React, { useState, useEffect } from 'react'; // Importar useState y useEffect
import GoogleLoginButton from './GoogleLoginButton';
import axios from 'axios'; // Importar axios
import { useNavigate } from 'react-router-dom'; // Importar useNavigate para redirección
import { useAuth } from '../../context/AuthContext'; // Importar useAuth
import api from '../../utils/api'; // Importar la instancia de axios configurada

/**
 * Página de autenticación.
 * Contiene el botón de inicio de sesión con Google y maneja el flujo de autenticación.
 * @returns {JSX.Element} El elemento JSX de la página de autenticación.
 */
function AuthPage() {
  const navigate = useNavigate(); // Hook para redirección
  const { login } = useAuth(); // Obtener la función login del contexto de autenticación

  // Efecto para obtener la cookie CSRF al montar el componente
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        // Hacer una solicitud GET a un endpoint que establezca la cookie CSRF
        // Usar el nuevo endpoint dedicado para obtener la cookie CSRF
        await axios.get('http://localhost:8000/api/csrf/');
        console.log('Cookie CSRF obtenida.');
      } catch (error) {
        console.error('Error al obtener la cookie CSRF:', error);
      }
    };

    fetchCsrfToken();
  }, []); // El array vacío asegura que el efecto se ejecute solo una vez al montar

  const [username, setUsername] = useState(''); // Cambiar estado de email a username
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Estado para manejar errores

  const handleLoginSuccess = async (response) => {
    console.log('Inicio de sesión con Google exitoso:', response);
    const accessToken = response.access_token; // Obtener el access_token de la respuesta de Google

    try {
      // Enviar el access_token al backend para autenticación usando la instancia 'api'
      const backendResponse = await api.post('/users/google/', {
        access_token: accessToken,
      });

      console.log('Respuesta del backend:', backendResponse.data);

      // Asumiendo que el backend devuelve tokens JWT en la respuesta
      const { access, refresh } = backendResponse.data;

      // Llamar a la función login del contexto para actualizar el estado global y localStorage
      login(access, refresh);

    } catch (error) {
      console.error('Error al enviar token a backend:', error);
      // TODO: Mostrar mensaje de error al usuario
    }
  };

  const handleLoginError = () => {
    console.log('Inicio de sesión con Google fallido');
    // TODO: Mostrar mensaje de error al usuario
  };

  const handleTraditionalLogin = async (e) => {
    e.preventDefault(); // Prevenir la recarga de la página

    // Validar que los campos no estén vacíos
    if (!username || !password) { // Validar username en lugar de email
      setError('Por favor, ingresa tu username y contraseña.'); // Cambiar mensaje de error
      return; // Detener la ejecución si los campos están vacíos
    }

    try {
      // Limpiar errores previos
      setError('');

      // Crear un objeto FormData para enviar los datos
      //const formData = new FormData();
      //formData.append('username', username);
      //formData.append('password', password);
     
      const data = { username, password }; 
      
     // await api.post('/users/login/', data);
     
      console.log("datos para back",data)
      
      // Usar la instancia 'api' para enviar la solicitud de login tradicional
      const response = await api.post('/users/login/', data);

      console.log('Inicio de sesión tradicional exitoso:', response.data);

      // Asumiendo que el backend devuelve tokens JWT en la respuesta
      const { access, refresh } = response.data;

      // Llamar a la función login del contexto para actualizar el estado global y localStorage
      login(access, refresh);

    } catch (error) {
      console.error('Error en inicio de sesión tradicional:', error);
      if (error.response && error.response.data && error.response.data.detail) {
        setError(error.response.data.detail); // Mostrar mensaje de error del backend
      } else {
        setError('Error en el inicio de sesión. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Iniciar Sesión</h1>

      {/* Formulario de inicio de sesión tradicional */}
      <form onSubmit={handleTraditionalLogin} className="bg-white p-6 rounded shadow-md w-full max-w-sm mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username"> {/* Cambiar htmlFor a username */}
            Username {/* Cambiar texto del label */}
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username" // Cambiar id a username
            type="text" // Cambiar type a text
            placeholder="Username" // Cambiar placeholder a Username
            value={username} // Usar estado username
            onChange={(e) => setUsername(e.target.value)} // Actualizar estado username
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Contraseña
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>} {/* Mostrar error */}
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Iniciar Sesión
          </button>
        </div>
      </form>

      <p className="mb-4">- O -</p>

      {/* Botón de inicio de sesión con Google */}
      <GoogleLoginButton onSuccess={handleLoginSuccess} onError={handleLoginError} />

      {/* Enlace a formulario de registro */}
      <p className="mt-4 text-center">
        ¿No tienes una cuenta?{' '}
        <a href="/register" className="text-blue-500 hover:underline">
          Regístrate aquí
        </a>
      </p>
    </div>
  );
}

export default AuthPage;
