import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Importar useAuth
import '../../styles/DashboardLayout.css'; // Importar estilos del layout
import '../../styles/dashboard.css'; // Importar estilos generales del dashboard

function DashboardLayout() {
  const { logout } = useAuth(); // Obtener la función logout del contexto de autenticación

  const handleLogout = () => {
    logout(); // Llamar a la función de cerrar sesión
    // La función logout del contexto debería manejar la redirección
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
            <h2>Cancha Admin</h2> {/* Título del dashboard */}
        </div>
        <div className="dashboard-sidebar-menu">
            <Link to="/dashboard" className="dashboard-menu-item active">
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
            </Link>

            <div className="dashboard-menu-title">Gestión</div>

            <Link to="/dashboard/reservas" className="dashboard-menu-item">
                <i className="fas fa-calendar-check"></i> {/* Icono de ejemplo */}
                <span>Reservas</span>
            </Link>

            <Link to="/dashboard/canchas" className="dashboard-menu-item">
                <i className="fas fa-futbol"></i> {/* Icono de ejemplo */}
                <span>Canchas</span>
            </Link>

             <Link to="/dashboard/usuarios" className="dashboard-menu-item">
                <i className="fas fa-users"></i> {/* Icono de ejemplo */}
                <span>Usuarios</span>
            </Link>

             <Link to="/dashboard/pagos" className="dashboard-menu-item">
                <i className="fas fa-dollar-sign"></i> {/* Icono de ejemplo */}
                <span>Pagos</span>
            </Link>

             <Link to="/dashboard/estadisticas" className="dashboard-menu-item">
                <i className="fas fa-chart-line"></i> {/* Icono de ejemplo */}
                <span>Estadísticas</span>
            </Link>

            <div className="dashboard-menu-title">Cuenta</div>

             <Link to="/dashboard/perfil" className="dashboard-menu-item"> {/* Enlace al perfil en el dashboard */}
                <i className="fas fa-user"></i>
                <span>Perfil</span>
            </Link>

             {/* Botón de cerrar sesión */}
             <div className="dashboard-menu-item" onClick={handleLogout} style={{ cursor: 'pointer' }}> {/* Añadir onClick y cursor */}
                <i className="fas fa-sign-out-alt"></i>
                <span>Cerrar Sesión</span>
            </div>

        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Header del Dashboard */}
        <div className="dashboard-header">
            <div className="dashboard-search-box">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Buscar..."/>
            </div>

            <div className="dashboard-header-right">
                <div className="dashboard-header-icon">
                    <i className="fas fa-bell"></i>
                    <span className="dashboard-notification-badge">3</span>
                </div>

                <div className="dashboard-header-icon">
                    <i className="fas fa-envelope"></i>
                    <span className="dashboard-notification-badge">5</span>
                </div>

                <div className="dashboard-user-profile">
                    <div className="dashboard-user-avatar">AD</div> {/* Iniciales del admin */}
                    <div className="dashboard-user-info">
                        <div className="dashboard-user-name">Admin</div> {/* Nombre del admin */}
                        <div className="dashboard-user-role">Administrador</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Contenido específico de la página del dashboard */}
        <div className="dashboard-page-content">
            <Outlet /> {/* Aquí se renderizarán las sub-rutas del dashboard */}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
