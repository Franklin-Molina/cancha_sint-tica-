import { IBookingRepository } from '../../domain/repositories/booking-repository'; // Importar la interfaz del repositorio
import { Booking } from '../../domain/entities/booking'; // Importar la entidad Booking

/**
 * Caso de uso para obtener la lista de reservas.
 * Esta clase reside en la capa de Aplicación y orquesta la obtención de datos
 * utilizando la interfaz del repositorio de Dominio.
 */
export class GetBookingsUseCase {
  /**
   * @param {IBookingRepository} bookingRepository - Una implementación del repositorio de reservas.
   */
  constructor(bookingRepository) {
    this.bookingRepository = bookingRepository;
  }

  /**
   * Ejecuta el caso de uso para obtener la lista de reservas.
   * @returns {Promise<Booking[]>} Una promesa que resuelve con un array de entidades Booking.
   */
  async execute() {
    return this.bookingRepository.getBookings();
  }
}
