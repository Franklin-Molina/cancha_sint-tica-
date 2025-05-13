import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import LogoutButton from '../components/Auth/LogoutButton.jsx';
import '../../styles/ProfilePage.css'; // Importar estilos específicos

function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="profile-container">Cargando perfil...</div>;
  }

  if (!user) {
    return <div className="profile-container">Usuario no autenticado. Por favor, inicia sesión.</div>;
  }

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
        </div>
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
