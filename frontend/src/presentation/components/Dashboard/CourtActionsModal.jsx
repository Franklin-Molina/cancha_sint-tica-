import React from 'react';
import '../../../styles/DashboardCanchaTable.css';
import useButtonDisable from '../../hooks/useButtonDisable.js'; // Importar el hook personalizado
 

function CourtActionsModal({ court, onClose, setCourts, onDeleteRequest, onModifyRequest }) {
  return (
    <div className="modal-details">
      
      <div className="modal-contentx">
        <div className='closs-button'> 
          <button className="close-button" onClick={onClose }>&times;</button>
        </div>       
        <h2 className="modal-title">Acciones para {court.name}</h2>
        <div className="modal-actions">
          <button onClick={() => onDeleteRequest(court)} className="action-button button-delete">Eliminar</button>
          <button onClick={() => onModifyRequest(court)} className="action-button button-modify">Modificar</button>
          <button onClick={() => handleActivarDesactivar(court.id)} className="action-button button-activate">
            {court.is_active ? 'Desactivar' : 'Activar'}
          </button>
        </div>       
      </div>
    </div>
  );

  // La lógica de modificar se manejará en la página principal
  // function handleModificar(courtId) {
  //   console.log(`Modificar cancha ${courtId}`);
  //   // TODO: Implementar la lógica para modificar la cancha
  //   // TODO: Navegar a la página de modificación de la cancha
  // }

  // Usar el hook para la acción de activar/desactivar
  const [isActivatingDeactivating, handleActivarDesactivarClick] = useButtonDisable(async () => {
    console.log(`${court.is_active ? 'Desactivar' : 'Activar'} cancha ${court.id}`);
    try {
      const { ApiCourtRepository } = await import('../../../infrastructure/repositories/api-court-repository');
      const courtRepository = new ApiCourtRepository();
      await courtRepository.updateCourtStatus(court.id, !court.is_active);
      setCourts(prevCourts =>
        prevCourts.map(c =>
          c.id === court.id ? { ...c, is_active: !c.is_active } : c
        )
      );
      onClose();
    } catch (error) {
      console.error(`Error al activar/desactivar la cancha ${court.id}:`, error);
      // TODO: Mostrar un mensaje de error al usuario
      throw error; // Re-lanzar el error para que el hook lo capture
    }
  });

  // Usar el hook para la acción de eliminar
  const [isDeleting, handleDeleteClick] = useButtonDisable(async () => {
    await onDeleteRequest(court);
  });

  // Usar el hook para la acción de modificar
  const [isModifying, handleModifyClick] = useButtonDisable(async () => {
    await onModifyRequest(court);
  });

  return (
    <div className="modal-details">
      
      <div className="modal-contentx">
        <div className='closs-button'> 
          <button className="close-button" onClick={onClose }>&times;</button>
        </div>       
        <h2 className="modal-title">Acciones para {court.name}</h2>
        <div className="modal-actions">
          <button onClick={handleDeleteClick} className="action-button button-delete" disabled={isDeleting}>Eliminar</button>
          <button onClick={handleModifyClick} className="action-button button-modify" disabled={isModifying}>Modificar</button>
          <button onClick={handleActivarDesactivarClick} className="action-button button-activate" disabled={isActivatingDeactivating}>
            {court.is_active ? 'Desactivar' : 'Activar'}
          </button>
        </div>       
      </div>
    </div>
  );
}

export default CourtActionsModal;
