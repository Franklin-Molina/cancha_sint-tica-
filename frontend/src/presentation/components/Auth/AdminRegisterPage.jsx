import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { CreateAdminUserUseCase } from '../../../application/use-cases/create-admin-user.js'; // Importar el caso de uso
import { ApiUserRepository } from '../../../infrastructure/repositories/api-user-repository.js'; // Importar el repositorio
// import api from '../../../infrastructure/api/api.js'; // Mantener la importación de api si se usa en otro lugar, si no, eliminar
import '../../../styles/AdminRegisterPage.css'; // Importar los estilos específicos de este componente desde la nueva ubicación
import useButtonDisable from '../../hooks/useButtonDisable.js'; // Importar el hook personalizado

/**
 * Página de registro de administradores.
 * Permite a los administradores registrarse con email y contraseña.
 * @returns {JSX.Element} El elemento JSX de la página de registro de administradores.
 */
function AdminRegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Obtener la función login del contexto

  const [username, setUsername] = useState(''); // Añadir estado para username
  const [firstName, setFirstName] = useState(''); // Añadir estado para first_name
  const [lastName, setLastName] = useState(''); // Añadir estado para last_name
  const [age, setAge] = useState(''); // Añadir estado para edad
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Instanciar el repositorio y el caso de uso
  const userRepository = new ApiUserRepository();
  const createAdminUserUseCase = new CreateAdminUserUseCase(userRepository);

  // Usar el hook para el envío del formulario
  const [isSubmitting, handleRegistration] = useButtonDisable(async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      // Preparar los datos para el caso de uso
      const userData = {
        username,
        email,
        password,
        password2: confirmPassword,
        first_name: firstName,
        last_name: lastName,
        edad: age,
      };

      // Ejecutar el caso de uso
      const newUser = await createAdminUserUseCase.execute(userData);

      console.log('Registro de administrador exitoso:', newUser); // Usar newUser en lugar de response.data
      setSuccess('Registro de administrador exitoso.');
      setError(''); // Limpiar errores previos

      // Limpiar el formulario después del registro exitoso
      setUsername('');
      setFirstName('');
      setLastName('');
      setAge('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000); // 3000 milisegundos = 3 segundos

    } catch (error) {
      console.error('Error en el registro de administrador:', error);
      if (error.response && error.response.data) {
        // Mostrar errores de validación del backend
        const backendErrors = error.response.data;

        let errorMessage = 'Error en el registro de administrador: '; // Corregido el error tipográfico
        for (const field in backendErrors) {
          if (backendErrors.hasOwnProperty(field)) {
            const errorValue = backendErrors[field];
            if (Array.isArray(errorValue)) {
              errorMessage += `${field}: ${errorValue.join(', ')} `;
            } else {
              errorMessage += `${field}: ${errorValue} `;
            }
          }
        }
        setError(errorMessage.trim());
      } else {
        setError('Error en el registro de administrador. Inténtalo de nuevo.');
      }
      setSuccess(''); // Limpiar mensaje de éxito previo
      throw error; // Re-lanzar el error para que el hook lo capture
    }
  });

  // Aplicar estructura y clases de RegisterPage.css
  // Nota: AdminRegisterPage ahora se renderiza dentro del layout de AdminGlobalDashboardPage,
  // por lo que register-page-container podría no ser necesario o necesitar ajustes.
  // Por ahora, mantendremos una estructura similar a RegisterPage.
  return (
    // Usar la nueva clase para el contenedor del formulario
      <div className="admin-register-form-container"> 
        <h2>Registro de Administrador de Cancha</h2>
        {/* Mostrar alerta de éxito o mensaje de error */}
        <div className="messages">
          {error && <div className="alert error-alert">{error}</div>}
          {success && <div className="alert success-alert">{success}</div>}
        </div>
        <form onSubmit={handleRegistration}>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                id="username"
                placeholder="Nombre de Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                className="form-input"
                id="email"
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
                className="form-input"
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
                className="form-input"
                id="lastName"
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
                className="form-input"
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
                className="form-input"
                id="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <input
              type="password"
              className="form-input"
              id="confirmPassword"
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              Registrar Administrador
            </button>
          </div>
        </form>
      </div>
    // </div>
  );
}

export default AdminRegisterPage;
