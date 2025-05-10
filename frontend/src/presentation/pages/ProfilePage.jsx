import React from 'react'; // No es necesario useContext si solo usas useAuth
import { useAuth } from '../context/AuthContext.jsx'; // Usar useAuth hook
import LogoutButton from '../components/Auth/LogoutButton.jsx'; // Importar LogoutButton

function ProfilePage() {
  const { user, loading } = useAuth(); // Usar useAuth hook y obtener loading

  if (loading) {
    return <div>Cargando perfil...</div>; // Mostrar cargando mientras se obtiene el usuario
  }

  if (!user) {
    // Redirigir al login si no hay usuario autenticado después de cargar
    // La redirección se maneja en el contexto de autenticación si fetchUser falla
    return <div>Usuario no autenticado. Por favor, inicia sesión.</div>;
  }

  return (
    <div>
      <h1>Perfil de Usuario</h1>
      <p><strong>Nombre de usuario:</strong> {user.username}</p>
      <p><strong>Nombre:</strong> {user.first_name}</p>
      <p><strong>Apellido:</strong> {user.last_name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      {user.edad && <p><strong>Edad:</strong> {user.edad}</p>} {/* Mostrar edad si existe */}

      <h2>Cuentas Vinculadas</h2>
      {user.social_profiles && user.social_profiles.length > 0 ? (
        <ul>
          {user.social_profiles.map(profile => (
            <li key={profile.id}>
              Proveedor: {profile.provider}, UID: {profile.uid}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay cuentas sociales vinculadas.</p>
      )}

      <LogoutButton /> {/* Agregar el botón de cerrar sesión */}
    </div>
  );
}

export default ProfilePage;
