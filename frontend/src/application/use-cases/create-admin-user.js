import { IUserRepository } from '../../domain/repositories/user-repository.js';

/**
 * Caso de uso para crear un nuevo usuario admin de cancha en el frontend.
 */
export class CreateAdminUserUseCase {
  /**
   * @param {IUserRepository} userRepository - Una implementación del repositorio de usuarios.
   */
  constructor(userRepository) {
    if (!(userRepository instanceof IUserRepository)) {
      throw new Error('userRepository must be an instance of IUserRepository');
    }
    this.userRepository = userRepository;
  }

  /**
   * Ejecuta el caso de uso para crear un usuario admin.
   * @param {object} userData - Datos del usuario a crear.
   * @returns {Promise<object>} Una promesa que resuelve con el objeto del usuario creado.
   */
  async execute(userData) {
    return this.userRepository.createAdminUser(userData);
  }
}
