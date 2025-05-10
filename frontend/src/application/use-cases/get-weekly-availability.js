import { ICourtRepository } from '../../domain/repositories/court-repository'; // Importar la interfaz del repositorio

/**
 * Caso de uso para obtener la disponibilidad semanal de una cancha.
 * Esta clase reside en la capa de Aplicación y orquesta la obtención de datos
 * utilizando la interfaz del repositorio de Dominio.
 */
export class GetWeeklyAvailabilityUseCase {
  /**
   * @param {ICourtRepository} courtRepository - Una implementación del repositorio de canchas.
   */
  constructor(courtRepository) {
    if (!(courtRepository instanceof ICourtRepository)) {
      throw new Error('courtRepository must be an instance of ICourtRepository');
    }
    this.courtRepository = courtRepository;
  }

  /**
   * Ejecuta el caso de uso para obtener la disponibilidad semanal.
   * @param {number} courtId - El ID de la cancha.
   * @returns {Promise<object>} Una promesa que resuelve con un objeto que representa la disponibilidad semanal.
   */
  async execute(courtId) {
    // Aquí se podría añadir lógica de aplicación adicional si fuera necesario.
    return this.courtRepository.getWeeklyAvailability(courtId);
  }
}
