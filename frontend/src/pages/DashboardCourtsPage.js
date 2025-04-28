import React from 'react';
import CourtForm from '../components/Dashboard/CourtForm'; // Importar el componente CourtForm

function DashboardCourtsPage() {
  return (
    <div>
      <h1 className="dashboard-page-title">Gestión de Canchas</h1>
      {/* Contenido de la sección de gestión de canchas */}
      <p>Aquí se listarán y gestionarán las canchas.</p>
      {/* TODO: Implementar tabla de canchas */}

      {/* Formulario para crear cancha */}
      <CourtForm />

    </div>
  );
}

export default DashboardCourtsPage;
