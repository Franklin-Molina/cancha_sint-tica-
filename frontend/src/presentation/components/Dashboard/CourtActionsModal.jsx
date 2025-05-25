import React from 'react';
import '../../../styles/DashboardCanchaTable.css';
 

function CourtActionsModal({ court, onClose, setCourts, onDeleteRequest, onModifyRequest }) {
  return (
    <div className="modal-details">
      
      <div className="modal-contentx">
        <div className='closs-button'> 
          <button className="close-button" onClick={() => setIsPasswordModalOpen(false)}>&times;</button>
        </div>
       
        <h2 className="modal-title">Acciones para {court.name}</h2>
      
        <div className="modal-actions">
          <button onClick={() => onDeleteRequest(court)} className="action-button button-delete">Eliminar</button>
          <button onClick={() => onModifyRequest(court)} className="action-button button-modify">Modificar</button>
          <button onClick={() => handleActivarDesactivar(court.id)} className="action-button button-activate">
            {court.is_active ? 'Desactivar' : 'Activar'}
          </button>
        </div>
        <button onClick={onClose} className="action-button button-cancel">
          Cerrar
        </button>
      </div>
    </div>
  );

  // La lógica de modificar se manejará en la página principal
  // function handleModificar(courtId) {
  //   console.log(`Modificar cancha ${courtId}`);
  //   // TODO: Implementar la lógica para modificar la cancha
  //   // TODO: Navegar a la página de modificación de la cancha
  // }

  // La lógica de activar/desactivar se mantiene aquí por ahora,
  // pero la eliminación se manejará en la página principal con confirmación.
  async function handleActivarDesactivar(courtId) {
    console.log(`${court.is_active ? 'Desactivar' : 'Activar'} cancha ${courtId}`);
    try {
      // Importar ApiCourtRepository solo donde se necesita
      const { ApiCourtRepository } = await import('../../../infrastructure/repositories/api-court-repository');
      const courtRepository = new ApiCourtRepository();
      await courtRepository.updateCourtStatus(courtId, !court.is_active);
      setCourts(prevCourts =>
        prevCourts.map(c =>
          c.id === courtId ? { ...c, is_active: !c.is_active } : c
        )
      );
      onClose();
    } catch (error) {
      console.error(`Error al activar/desactivar la cancha ${courtId}:`, error);
      // TODO: Mostrar un mensaje de error al usuario
    }
  }
}

export default CourtActionsModal;
