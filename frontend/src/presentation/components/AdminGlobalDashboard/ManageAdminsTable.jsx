import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom'; // Para acceder al contexto del Outlet
import '../../../styles/AdminGlobalDashboard.css'; // Importar los estilos
import Spinner from '../common/Spinner';
import useButtonDisable from '../../hooks/useButtonDisable.js'; // Importar el hook personalizado

function ManageAdminsTable() {
  // Acceder a los datos y funciones pasados a través del contexto del Outlet
  const { adminUsers, loading, error, fetchAdminUsers, handleSuspendUser, handleReactivateUser, handleDeleteUser } = useOutletContext();

  // Estado para controlar la visibilidad del modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Estado para almacenar la información del administrador a eliminar
  const [adminToDelete, setAdminToDelete] = useState(null);

  // Función para abrir el modal de confirmación
  const confirmDelete = (admin) => {
    setAdminToDelete(admin);
    setShowDeleteModal(true);
  };

  // Función para cerrar el modal de confirmación
  const cancelDelete = () => {
    setAdminToDelete(null);
    setShowDeleteModal(false);
  };

  // Usar el hook para manejar la eliminación después de la confirmación
  const [isDeleting, proceedDelete] = useButtonDisable(async () => {
    if (adminToDelete) {
      await handleDeleteUser(adminToDelete.id);
      cancelDelete(); // Cerrar el modal después de la eliminación
    }
  });

  // El loading y error se manejan en AdminGlobalDashboardPage, aquí solo mostramos la tabla o mensaje
  if (loading) {
    return <Spinner/>;  // O un spinner más elaborado
  }

  if (error) {
    // El error principal se muestra en la página padre, aquí podríamos mostrar un mensaje específico si es necesario
    return <p style={{ color: 'red' }}>Error al cargar la lista de administradores.</p>;
  }

  return (
    <div>
      <h1 className="page-title">Gestionar Administradores de Cancha</h1>
    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
 <div className="align-right">
  <Link to="/adminglobal/register-admin" style={{ marginRight: '10px' }}>
    <button className="action-button button-create">➕</button>
  </Link>
</div>

</div>


      {adminUsers.length === 0 ? (
        <p>No hay administradores de cancha registrados.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
             {/*  <th>ID</th> */}
              <th>Username</th>
              <th>Email</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map(admin => (
              <tr key={admin.id}>
              {/*   <td>{admin.id}</td> */}
                <td>{admin.username}</td>
                <td>{admin.email}</td>
                <td>{admin.first_name} {admin.last_name}</td>
                <td>
                  <span className={`status ${admin.is_active ? 'status-active' : 'status-suspended'}`}>
                    {admin.is_active ? 'Activo' : ' Suspendido'}
                  </span>
                </td>
                <td>
                  {admin.is_active ? (
                    <button onClick={() => handleSuspendUser(admin.id)} className="action-button button-suspend">🛑 Suspender</button>
                  ) : (
                    <button onClick={() => handleReactivateUser(admin.id)} className="action-button button-reactivate"><img src="/check.png" alt="Reactivar" className="reactivate-icon" />Reactivar</button>
                  )}
                  {/* Modificar el onClick para abrir el modal */}
                  <button onClick={() => confirmDelete(admin)} className="action-button button-delete"> 🗑 Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && adminToDelete && (
        <div className="modal-delete">
          <div className="modal-contentx">
            <h2>Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar al administrador:</p>
            <p><strong>Username:</strong> {adminToDelete.username}</p>
            <p><strong>Email:</strong> {adminToDelete.email}</p>
            <p><strong>Nombre:</strong> {adminToDelete.first_name} {adminToDelete.last_name}</p>
            <div className="modal-actions">
              <button onClick={proceedDelete} className="action-button button-delete" disabled={isDeleting}>Sí, Eliminar</button>
              <button onClick={cancelDelete} className="action-button button-cancel">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageAdminsTable;
