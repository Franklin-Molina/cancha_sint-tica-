import React from 'react';
import CourtForm from '../components/Dashboard/CourtForm.jsx'; // Importar el componente CourtForm

function DashboardCourtsPage() {
  return (
    <div>
      <h1 className="dashboard-page-title">Crear Cancha</h1>
      {/* Formulario para crear cancha */}
      <CourtForm />
    </div>
  );
}

export default DashboardCourtsPage;
