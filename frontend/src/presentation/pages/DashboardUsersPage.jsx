import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // Corregir la ruta de importación

// Casos de uso y repositorios
import { GetUserListUseCase } from '../../application/use-cases/get-user-list.js';
// Importar ApiUserRepository directamente para usar updateClientUserStatus
import { ApiUserRepository } from '../../infrastructure/repositories/api-user-repository.js';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.js';
// Ya no necesitamos importar UpdateUserStatusUseCase si llamamos al repositorio directamente
// import { UpdateUserStatusUseCase } from '../../application/use-cases/update-user-status.js';

import '../../styles/dashboard.css'; // Estilos generales del dashboard
//import '../../styles/AdminGlobalDashboard.css'; // Importar estilos de AdminGlobalDashboard para la tabla
import '../../styles/DashboardUserTable.css';
function DashboardUsersPage() {
  const { user } = useAuth();
  const [clientUsers, setClientUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState(''); // Estado para mensajes de acción

  // Estado para controlar la visibilidad del modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Estado para almacenar la información del usuario a eliminar
  const [userToDelete, setUserToDelete] = useState(null);

  // Estado para controlar la visibilidad del modal de detalles
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  // Estado para almacenar la información del usuario a mostrar en el modal de detalles
  const [userDetails, setUserDetails] = useState(null);


  // Instanciar repositorio y casos de uso
  const userRepository = new ApiUserRepository();
  const getUserListUseCase = new GetUserListUseCase(userRepository);
  // Instanciar DeleteUserUseCase
  const deleteUserUseCase = new DeleteUserUseCase(userRepository);
  // Ya no necesitamos instanciar UpdateUserStatusUseCase
  // const updateUserStatusUseCase = new UpdateUserStatusUseCase(userRepository);

  const fetchClientUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      setActionStatus(''); // Limpiar mensajes de acción
      // Obtener usuarios con rol 'cliente'
      const response = await getUserListUseCase.execute({ role: 'cliente' }); // Corregir el nombre del rol
      console.log("Respuesta completa de usuarios cliente recibida:", response); // Log para depuración
      // Asumir que la lista de usuarios está en response.results si hay paginación, o response directamente si no
      // Si la respuesta es el objeto de URLs del router, esto no funcionará, pero nos ayudará a depurar
      const users = Array.isArray(response) ? response : response.results || response.users || []; // Intentar acceder a la lista
      console.log("Lista de usuarios extraída:", users); // Log para depuración
      setClientUsers(users);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching client users:", err);
      setError(err);
      setClientUsers([]);
      setLoading(false);
      setActionStatus('Error al cargar usuarios.');
    }
  };

  useEffect(() => {
    // Solo cargar datos si el usuario está autenticado (y es admin, aunque la ruta debería estar protegida)
    if (user) {
      fetchClientUsers();
    } else {
      setLoading(false);
    }
  }, [user]); // Dependencia del usuario del contexto

  const handleSuspendUser = async (userId) => {

    try {
      setActionStatus('Suspendiendo usuario...');
      // Usar la nueva función del repositorio para clientes
      await userRepository.updateClientUserStatus(userId, false);
      // Actualizar la lista de usuarios para reflejar el cambio
      setClientUsers(prevUsers =>
        prevUsers.map(u => u.id === userId ? { ...u, is_active: false } : u)
      );
      setActionStatus('Usuario suspendido exitosamente.');
      setTimeout(() => setActionStatus(''), 3000); // Ocultar mensaje después de 3s
    } catch (err) {
      console.error(`Error suspending user ${userId}:`, err);
      setActionStatus(`Error al suspender usuario: ${err.message}`);
    }
  }


  const handleReactivateUser = async (userId) => {

    try {
      setActionStatus('Reactivando usuario...');
      // Usar la nueva función del repositorio para clientes
      await userRepository.updateClientUserStatus(userId, true);
      // Actualizar la lista de usuarios para reflejar el cambio
      setClientUsers(prevUsers =>
        prevUsers.map(u => u.id === userId ? { ...u, is_active: true } : u)
      );
      setActionStatus('Usuario reactivado exitosamente.');
      setTimeout(() => setActionStatus(''), 3000); // Ocultar mensaje después de 3s
    } catch (err) {
      console.error(`Error reactivating user ${userId}:`, err);
      setActionStatus(`Error al reactivar usuario: ${err.message}`);
    }

  };

  // Función para abrir el modal de confirmación
  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Función para cerrar el modal de confirmación
  const cancelDelete = () => {
    setUserToDelete(null);
    setShowDeleteModal(false);
  };

  // Función para manejar la eliminación después de la confirmación
  const proceedDelete = async () => {
    if (userToDelete) {
      try {
        setActionStatus('Eliminando usuario...');
        await deleteUserUseCase.execute(userToDelete.id);
        // Actualizar la lista de usuarios para reflejar la eliminación
        setClientUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));
        setActionStatus('Usuario eliminado exitosamente.');
        setTimeout(() => setActionStatus(''), 3000); // Ocultar mensaje después de 3s
      } catch (err) {
        console.error(`Error deleting user ${userToDelete.id}:`, err);
        setActionStatus(`Error al eliminar usuario: ${err.message}`);
      } finally {
        cancelDelete(); // Cerrar el modal después de la eliminación (éxito o error)
      }
    }
  };

  // Función para abrir el modal de detalles
  const handleViewDetails = (user) => {
    setUserDetails(user);
    setShowDetailsModal(true);
  };

  // Función para cerrar el modal de detalles
  const handleCloseDetailsModal = () => {
    setUserDetails(null);
    setShowDetailsModal(false);
  };


  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error.message}</div>;
  }

  return (
    <div className="user-page-content"> {/* Usar la clase del layout */}
      <h1 className="page-title">Gestión de Usuarios Cliente</h1> {/* Usar page-title */}

      {actionStatus && (
        <div className="messages">
          <div className={`alert ${actionStatus.includes('Error') ? 'error-alert' : 'success-alert'}`}>
            {actionStatus}
          </div>
        </div>
      )}

      {/* Verificar si clientUsers es un array y no está vacío antes de mapear */}
      {Array.isArray(clientUsers) && clientUsers.length === 0 ? (
        <p>No se encontraron usuarios cliente.</p>
      ) : (
        Array.isArray(clientUsers) && ( // Asegurarse de que sea un array antes de renderizar la tabla
          <table className="users-table">
            {/* Usar la clase admin-table */}
            <thead>
              <tr>               
                <th>Usuario</th> 
                <th>Nombre</th>
                <th>Estado</th>
                <th>Acciones</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
  {clientUsers.map(clientUser => (
    <tr key={clientUser.id}>
      <td>{clientUser.username}</td>
      <td>{clientUser.first_name} {clientUser.last_name}</td>
      <td>
        <span className={`status ${clientUser.is_active ? 'status-active' : 'status-suspended'}`}>
          {clientUser.is_active ? 'Activo' : 'Suspendido'}
        </span>
      </td>
      <td>
        {clientUser.is_active ? (
          <button
            onClick={() => handleSuspendUser(clientUser.id)}
            className="action-button button-suspend"
          >
            Suspender
          </button>
        ) : (
          <button
            onClick={() => handleReactivateUser(clientUser.id)}
            className="action-button button-reactivate"
          >
            Reactivar
          </button>
        )}
        <button
          onClick={() => confirmDelete(clientUser)}
          className="action-button button-delete"
        >
          Eliminar
        </button>
      </td>
      <td>
        <button
          onClick={() => handleViewDetails(clientUser)}
          className="action-button button-details"
        >
          Ver más
        </button>
      </td>
    </tr>
  ))}
</tbody>

          
          </table>)
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && userToDelete && (
        <div className="modal-delete">
          <div className="modal-contentx">
            <h2 className='modal-title'>Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar al usuario:</p>
            <p><strong>Usuario:</strong> {userToDelete.username}</p>
            <p><strong>Email:</strong> {userToDelete.email}</p>
            <p><strong>Nombre:</strong> {userToDelete.first_name} {userToDelete.last_name}</p>
            <div className="modal-actions">
              <button onClick={proceedDelete} className="action-button button-delete">Sí, Eliminar</button>
              <button onClick={cancelDelete} className="action-button button-cancel">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles del Usuario */}
      {showDetailsModal && userDetails && (
        <div className="modal-details">
          <div className="modal-contentx">
            <h2 className='modal-title'>Detalles del Usuario</h2>
            <p><strong>ID:</strong> {userDetails.id}</p>
            <p><strong>Usuario:</strong> {userDetails.username}</p>
            <p><strong>Email:</strong> {userDetails.email}</p>
            <p><strong>Nombre:</strong> {userDetails.first_name}</p>
            <p><strong>Apellido:</strong> {userDetails.last_name}</p>
            <p><strong>Rol:</strong> {userDetails.role}</p>
            <p><strong>Estado:</strong> {userDetails.is_active ? 'Activo' : 'Suspendido'}</p>
            {/* Agrega aquí más campos si es necesario */}
            <div className="modal-actions">
              <button onClick={handleCloseDetailsModal} className="action-button button-cancel">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardUsersPage;
