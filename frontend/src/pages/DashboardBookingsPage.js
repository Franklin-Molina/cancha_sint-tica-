import React, { useEffect, useState } from 'react';
import api from '../utils/api'; // Importar la utilidad de la API
import '../styles/dashboard.css'; // Reutilizar estilos del dashboard

function DashboardBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Función para obtener la lista de reservas
    const fetchBookings = async () => {
      try {
        setLoading(true);
        // Realizar solicitud GET a la URL correcta generada por el router: /api/bookings/bookings/
        const response = await api.get('/bookings/bookings/');
        console.log('Respuesta de reservas:', response.data); // Log para verificar la estructura
        // Asumir que la respuesta es un array plano (ya que la paginación no está activa globalmente)
        setBookings(response.data); // Guardar la lista de reservas en el estado
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
        console.error('Error al obtener reservas:', err.response ? err.response.data : err.message);
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
