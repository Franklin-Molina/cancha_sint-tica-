import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardNavbar from './DashboardNavbar.jsx'; // Importar el nuevo componente Navbar
import '../../../styles/DashboardLayout.css';

function DashboardLayout() {
  const { user, logout } = useAuth();
  const [isCanchasExpanded, setIsCanchasExpanded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para controlar la visibilidad de la sidebar
  const sidebarRef = useRef(null); // Referencia al elemento del sidebar
  const location = useLocation(); // Para cerrar el sidebar al cambiar de ruta

  const handleLogout = () => {
    logout();
  };

  const toggleCanchasMenu = () => {
    setIsCanchasExpanded(!isCanchasExpanded);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Efecto para cerrar el sidebar al cambiar de ruta en móviles
  useEffect(() => {
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  }, [location]);


  // Efecto para detectar clics fuera del sidebar en móviles
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verificar si el clic fue fuera del sidebar y si estamos en móvil y el sidebar está abierto
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && window.innerWidth <= 768 && isSidebarOpen) {
        closeSidebar();
      }
    };

    // Agregar event listener al documento
    document.addEventListener('mousedown', handleClickOutside);

    // Limpiar event listener al desmontar el componente
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]); // Dependencia en isSidebarOpen para que el efecto se re-ejecute cuando cambie el estado

  return (
    <div className="dashboard-container">
      {/* Overlay para cerrar sidebar al hacer clic fuera */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={(e) => { e.stopPropagation(); closeSidebar(); }}></div>}

      <aside ref={sidebarRef} className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}> {/* Añadir clase 'open' si isSidebarOpen es true y referencia */}
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

          <Link to="/" className="dashboard-menu-item" onClick={closeSidebar}> {/* Cerrar sidebar al hacer click */}
            <i className="fas fa-home"></i>
            <span>Inicio</span>
          </Link>

          <Link to="/dashboard" className="dashboard-menu-item active" onClick={closeSidebar}> {/* Cerrar sidebar al hacer click */}
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </Link>

          <div className="dashboard-menu-title">Gestión</div>

          <Link to="/dashboard/reservas" className="dashboard-menu-item" onClick={closeSidebar}> {/* Cerrar sidebar al hacer click */}
            <i className="fas fa-calendar-check"></i>
            <span>Reservas</span>
          </Link>

          <div role="button" tabIndex="0" className="dashboard-menu-cancha" onClick={toggleCanchasMenu}> {/* Cerrar sidebar al hacer click */}
            <i className="fas fa-pencil-alt"></i>
            Canchas
            <i className={`fas fa-chevron-${isCanchasExpanded ? 'up' : 'down'}`}></i>
          </div>
          {isCanchasExpanded && (
            <div className="submenu">
              <Link to="/dashboard/canchas/manage" className="dashboard-menu-item" onClick={closeSidebar}> {/* Cerrar sidebar al hacer click */}
                <i className="fas fa-list"></i>
                <span>Gestionar Canchas</span>
              </Link>
              <Link to="/dashboard/canchas/create" className="dashboard-menu-item" onClick={closeSidebar}> {/* Cerrar sidebar al hacer click */}
                <i className="fas fa-plus"></i>
                <span>Crear Cancha</span>
              </Link>
            </div>
          )}

          <Link to="/dashboard/usuarios" className="dashboard-menu-item" onClick={closeSidebar}> {/* Cerrar sidebar al hacer click */}
            <i className="fas fa-users"></i>
            <span>Usuarios</span>
          </Link>

          <Link to="/dashboard/pagos" className="dashboard-menu-item" onClick={closeSidebar}> {/* Cerrar sidebar al hacer click */}
            <i className="fas fa-dollar-sign"></i>
            <span>Pagos</span>
          </Link>

          <Link to="/dashboard/estadisticas" className="dashboard-menu-item" onClick={closeSidebar}> {/* Cerrar sidebar al hacer click */}
            <i className="fas fa-chart-line"></i>
            <span>Estadísticas</span>
          </Link>

          <div className="dashboard-menu-title">Cuenta</div>

          <Link to="/dashboard/perfil" className="dashboard-menu-item" onClick={closeSidebar}> {/* Cerrar sidebar al hacer click */}
            <i className="fas fa-user"></i>
            <span>Perfil</span>
          </Link>          

          <div className="dashboard-menu-item" onClick={() => { handleLogout(); closeSidebar(); }} style={{ cursor: 'pointer' }}> {/* Logout y cerrar sidebar */}
            <i className="fas fa-sign-out-alt"></i>
            <span>Cerrar Sesión</span>
          </div>
        </div>
      </aside>

      <main className="dashboard-content">
        <DashboardNavbar toggleSidebar={toggleSidebar} /> {/* Renderizar el Navbar */}
        <div className="dashboard-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
