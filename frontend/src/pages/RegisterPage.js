import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importar axios
import '../styles/LoginForm.css'; // Importar estilos del formulario de login
import '../styles/RegisterPage.css'; // Importar estilos de la página de registro

function RegisterPage() {
  useEffect(() => {
    // Agregar clase al body cuando el componente se monta
    document.body.classList.add('no-scroll');

    // Limpiar: eliminar clase del body cuando el componente se desmonta
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []); // El array vacío asegura que el efecto se ejecute solo una vez al montar y desmontar

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
    <div className="login-container"> {/* Usar la misma clase de contenedor que el login */}
      <h2>Página de Registro</h2> {/* Usar h2 para el título */}
      {error && <p className="error">{error}</p>} {/* Usar la clase error para mostrar errores */}
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
