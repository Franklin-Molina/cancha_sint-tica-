import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// Eliminar importación directa de api
import '../../styles/HomePage.css';
import '../../styles/dashboard.css';
import '../../styles/CourtDetailPage.css';
import Spinner from '../components/common/Spinner';
import { format, startOfWeek, addDays, setHours, setMinutes, isWithinInterval } from 'date-fns'; // Importar funciones adicionales de date-fns


// Importar los casos de uso y la implementación del repositorio
import { GetCourtByIdUseCase } from '../../application/use-cases/get-court-by-id';
import { CheckAvailabilityUseCase } from '../../application/use-cases/check-availability';
import { GetWeeklyAvailabilityUseCase } from '../../application/use-cases/get-weekly-availability';
import { ApiCourtRepository } from '../../infrastructure/repositories/api-court-repository';
// Eliminar importación directa de api


function CourtDetailPage() {
  const { courtId } = useParams();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Crear instancias del repositorio y casos de uso
  // En una aplicación real, esto se haría a través de inyección de dependencias
  const courtRepository = new ApiCourtRepository();
  const getCourtByIdUseCase = new GetCourtByIdUseCase(courtRepository);
  const checkAvailabilityUseCase = new CheckAvailabilityUseCase(courtRepository);
  const getWeeklyAvailabilityUseCase = new GetWeeklyAvailabilityUseCase(courtRepository);

  // Estado para la selección de disponibilidad (mantener por ahora, aunque el calendario es la prioridad)
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);

  // Estado para los datos de disponibilidad semanal del calendario
  const [weeklyAvailability, setWeeklyAvailability] = useState({});
  const [loadingWeeklyAvailability, setLoadingWeeklyAvailability] = useState(false);
  const [weeklyAvailabilityError, setWeeklyAvailabilityError] = useState(null);


  useEffect(() => {
    // Función para obtener los detalles de la cancha usando el caso de uso
    const fetchCourtDetails = async () => {
      try {
        setLoading(true);
        // Llamar al caso de uso
        const courtDetails = await getCourtByIdUseCase.execute(courtId);
        setCourt(courtDetails);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
        console.error(`Error al obtener detalles de la cancha ${courtId}:`, err);
      }
    };

    if (courtId) {
      fetchCourtDetails();
    }
  }, [courtId]); // Dependencia solo de courtId

  // Efecto para cargar la disponibilidad semanal cuando se cargan los detalles de la cancha
  useEffect(() => {
      if (court) {
          fetchWeeklyAvailability();
      }
  }, [court]); // Cargar disponibilidad cuando los detalles de la cancha estén disponibles


  // Función para abrir el modal con la imagen seleccionada
  const openModal = (image) => {
    setSelectedImage(image.image);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setSelectedImage(null);
  };

  // Función para manejar la verificación de disponibilidad (mantener por ahora)
  const handleCheckAvailability = async () => {
      if (!selectedDate || !startTime || !endTime) {
          setAvailabilityError("Por favor, selecciona fecha y rango de horas.");
          setAvailability(null);
          return;
      }

      setCheckingAvailability(true);
      setAvailability(null);
      setAvailabilityError(null);

      try {
          const startDateTime = new Date(`${selectedDate}T${startTime}:00`);
          const endDateTime = new Date(`${selectedDate}T${endTime}:00`);

          if (startDateTime >= endDateTime) {
              setAvailabilityError("La hora de fin debe ser posterior a la hora de inicio.");
              setCheckingAvailability(false);
              return;
          }

          const formattedStartTime = startDateTime.toISOString();
          const formattedEndTime = endDateTime.toISOString();

          // Llamar al caso de uso para verificar disponibilidad
          const availabilityResults = await checkAvailabilityUseCase.execute(formattedStartTime, formattedEndTime);

          const courtAvailability = availabilityResults.find(item => item.id === parseInt(courtId));

          if (courtAvailability) {
              setAvailability(courtAvailability.is_available);
          } else {
              setAvailabilityError("No se pudo verificar la disponibilidad para esta cancha.");
          }

          setCheckingAvailability(false);

      } catch (err) {
          setAvailabilityError("Error al verificar disponibilidad. Inténtalo de nuevo.");
          setAvailability(null);
          setCheckingAvailability(false);
          console.error('Error checking availability:', err.response ? err.response.data : err.message);
      }
  };

  // Función para obtener la disponibilidad semanal para el calendario
  const fetchWeeklyAvailability = async () => {
      setLoadingWeeklyAvailability(true);
      setWeeklyAvailabilityError(null);
      const today = new Date();
      // Obtener el lunes de la semana actual
      const monday = startOfWeek(today, { weekStartsOn: 1 }); // weekStartsOn: 1 para lunes

      const availabilityData = {};
      const hours = Array.from({ length: 18 }, (_, i) => i + 6); // Horas de 6 AM a 11 PM (23)

      try {
          // Realizar una solicitud de disponibilidad para cada hora de cada día (Lunes a Domingo)
          for (let i = 0; i < 7; i++) { // Lunes (0) a Domingo (6)
              const currentDay = addDays(monday, i);
              const formattedDate = format(currentDay, 'yyyy-MM-dd');
              availabilityData[formattedDate] = {};

              for (const hour of hours) {
                  const startHour = setMinutes(setHours(currentDay, hour), 0);
                  const endHour = setMinutes(setHours(currentDay, hour + 1), 0); // Rango de 1 hora

                  const formattedStartTime = startHour.toISOString();
                  const formattedEndTime = endHour.toISOString();

                  try {
                      // Llamar al caso de uso para verificar disponibilidad para esta hora
                      const availabilityResults = await checkAvailabilityUseCase.execute(formattedStartTime, formattedEndTime);
                      const courtAvailability = availabilityResults.find(item => item.id === parseInt(courtId));

                      if (courtAvailability) {
                          availabilityData[formattedDate][hour] = courtAvailability.is_available;
                      } else {
                           // Si no se encuentra la cancha, asumir no disponible o manejar como error
                           availabilityData[formattedDate][hour] = false; // Asumir no disponible
                      }
                  } catch (hourErr) {
                      console.error(`Error al verificar disponibilidad para ${formattedDate} ${hour}:00`, hourErr);
                      availabilityData[formattedDate][hour] = false; // Asumir no disponible en caso de error
                  }
              }
          }
          setWeeklyAvailability(availabilityData);
          setLoadingWeeklyAvailability(false);

      } catch (err) {
          setWeeklyAvailabilityError("Error al cargar la disponibilidad semanal.");
          setLoadingWeeklyAvailability(false);
          console.error('Error fetching weekly availability:', err);
      }
  };


  // Días de la semana y horas para el calendario
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  // Generar rangos de horas de 6:00 AM a 11:00 PM
  const hoursOfDay = Array.from({ length: 18 }, (_, i) => {
      const startHour24 = i + 6; // Hora de inicio en formato 24 horas (6 a 23)
      const endHour24 = startHour24 + 1; // Hora de fin en formato 24 horas (7 a 24)

      // Crear objetos Date temporales para formatear las horas
      const tempStartDate = setMinutes(setHours(new Date(), startHour24), 0);
      const tempEndDate = setMinutes(setHours(new Date(), endHour24), 0);

      // Formatear a formato de 12 horas (ej: "6:00 AM - 7:00 AM")
      return `${format(tempStartDate, 'h:mm a')} - ${format(tempEndDate, 'h:mm a')}`;
  });


  if (loading) {
    return <Spinner />; // <div className="home-content">Cargando detalles de la cancha...</div>;
  }

  if (error) {
    return <div className="home-content" style={{ color: 'red' }}>Error al cargar detalles de la cancha: {error.message}</div>;
  }

  if (!court) {
      return <div className="home-content">No se encontró la cancha.</div>;
  }

  return (
    <div className="home-content"> {/* Usar clase de estilo para el contenido */}
      <h1>Detalle de la Cancha: {court.name}</h1>

      <p>Precio por hora: ${court.price}</p>
      {court.description && <p>{court.description}</p>}
      {court.characteristics && <p>Características: {court.characteristics}</p>}

      {/* Mostrar imágenes si existen */}
      {court.images && court.images.length > 0 && (
        <div className="gallery gallery-detail" style={{ marginTop: '1rem' }}> {/* Usar clases de estilo de galería y detalle */}
          {court.images.map(image => (
            <div key={image.id} className="image-container" onClick={() => openModal(image)}> {/* Añadir onClick */}
              {/* Construir la URL completa de la imagen: URL base del servidor + URL relativa de la imagen */}
              {/* Eliminar '/api' de la URL base si está presente */}
              {(() => {
                
                return <img src={image.image} alt={`Imagen de ${court.name}`} className="image-preview" />;
                
              })()}
               <div className="dark-overlay"></div> {/* Overlay */}
            </div>
          ))}
        </div>
      )}

      {/* Sección de Disponibilidad y Reserva (Calendario Semanal) */}
      <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
          <h2>Disponibilidad Semanal</h2>
          {loadingWeeklyAvailability ? (
              <div>Cargando disponibilidad semanal...</div>
          ) : weeklyAvailabilityError ? (
              <div style={{ color: 'red' }}>{weeklyAvailabilityError}</div>
          ) : (
              <div className="availability-calendar" style={{ overflowX: 'auto' }}> {/* Contenedor con scroll horizontal */}
                  <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                      <thead>
                          <tr>
                              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Hora</th>
                              {daysOfWeek.map((day, index) => {
                                  const today = new Date();
                                  const monday = startOfWeek(today, { weekStartsOn: 1 });
                                  const currentDay = addDays(monday, index);
                                  const formattedDate = format(currentDay, 'dd/MM'); // Formato día/mes
                                  return (
                                      <th key={day} style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                                          {day} ({formattedDate})
                                      </th>
                                  );
                              })}
                          </tr>
                      </thead>
                      <tbody>
                          {hoursOfDay.map(hour => {
                              const hourNumber = parseInt(hour.split(':')[0]);
                              return (
                                  <tr key={hour}>
                                      <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>{hour}</td>
                                      {daysOfWeek.map((day, index) => {
                                          const today = new Date();
                                          const monday = startOfWeek(today, { weekStartsOn: 1 });
                                          const currentDay = addDays(monday, index);
                                          const formattedDate = format(currentDay, 'yyyy-MM-dd');
                                          const isAvailable = weeklyAvailability[formattedDate] && weeklyAvailability[formattedDate][hourNumber];
                                          const cellColor = isAvailable ? 'lightgreen' : 'salmon'; // Verde para disponible, Rojo para ocupado

                                          return (
                                              <td
                                                  key={`${day}-${hour}`}
                                                  style={{
                                                      border: '1px solid #ccc',
                                                      padding: '8px',
                                                      textAlign: 'center',
                                                      backgroundColor: cellColor,
                                                      cursor: isAvailable ? 'pointer' : 'not-allowed' // Cursor diferente si está disponible
                                                  }}
                                                  // TODO: Añadir onClick para iniciar reserva si está disponible
                                              >
                                                  {/* Puedes mostrar un texto como "Disponible" o "Ocupado" si quieres */}
                                              </td>
                                          );
                                      })}
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          )}
      </div>


      {/* Sección de Verificación de Disponibilidad (mantener por ahora) */}
       <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
          <h2>Verificar Disponibilidad en Rango Específico</h2>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div>
                  <label htmlFor="date" style={{ display: 'block', marginBottom: '0.5rem' }}>Fecha:</label>
                  <input type="date" id="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div>
                  <label htmlFor="start-time" style={{ display: 'block', marginBottom: '0.5rem' }}>Hora Inicio:</label>
                  <input type="time" id="start-time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div>
                  <label htmlFor="end-time" style={{ display: 'block', marginBottom: '0.5rem' }}>Hora Fin:</label>
                  <input type="time" id="end-time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
          </div>
          <button onClick={handleCheckAvailability} disabled={checkingAvailability} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#4a89dc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: checkingAvailability ? 0.7 : 1 }}>
              {checkingAvailability ? 'Verificando...' : 'Verificar Disponibilidad'}
          </button>

          {availabilityError && (
              <div style={{ color: 'red', marginTop: '1rem' }}>{availabilityError}</div>
          )}

          {availability !== null && (
              <div style={{ marginTop: '1rem', fontWeight: 'bold', color: availability ? 'green' : 'red' }}>
                  {availability ? '¡Cancha Disponible!' : 'Cancha No Disponible en este rango.'}
              </div>
          )}

          {/* TODO: Añadir botón de reservar si está disponible */}
           {availability === true && (
               <button style={{ padding: '0.75rem 1.5rem', backgroundColor: '#8cc152', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '1rem' }}>
                   Reservar Ahora
               </button>
           )}
      </div>


      {/* Modal para mostrar la imagen expandida */}
      {selectedImage && (
        <div className="modal-overlay" onClick={closeModal}> {/* Overlay oscuro para cerrar el modal */}
          <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Contenido del modal, detener propagación del clic */}
            <img src={selectedImage} alt="Imagen expandida" className="modal-image" /> {/* Imagen expandida */}
            <button className="modal-close-btn" onClick={closeModal}>✕</button> {/* Botón de cerrar */}
          </div>
        </div>
      )}
    </div>
  );
}

export default CourtDetailPage;
