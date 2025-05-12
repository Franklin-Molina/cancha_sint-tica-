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
import CourtDetailPage from './presentation/pages/CourtDetailPage.jsx';
import DashboardBookingsPage from './presentation/pages/DashboardBookingsPage.jsx';
import DashboardProfilePage from './presentation/pages/DashboardProfilePage.jsx';
import AdminGlobalDashboardPage from './presentation/pages/AdminGlobalDashboardPage.jsx'; // Nueva página

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
          <Route path="canchas" element={<DashboardCourtsPage />} />
          <Route path="reservas" element={<DashboardBookingsPage />} />
          <Route path="perfil" element={<DashboardProfilePage />} />
          {/* <Route path="admin/register" element={<AdminRegisterPage />} /> */} {/* AdminRegisterPage podría ser parte del dashboard adminglobal */}
        </Route>
        <Route
          path="/adminglobal"
          element={
            <ProtectedRoute> {/* Proteger esta ruta */}
              <Layout> {/* O un Layout específico para adminglobal */}
                <AdminGlobalDashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* La ruta para registrar admins de cancha podría estar dentro de AdminGlobalDashboardPage */}
        {/* o ser una subruta de /adminglobal */}
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
      </Routes>
    
  );
}

export default App;
