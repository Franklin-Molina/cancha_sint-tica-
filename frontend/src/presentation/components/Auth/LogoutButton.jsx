import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Componente de botón para cerrar sesión.
 * Utiliza el contexto de autenticación para llamar a la función logout.
 * @returns {JSX.Element} El botón de cerrar sesión.
 */
const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <button onClick={handleLogout}>
      Cerrar Sesión
    </button>
  );
};

export default LogoutButton;
