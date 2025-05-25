import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
// Importar el caso de uso y la implementación del repositorio
import { GetCourtsUseCase } from '../../application/use-cases/get-courts.js';
import { ApiCourtRepository } from '../../infrastructure/repositories/api-court-repository.js';
import Spinner from '../components/common/Spinner.jsx';

import '../../styles/HomePage.css';
import '../../styles/dashboard.css';

import AuthPage from '../components/Auth/AuthPage.jsx'; // Importar AuthPage


function HomePage({ openAuthModal }) { // Recibir openAuthModal como prop
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Estado showAuthModal eliminado, se manejará en el componente padre (Layout)

  // Crear instancias del repositorio y caso de uso
  // En una aplicación real, esto se haría a través de inyección de dependencias
  const courtRepository = new ApiCourtRepository();
  const getCourtsUseCase = new GetCourtsUseCase(courtRepository);

  // Ref para rastrear si el efecto ya se ejecutó
  const effectRan = useRef(false);

  useEffect(() => {
    // Usar el ref para asegurar que el efecto solo se ejecute una vez en desarrollo (StrictMode)
    if (effectRan.current === false) {
      // Función para obtener las canchas usando el caso de uso
      const fetchCourts = async () => {
        try {
          setLoading(true);
          // Llamar al caso de uso en lugar de llamar directamente a la API
          const courtsList = await getCourtsUseCase.execute();
          setCourts(courtsList); // Guardar la lista de canchas en el estado
          setLoading(false);
        } catch (err) {
          setError(err);
          setLoading(false);
          console.error('Error al obtener canchas:', err);
        }
      };

      fetchCourts(); // Llamar a la función al montar el componente
      
      // Marcar que el efecto ya se ejecutó
      effectRan.current = true;
    }

    // Función de limpieza (opcional para este caso, pero buena práctica)
    return () => {
      // Resetear el ref si el componente se desmonta (útil para pruebas)
      // effectRan.current = false; 
    };

  }, []); // El array vacío asegura que se ejecute solo una vez al montar (después del primer ciclo de StrictMode)

  // Funciones para controlar el modal de autenticación (ahora pasadas como props)
  // const openAuthModal = () => {
  //     setShowAuthModal(true);
  // };

  // const closeAuthModal = () => {
  //     setShowAuthModal(false);
  // };


  if (loading) {
    return <Spinner />; 
  }

  if (error) {
    return <div className="home-content" style={{ color: 'red' }}>Error al cargar canchas: {error.message}</div>;
  }

  return (
    <div className="home-content"> {/* Usar clase de estilo para el contenido */}
      <h1>Canchas Disponibles</h1>

      {courts.length === 0 ? (
      <p>No hay canchas disponibles en este momento.</p>
    ) : (
      <div className="courts-list"> {/* Contenedor para la lista de canchas */}
        {courts.map(court => (
          <div key={court.id} className="court-item" style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}> {/* Estilo básico de item */}
            <h2>{court.name}</h2>
            <p>Precio por hora: ${court.price}</p>
            {court.description && <p>{court.description}</p>}
            {court.characteristics && <p>{court.characteristics}</p>}

            {/* Mostrar imágenes si existen */}
            {court.images && court.images.length > 0 && (
              <div className="gallery" style={{ marginTop: '1rem' }}> {/* Usar clase de estilo de galería */}
                {court.images.map(image => (
                  <div key={image.id} className="image-container"> {/* Usar clase de estilo de imagen */}
                    {/* La URL de la imagen ya viene completa del backend */}
                    <img src={`${image.image}`} alt={`Imagen de ${court.name}`} className="image-preview" /> {/* Usar clase de estilo de previsualización */}
                     <div className="dark-overlay"></div> {/* Overlay */}
                  </div>
                ))}
              </div>
            )}

            {/* Botón para ver detalles */}
            <Link to={`/courts/${court.id}`} style={{ display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#4a89dc', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
              Ver más
            </Link>

            {/* TODO: Añadir botón para reservar */}
          </div>
        ))}
      </div>
    )}
  </div>
  );
}

export default HomePage;
