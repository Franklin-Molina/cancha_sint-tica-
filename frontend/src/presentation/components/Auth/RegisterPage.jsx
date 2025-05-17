import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../../styles/RegisterPage.css'; // Importar el archivo CSS

/**
 * Página de registro tradicional.
 * Permite a los usuarios registrarse con email y contraseña.
 * @returns {JSX.Element} El elemento JSX de la página de registro.
 */
function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;

  const handleRegistration = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/users/register/`, {
        username,
        email,
        password,
        password2: confirmPassword,
        first_name: firstName,
        last_name: lastName,
        edad: age,
      });

      console.log('Registro exitoso:', response.data);
      setSuccess('Registro exitoso. Intentando iniciar sesión...');
      setError('');
/* 
      try {
        const loginResponse = await axios.post('http://localhost:8000/api/users/login/', {
          username,
          password,
        });

        const { access, refresh } = loginResponse.data;
        login(access, refresh);
        console.log('Inicio de sesión automático exitoso.');
        setSuccess('Registro y inicio de sesión exitosos.');

      } catch (loginError) {
        console.error('Error en el inicio de sesión automático:', loginError);
        setError('Registro exitoso, pero no se pudo iniciar sesión automáticamente. Por favor, inicia sesión manualmente.');
      } */

    } catch (error) {
      console.error('Error en el registro:', error);
      if (error.response && error.response.data) {
        const backendErrors = error.response.data;
        let errorMessage = 'Error en el registro: ';
        for (const field in backendErrors) {
          if (backendErrors.hasOwnProperty(field)) {
            errorMessage += `${field}: ${backendErrors[field].join(', ')} `;
          }
        }
        setError(errorMessage.trim());
      } else {
        setError('Error en el registro. Inténtalo de nuevo.');
      }
      setSuccess('');
    }
  };

  return (
    <div className="register-page-container"> {/* Contenedor para centrar la página */}
      <div className="register-container"> {/* Usar la clase del HTML */}
        <h2>Registro Users</h2>
        {/* Mostrar error y éxito dentro de un div con clase error */}
        <div className="error">
          {error && <p>{error}</p>}
          {success && <p>{success}</p>}
        </div>
        <form onSubmit={handleRegistration}> {/* Eliminar className de form */}
          {/* Usuario y Email en una fila */}
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                className="form-input" // Usar la clase del HTML
                id="username"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                className="form-input" // Usar la clase del HTML
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Nombre y Apellido en otra fila */}
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                className="form-input" // Usar la clase del HTML
                id="firstName"
                placeholder="Nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                className="form-input" // Usar la clase del HTML
                id="lastName"
                placeholder="Apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Edad y Contraseña en otra fila */}
          <div className="form-row">
            <div className="form-group">
              <input
                type="number"
                className="form-input" // Usar la clase del HTML
                id="age"
                placeholder="Edad"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className="form-input" // Usar la clase del HTML
                id="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Confirmar Contraseña en su propia fila */}
          <div className="form-group">
            <input
              type="password"
              className="form-input" // Usar la clase del HTML
              id="confirmPassword"
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Botón Registrar en su propia fila */}
          <div className="form-group">
            <button type="submit" className="submit-button">Registrar</button> {/* Usar la clase del HTML */}
          </div>
        </form>
      </div> {/* Cierre del div register-container */}
    </div> /* Cierre del div register-page-container */
  );
}

export default RegisterPage;
