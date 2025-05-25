import React, { useState, useEffect } from 'react'; // Importar useEffect
import { useParams, useNavigate } from 'react-router-dom';
// Eliminar importación de axios
import { useAuth } from '../context/AuthContext.jsx'; // Importar useAuth
import Spinner from '../components/common/Spinner.jsx';
import useButtonDisable from '../hooks/useButtonDisable.js'; // Importar el hook personalizado

// Importar el caso de uso y la implementación del repositorio
import { ApiBookingRepository } from '../../infrastructure/repositories/api-booking-repository';
import { CreateBookingUseCase } from '../../application/use-cases/create-booking';
// Importar el repositorio de canchas para obtener detalles
import { ApiCourtRepository } from '../../infrastructure/repositories/api-court-repository';

function BookingPage() {
  const { courtId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth(); // Obtener isAuthenticated y user del contexto

  const [court, setCourt] = useState(null); // Estado para almacenar la información de la cancha
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState(''); // Cambiar nombre a startTime
  const [endTime, setEndTime] = useState(''); // Añadir estado para hora de fin
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado para errores
  const [bookingError, setBookingError] = useState(null); // Estado para errores de reserva

  // Crear instancias del repositorio y caso de uso
  // En una aplicación real, esto se haría a través de inyección de dependencias
  const bookingRepository = new ApiBookingRepository();
  const createBookingUseCase = new CreateBookingUseCase(bookingRepository);
  const courtRepository = new ApiCourtRepository(); // Para obtener detalles de la cancha

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

  // Cargar información de la cancha al montar el componente
  useEffect(() => {
    const fetchCourt = async () => {
      try {
        // Usar el repositorio de canchas para obtener detalles
        const courtDetails = await courtRepository.getCourtById(courtId);
        setCourt(courtDetails);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    if (courtId) {
      fetchCourt();
    } else {
      setError(new Error("ID de cancha no proporcionado."));
      setLoading(false);
    }
  }, [courtId, courtRepository]); // Añadir courtRepository a las dependencias

  // Usar el hook para el envío del formulario
  const [isSubmitting, handleSubmit] = useButtonDisable(async (e) => {
    e.preventDefault();
    setBookingError(null); // Limpiar errores de reserva anteriores

    if (!isAuthenticated) {
      setBookingError("Debes iniciar sesión para hacer una reserva.");
      return;
    }

    // Combinar fecha y hora en formato ISO 8601
    const startDateTime = date && startTime ? `${date}T${startTime}:00Z` : null;
    const endDateTime = date && endTime ? `${date}T${endTime}:00Z` : null;

    if (!startDateTime || !endDateTime) {
        setBookingError("Por favor, selecciona la fecha, hora de inicio y hora de fin.");
        return;
    }

    try {
      // Llamar al caso de uso para crear la reserva
      const bookingData = {
        court: parseInt(courtId, 10), // Asegurarse de que courtId sea un número
        start_time: startDateTime,
        end_time: endDateTime,
      };
      const createdBooking = await createBookingUseCase.execute(bookingData);

      console.log('Reserva creada exitosamente:', createdBooking);

      // Mostrar mensaje de éxito y redirigir
      alert(`Reserva creada exitosamente para la cancha ${court.name}.`);
      navigate('/profile'); // Redirige al perfil del usuario o a una página de confirmación

    } catch (err) {
      console.error('Error al crear reserva:', err);
      if (err.response && err.response.data) {
        // Mostrar errores de validación del backend
        setBookingError(err.response.data.detail || JSON.stringify(err.response.data));
      } else {
        setBookingError('Error al crear la reserva. Inténtalo de nuevo.');
      }
      throw err; // Re-lanzar el error para que el hook lo capture
    }
  });

  if (loading) {
    return <Spinner/>; 
  }

  if (error) {
    return <div>Error al cargar la cancha: {error.message}</div>;
  }

  if (!court) {
      return <div>Cancha no encontrada.</div>;
  }


  return (
    <div>
      <h1>Reservar Cancha: {court.name}</h1>
      <p>Precio por hora: ${court.price}</p>
      {/* TODO: Mostrar información sobre el pago anticipado del 10% */}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="date">Fecha:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="startTime">Hora de Inicio:</label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
         <div>
          <label htmlFor="endTime">Hora de Fin:</label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        {bookingError && <div style={{ color: 'red' }}>{bookingError}</div>} {/* Mostrar errores de reserva */}

        <button type="submit" disabled={isSubmitting}>Confirmar Reserva</button>
      </form>
    </div>
  );
}

export default BookingPage;
