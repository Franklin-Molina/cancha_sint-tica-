import React, { useState } from 'react';
import '../../styles/LoginForm.css'; // Importar los estilos

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    if (username.trim() === '' || password.trim() === '') {
      setError('Por favor, rellena ambos campos.');
      return;
    }

    setError('');
    // Aquí iría la lógica real de inicio de sesión, por ejemplo, llamar a una API
    alert('Login correcto (simulado)');
    // Puedes agregar aquí la llamada a la API de autenticación
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <div className="error">{error}</div> {/* Mostrar mensaje de error */}
      <form onSubmit={handleSubmit}> {/* Usar un formulario para manejar el envío */}
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Entrar</button> {/* Botón de tipo submit */}
      </form>
    </div>
  );
}

export default LoginForm;
