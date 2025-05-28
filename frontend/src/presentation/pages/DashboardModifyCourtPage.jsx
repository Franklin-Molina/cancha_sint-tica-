import React, { useState, useEffect, useMemo } from 'react'; // Importar useMemo
import { useParams, useNavigate } from 'react-router-dom'; // Necesario para obtener el ID de la URL y navegar
import { ApiCourtRepository } from '../../infrastructure/repositories/api-court-repository'; // Necesario para obtener y actualizar la cancha
import '../../styles/dashboard.css'; // Usar estilos generales del dashboard
import '../../styles/DashboardCanchaTable.css'; // Mantener estilos de formulario si son necesarios
import Spinner from '../components/common/Spinner';
import useButtonDisable from '../hooks/useButtonDisable.js'; // Importar el hook personalizado

function DashboardModifyCourtPage() {
  const { id } = useParams(); // Obtener el ID de la cancha de la URL
  const navigate = useNavigate(); // Hook para navegar
  const courtRepository = useMemo(() => new ApiCourtRepository(), []); // Usar useMemo para estabilidad

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    is_active: true,
    characteristics: '',
    images: [], // Estado para las imágenes existentes y nuevas
    imagesToDelete: [], // Estado para IDs de imágenes a eliminar
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState('');

  useEffect(() => {
    const fetchCourt = async () => {
      try {
        setLoading(true);
        const courtData = await courtRepository.getCourtById(id); // Obtener detalles de la cancha por ID
        console.log("courtData:", courtData); // Agregar console.log para inspeccionar los datos
        setFormData({
          name: courtData.name || '',
          price: courtData.price || '',
          is_active: courtData.is_active !== undefined ? courtData.is_active : true,
          characteristics: courtData.characteristics || '',
          images: courtData.images || [], // Cargar imágenes existentes
          imagesToDelete: [],
        });
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
        setActionStatus(`Error al cargar la cancha: ${error.message}`);
      }
    };

    if (id) {
      fetchCourt();
    } else {
      setError(new Error("No se proporcionó ID de cancha."));
      setLoading(false);
    }
  }, [id, courtRepository]); // Dependencia en el ID de la URL y courtRepository

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === 'images') {
      // Agregar nuevas imágenes al estado
      setFormData(prevState => ({
        ...prevState,
        images: [...prevState.images, ...Array.from(files)],
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    // Marcar imagen existente para eliminar o remover imagen nueva del estado
    const imageToRemove = formData.images[indexToRemove];
    if (imageToRemove.id) { // Si la imagen tiene ID, es una imagen existente
      setFormData(prevState => ({
        ...prevState,
        images: prevState.images.filter((_, index) => index !== indexToRemove),
        imagesToDelete: [...prevState.imagesToDelete, imageToRemove.id],
      }));
    } else { // Si no tiene ID, es una imagen nueva que aún no se ha subido
      setFormData(prevState => ({
        ...prevState,
        images: prevState.images.filter((_, index) => index !== indexToRemove),
      }));
    }
  };

  // Usar el hook para el envío del formulario
  const [isSubmitting, handleSubmit] = useButtonDisable(async (e) => {
    e.preventDefault();
    setActionStatus('Guardando cambios...');

    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('is_active', formData.is_active);
    if (formData.characteristics) data.append('characteristics', formData.characteristics);

    // Añadir nuevas imágenes al FormData
    formData.images.forEach(image => {
      if (!image.id) { // Solo añadir imágenes que no tienen ID (son nuevas)
        data.append('images', image); // Usar el mismo nombre 'images' para todos los archivos
      }
    });

    // Añadir IDs de imágenes a eliminar
    if (formData.imagesToDelete.length > 0) {
       // Dependiendo de cómo el backend maneje la eliminación de imágenes,
       // podríamos necesitar enviar una lista de IDs a eliminar.
       // Asumiremos que el backend espera un campo 'images_to_delete' con una lista de IDs.
       data.append('images_to_delete', JSON.stringify(formData.imagesToDelete));
    }

    try {
      // Usar updateCourt que debe soportar FormData y eliminación de imágenes
      await courtRepository.updateCourt(id, data);
      setActionStatus('Cancha actualizada exitosamente.');
      setTimeout(() => {
        setActionStatus('');
        navigate('/dashboard/canchas/manage'); // Navegar de regreso a la lista después de guardar
      }, 2000);
    } catch (error) {
      console.error(`Error al actualizar la cancha ${id}:`, error);
      setActionStatus(`Error al actualizar cancha: ${error.message}`);
      throw error; // Re-lanzar el error para que el hook lo capture
    }
  });

  if (loading) {
    return <Spinner />; 
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1 className="dashboard-page-title">Modificar Cancha: {formData.name}</h1>
       {actionStatus && (
        <div className="messages">
          <div className={`alert ${actionStatus.includes('Error') ? 'error-alert' : 'success-alert'}`}>
            {actionStatus}
          </div>
        </div>
      )}
      <div className="widget">
        <div className="widget-header">
          <div className="widget-title">Detalles de la Cancha</div>
        </div>
        <div className="widget-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Nombre:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price" className="form-label">Precio:</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="characteristics" className="form-label">Características:</label>
              <textarea
                id="characteristics"
                name="characteristics"
                value={formData.characteristics}
                onChange={handleChange}
                className="form-input"
              />
            </div>

         

            {/* Sección de Imágenes (adaptada de CourtForm.jsx) */}
            <div className="form-group">
               <div className="header">
                  <div>Fotos - <span id="photo-count">{formData.images.length}</span>/5 - Puedes agregar un máximo de 5 fotos.</div>
              </div>
              <div className="gallery">
                  {/* Previsualizaciones de imágenes */}
                  {formData.images.map((image, index) => (
                      <div key={image.id || index} className="image-container">
                          {/* Determinar la fuente de la imagen: URL existente o URL temporal para nueva imagen */}
                          <img
                            src={image instanceof File ? URL.createObjectURL(image) : image.image}
                            alt={`Preview ${index}`}
                            className="image-preview"
                          />
                           <div className="dark-overlay"></div>
                          <button type="button" className="close-btn" onClick={() => handleRemoveImage(index)}>✕</button>
                      </div>
                  ))}

                  {/* Botón Agregar foto (adaptado del ejemplo) */}
                  {formData.images.length < 5 && ( // Mostrar solo si no se alcanzó el límite
                      <label htmlFor="images-input" className="image-container">
                          <div className="add-photo">
                              <div className="add-photo-icon">📷</div>
                              <div className="add-photo-text">Agregar foto</div>
                          </div>
                          <input
                              type="file"
                              id="images-input" // Cambiado el ID
                              name="images" // Cambiado el nombre
                              onChange={handleChange}
                              accept="image/*"
                              multiple // Permitir múltiples archivos
                              style={{ display: 'none' }}
                          />
                      </label>
                  )}
              </div>
            </div>


            <div className="modal-actions">
              <button type="submit" className="action-button button-modify" disabled={isSubmitting}>Guardar Cambios</button>
              <button type="button" onClick={() => navigate('/dashboard/canchas/manage')} className="action-button button-cancel">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DashboardModifyCourtPage;
