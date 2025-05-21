import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../../styles/DashboardLayout.css';

function DashboardLayout() {
  const { user, logout } = useAuth();
  const [isCanchasExpanded, setIsCanchasExpanded] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleCanchasMenu = () => {
    setIsCanchasExpanded(!isCanchasExpanded);
  };

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <h2>Cancha Admin</h2>
        </div>
        <div className="dashboard-sidebar-menu">
          <div className="profile-container">
            <div className="profile-img">
              <i className="fas fa-user"></i>
            </div>
            <div className="profile-name">{user.username}</div>
            <div className="profile-role">{user.role}</div>
          </div>

          <Link to="/" className="dashboard-menu-item">
            <i className="fas fa-home"></i>
            <span>Inicio</span>
          </Link>

          <Link to="/dashboard" className="dashboard-menu-item active">
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </Link>

          <div className="dashboard-menu-title">Gestión</div>

          <Link to="/dashboard/reservas" className="dashboard-menu-item">
            <i className="fas fa-calendar-check"></i>
            <span>Reservas</span>
          </Link>

          <div role="button" tabIndex="0" className="dashboard-menu-title" onClick={toggleCanchasMenu} style={{ cursor: 'pointer' }}>
            <i className="fas fa-pencil-alt"></i>
            Canchas
            <i className={`fas fa-chevron-${isCanchasExpanded ? 'up' : 'down'}`}></i>
          </div>
          {isCanchasExpanded && (
            <div className="submenu">
              <Link to="/dashboard/canchas/manage" className="dashboard-menu-item">
                <i className="fas fa-list"></i>
                <span>Gestionar Canchas</span>
              </Link>
              <Link to="/dashboard/canchas/create" className="dashboard-menu-item">
                <i className="fas fa-plus"></i>
                <span>Crear Cancha</span>
              </Link>
            </div>
          )}

          <Link to="/dashboard/usuarios" className="dashboard-menu-item">
            <i className="fas fa-users"></i>
            <span>Usuarios</span>
          </Link>

          <Link to="/dashboard/pagos" className="dashboard-menu-item">
            <i className="fas fa-dollar-sign"></i>
            <span>Pagos</span>
          </Link>

          <Link to="/dashboard/estadisticas" className="dashboard-menu-item">
            <i className="fas fa-chart-line"></i>
            <span>Estadísticas</span>
          </Link>

          <div className="dashboard-menu-title">Cuenta</div>

          <Link to="/dashboard/perfil" className="dashboard-menu-item">
            <i className="fas fa-user"></i>
            <span>Perfil</span>
          </Link>

          <div className="dashboard-menu-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Cerrar Sesión</span>
          </div>
        </div>
      </aside>

      <main className="dashboard-content">
        <div className="dashboard-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
