import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios'; // Importar axios

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
      const response = await axios.post('http://localhost:8000/api/users/login/', {
        username,
        password,
      });

      console.log('Inicio de sesión exitoso:', response.data);
      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;
      console.log("Respuesta del backend:", response.data);
      login(accessToken, refreshToken);
      navigate('/courts');

    } catch (err) {
      console.error('Error en el inicio de sesión:', err.response ? err.response.data : err.message);
      if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data));
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Error en el inicio de sesión');
      }
      console.error("Error detallado:", err); // Agregar console.error para ver el error detallado
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
