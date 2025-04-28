import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './components/Auth/RegisterPage';
import CourtListPage from './pages/CourtListPage';
import BookingPage from './pages/BookingPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AuthPage from './components/Auth/AuthPage';
import AdminRegisterPage from './components/Auth/AdminRegisterPage';
import Layout from './components/common/Layout'; // Importar el componente Layout
import DashboardLayout from './components/Dashboard/DashboardLayout'; // Importar DashboardLayout
import DashboardOverviewPage from './pages/DashboardOverviewPage'; // Importar DashboardOverviewPage
import DashboardCourtsPage from './pages/DashboardCourtsPage'; // Importar DashboardCourtsPage
import CourtDetailPage from './pages/CourtDetailPage'; // Importar CourtDetailPage
import DashboardBookingsPage from './pages/DashboardBookingsPage'; // Importar DashboardBookingsPage
import DashboardProfilePage from './pages/DashboardProfilePage'; // Importar DashboardProfilePage


function App() {
  return (
    <Routes>
      {/* Rutas sin layout (ej. autenticación) */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas con layout principal */}
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      {/* Ruta de detalle de cancha (accesible para cualquier usuario) */}
      <Route
        path="/courts/:courtId"
        element={
          <Layout> {/* Usar el layout principal */}
            <CourtDetailPage />
          </Layout>
        }
      />
      <Route
        path="/courts"
        element={
          <ProtectedRoute> {/* Mantener ProtectedRoute para rutas protegidas */}
            <Layout> {/* Envolver con Layout */}
              <CourtListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/:courtId"
        element={
          <ProtectedRoute> {/* Mantener ProtectedRoute para rutas protegidas */}
            <Layout> {/* Envolver con Layout */}
              <BookingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute> {/* Mantener ProtectedRoute para rutas protegidas */}
            <Layout> {/* Envolver con Layout */}
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* La ruta de registro de admin podría usar el layout principal o uno específico, por ahora la dejo con el principal */}
       <Route
        path="/admin/register"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminRegisterPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Rutas del Dashboard (protegidas y con DashboardLayout) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute> {/* Proteger el dashboard */}
            <DashboardLayout /> {/* Usar el layout del dashboard */}
          </ProtectedRoute>
        }
      >
        {/* Ruta índice del dashboard (Overview) */}
        <Route index element={<DashboardOverviewPage />} />
        {/* Sub-ruta para Gestión de Canchas */}
        <Route path="canchas" element={<DashboardCourtsPage />} />
        {/* Sub-ruta para Gestión de Reservas */}
        <Route path="reservas" element={<DashboardBookingsPage />} />
        {/* Sub-ruta para Perfil en el Dashboard */}
        <Route path="perfil" element={<DashboardProfilePage />} />
        {/* TODO: Añadir sub-rutas para las otras secciones del dashboard */}
      </Route>


      {/* TODO: Agregar ruta 404 */}
    </Routes>
  );
}

export default App;
