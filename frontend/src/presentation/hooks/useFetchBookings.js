import { useState, useEffect } from 'react';
import { useUseCases } from '../context/UseCaseContext';

/**
 * Hook personalizado para obtener la lista de reservas.
 * Encapsula la lógica de carga, estado de carga y manejo de errores.
 * @returns {object} Un objeto con la lista de reservas, estado de carga y error.
 */
export const useFetchBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getBookingsUseCase } = useUseCases();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const bookingsList = await getBookingsUseCase.execute();
        setBookings(bookingsList);
      } catch (err) {
        setError(err);
        console.error('Error al obtener reservas en useFetchBookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [getBookingsUseCase]); // Dependencia del caso de uso

  return { bookings, loading, error };
};
