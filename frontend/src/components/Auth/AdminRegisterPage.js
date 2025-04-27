import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { useAuth } from '../../context/AuthContext'; // Importar useAuth
import api from '../../utils/api'; // Importar la instancia de axios configurada

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

  const handleRegistration = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      // Ajusta la URL si es necesario
      const response = await api.post('/users/admin/register/', {
        username, // Incluir username
        email,
        password,
        password2: confirmPassword, // Incluir confirmPassword como password2
        first_name: firstName, // Incluir first_name
        last_name: lastName, // Incluir last_name
        edad: age, // Incluir edad
      });

      console.log('Registro de administrador exitoso:', response.data);
      setSuccess('Registro de administrador exitoso.');
      setError(''); // Limpiar errores previos

    } catch (error) {
      console.error('Error en el registro de administrador:', error);
      if (error.response && error.response.data) {
        // Mostrar errores de validación del backend
        const backendErrors = error.response.data;
        let errorMessage = 'Error en el registro de administrador: ';
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
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Registro de Administrador</h1>

      <form onSubmit={handleRegistration} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
         <div className="mb-4"> {/* Añadir campo username */}
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Nombre de Usuario
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            placeholder="Nombre de Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-shadow-outline"
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
         <div className="mb-4"> {/* Añadir campo first_name */}
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
            Nombre
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="firstName"
            type="text"
            placeholder="Nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
         <div className="mb-4"> {/* Añadir campo last_name */}
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
            Apellido
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="lastName"
            type="text"
            placeholder="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
         <div className="mb-4"> {/* Añadir campo edad */}
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="age">
            Edad
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="age"
            type="number"
            placeholder="Edad"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Contraseña
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
         <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
            Confirmar Contraseña
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="confirmPassword"
            type="password"
            placeholder="******************"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>} {/* Mostrar error */}
        {success && <p className="text-green-500 text-xs italic mb-4">{success}</p>} {/* Mostrar mensaje de éxito */}
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Registrar Administrador
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminRegisterPage;
