import React, { useEffect, useState } from 'react';
// Eliminar importación directa de api
import '../../styles/dashboard.css'; // Reutilizar estilos del dashboard
 
// Importar el caso de uso y la implementación del repositorio
import { GetBookingsUseCase } from '../../application/use-cases/get-bookings';
import { ApiBookingRepository } from '../../infrastructure/repositories/api-booking-repository';

function DashboardBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Crear instancias del repositorio y caso de uso
  // En una aplicación real, esto se haría a través de inyección de dependencias
  const bookingRepository = new ApiBookingRepository();
  const getBookingsUseCase = new GetBookingsUseCase(bookingRepository);

  useEffect(() => {
    // Función para obtener la lista de reservas usando el caso de uso
    const fetchBookings = async () => {
      try {
        setLoading(true);
        // Llamar al caso de uso
        const bookingsList = await getBookingsUseCase.execute();
        console.log('Respuesta de reservas:', bookingsList); // Log para verificar la estructura
        setBookings(bookingsList); // Guardar la lista de reservas en el estado
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
        console.error('Error al obtener reservas:', err);
      }
    };

    fetchBookings(); // Llamar a la función al montar el componente
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  if (loading) {
    return <div className="dashboard-page-content">Cargando reservas...</div>;
  }

  if (error) {
    return <div className="dashboard-page-content" style={{ color: 'red' }}>Error al cargar reservas: {error.message}</div>;
  }

  return (
    <div className="dashboard-page-content"> {/* Usar clase de estilo del dashboard */}
      <h1 className="dashboard-page-title">Gestión de Reservas</h1>

      {bookings.length === 0 ? (
        <p>No hay reservas registradas.</p>
      ) : (
        <div className="widget"> {/* Usar clase de estilo del dashboard para la tabla */}
            <div className="widget-header">
                <div className="widget-title">Lista de Reservas</div>
            </div>
            <div className="widget-content" style={{ padding: '0' }}> {/* Eliminar padding para la tabla */}
                <table className="recent-orders"> {/* Usar clase de estilo de tabla del dashboard */}
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cancha</th>
                            <th>Usuario</th>
                            <th>Inicio</th>
                            <th>Fin</th>
                            <th>Estado</th>
                            <th>Pago</th>
                            {/* TODO: Añadir columna de Acciones (Ver, Editar, Cancelar) */}
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(booking => (
                            <tr key={booking.id}>
                                <td>{booking.id}</td>
                                <td>{booking.court}</td> {/* Mostrar ID de cancha por ahora */}
                                <td>{booking.user}</td> {/* Mostrar ID de usuario por ahora */}
                                <td>{new Date(booking.start_time).toLocaleString()}</td> {/* Formatear fecha/hora */}
                                <td>{new Date(booking.end_time).toLocaleString()}</td> {/* Formatear fecha/hora */}
                                <td>{booking.status}</td>
                                <td>{booking.payment}</td> {/* Mostrar ID de pago por ahora */}
                                {/* TODO: Añadir celdas de Acciones */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
}

export default DashboardBookingsPage;
