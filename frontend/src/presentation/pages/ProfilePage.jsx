import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import LogoutButton from '../components/Auth/LogoutButton.jsx';
import '../../styles/ProfilePage.css'; // Importar estilos específicos
import { ApiUserRepository } from '../../infrastructure/repositories/api-user-repository.js'; // Importar el repositorio
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.js'; // Importar el caso de uso

function ProfilePage() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user ? user.username : '');
  const [firstName, setFirstName] = useState(user ? user.first_name : '');
  const [lastName, setLastName] = useState(user ? user.last_name : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [edad, setEdad] = useState(user ? user.edad : '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Instanciar el repositorio y el caso de uso
  const userRepository = new ApiUserRepository();
  const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);

  if (loading) {
    return <div className="profile-container">Cargando perfil...</div>;
  }

  if (!user) {
    return <div className="profile-container">Usuario no autenticado. Por favor, inicia sesión.</div>;
  }

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Resetear los valores del formulario a los valores del usuario
    setUsername(user.username);
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setEmail(user.email);
    setEdad(user.edad);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Preparar los datos para el caso de uso
      const userData = {
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        edad,
      };

      // Ejecutar el caso de uso
      const updatedUser = await updateUserProfileUseCase.execute(user.id, userData);

      console.log('Perfil actualizado exitosamente:', updatedUser);
      setSuccess('Perfil actualizado exitosamente.');

      // Mostrar la alerta de éxito durante 2 segundos antes de redirigir
      setTimeout(() => {
        setIsEditing(false);
      }, 2000); // 2000 milisegundos = 2 segundos

      // Actualizar el contexto de autenticación con los nuevos datos del usuario
      // (Esto dependerá de cómo esté implementado el contexto de autenticación)
      // Por ejemplo, si tienes una función para actualizar el usuario en el contexto:
      // updateUserContext(updatedUser);

    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setError('Error al actualizar el perfil. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="profile-container">
      <h1 className="page-title">Perfil de Usuario</h1>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{user.username ? user.username.charAt(0).toUpperCase() : 'U'}</div>
          <div className="profile-info-header">
            <h2 className="profile-username">{user.username}</h2>
            <p className="profile-role">{user.role}</p>
          </div>
        </div>

        {isEditing ? (
          <form className="profile-form" onSubmit={handleSubmit}>
            {error && <div className="alert error-alert">{error}</div>}
            {success && <div className="alert success-alert">{success}</div>}
            <div className="form-group">
              <label htmlFor="username">Nombre de Usuario:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="firstName">Nombre:</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Apellido:</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edad">Edad:</label>
              <input
                type="number"
                id="edad"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button type="submit">Guardar</button>
              <button type="button" onClick={handleCancelClick}>Cancelar</button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">Nombre:</span>
              <span className="detail-value">{user.first_name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Apellido:</span>
              <span className="detail-value">{user.last_name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user.email}</span>
            </div>
            {user.edad && (
              <div className="detail-item">
                <span className="detail-label">Edad:</span>
                <span className="detail-value">{user.edad}</span>
              </div>
            )}
            <button onClick={handleEditClick}>Editar Perfil</button>
          </div>
        )}
      </div>

      <div className="social-profiles-card">
        <h2 className="card-title">Cuentas Vinculadas</h2>
        {user.social_profiles && user.social_profiles.length > 0 ? (
          <ul className="social-profiles-list">
            {user.social_profiles.map(profile => (
              <li key={profile.id} className="social-profile-item">
                <span className="provider-label">Proveedor:</span> {profile.provider}, <span className="uid-label">UID:</span> {profile.uid}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-social-profiles">No hay cuentas sociales vinculadas.</p>
        )}
      </div>

      <div className="logout-section">
        <LogoutButton />
      </div>
    </div>
  );
}

export default ProfilePage;
