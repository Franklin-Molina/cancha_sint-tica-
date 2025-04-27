import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import Button from '../common/Button'; // Importar el componente Button

/**
 * Componente de botón para iniciar sesión con Google.
 * Utiliza el hook useGoogleLogin para manejar el flujo de autenticación.
 * @param {object} props - Las props del componente.
 * @param {function} props.onSuccess - Función a llamar en caso de éxito en el inicio de sesión.
 * @param {function} props.onError - Función a llamar en caso de error en el inicio de sesión.
 * @returns {JSX.Element} El elemento JSX del botón de inicio de sesión con Google.
 */
function GoogleLoginButton({ onSuccess, onError }) {
  const login = useGoogleLogin({
    onSuccess: onSuccess,
    onError: onError,
  });

  return (
    <Button onClick={() => login()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
      Iniciar sesión con Google
    </Button>
  );
}

export default GoogleLoginButton;
