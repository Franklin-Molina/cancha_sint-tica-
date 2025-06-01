// frontend/src/application/use-cases/create-booking.js

/**
 * @class CreateBookingUseCase
 * @description Caso de uso para crear una nueva reserva.
 */
export class CreateBookingUseCase {
    /**
     * @param {BookingRepository} bookingRepository - El repositorio de reservas.
     */
    constructor(bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    /**
     * Ejecuta el caso de uso para crear una reserva.
     * @param {string} courtId - El ID de la cancha.
     * @param {string} startTime - La hora de inicio de la reserva (formato ISO 8601).
     * @param {string} endTime - La hora de fin de la reserva (formato ISO 8601).
     * @returns {Promise<object>} Los datos de la reserva creada.
     * @throws {Error} Si ocurre un error al crear la reserva.
     */
    async execute(courtId, startTime, endTime) {
        // Aquí se podría añadir lógica de validación de negocio antes de llamar al repositorio
        // Por ejemplo, verificar si el usuario tiene permisos para reservar, etc.

        try {
            const bookingData = {
                court: parseInt(courtId), // Convertir courtId a entero
                start_time: startTime,
                end_time: endTime,
                // Otros campos necesarios para la reserva, como el usuario, se manejarían en el backend
            };
            return await this.bookingRepository.createBooking(bookingData);
        } catch (error) {
            console.error("Error en CreateBookingUseCase:", error);
            throw new Error("No se pudo crear la reserva.");
        }
    }
}

// TODO: Definir la interfaz BookingRepository en frontend/src/domain/repositories/booking_repository.js
// TODO: Implementar ApiBookingRepository en frontend/src/infrastructure/repositories/api-booking-repository.js
