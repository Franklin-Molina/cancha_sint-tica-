import React, { useState, useEffect } from 'react';
// No importar estilos específicos, usar clases globales o de dashboard
import '../../../styles/DashboardCanchaTable.css'; // Importar estilos de modal si son necesarios para las clases modal-details/modal-contentx
import useButtonDisable from '../../hooks/useButtonDisable.js'; // Importar el hook personalizado

function CourtModifyForm({ court, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    is_active: true,
    characteristics: ''
  });

  useEffect(() => {
    if (court) {
      setFormData({
        name: court.name || '',
        price: court.price || '',
        is_active: court.is_active !== undefined ? court.is_active : true,
        characteristics: court.characteristics || ''
      });
    }
  }, [court]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Usar el hook para el envío del formulario
  const [isSubmitting, handleSubmit] = useButtonDisable(async (e) => {
    e.preventDefault();
    await onSave(court.id, formData); // Llamar a la función onSave pasada por props
  });

  return (
    <div className="modal-details"> {/* Contenedor principal del modal */}
      <div className="modal-contentx"> {/* Contenido del modal */}
        <div className="widget"> {/* Usar clase de estilo del dashboard */}
          <div className="widget-header">
            <div className="widget-title">Modificar Cancha: {court?.name}</div> {/* Usar clase de estilo del dashboard */}
          </div>
          <div className="widget-content"> {/* Usar clase de estilo del dashboard */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}> {/* Mantener estilos en línea por ahora */}
                <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre:</label> {/* Mantener estilos en línea por ahora */}
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}> {/* Mantener estilos en línea por ahora */}
                <label htmlFor="price" style={{ display: 'block', marginBottom: '0.5rem' }}>Precio:</label> {/* Mantener estilos en línea por ahora */}
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}> {/* Mantener estilos en línea por ahora */}
                <label htmlFor="characteristics" style={{ display: 'block', marginBottom: '0.5rem' }}>Características:</label> {/* Mantener estilos en línea por ahora */}
                <textarea
                  id="characteristics"
                  name="characteristics"
                  value={formData.characteristics}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}> {/* Mantener estilos en línea por ahora */}
                <label htmlFor="is_active" style={{ display: 'block', marginBottom: '0.5rem' }}>Activa:</label> {/* Mantener estilos en línea por ahora */}
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-actions"> {/* Reutilizar clases de estilo si es posible */}
                <button type="submit" className="action-button button-modify" disabled={isSubmitting}>Guardar Cambios</button> {/* Reutilizar clases de estilo si es posible */}
                <button type="button" onClick={onCancel} className="action-button button-cancel">Cancelar</button> {/* Reutilizar clases de estilo si es posible */}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourtModifyForm;
