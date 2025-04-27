import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Header.css'; // Importar el archivo CSS

function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header-title">Mi Aplicación</div> {/* Puedes reemplazar esto con el logo o nombre de la app */}
      <nav className="app-nav">
        {!isAuthenticated && (
          <>
            <Link to="/auth">Iniciar Sesión</Link>
            <Link to="/register">Registrar</Link>
          </>
        )}
        {isAuthenticated && (
          <>
            {/* Aquí se podrían añadir enlaces de navegación para usuarios autenticados */}
            <Link to="/courts">Canchas</Link>
            <Link to="/profile">Perfil</Link>
            {/* TODO: Añadir botón de cerrar sesión */}
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
