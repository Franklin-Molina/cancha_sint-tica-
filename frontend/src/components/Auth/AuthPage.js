import React, { useState, useEffect } from 'react'; // Importar useState y useEffect
import axios from 'axios'; // Importar axios
import { useNavigate } from 'react-router-dom'; // Importar useNavigate para redirección
import { useAuth } from '../../context/AuthContext'; // Importar useAuth
import api from '../../utils/api'; // Importar la instancia de axios configurada
import LoginForm from './LoginForm'; // Importar el componente LoginForm

/**
 * Página de autenticación.
 * Contiene el formulario de inicio de sesión tradicional y el botón de inicio de sesión con Google.
 * @returns {JSX.Element} El elemento JSX de la página de autenticación.
 */
function AuthPage() {
  const navigate = useNavigate(); // Hook para redirección
  const { login } = useAuth(); // Obtener la función login del contexto de autenticación

  // Estados para el formulario de inicio de sesión tradicional
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
    if (!username || !password) {
      setError('Por favor, ingresa tu username y contraseña.');
      return;
    }

    try {
      // Limpiar errores previos
      setError('');

      const data = { username, password };

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
      {/* Renderizar el componente LoginForm y pasarle las props */}
      <LoginForm
        username={username}
        password={password}
        error={error}
        setUsername={setUsername}
        setPassword={setPassword}
        setError={setError}
        onSubmit={handleTraditionalLogin}
        onGoogleSuccess={handleLoginSuccess} // Pasar la función de éxito de Google
        onGoogleError={handleLoginError} // Pasar la función de error de Google
      />

      {/* El botón de Google y el separador "- O -" ahora están dentro de LoginForm */}
    </div>
  );
}

export default AuthPage;
