import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // Corregida la ruta de importación
import LogoutButton from '../components/Auth/LogoutButton.jsx';
import '../../styles/ProfilePage.css'; // Importar estilos específicos
import { ApiUserRepository } from '../../infrastructure/repositories/api-user-repository.js'; // Importar el repositorio
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.js'; // Importar el caso de uso
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.js'; // Importar el caso de uso de cambio de contraseña
import Spinner from '../components/common/Spinner.jsx';
import useButtonDisable from '../hooks/useButtonDisable.js'; // Importar el hook personalizado


function ProfilePage() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  // Estados para el modal de cambio de contraseña
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [username, setUsername] = useState(user ? user.username : '');
  const [firstName, setFirstName] = useState(user ? user.first_name : '');
  const [lastName, setLastName] = useState(user ? user.last_name : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [edad, setEdad] = useState(user ? user.edad : '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Instanciar el repositorio y los casos de uso
  const userRepository = new ApiUserRepository();
  const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);
  const changePasswordUseCase = new ChangePasswordUseCase(userRepository); // Instanciar caso de uso de cambio de contraseña

  if (loading) {
    return <Spinner />; 
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

  // Usar el hook para el formulario de perfil
  const [isSubmittingProfile, handleProfileSubmit] = useButtonDisable(async (e) => {
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
      throw error; // Re-lanzar el error para que el hook lo capture y no deshabilite el botón si se desea
    }
  });

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword) {
      setPasswordError('Por favor, ingresa la contraseña actual y la nueva contraseña.');
      return;
    }

    try {
      // Llamar al caso de uso para cambiar la contraseña
      // Si el caso de uso no lanza un error, asumimos que fue exitoso.
      const result = await changePasswordUseCase.execute(user.id, currentPassword, newPassword);

      // Si llegamos aquí, la llamada fue exitosa.
      // Mostrar mensaje de éxito del backend si está disponible, de lo contrario usar un mensaje genérico.
      setPasswordSuccess(result.detail || 'Contraseña cambiada exitosamente.');

      // Limpiar campos y cerrar modal después de un tiempo
      setTimeout(() => {
        setCurrentPassword('');
        setNewPassword('');
        setIsPasswordModalOpen(false);
        setPasswordSuccess(''); // Limpiar el mensaje de éxito después de cerrar el modal
      }, 2000);

    } catch (error) {
     // console.error('Error al cambiar la contraseña:', error);
      // Log detallado de la respuesta de error si está disponible
      if (error.response) {
      //  console.error('Detalles del error de respuesta:', error.response.data);
        // Mostrar mensaje de error del backend si está disponible
        setPasswordError(error.response.data.error || error.response.data.detail || 'Error al cambiar la contraseña.');
      } else {
        // Mostrar mensaje de error genérico si no hay respuesta del backend
        setPasswordError(error.message || 'Error al cambiar la contraseña. Inténtalo de nuevo.');
      }
      // No cerrar el modal automáticamente en caso de error para que el usuario vea el mensaje
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
          <form className="profile-form" onSubmit={handleProfileSubmit}>
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
              <button className="save-button" type="submit" disabled={isSubmittingProfile}>Guardar</button>
              <button className="exit-button" type="button" onClick={handleCancelClick}>Cancelar</button>
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
            <button className="edit-button" onClick={handleEditClick}>Editar Perfil</button>
            <button className="change-password-button" onClick={() => setIsPasswordModalOpen(true)}>Cambiar Contraseña</button>
          </div>
        )}
      </div>

      {/* Modal para cambiar contraseña */}
      {isPasswordModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Cambiar Contraseña</h2>
              <button className="close-button" onClick={() => setIsPasswordModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleChangePasswordSubmit}>
                <div className="form-group">
                  <label htmlFor="current-password">Contraseña Actual:</label>
                  <input
                    type="password"
                    id="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new-password">Nueva Contraseña:</label>
                  <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                {passwordError && <div className="alert error-alert">{passwordError}</div>}
                {passwordSuccess && <div className="alert success-alert">{passwordSuccess}</div>}
                <div className="form-actions">
                  <button className="save-button" type="submit" disabled={isSubmittingPassword}>Cambiar Contraseña</button>
                  <button className="exit-button" type="button" onClick={() => setIsPasswordModalOpen(false)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
