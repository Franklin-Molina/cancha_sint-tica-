import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importar axios

function RegisterPage() {
  const [username, setUsername] = useState(''); // Estado para el nombre de usuario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(''); // Estado para manejar errores
  const navigate = useNavigate();

  const handleSubmit = async (e) => { // Hacer la función asíncrona
    e.preventDefault();
    setError(''); // Limpiar errores previos

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      // Realizar la llamada a la API de backend para registrar al usuario
      const response = await axios.post('http://localhost:8000/api/users/register/', { // Usar la URL correcta del endpoint de registro
        username, // Incluir nombre de usuario
        email,
        password,
      });

      console.log('Registro exitoso:', response.data);
      // Después de un registro exitoso, redirigir al usuario a la página de login
      navigate('/login');

    } catch (err) {
      console.error('Error en el registro:', err.response ? err.response.data : err.message);
      // Mostrar mensaje de error al usuario
      setError(err.response && err.response.data ? JSON.stringify(err.response.data) : 'Error en el registro');
    }
  };

  return (
    <div>
      <h1>Página de Registro</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Mostrar errores */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Nombre de Usuario:</label> {/* Campo para nombre de usuario */}
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <div>
          <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
}

export default RegisterPage;
