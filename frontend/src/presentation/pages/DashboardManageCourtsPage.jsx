import React, { useState, useEffect } from 'react';
import { ApiCourtRepository } from '../../infrastructure/repositories/api-court-repository'; // Importar ApiCourtRepository

function DashboardManageCourtsPage() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState('');
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

    fetchCourts();
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


  if (loading) {
    return <div>Cargando canchas...</div>;
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
                {court.is_active ? (
                  <button onClick={() => handleSuspendCourt(court.id)} className="action-button button-suspend">
                    Suspender
                  </button>
                ) : (
                  <button onClick={() => handleReactivateCourt(court.id)} className="action-button button-reactivate">
                    Reactivar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DashboardManageCourtsPage;
