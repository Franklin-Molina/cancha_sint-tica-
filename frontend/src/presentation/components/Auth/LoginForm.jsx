import React from 'react'; // Ya no necesitamos useState aquí, lo manejamos con el hook
import '../../../styles/LoginForm.css'; // Importar los estilos
import GoogleLoginButton from './GoogleLoginButton.jsx'; // Importar GoogleLoginButton
import useButtonDisable from '../../hooks/useButtonDisable.js'; // Importar el hook personalizado

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
  // Usar el hook personalizado para manejar el estado de deshabilitación del botón
  const [isSubmitting, handleFormSubmit] = useButtonDisable(onSubmit);

  function togglePassword() {
    const passwordInput = document.getElementById('password');
    const showButton = document.querySelector('.show-password');

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      showButton.textContent = '🙈';
    } else {
      passwordInput.type = 'password';
      showButton.textContent = '👁';
    }
  }

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <div className="error">{error}</div> {/* Mostrar mensaje de error */}
      <form onSubmit={handleFormSubmit}> {/* Usar el nuevo manejador de envío */}
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError(''); // Limpiar error al escribir
          }}
        />
        <div className="password-input-container"> {/* Contenedor para el input y el botón */}

          <div className="password-wrapper">
            <input type="password" id="password" name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(''); // Limpiar error al escribir
              }} placeholder="Ingresa tu contraseña" required />
            <button type="button" className="show-password" onClick={togglePassword}> {/* Botón para mostrar/ocultar */}
              👁
            </button>
          </div>



        </div>
        {/* El botón se deshabilita cuando isSubmitting es true */}
        <button className='login-button' type="submit" disabled={isSubmitting}>Entrar</button> {/* Botón de tipo submit */}
        <div className="forgot-password">
          <a href="#" >¿Olvidaste tu contraseña?</a>
        </div>
        <div className="divider">
          <span>- O -</span>
        </div>


        {/* Botón de inicio de sesión con Google */}
        <GoogleLoginButton onSuccess={onGoogleSuccess} onError={onGoogleError} />

      </form>
      {/* Enlace a formulario de registro */}
      <div className="signup-link">
        <p>¿No tienes una cuenta? <a href="/register" >Regístrate aquí</a></p>
      </div>

    </div>
  );
}

export default LoginForm;
