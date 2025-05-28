import React, { useEffect, useState, useMemo } from 'react'; // Importar useMemo
import { useAuth } from '../context/AuthContext.jsx'; // Corregir la ruta de importación
import Spinner from '../components/common/Spinner.jsx';
import useButtonDisable from '../hooks/useButtonDisable.js'; // Importar el hook personalizado

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


  // Instanciar repositorio y casos de uso usando useMemo para asegurar estabilidad
  const userRepository = useMemo(() => new ApiUserRepository(), []);
  const getUserListUseCase = useMemo(() => new GetUserListUseCase(userRepository), [userRepository]);
  const deleteUserUseCase = useMemo(() => new DeleteUserUseCase(userRepository), [userRepository]);
  // Ya no necesitamos instanciar UpdateUserStatusUseCase
  // const updateUserStatusUseCase = useMemo(() => new UpdateUserStatusUseCase(userRepository), [userRepository]);

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
  }, [user, getUserListUseCase]); // Dependencia del usuario del contexto y del caso de uso

  // Usar el hook para suspender usuario
  const [isSuspending, handleSuspendUserClick] = useButtonDisable(async (userId) => {
    try {
      setActionStatus('Suspendiendo usuario...');
      await userRepository.updateClientUserStatus(userId, false);
      setClientUsers(prevUsers =>
        prevUsers.map(u => u.id === userId ? { ...u, is_active: false } : u)
      );
      setActionStatus('Usuario suspendido exitosamente.');
      setTimeout(() => setActionStatus(''), 3000);
    } catch (err) {
      console.error(`Error suspending user ${userId}:`, err);
      setActionStatus(`Error al suspender usuario: ${err.message}`);
      throw err;
    }
  });

  // Usar el hook para reactivar usuario
  const [isReactivating, handleReactivateUserClick] = useButtonDisable(async (userId) => {
    try {
      setActionStatus('Reactivando usuario...');
      await userRepository.updateClientUserStatus(userId, true);
      setClientUsers(prevUsers =>
        prevUsers.map(u => u.id === userId ? { ...u, is_active: true } : u)
      );
      setActionStatus('Usuario reactivado exitosamente.');
      setTimeout(() => setActionStatus(''), 3000);
    } catch (err) {
      console.error(`Error reactivating user ${userId}:`, err);
      setActionStatus(`Error al reactivar usuario: ${err.message}`);
      throw err;
    }
  });

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

  // Usar el hook para manejar la eliminación después de la confirmación
  const [isDeleting, proceedDeleteClick] = useButtonDisable(async () => {
    if (userToDelete) {
      try {
        setActionStatus('Eliminando usuario...');
        await deleteUserUseCase.execute(userToDelete.id);
        setClientUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));
        setActionStatus('Usuario eliminado exitosamente.');
        setTimeout(() => setActionStatus(''), 3000);
      } catch (err) {
        console.error(`Error deleting user ${userToDelete.id}:`, err);
        setActionStatus(`Error al eliminar usuario: ${err.message}`);
        throw err;
      } finally {
        cancelDelete();
      }
    }
  });

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
    return <Spinner />; 
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
            onClick={() => handleSuspendUserClick(clientUser.id)}
            className="action-button button-suspend"
            disabled={isSuspending}
          >
            Suspender
          </button>
        ) : (
          <button
            onClick={() => handleReactivateUserClick(clientUser.id)}
            className="action-button button-reactivate"
            disabled={isReactivating}
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
              <button onClick={proceedDeleteClick} className="action-button button-delete" disabled={isDeleting}>Sí, Eliminar</button>
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
