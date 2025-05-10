import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../../styles/Header.css'; // Importar el archivo CSS


function Header({ openAuthModal }) { // Recibir openAuthModal como prop
  const { isAuthenticated, user } = useAuth(); // Obtener user del contexto

  return (
    <header className="app-header">
      <Link to="/"> {/* Envolver el título con Link a la página de inicio */}
        <div className="app-header-title">Inicio</div> {/* Puedes reemplazar esto con el logo o nombre de la app */}
      </Link>
      <nav className="app-nav">
        {!isAuthenticated && (
          <>
            {/* Usar un div con onClick para abrir el modal */}
            <div onClick={openAuthModal} style={{ cursor: 'pointer' }}>Iniciar Sesión</div>
            <Link to="/register">Registrar</Link>
          </>
        )}
        {isAuthenticated && (
          <>
            {/* Aquí se podrían añadir enlaces de navegación para usuarios autenticados */}
            <Link to="/courts">Canchas</Link>
            <Link to="/profile">Perfil</Link>
            {/* Mostrar enlace al dashboard solo si el usuario es admin */}
            {user && user.is_staff && (
              <Link to="/dashboard">Dashboard</Link>
            )}
            {/* TODO: Añadir botón de cerrar sesión */}
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
