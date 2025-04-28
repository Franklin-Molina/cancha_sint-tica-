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
      {/* Rutas con layout principal */}
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      {/* Rutas de autenticación y registro con layout principal */}
      <Route
        path="/auth"
        element={
          <Layout> {/* Envolver con Layout */}
            <AuthPage />
          </Layout>
        }
      />
      <Route
        path="/register"
        element={
          <Layout> {/* Envolver con Layout */}
            <RegisterPage />
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
        {/* Sub-ruta para Registrar Admin */}
        <Route path="admin/register" element={<AdminRegisterPage />} />
        {/* TODO: Añadir sub-rutas para las otras secciones del dashboard */}
      </Route>


      {/* TODO: Agregar ruta 404 */}
    </Routes>
  );
}

export default App;
