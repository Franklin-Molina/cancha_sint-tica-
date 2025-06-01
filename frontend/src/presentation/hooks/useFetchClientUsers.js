import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para obtener la lista de usuarios cliente.
 * Encapsula la lógica de carga, estado de carga y manejo de errores.
 * @param {object} getUserListUseCase - Instancia del caso de uso GetUserListUseCase.
 * @param {object} user - Objeto de usuario autenticado (para determinar si se debe cargar).
 * @returns {object} Un objeto con la lista de usuarios, estado de carga, error y una función para recargar.
 */
export const useFetchClientUsers = (getUserListUseCase, user) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await getUserListUseCase.execute({ role: 'cliente' });
      const fetchedUsers = Array.isArray(response) ? response : response.results || response.users || [];
      setUsers(fetchedUsers);
    } catch (err) {
      setError(err);
      console.error('Error al obtener usuarios cliente en useFetchClientUsers:', err);
    } finally {
      setLoading(false);
    }
  }, [getUserListUseCase, user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
};
