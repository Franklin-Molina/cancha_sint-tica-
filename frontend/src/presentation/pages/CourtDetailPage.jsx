import { useState, useEffect, useCallback } from 'react'; // Importar useCallback
import { useParams } from 'react-router-dom';
// Eliminar importación directa de api
import '../../styles/HomePage.css';
import '../../styles/dashboard.css';
import '../../styles/CourtDetailPage.css';
import Spinner from '../components/common/Spinner';
import { format, startOfWeek, addDays, setHours, setMinutes, isWithinInterval, parseISO } from 'date-fns'; // Importar parseISO
import useButtonDisable from '../hooks/useButtonDisable.js'; // Importar el hook personalizado
import WeeklyAvailabilityCalendar from '../pages/WeeklyAvailabilityCalendar.jsx'

// Importar los casos de uso y la implementación del repositorio
import { useRepositories } from '../context/RepositoryContext';
import { useUseCases } from '../context/UseCaseContext';


function CourtDetailPage() {
  const { courtId } = useParams();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Obtener repositorios y casos de uso del contexto
  const { courtRepository, bookingRepository } = useRepositories();
  const { getCourtByIdUseCase, checkAvailabilityUseCase, getWeeklyAvailabilityUseCase, createBookingUseCase } = useUseCases();

  // Estados para manejar la creación de reserva desde el calendario
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Estados para el modal de confirmación de reserva
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingDetailsToConfirm, setBookingDetailsToConfirm] = useState(null);

  // Estado para los datos de disponibilidad semanal del calendario
  const [weeklyAvailability, setWeeklyAvailability] = useState({});
  const [loadingWeeklyAvailability, setLoadingWeeklyAvailability] = useState(false);
  const [weeklyAvailabilityError, setWeeklyAvailabilityError] = useState(null);
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Estado para la fecha de inicio de la semana actual


  // Función para obtener los detalles de la cancha usando el caso de uso (memorizada con useCallback)
  const fetchCourtDetails = useCallback(async () => {
    if (!courtId) return; // No intentar cargar si no hay courtId

    try {
      setLoading(true);
      setError(null); // Limpiar errores anteriores
      // Llamar al caso de uso
      const courtDetails = await getCourtByIdUseCase.execute(courtId);
      setCourt(courtDetails);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
      console.error(`Error al obtener detalles de la cancha ${courtId}:`, err);
    }
  }, [courtId, getCourtByIdUseCase]); // Dependencias: courtId y el caso de uso

  useEffect(() => {
    fetchCourtDetails();
  }, [fetchCourtDetails]); // Dependencia de la función memorizada

  // Efecto para cargar la disponibilidad semanal cuando se cargan los detalles de la cancha
  useEffect(() => {
      if (court) {
          console.log("DEBUG Frontend: useEffect para disponibilidad semanal activado."); // Debug print
          fetchWeeklyAvailability(); // Restaurada la llamada para cargar el calendario
      }
  }, [court, courtId, currentWeekStartDate, getWeeklyAvailabilityUseCase]); // Añadimos court a las dependencias

  // Función para obtener la disponibilidad semanal para el calendario (optimizada)
  const fetchWeeklyAvailability = async () => {
      console.log("DEBUG Frontend: fetchWeeklyAvailability llamada."); // Debug print
      setLoadingWeeklyAvailability(true);
      setWeeklyAvailabilityError(null);
      // Obtener el domingo de la semana actual (fin del día)
      const sunday = addDays(currentWeekStartDate, 6);
      const endOfSunday = setMinutes(setHours(sunday, 23), 59); // Fin del día domingo

      const formattedStartTime = currentWeekStartDate.toISOString();
      const formattedEndTime = endOfSunday.toISOString();

      const availabilityData = {};
      const hours = Array.from({ length: 18 }, (_, i) => i + 6); // Horas de 6 AM a 11 PM (23)

      try {
          // Realizar una sola solicitud de disponibilidad para toda la semana usando el caso de uso optimizado
          const weeklyAvailabilityResults = await getWeeklyAvailabilityUseCase.execute(courtId, formattedStartTime, formattedEndTime);

          console.log("DEBUG Frontend: Respuesta de disponibilidad semanal recibida:", weeklyAvailabilityResults); // Debug print

          // Asignar directamente la respuesta del backend al estado de disponibilidad semanal
          // Asumiendo que el backend ya devuelve el formato correcto { 'YYYY-MM-DD': { hour: boolean, ... }, ... }
          setWeeklyAvailability({ ...weeklyAvailabilityResults }); // Crear una nueva copia del objeto
       //   console.log("DEBUG Frontend: Estado weeklyAvailability actualizado:", JSON.stringify(weeklyAvailabilityResults, null, 2)); // Debug print
          setLoadingWeeklyAvailability(false);

      } catch (err) {
          setWeeklyAvailabilityError("Error al cargar la disponibilidad semanal.");
          setLoadingWeeklyAvailability(false);
          console.error('Error fetching weekly availability:', err);
      }
  };


  // Función para manejar el clic en una celda de disponibilidad del calendario
  const handleCellClick = async (date, hour) => {
      setIsBooking(true);
      setBookingError(null);
      setBookingSuccess(false);

      console.log("DEBUG: handleCellClick - date:", date, "hour:", hour);

      try {
          // Construir las horas de inicio y fin para la reserva (rango de 1 hora)
          // Construir la fecha base en la zona horaria local para evitar desfases
          const [year, month, day] = date.split('-').map(Number);
          const baseDate = new Date(year, month - 1, day); // month - 1 porque los meses son 0-indexados

          const startDateTime = setMinutes(setHours(baseDate, hour), 0);
          const endDateTime = setMinutes(setHours(baseDate, hour + 1), 0);

          const formattedStartTime = startDateTime.toISOString();
          const formattedEndTime = endDateTime.toISOString();

          console.log("DEBUG: handleCellClick - startDateTime:", startDateTime, "endDateTime:", endDateTime);
          console.log("DEBUG: handleCellClick - formattedStartTime:", formattedStartTime, "formattedEndTime:", formattedEndTime);
          console.log("DEBUG: handleCellClick - court.name:", court?.name, "court.price:", court?.price);

          // En lugar de reservar directamente, mostrar el modal de confirmación
          setBookingDetailsToConfirm({
            courtId,
            startDateTime,
            endDateTime,
            formattedStartTime,
            formattedEndTime,
            courtName: court?.name, // Pasar el nombre de la cancha para el modal (usar optional chaining)
            price: court?.price, // Pasar el precio para el modal (usar optional chaining)
          });
          setShowConfirmModal(true);

          console.log("DEBUG: handleCellClick - bookingDetailsToConfirm:", {
            courtId,
            startDateTime,
            endDateTime,
            formattedStartTime,
            formattedEndTime,
            courtName: court?.name,
            price: court?.price,
          });

      } catch (err) {
          setBookingError("Error al preparar la reserva. Inténtalo de nuevo.");
          console.error('Error preparing booking:', err.response ? err.response.data : err.message);
      } finally {
          setIsBooking(false);
      }
  };

  // Nueva función para confirmar la reserva después de la aprobación del usuario
  const confirmBooking = async () => {
    if (!bookingDetailsToConfirm) return;

    setIsBooking(true);
    setBookingError(null);
    setBookingSuccess(false);
    setShowConfirmModal(false); // Cerrar el modal

    try {
      await createBookingUseCase.execute(
        bookingDetailsToConfirm.courtId,
        bookingDetailsToConfirm.formattedStartTime,
        bookingDetailsToConfirm.formattedEndTime
      );
      setBookingSuccess(true);
      fetchWeeklyAvailability(); // Refrescar la disponibilidad
    } catch (err) {
      setBookingError("Error al crear la reserva. Inténtalo de nuevo.");
      console.error('Error creating booking:', err.response ? err.response.data : err.message);
    } finally {
      setIsBooking(false);
      setBookingDetailsToConfirm(null); // Limpiar detalles de confirmación
    }
  };

  const cancelConfirmation = () => {
    setShowConfirmModal(false);
    setBookingDetailsToConfirm(null);
    setIsBooking(false); // Resetear el estado de booking
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

  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });

  const handlePreviousWeek = () => {
    setCurrentWeekStartDate(addDays(currentWeekStartDate, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStartDate(addDays(currentWeekStartDate, 7));
  };

  // Funciones para el modal de imagen expandida
  const openModal = (image) => {
    setSelectedImage(image.image); // Asumiendo que image.image es la URL de la imagen
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

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
      <div>
        <button onClick={handlePreviousWeek}>Semana Anterior</button>
        <button onClick={handleNextWeek}>Semana Siguiente</button>
      </div>
      <WeeklyAvailabilityCalendar
        weeklyAvailability={weeklyAvailability}
        loadingWeeklyAvailability={loadingWeeklyAvailability}
        weeklyAvailabilityError={weeklyAvailabilityError}
        onTimeSlotClick={handleCellClick} // Pasar la función de manejo de clic
        daysOfWeek={daysOfWeek}
        hoursOfDay={hoursOfDay}
        monday={currentWeekStartDate} // Pasar la fecha de inicio de la semana actual
      />


      

      {/* Mostrar mensajes de éxito o error de la reserva */}
      {bookingError && (
          <div style={{ color: 'red', marginTop: '1rem' }}>{bookingError}</div>
      )}

      {bookingSuccess && (
          <div style={{ color: 'green', marginTop: '1rem', fontWeight: 'bold' }}>¡Reserva creada con éxito</div>
      )}


      {/* Modal para mostrar la imagen expandida */}
      {selectedImage && (
        <div className="modal-overlay" onClick={closeModal}> {/* Overlay oscuro para cerrar el modal */}
          <div className="mod" onClick={(e) => e.stopPropagation()}> {/* Contenido del modal, detener propagación del clic */}
            <img src={selectedImage} alt="Imagen expandida" className="modal-image" /> {/* Imagen expandida */}
            <button className="modal-close-btn" onClick={closeModal}>✕</button> {/* Botón de cerrar */}
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Reserva */}
      {showConfirmModal && bookingDetailsToConfirm && (
        <div className="modal-overlay">
          <div className="modal-contentx"> {/* Usar la misma clase de estilo que otros modales */}
            <h2 className='modal-title'>Confirmar Reserva</h2>
            <p>¿Estás seguro de que deseas reservar la cancha:</p>
            <p><strong>Cancha:</strong> {bookingDetailsToConfirm.courtName}</p>
            <p><strong>Fecha:</strong> {format(bookingDetailsToConfirm.startDateTime, 'dd/MM/yyyy')}</p>
            <p><strong>Hora:</strong> {format(bookingDetailsToConfirm.startDateTime, 'h:mm a')} - {format(bookingDetailsToConfirm.endDateTime, 'h:mm a')}</p>
            <p><strong>Precio:</strong> ${bookingDetailsToConfirm.price}</p>
            <div className="modal-actions">
              <button onClick={confirmBooking} className="action-button button-confirm" disabled={isBooking}>Confirmar</button>
              <button onClick={cancelConfirmation} className="action-button button-cancel">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourtDetailPage;
