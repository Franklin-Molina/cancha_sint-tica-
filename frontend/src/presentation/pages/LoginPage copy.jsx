import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
// Eliminar importación de axios

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Llamar a la función login del contexto con username y password
      // La lógica de la llamada a la API y el manejo de tokens está ahora en el contexto/casos de uso/repositorio
      await login(username, password);
      // La redirección después del login exitoso se maneja en el contexto (fetchUser)
      // Eliminar redirección aquí: navigate('/courts');

    } catch (err) {
      console.error('Error en el inicio de sesión:', err);
      // Mostrar mensaje de error al usuario basado en el error propagado desde el contexto
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail); // Mostrar mensaje de error del backend
      } else {
        setError('Error en el inicio de sesión. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div>
      <h1>Página de Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}

export default LoginPage;
