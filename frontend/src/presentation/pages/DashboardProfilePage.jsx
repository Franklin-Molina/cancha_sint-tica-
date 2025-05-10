import React from 'react';
// Importar useAuth o lógica para obtener datos del perfil

function DashboardProfilePage() {
  // TODO: Obtener datos del perfil del usuario autenticado (desde AuthContext o API)

  const user = { // Datos placeholder por ahora
    username: 'admin_user',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    is_staff: true,
  };

  return (
    <div className="dashboard-page-content"> {/* Usar clase de estilo del dashboard */}
      <h1 className="dashboard-page-title">Perfil del Usuario (Dashboard)</h1>

      {/* Mostrar datos del perfil */}
      <div>
        <p><strong>Usuario:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Nombre:</strong> {user.first_name}</p>
        <p><strong>Apellido:</strong> {user.last_name}</p>
        <p><strong>Es Administrador:</strong> {user.is_staff ? 'Sí' : 'No'}</p>
        {/* Añadir más campos del perfil si están disponibles */}
      </div>

      {/* TODO: Añadir opciones para editar perfil, cambiar contraseña, etc. */}
    </div>
  );
}

export default DashboardProfilePage;
