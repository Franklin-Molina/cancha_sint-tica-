import api from '../api/api.js'; // Importar la instancia de axios configurada
import { IBookingRepository } from '../../domain/repositories/booking-repository'; // Importar la interfaz del repositorio
import { Booking } from '../../domain/entities/booking'; // Importar la entidad Booking

/**
 * Implementación del repositorio de reservas que utiliza la API REST.
 * Esta clase reside en la capa de Infraestructura e implementa la interfaz IBookingRepository
 * definida en la capa de Dominio.
 */
export class ApiBookingRepository extends IBookingRepository {
  /**
   * Crea una nueva reserva a través de la API.
   * @param {object} bookingData - Los datos para crear la reserva.
   * @param {number} bookingData.court - El ID de la cancha.
   * @param {string} bookingData.start_time - La fecha y hora de inicio (ISO 8601).
   * @param {string} bookingData.end_time - La fecha y hora de fin (ISO 8601).
   * @returns {Promise<Booking>} Una promesa que resuelve con la entidad Booking creada.
   */
  async createBooking(bookingData) {
    try {
      // El token de autorización se adjunta automáticamente por el interceptor de api.js
      const response = await api.post('/bookings/', bookingData);
      // Mapear los datos de la respuesta a una entidad Booking del Dominio
      return new Booking(response.data);
    } catch (error) {
      console.error('Error creating booking via API:', error);
      throw error; // Relanzar el error para que la capa superior lo maneje
    }
  }

  /**
   * Obtiene una lista de todas las reservas desde la API.
   * @returns {Promise<Booking[]>} Una promesa que resuelve con un array de entidades Booking.
   */
  async getBookings() {
    try {
      // El token de autorización se adjunta automáticamente por el interceptor de api.js
      const response = await api.get('/bookings/bookings/'); // Endpoint según DashboardBookingsPage.jsx
      // Mapear los datos de la respuesta a entidades Booking del Dominio
      return response.data.map(bookingData => new Booking(bookingData));
    } catch (error) {
      console.error('Error fetching bookings from API:', error);
      throw error; // Relanzar el error
    }
  }

  // TODO: Implementar otros métodos de IBookingRepository si se añaden
}
