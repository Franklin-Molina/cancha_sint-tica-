import React, { useState } from 'react';
import api from '../../utils/api'; // Importar la utilidad de la API
// Importar estilos si es necesario, o usar clases de dashboard.css

function CourtForm() {
  const [formData, setFormData] = useState({
    name: '',
    characteristics: '',
    price: '',
    description: '',
    images: [], // Cambiado a array para múltiples imágenes
  });
  const [message, setMessage] = useState(null); // Estado para mensajes de éxito/error

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'images') { // Cambiado el nombre a 'images'
      // Convertir FileList a Array y añadir a las imágenes existentes
      setFormData({
        ...formData,
        images: [...formData.images, ...Array.from(files)],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null); // Limpiar mensajes anteriores

    // Crear objeto FormData para enviar archivos
    const data = new FormData();
    data.append('name', formData.name);
    data.append('characteristics', formData.characteristics);
    data.append('price', formData.price);
    data.append('description', formData.description);

    // Añadir cada archivo de imagen al FormData
    formData.images.forEach((image, index) => {
      data.append(`images`, image); // Usar el mismo nombre 'images' para todos los archivos
    });


    try {
      // Enviar datos al backend usando FormData
      const response = await api.post('/courts/', data, {
         headers: {
            'Content-Type': 'multipart/form-data', // Importante para enviar FormData
         },
      });
      console.log('Cancha creada:', response.data);
      setMessage({ type: 'success', text: 'Cancha creada exitosamente!' });
      // Limpiar el formulario después del éxito
      setFormData({
        name: '',
        characteristics: '',
        price: '',
        description: '',
        images: [], // Limpiar array de imágenes
      });
      // Limpiar el input de archivo manualmente si es necesario (puede requerir useRef)
      // e.target.value = null; // Esto limpia el input de archivo
    } catch (error) {
      console.error('Error al crear cancha:', error.response ? error.response.data : error.message);
      // Intentar mostrar errores de validación específicos del backend
      if (error.response && error.response.data) {
        let errorText = 'Error al crear cancha: ';
        // Verificar si error.response.data es un objeto y si sus valores son arrays
        if (typeof error.response.data === 'object' && error.response.data !== null) {
           try {
              const errorMessages = Object.entries(error.response.data)
                .map(([field, messages]) => {
                   // Asegurarse de que 'messages' sea un array antes de llamar a join
                   const msgArray = Array.isArray(messages) ? messages : [messages];
                   return `${field}: ${msgArray.join(', ')}`;
                })
                .join('; ');
              errorText += errorMessages;
           } catch (formatError) {
              // Si falla el formateo, usar la representación del objeto
              errorText += JSON.stringify(error.response.data);
           }
        } else {
          // Si no es un objeto, usar la respuesta directamente (podría ser un string)
          errorText += error.response.data;
        }
        setMessage({ type: 'error', text: errorText });
      } else {
        // Si no hay error.response o error.response.data
        setMessage({ type: 'error', text: 'Error al crear cancha. Verifica la conexión o los datos.' });
      }
    }
  };

  return (
    <div className="widget"> {/* Usar clase de estilo del dashboard */}
      <div className="widget-header">
        <div className="widget-title">Crear Nueva Cancha</div>
      </div>
      <div className="widget-content">
        {message && (
          <div style={{ color: message.type === 'success' ? 'green' : 'red', marginBottom: '1rem' }}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre:</label>
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

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="characteristics" style={{ display: 'block', marginBottom: '0.5rem' }}>Características:</label>
            <textarea
              id="characteristics"
              name="characteristics"
              value={formData.characteristics}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            ></textarea>
          </div>

           <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem' }}>Descripción:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            ></textarea>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="price" style={{ display: 'block', marginBottom: '0.5rem' }}>Precio:</label>
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

          {/* Campo para las imágenes (adaptado del ejemplo img.html) */}
          <div style={{ marginBottom: '1rem' }}>
             <div className="header"> {/* Usar clase de estilo del ejemplo */}
                <div>Fotos - <span id="photo-count">{formData.images.length}</span>/5 - Puedes agregar un máximo de 5 fotos.</div> {/* Mostrar conteo */}
            </div>
            <div className="gallery"> {/* Usar clase de estilo del ejemplo */}
                {/* Previsualizaciones de imágenes */}
                {formData.images.map((image, index) => (
                    <div key={index} className="image-container"> {/* Usar clase de estilo del ejemplo */}
                        <img src={URL.createObjectURL(image)} alt={`Preview ${index}`} className="image-preview" /> {/* Previsualizar imagen */}
                         <div className="dark-overlay"></div> {/* Overlay */}
                        <button type="button" className="close-btn" onClick={() => handleRemoveImage(index)}>✕</button> {/* Botón eliminar */}
                    </div>
                ))}

                {/* Botón Agregar foto (adaptado del ejemplo) */}
                {formData.images.length < 5 && ( // Mostrar solo si no se alcanzó el límite
                    <label htmlFor="images-input" className="image-container"> {/* Usar clase de estilo del ejemplo */}
                        <div className="add-photo"> {/* Usar clase de estilo del ejemplo */}
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
                            style={{ display: 'none' }} // Ocultar input original
                        />
                    </label>
                )}
            </div>
          </div>


          <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#4a89dc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Crear Cancha
          </button>
        </form>
      </div>
    </div>
  );
}

export default CourtForm;
