import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importar useNavigate
import '../../styles/HomePage.css';
import '../../styles/dashboard.css';
import '../../styles/CourtDetailPage.css';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal'; // Importar el componente Modal
import { format, startOfWeek, addDays, setHours, setMinutes } from 'date-fns';
import useButtonDisable from '../hooks/useButtonDisable.js';
import WeeklyAvailabilityCalendar from '../pages/WeeklyAvailabilityCalendar.jsx';
import { Check, Icon } from 'lucide-react';
import { soccerBall } from '@lucide/lab';

// Importar los casos de uso y la implementación del repositorio
import { useRepositories } from '../context/RepositoryContext';
import { useUseCases } from '../context/UseCaseContext';

function CourtDetailPage() {
  const { courtId } = useParams();
  const navigate = useNavigate(); // Inicializar useNavigate
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
  const [showLoginModal, setShowLoginModal] = useState(false); // Nuevo estado para el modal de login

  // Estados para el modal de confirmación de reserva
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingDetailsToConfirm, setBookingDetailsToConfirm] = useState(null);

  // Estado para los datos de disponibilidad semanal del calendario
  const [weeklyAvailability, setWeeklyAvailability] = useState({});
  const [loadingWeeklyAvailability, setLoadingWeeklyAvailability] = useState(false);
  const [weeklyAvailabilityError, setWeeklyAvailabilityError] = useState(null);
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Función para obtener los detalles de la cancha usando el caso de uso
  const fetchCourtDetails = useCallback(async () => {
    if (!courtId) return;

    try {
      setLoading(true);
      setError(null);
      const courtDetails = await getCourtByIdUseCase.execute(courtId);
      setCourt(courtDetails);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
      console.error(`Error al obtener detalles de la cancha ${courtId}:`, err);
    }
  }, [courtId, getCourtByIdUseCase]);

  useEffect(() => {
    fetchCourtDetails();
  }, [fetchCourtDetails]);

  // Efecto para cargar la disponibilidad semanal cuando se cargan los detalles de la cancha
  useEffect(() => {
    if (court) {
      console.log("DEBUG Frontend: useEffect para disponibilidad semanal activado.");
      fetchWeeklyAvailability();
    }
  }, [court, courtId, currentWeekStartDate, getWeeklyAvailabilityUseCase]);

  // Función para obtener la disponibilidad semanal para el calendario
  const fetchWeeklyAvailability = async () => {
    console.log("DEBUG Frontend: fetchWeeklyAvailability llamada.");
    setLoadingWeeklyAvailability(true);
    setWeeklyAvailabilityError(null);

    const sunday = addDays(currentWeekStartDate, 6);
    const endOfSunday = setMinutes(setHours(sunday, 23), 59);

    const formattedStartTime = currentWeekStartDate.toISOString();
    const formattedEndTime = endOfSunday.toISOString();

    try {
      const weeklyAvailabilityResults = await getWeeklyAvailabilityUseCase.execute(courtId, formattedStartTime, formattedEndTime);
      console.log("DEBUG Frontend: Respuesta de disponibilidad semanal recibida:", weeklyAvailabilityResults);
      setWeeklyAvailability({ ...weeklyAvailabilityResults });
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
      const [year, month, day] = date.split('-').map(Number);
      const baseDate = new Date(year, month - 1, day);

      const startDateTime = setMinutes(setHours(baseDate, hour), 0);
      const endDateTime = setMinutes(setHours(baseDate, hour + 1), 0);

      const formattedStartTime = startDateTime.toISOString();
      const formattedEndTime = endDateTime.toISOString();

      setBookingDetailsToConfirm({
        courtId,
        startDateTime,
        endDateTime,
        formattedStartTime,
        formattedEndTime,
        courtName: court?.name,
        price: court?.price,
      });
      setShowConfirmModal(true);

    } catch (err) {
      setBookingError("Error al preparar la reserva. Inténtalo de nuevo.");
      console.error('Error preparing booking:', err.response ? err.response.data : err.message);
    } finally {
      setIsBooking(false);
    }
  };

  // Función para confirmar la reserva
  const confirmBooking = async () => {
    if (!bookingDetailsToConfirm) return;

    setIsBooking(true);
    setBookingError(null);
    setBookingSuccess(false);
    setShowConfirmModal(false);

    try {
      await createBookingUseCase.execute(
        bookingDetailsToConfirm.courtId,
        bookingDetailsToConfirm.formattedStartTime,
        bookingDetailsToConfirm.formattedEndTime
      );
      setBookingSuccess(true);
      fetchWeeklyAvailability();
    } catch (err) {
      console.log("DEBUG: Error en confirmBooking:", err); // Añadir log para depuración
      console.log("DEBUG: err.response:", err.response);
      console.log("DEBUG: err.response.status:", err.response ? err.response.status : 'N/A');
      console.log("DEBUG: err.message:", err.message); // Log del mensaje de error

      // Manejo de errores de autenticación
      // Verificamos si es un error 401 de Axios o si el mensaje de error indica falta de autenticación
      if ((err.response && err.response.status === 401) || (err.message === "No se pudo crear la reserva.")) {
        setBookingError(null); // Limpiar el mensaje de error de reserva
        setShowLoginModal(true); // Mostrar el modal de inicio de sesión
      } else {
        setBookingError("Error al crear la reserva. Inténtalo de nuevo.");
      }
      console.error('Error creating booking:', err.response ? err.response.data : err.message);
    } finally {
      setIsBooking(false);
      setBookingDetailsToConfirm(null);
    }
  };

  const cancelConfirmation = () => {
    setShowConfirmModal(false);
    setBookingDetailsToConfirm(null);
    setIsBooking(false);
  };

  // Función para cerrar el modal de login y redirigir
  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    navigate('/login'); // Redirigir al usuario a la página de login
  };

  // Días de la semana y horas para el calendario
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const hoursOfDay = Array.from({ length: 18 }, (_, i) => {
    const startHour24 = i + 6;
    const endHour24 = startHour24 + 1;
    const tempStartDate = setMinutes(setHours(new Date(), startHour24), 0);
    const tempEndDate = setMinutes(setHours(new Date(), endHour24), 0);
    return `${format(tempStartDate, 'h:mm a')} - ${format(tempEndDate, 'h:mm a')}`;
  });

  const handlePreviousWeek = () => {
    setCurrentWeekStartDate(addDays(currentWeekStartDate, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStartDate(addDays(currentWeekStartDate, 7));
  };

  const openModal = (image) => {
    setSelectedImage(image.image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="court-detail-loading">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="court-detail-error">
        <div className="error-content">
          <h2>¡Oops! Algo salió mal</h2>
          <p>Error al cargar detalles de la cancha: {error.message}</p>
          <button className="retry-button" onClick={fetchCourtDetails}>
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!court) {
    return (
      <div className="court-detail-not-found">
        <div className="not-found-content">
          <h2>Cancha no encontrada</h2>
          <p>Lo sentimos, no pudimos encontrar la cancha que buscas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="court-detail-container">


      {/* Header de la cancha */}


      <div className="availability-section">
        <div className="availability-header">
          <div className="test">
            <div className="header-left">
              <div className="header-icon">
                {/* Icono de cancha, puedes usar un icono de Lucide React si es necesario */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg>
              </div>
              <div className="header-text">
                <h1 className="header-title">{court.name}</h1>
              </div>
            </div>
            <div className="container-price">
              <div className="court-price-badge">
                <span className="price-label">Precio por hora</span>
                <span className="price-value">${court.price}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Información de la cancha */}
      <div className="court-info-section">
        {court.description && (
          <div className="court-description">
            <h3>Descripción</h3>
            <p>{court.description}</p>
          </div>
        )}

        {court.characteristics && (
          <div className="court-characteristics">
            <h3>Características</h3>
            <p>{court.characteristics}</p>
          </div>
        )}
      </div>
      {/* Stats Cards */}
     {/*  <div className="stats-container">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-text">
              <p className="stat-label">Slots Disponibles</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-text">
              <p className="stat-label">Disponibilidad</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Galería de imágenes */}
      {court.images && court.images.length > 0 && (
        <div className="court-gallery-section">
          <div className='sub-content-imagen'>
            <h3>Galería</h3>
            <div className="court-image-gallery">
              {court.images.map(image => (
                <div
                  key={image.id}
                  className="gallery-image-container"
                  onClick={() => openModal(image)}
                >
                  <img
                    src={image.image}
                    alt={`Imagen de ${court.name}`}
                    className="gallery-image"
                  />
                  <div className="image-overlay">
                    <span className="view-icon">👁</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Test button*/}
      <div class="availability-container-b">
        <div class="availability-header-moder">
          <div class="header-content-b">
            <div class="header-title-b">
              <div class="header-icon">📅</div>
              <div class="header-text">
                <h1>Reservas</h1>
                <p>Gestiona tu horario disponible</p>
              </div>
            </div>
            <div class="week-navigation-b">
              <button class="nav-button-b" onClick={handlePreviousWeek}
                aria-label="Semana anterior">
                ← Anterior
              </button>
              <span className="current-week-b">
                {format(currentWeekStartDate, 'dd/MM/yyyy')} - {format(addDays(currentWeekStartDate, 6), 'dd/MM/yyyy')}
              </span>

              <button class="nav-button-b"
                onClick={handleNextWeek}
                aria-label="Semana siguiente">
                Siguiente →
              </button>
            </div>
            <div class="legend">
              <div class="legend-item legend-disponible">                             
                  <Check className="icon-check" />                           
                <span>Disponible</span>
              </div>
              <div class="legend-item legend-ocupado">
                <Icon iconNode={soccerBall} className="iconsoccer" />
                <span>Ocupado</span>
              </div>

            </div>
          </div>
        </div>


      </div>
      {/* Sección de disponibilidad */}
      <div className="availability-section">

        <div className="calendar-container">
          <WeeklyAvailabilityCalendar
            weeklyAvailability={weeklyAvailability}
            loadingWeeklyAvailability={loadingWeeklyAvailability}
            weeklyAvailabilityError={weeklyAvailabilityError}
            onTimeSlotClick={handleCellClick}
            daysOfWeek={daysOfWeek}
            hoursOfDay={hoursOfDay}
            monday={currentWeekStartDate}
          />
        </div>
      </div>

      {/* Mensajes de estado */}
      {bookingError && (
        <div className="booking-message booking-error">
          <span className="message-icon">⚠️</span>
          <span>{bookingError}</span>
        </div>
      )}

      {bookingSuccess && (
        <div className="booking-message booking-success">
          <span className="message-icon">✅</span>
          <span>¡Reserva creada con éxito!</span>
        </div>
      )}

      {/* Modal de imagen expandida */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={closeModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Imagen expandida" className="modal-expanded-image" />
            <button className="modal-close-button" onClick={closeModal}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación de reserva */}
      {showConfirmModal && bookingDetailsToConfirm && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-content">
            <div className="modal-headerx">
              <h2 className="modal-title">Confirmar reservación </h2>
            </div>

            <div className="modal-body">
              <p className="confirmation-question">¿Estás seguro de que deseas reservar esta cancha?</p>

              <div className="booking-details">
                <div className="detail-item">
                  <span className="detail-label">Cancha:</span>
                  <span className="detail-value">{bookingDetailsToConfirm.courtName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">{format(bookingDetailsToConfirm.startDateTime, 'dd/MM/yyyy')}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Hora:</span>
                  <span className="detail-value">
                    {format(bookingDetailsToConfirm.startDateTime, 'h:mm a')} - {format(bookingDetailsToConfirm.endDateTime, 'h:mm a')}
                  </span>
                </div>
                <div className="detail-item price-item">
                  <span className="detail-label">Precio:</span>
                  <span className="detail-value price-highlight">${bookingDetailsToConfirm.price}</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={confirmBooking}
                className="action-button confirm-button"
                disabled={isBooking}
              >
                {isBooking ? 'Procesando...' : 'Confirmar Reserva'}
              </button>
              <button
                onClick={cancelConfirmation}
                className="action-button cancel-button"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nuevo Modal para solicitar inicio de sesión */}
      <Modal
        show={showLoginModal}
        onClose={handleCloseLoginModal}
        title="Acceso Requerido"
      >
        <p>Para reservar una cancha, debes estar registrado e iniciar sesión.</p>
        <button onClick={handleCloseLoginModal} className="modal-button">
          Ir a Iniciar Sesión
        </button>
      </Modal>
    </div>
  );
}

export default CourtDetailPage;
