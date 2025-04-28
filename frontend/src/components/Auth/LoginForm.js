import React from 'react'; // No necesitamos useState aquí
import '../../styles/LoginForm.css'; // Importar los estilos
import GoogleLoginButton from './GoogleLoginButton'; // Importar GoogleLoginButton

/**
 * Componente de formulario de inicio de sesión.
 * Recibe props para manejar el estado, el envío y el inicio de sesión con Google.
 * @param {object} props - Las props del componente.
 * @param {string} props.username - El valor actual del campo de username.
 * @param {string} props.password - El valor actual del campo de password.
 * @param {string} props.error - El mensaje de error a mostrar.
 * @param {function} props.setUsername - Función para actualizar el estado del username.
 * @param {function} props.setPassword - Función para actualizar el estado del password.
 * @param {function} props.setError - Función para actualizar el estado del error.
 * @param {function} props.onSubmit - Función a ejecutar al enviar el formulario tradicional.
 * @param {function} props.onGoogleSuccess - Función a ejecutar al iniciar sesión con Google exitosamente.
 * @param {function} props.onGoogleError - Función a ejecutar si falla el inicio de sesión con Google.
 * @returns {JSX.Element} El elemento JSX del formulario de inicio de sesión.
 */
function LoginForm({ username, password, error, setUsername, setPassword, setError, onSubmit, onGoogleSuccess, onGoogleError }) {
  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <div className="error">{error}</div> {/* Mostrar mensaje de error */}
      <form onSubmit={onSubmit}> {/* Usar la prop onSubmit */}
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError(''); // Limpiar error al escribir
          }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(''); // Limpiar error al escribir
          }}
        />
        <button type="submit">Entrar</button> {/* Botón de tipo submit */}

        <p className="mb-4">- O -</p> {/* Separador */}

        {/* Botón de inicio de sesión con Google */}
        <GoogleLoginButton onSuccess={onGoogleSuccess} onError={onGoogleError} />

      </form>
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

export default LoginForm;
