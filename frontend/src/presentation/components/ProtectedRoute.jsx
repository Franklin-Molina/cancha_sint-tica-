import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../presentation/context/AuthContext.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    // Si el usuario no está autenticado, redirigir a la página de login
    return <Navigate to="/auth" replace />;
  }

  // Verificar si el usuario es administrador
  if (user && !user.is_staff) {
    // Si el usuario no es administrador, redirigir a la página principal
    return <Navigate to="/" replace />;
  }

  // Si el usuario está autenticado y es administrador, renderizar los componentes hijos (la página solicitada)
  return children;
}

export default ProtectedRoute;
