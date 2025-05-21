import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './presentation/pages/HomePage.jsx';
import RegisterPage from './presentation/components/Auth/RegisterPage.jsx';
import CourtListPage from './presentation/pages/CourtListPage.jsx';
import BookingPage from './presentation/pages/BookingPage.jsx';
import ProfilePage from './presentation/pages/ProfilePage.jsx';
import ProtectedRoute from './presentation/components/Auth/ProtectedRoute.jsx';
import AuthPage from './presentation/components/Auth/AuthPage.jsx';
import AdminRegisterPage from './presentation/components/Auth/AdminRegisterPage.jsx';
import Layout from './presentation/components/common/Layout.jsx';
import DashboardLayout from './presentation/components/Dashboard/DashboardLayout.jsx';
import DashboardOverviewPage from './presentation/pages/DashboardOverviewPage.jsx';
import DashboardCourtsPage from './presentation/pages/DashboardCourtsPage.jsx';
import DashboardManageCourtsPage from './presentation/pages/DashboardManageCourtsPage.jsx';
import CourtDetailPage from './presentation/pages/CourtDetailPage.jsx';
import DashboardBookingsPage from './presentation/pages/DashboardBookingsPage.jsx';
import DashboardProfilePage from './presentation/pages/DashboardProfilePage.jsx';
import DashboardUsersPage from './presentation/pages/DashboardUsersPage.jsx'; // Importar DashboardUsersPage

import AdminGlobalDashboardPage from './presentation/pages/AdminGlobalDashboardPage.jsx';
import ManageAdminsTable from './presentation/components/AdminGlobalDashboard/ManageAdminsTable.jsx'; // Nuevo componente

function App() {
  return (
    
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        <Route
          path="/auth"
          element={
            <Layout>
              <AuthPage />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <RegisterPage />
            </Layout>
          }
        />
        <Route
          path="/courts/:courtId"
          element={
            <Layout>
              <CourtDetailPage />
            </Layout>
          }
        />
        <Route
          path="/booking/:courtId"
          element={
            <ProtectedRoute>
              <Layout>
                <BookingPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverviewPage />} />
          <Route path="canchas/manage" element={<DashboardManageCourtsPage />} />
          <Route path="canchas/create" element={<DashboardCourtsPage />} />
          <Route path="reservas" element={<DashboardBookingsPage />} />
          <Route path="usuarios" element={<DashboardUsersPage />} />
          <Route path="perfil" element={<DashboardProfilePage />} />
        </Route>
        <Route
          path="/adminglobal"
          element={
            <ProtectedRoute>
              <AdminGlobalDashboardPage /> {/* Este es ahora el layout */}
            </ProtectedRoute>
          }
        >
          {/* Ruta índice para el dashboard adminglobal, podría ser un resumen o la gestión de admins */}
          <Route index element={<ManageAdminsTable />} /> {/* Mostrar tabla de admins por defecto */}
          <Route path="manage-admins" element={<ManageAdminsTable />} />
          <Route path="profile" element={<ProfilePage />} /> {/* Perfil dentro del layout adminglobal */}
          <Route path="register-admin" element={<AdminRegisterPage />} /> {/* Registrar admin dentro del layout adminglobal */}
        </Route>
        
        {/* La ruta /adminglobal/register-admin ahora es anidada y no necesita su propia definición aquí con Layout */}
        {/* 
        <Route 
          path="/adminglobal/register-admin" 
          element={
            <ProtectedRoute>
              <Layout> 
                <AdminRegisterPage />
              </Layout>
            </ProtectedRoute>
          } 
        /> 
        */}
      </Routes>
    
  );
}

export default App;
