import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Para el botón de crear
import { useAuth } from '../context/AuthContext.jsx'; // Para verificar el rol del usuario

// Importar casos de uso y repositorios del frontend
import { GetUserListUseCase } from '../../application/use-cases/get-user-list.js';
import { UpdateUserStatusUseCase } from '../../application/use-cases/update-user-status.js'; // Importar
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.js'; // Importar
import { ApiUserRepository } from '../../infrastructure/repositories/api-user-repository.js';

function AdminGlobalDashboardPage() {
  const { user } = useAuth(); // Para verificar si el usuario es adminglobal
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Instanciar repositorio y casos de uso
  const userRepository = new ApiUserRepository();
  const getUserListUseCase = new GetUserListUseCase(userRepository);
  const updateUserStatusUseCase = new UpdateUserStatusUseCase(userRepository); // Instanciar
  const deleteUserUseCase = new DeleteUserUseCase(userRepository); // Instanciar

  const fetchAdminUsers = async () => { // Mover la función fuera de useEffect
    try {
      setLoading(true);
      setError(null); // Limpiar errores previos
      // El backend ya filtra por role='admin' en el endpoint /users/manage-admins/
      const users = await getUserListUseCase.execute(); 
      setAdminUsers(users);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching admin users:", err);
      setError(err);
      setAdminUsers([]); // Limpiar usuarios en caso de error
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo cargar datos si el usuario es adminglobal
    if (user && user.role === 'adminglobal') {
      fetchAdminUsers(); // Carga inicial
    } else {
      setLoading(false);
    }
  }, [user]); // Dependencia del usuario del contexto
  
  const handleSuspendUser = async (userId) => {
    try {
      await updateUserStatusUseCase.execute(userId, false);
      // Actualizar la lista de usuarios para reflejar el cambio
      setAdminUsers(prevUsers => 
        prevUsers.map(u => u.id === userId ? { ...u, is_active: false } : u)
      );
      alert('Administrador suspendido exitosamente.');
    } catch (err) {
      console.error(`Error suspending user ${userId}:`, err);
      alert(`Error al suspender administrador: ${err.message}`);
    }
  };

  const handleReactivateUser = async (userId) => {
    try {
      await updateUserStatusUseCase.execute(userId, true);
      // Actualizar la lista de usuarios para reflejar el cambio
      setAdminUsers(prevUsers => 
        prevUsers.map(u => u.id === userId ? { ...u, is_active: true } : u)
      );
      alert('Administrador reactivado exitosamente.');
    } catch (err) {
      console.error(`Error reactivating user ${userId}:`, err);
      alert(`Error al reactivar administrador: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    // Confirmación antes de eliminar
    if (window.confirm(`¿Estás seguro de que quieres eliminar al administrador con ID ${userId}? Esta acción no se puede deshacer.`)) {
      try {
        await deleteUserUseCase.execute(userId);
        // Actualizar la lista de usuarios para reflejar la eliminación
        setAdminUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        alert('Administrador eliminado exitosamente.');
      } catch (err) {
        console.error(`Error deleting user ${userId}:`, err);
        alert(`Error al eliminar administrador: ${err.message}`);
      }
    }
  };


  if (loading) {
    return <div>Cargando dashboard de Administrador Global...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error al cargar administradores: {error.message}</div>;
  }

  // Verificar si el usuario actual es adminglobal antes de renderizar el contenido sensible
  if (!user || user.role !== 'adminglobal') {
    return <div>Acceso denegado. Debes ser Administrador Global.</div>;
  }

  return (
    <div>
      <h1>Dashboard de Administrador Global</h1>
      <p>Bienvenido, {user.username}.</p>
      
      <h2>Gestionar Administradores de Cancha</h2>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/adminglobal/register-admin" style={{ marginRight: '10px' }}>
          <button>Crear Nuevo Admin de Cancha</button>
        </Link>
        <button onClick={fetchAdminUsers}>Ver/Actualizar Lista de Admins</button>
      </div>

      {adminUsers.length === 0 && !loading ? ( // Añadir !loading para no mostrar si está cargando
        <p>No hay administradores de cancha registrados o no se pudieron cargar.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Username</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Nombre</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Estado</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map(admin => (
              <tr key={admin.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{admin.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{admin.username}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{admin.email}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{admin.first_name} {admin.last_name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{admin.is_active ? 'Activo' : 'Suspendido'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {admin.is_active ? (
                    <button onClick={() => handleSuspendUser(admin.id)} style={{ marginRight: '5px' }}>Suspender</button>
                  ) : (
                    <button onClick={() => handleReactivateUser(admin.id)} style={{ marginRight: '5px' }}>Reactivar</button>
                  )}
                  <button onClick={() => handleDeleteUser(admin.id)} style={{ color: 'red' }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminGlobalDashboardPage;
