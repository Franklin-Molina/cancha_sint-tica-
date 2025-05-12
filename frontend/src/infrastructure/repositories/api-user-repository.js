import api from '../api/api.js'; // Importar la instancia de axios configurada
import { IUserRepository } from '../../domain/repositories/user-repository.js';
// import { User } from '../../domain/entities/user'; // Si se define una entidad User en frontend

/**
 * Implementación del repositorio de usuarios que utiliza la API REST.
 */
export class ApiUserRepository extends IUserRepository {
  /**
   * Obtiene una lista de todos los usuarios, con filtros opcionales.
   * @param {object} [filters] - Filtros opcionales (ej. { role: 'admin' }).
   * @returns {Promise<object[]>} Una promesa que resuelve con un array de objetos de usuario.
   */
  async getAllUsers(filters) {
    try {
      // El endpoint /api/users/manage-admins/ ya filtra por role='admin' en el backend (AdminManagementViewSet)
      // Si se necesitan otros filtros, se pueden pasar como params.
      const response = await api.get('/users/manage-admins/', { params: filters });
      // return response.data.map(userData => new User(userData)); // Si se usa entidad User
      return response.data;
    } catch (error) {
      console.error('Error fetching users from API:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario admin de cancha.
   * @param {object} userData - Datos del usuario a crear.
   * @returns {Promise<object>} Una promesa que resuelve con el objeto del usuario creado.
   */
  async createAdminUser(userData) {
    try {
      // Usar el endpoint /api/users/admin/register/ que ya existe y está protegido
      const response = await api.post('/users/admin/register/', userData);
      // return new User(response.data); // Si se usa entidad User
      return response.data;
    } catch (error) {
      console.error('Error creating admin user via API:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado (activo/inactivo) de un usuario.
   * @param {number} userId - El ID del usuario.
   * @param {boolean} isActive - El nuevo estado de activación.
   * @returns {Promise<object>} Una promesa que resuelve con el objeto del usuario actualizado.
   */
  async updateUserStatus(userId, isActive) {
    try {
      const action = isActive ? 'reactivate' : 'suspend';
      // Usar el endpoint /api/users/manage-admins/<id>/[suspend|reactivate]/
      const response = await api.patch(`/users/manage-admins/${userId}/${action}/`);
      // return new User(response.data); // Si la API devuelve el usuario actualizado
      return response.data; // O simplemente un mensaje de éxito
    } catch (error) {
      console.error(`Error updating user ${userId} status via API:`, error);
      throw error;
    }
  }

  /**
   * Elimina un usuario.
   * @param {number} userId - El ID del usuario.
   * @returns {Promise<void>} Una promesa que resuelve cuando el usuario ha sido eliminado.
   */
  async deleteUser(userId) {
    try {
      // Usar el endpoint /api/users/manage-admins/<id>/
      await api.delete(`/users/manage-admins/${userId}/`);
    } catch (error) {
      console.error(`Error deleting user ${userId} via API:`, error);
      throw error;
    }
  }
}
