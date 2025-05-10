import { IBookingRepository } from '../../domain/repositories/booking-repository'; // Importar la interfaz del repositorio
import { Booking } from '../../domain/entities/booking'; // Importar la entidad Booking

/**
 * Caso de uso para crear una nueva reserva.
 * Esta clase reside en la capa de Aplicación y orquesta el proceso de creación de reserva
 * utilizando la interfaz del repositorio de Dominio.
 */
export class CreateBookingUseCase {
  /**
   * @param {IBookingRepository} bookingRepository - Una implementación del repositorio de reservas.
   */
  constructor(bookingRepository) {
    if (!(bookingRepository instanceof IBookingRepository)) {
      throw new Error('bookingRepository must be an instance of IBookingRepository');
    }
    this.bookingRepository = bookingRepository;
  }

  /**
   * Ejecuta el caso de uso para crear una reserva.
   * @param {object} bookingData - Los datos para crear la reserva.
   * @param {number} bookingData.court - El ID de la cancha.
   * @param {string} bookingData.start_time - La fecha y hora de inicio (ISO 8601).
   * @param {string} bookingData.end_time - La fecha y hora de fin (ISO 8601).
   * @returns {Promise<Booking>} Una promesa que resuelve con la entidad Booking creada.
   */
  async execute(bookingData) {
    // Aquí se podría añadir lógica de aplicación adicional si fuera necesario
    // (ej. validaciones, notificaciones, etc.) antes o después de llamar al repositorio.
    return this.bookingRepository.createBooking(bookingData);
  }
}
