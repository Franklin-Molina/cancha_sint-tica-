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

function App() {
  return (
    <Routes>
      {/* Rutas sin layout (ej. autenticación) */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas con layout */}
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
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
      <Route
        path="/admin/register"
        element={
          <ProtectedRoute> {/* Mantener ProtectedRoute para rutas protegidas */}
            <Layout> {/* Envolver con Layout */}
              <AdminRegisterPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* TODO: Agregar ruta 404 */}
    </Routes>
  );
}

export default App;
