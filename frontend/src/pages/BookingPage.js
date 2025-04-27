import React, { useState, useEffect } from 'react'; // Importar useEffect
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importar axios
import { useAuth } from '../context/AuthContext'; // Importar useAuth

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
        const response = await axios.get(`http://localhost:8000/courts/${courtId}/`);
        setCourt(response.data);
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
  }, [courtId]);


  const handleSubmit = async (e) => { // Hacer la función asíncrona
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
      // Obtener el token de acceso del localStorage (o del contexto si se prefiere)
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
          setBookingError("No se encontró token de autenticación.");
          return;
      }

      // Realizar la llamada a la API de backend para crear la reserva
      const response = await axios.post('http://localhost:8000/bookings/', {
        court: courtId,
        start_time: startDateTime,
        end_time: endDateTime,
        // El usuario se asigna automáticamente en el backend perform_create
        // El pago se crea automáticamente en el backend perform_create
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Añadir encabezado de autorización
        },
      });

      console.log('Reserva creada exitosamente:', response.data);

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
    }
  };

  if (loading) {
    return <div>Cargando información de la cancha...</div>;
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

        <button type="submit">Confirmar Reserva</button>
      </form>
    </div>
  );
}

export default BookingPage;
