import React from 'react';
import '../../../styles/DashboardCanchaTable.css';
import useButtonDisable from '../../hooks/useButtonDisable.js'; // Importar el hook personalizado
 

function CourtActionsModal({ court, onClose, onDeleteRequest, onModifyRequest, onToggleActiveStatus }) {
  // Usar el hook para la acción de activar/desactivar
  const [isActivatingDeactivating, handleActivarDesactivarClick] = useButtonDisable(async () => {
    await onToggleActiveStatus(court.id, !court.is_active);
    onClose(); // Cerrar el modal después de la acción
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
          <button className="close-button" onClick={onClose}>&times;</button>
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
