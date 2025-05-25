import React, { useState, useEffect, useRef } from 'react';
import { ApiCourtRepository } from '../../infrastructure/repositories/api-court-repository'; // Importar ApiCourtRepository
import CourtActionsModal from '../components/Dashboard/CourtActionsModal.jsx';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import '../../styles/DashboardCanchaTable.css';
import Spinner from '../components/common/Spinner.jsx';



function DashboardManageCourtsPage() {
  const navigate = useNavigate(); // Inicializar useNavigate
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState('');
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [courtToDelete, setCourtToDelete] = useState(null); // Estado para la cancha a eliminar
  const hasFetchedCourts = useRef(false); // Ref para asegurar que fetchCourts se llame solo una vez
  // Eliminar estado courtToModify


  const courtRepository = new ApiCourtRepository();

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true);
        const courtsData = await courtRepository.getCourts();
        setCourts(courtsData);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    // Solo llamar a fetchCourts si no se ha llamado antes
    if (!hasFetchedCourts.current) {
      fetchCourts();
      hasFetchedCourts.current = true;
    }
  }, []);

  const handleSuspendCourt = async (courtId) => {
    try {
      setActionStatus('Suspendiendo cancha...');
      await courtRepository.updateCourtStatus(courtId, false);
      // Actualizar la lista de canchas para reflejar el cambio
      setCourts(prevCourts =>
        prevCourts.map(c => c.id === courtId ? { ...c, is_active: false } : c)
      );
      setActionStatus('Cancha suspendida exitosamente.');
      setTimeout(() => setActionStatus(''), 3000); // Ocultar mensaje después de 3s
    } catch (error) {
      console.error(`Error suspending court ${courtId}:`, error);
      setActionStatus(`Error al suspender cancha: ${error.message}`);
    }
  };

  const handleReactivateCourt = async (courtId) => {
    try {
      setActionStatus('Reactivando cancha...');
      await courtRepository.updateCourtStatus(courtId, true);
      // Actualizar la lista de canchas para reflejar el cambio
      setCourts(prevCourts =>
        prevCourts.map(c => c.id === courtId ? { ...c, is_active: true } : c)
      );
      setActionStatus('Cancha reactivada exitosamente.');
      setTimeout(() => setActionStatus(''), 3000); // Ocultar mensaje después de 3s
    } catch (error) {
      console.error(`Error reactivating court ${courtId}:`, error);
      setActionStatus(`Error al reactivar cancha: ${error.message}`);
    }
  };

  const handleDeleteRequest = (court) => {
    setCourtToDelete(court); // Establecer la cancha a eliminar para mostrar el modal de confirmación
    handleCloseModal(); // Cerrar el modal de acciones
  };

  const handleConfirmDelete = async () => {
    if (!courtToDelete) return;

    try {
      setActionStatus(`Eliminando cancha ${courtToDelete.name}...`);
      await courtRepository.deleteCourt(courtToDelete.id);
      setCourts(prevCourts => prevCourts.filter(c => c.id !== courtToDelete.id));
      setActionStatus(`Cancha ${courtToDelete.name} eliminada exitosamente.`);
      setTimeout(() => setActionStatus(''), 3000);
    } catch (error) {
      console.error(`Error al eliminar la cancha ${courtToDelete.id}:`, error);
      setActionStatus(`Error al eliminar cancha ${courtToDelete.name}: ${error.message}`);
    } finally {
      setCourtToDelete(null); // Cerrar el modal de confirmación
    }
  };

  const handleCancelDelete = () => {
    setCourtToDelete(null); // Cerrar el modal de confirmación sin eliminar
  };

  const handleModifyRequest = (court) => {
    handleCloseModal(); // Cerrar el modal de acciones
    navigate(`/dashboard/manage-courts/${court.id}`); // Navegar a la nueva página de modificación
  };

  // Eliminar funciones handleUpdateCourt y handleCancelModify


  const handleOpenModal = (court) => {
    setSelectedCourt(court);
  };

  const handleCloseModal = () => {
    setSelectedCourt(null);
  };

  if (loading) {
    return <Spinner />; 
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1 className="dashboard-page-title">Gestión de Canchas</h1>
       {actionStatus && (
        <div className="messages">
          <div className={`alert ${actionStatus.includes('Error') ? 'error-alert' : 'success-alert'}`}>
            {actionStatus}
          </div>
        </div>
      )}
      {/* Contenido de la sección de gestión de canchas */}
      {/* <p>Aquí se listarán y gestionarán las canchas.</p> */}
      {/* TODO: Implementar tabla de canchas */}

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {courts.map(court => (
            <tr key={court.id}>
              <td>{court.id}</td>
              <td>{court.name}</td>
              <td>{court.price}</td>
              <td>{court.is_active ? 'Activa' : 'Suspendida'}</td>
              <td>
                <button
                  onClick={() => handleOpenModal(court)}
                  className="action-button button-more"
                >
                  Ver más
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedCourt && (
        <CourtActionsModal
          court={selectedCourt}
          onClose={handleCloseModal}
          setCourts={setCourts}
          onDeleteRequest={handleDeleteRequest}
          onModifyRequest={handleModifyRequest} // Pasar la nueva prop
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      {courtToDelete && (
        <div className="modal-details"> {/* Reutilizar clases de estilo si es posible */}
          <div className="modal-contentx">
            <h2 className="modal-title">Confirmar Eliminación</h2>
            <p>¿Está seguro de que desea eliminar la cancha "{courtToDelete.name}"?</p>
            <div className="modal-actions">
              <button onClick={handleConfirmDelete} className="action-button button-delete">Sí, eliminar</button>
              <button onClick={handleCancelDelete} className="action-button button-cancel">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Eliminar renderizado condicional del formulario de modificación */}
      {/* {courtToModify && (
        <CourtModifyForm
          court={courtToModify}
          onSave={handleUpdateCourt}
          onCancel={handleCancelModify}
        />
      )} */}




    </div>
  );
}

export default DashboardManageCourtsPage;