import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importar axios
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
  const [firstName, setFirstName] = useState(''); // Estado para el nombre
  const [lastName, setLastName] = useState(''); // Estado para el apellido
  const [age, setAge] = useState(''); // Estado para la edad
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

    // Validar que todos los campos requeridos estén llenos
    if (!username || !email || !password || !confirmPassword || !firstName || !lastName || !age) {
      setError('Por favor completa todos los campos.');
      return;
    }


    try {
      // Realizar la llamada a la API de backend para registrar al usuario
      const response = await axios.post('http://localhost:8000/api/users/register/', { // Usar la URL correcta del endpoint de registro
        username, // Incluir nombre de usuario
        email,
        password,
        first_name: firstName, // Incluir nombre
        last_name: lastName, // Incluir apellido
        age: age, // Incluir edad
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
    <div className="register-container"> {/* Usar la clase register-container */}
      <h2>Registro de Usuario</h2> {/* Usar h2 para el título */}
      {error && <div className="error">{error}</div>} {/* Usar la clase error para mostrar errores */}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              id="username"
              className="form-input"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              id="nombre"
              className="form-input"
              placeholder="Nombre"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              id="apellido"
              className="form-input"
              placeholder="Apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="number"
              id="edad"
              className="form-input"
              placeholder="Edad"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="password"
              id="confirmPassword"
              className="form-input"
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="submit-button">Registrar</button>
      </form>
    </div>
  );
}

export default RegisterPage;
