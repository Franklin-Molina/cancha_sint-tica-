import React, { useState, useEffect } from 'react';
// Importar axios o usar fetch para las llamadas API

function CourtListPage() {
  const [courts, setCourts] = useState([]);

  useEffect(() => {
    // Aquí deberías hacer la llamada a tu API de backend para obtener la lista de canchas
    // Por ahora, simularemos una respuesta de API
    console.log('Obteniendo lista de canchas...');

    const dummyCourts = [
      { id: 1, name: 'Cancha 1', location: 'Ubicación A' },
      { id: 2, name: 'Cancha 2', location: 'Ubicación B' },
      { id: 3, name: 'Cancha 3', location: 'Ubicación C' },
    ];

    setCourts(dummyCourts);
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montar el componente

  return (
    <div>
      <h1>Página de Lista de Canchas</h1>
      <ul>
        {courts.map(court => (
          <li key={court.id}>
            <h2>{court.name}</h2>
            <p>{court.location}</p>
            {/* Aquí podrías agregar un enlace o botón para ver detalles o reservar */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CourtListPage;
