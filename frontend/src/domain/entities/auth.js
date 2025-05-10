/**
 * Entidad de dominio que representa los tokens de autenticación.
 */
export class AuthTokens {
  /**
   * @param {object} data - Los datos para inicializar la entidad AuthTokens.
   * @param {string} data.access - El token de acceso.
   * @param {string} data.refresh - El token de refresco.
   */
  constructor({ access, refresh }) {
    if (!access || !refresh) {
      throw new Error('AuthTokens entity requires access and refresh tokens.');
    }
    this.access = access;
    this.refresh = refresh;
  }
}

/**
 * Entidad de dominio que representa un usuario autenticado.
 */
export class AuthenticatedUser {
  /**
   * @param {object} data - Los datos para inicializar la entidad AuthenticatedUser.
   * @param {number} data.id - El ID del usuario.
   * @param {string} data.username - El nombre de usuario.
   * @param {string} data.email - El email del usuario.
   * @param {boolean} data.is_staff - Indica si el usuario es staff/administrador.
   * @param {string} [data.first_name] - El nombre del usuario.
   * @param {string} [data.last_name] - El apellido del usuario.
   * @param {number} [data.edad] - La edad del usuario.
   * @param {object[]} [data.social_profiles] - Perfiles sociales vinculados.
   */
  constructor({ id, username, email, is_staff, first_name, last_name, edad, social_profiles }) {
    if (id === undefined || !username || !email || is_staff === undefined) {
      throw new Error('AuthenticatedUser entity requires id, username, email, and is_staff.');
    }
    this.id = id;
    this.username = username;
    this.email = email;
    this.is_staff = is_staff;
    this.first_name = first_name;
    this.last_name = last_name;
    this.edad = edad;
    this.social_profiles = social_profiles || [];
  }
}
