import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import useButtonDisable from '../../hooks/useButtonDisable.js'; // Importar el hook personalizado

/**
 * Componente de botón para cerrar sesión.
 * Utiliza el contexto de autenticación para llamar a la función logout.
 * @returns {JSX.Element} El botón de cerrar sesión.
 */
const LogoutButton = () => {
  const { logout } = useAuth();

  // Usar el hook para manejar el logout
  const [isLoggingOut, handleLogout] = useButtonDisable(async () => {
    await logout();
  });

  return (
    <button onClick={handleLogout} disabled={isLoggingOut}>
      Cerrar Sesión
    </button>
  );
};

export default LogoutButton;
