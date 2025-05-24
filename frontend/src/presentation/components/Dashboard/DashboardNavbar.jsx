import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../../styles/DashboardNavbar.css';

function DashboardNavbar({ toggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="dashboard-navbar">
        {/* Botón de hamburguesa para móviles */}
        
        <div  onClick={toggleSidebar}>
          <i className="minimizar fas fa-bars"></i> {/* Icono de hamburguesa */}
        </div>

        {/* Título o logo del dashboard */}
        <div >
          <h2>Administracion</h2>
        </div>

        {/* Información del usuario o elementos de la derecha */}
        <div className="navbar-right">
          <div className="user-profile">          
            <div className="user-avatar">{user.username ? user.username.charAt(0).toUpperCase() : 'U'}</div>
            <div className="user-info">
              <div className="user-name">{user.username}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
        </div>
      </header>
  );
}

export default DashboardNavbar;
