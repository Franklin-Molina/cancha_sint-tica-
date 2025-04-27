import React, { useState } from 'react';
import axios from 'axios';

/**
 * Página para consultar la disponibilidad de las canchas.
 */
function AvailabilityPage() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckAvailability = async () => {
    setLoading(true);
    setError(null);
    setAvailability(null);

    try {
      // Asumiendo que el backend corre en localhost:8000 y el endpoint es /courts/availability/
      const response = await axios.get('http://localhost:8000/courts/availability/', {
        params: {
          start_time: startTime,
          end_time: endTime,
        },
      });
      setAvailability(response.data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Consultar Disponibilidad de Canchas</h1>

      <div>
        <label htmlFor="startTime">Hora de Inicio:</label>
        <input
          type="datetime-local"
          id="startTime"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="endTime">Hora de Fin:</label>
        <input
          type="datetime-local"
          id="endTime"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      <button onClick={handleCheckAvailability} disabled={loading}>
        {loading ? 'Consultando...' : 'Consultar Disponibilidad'}
      </button>

      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}

      {availability && (
        <div>
          <h2>Resultados de Disponibilidad</h2>
          {availability.length === 0 ? (
            <p>No se encontraron canchas para el rango de tiempo seleccionado.</p>
          ) : (
            <ul>
              {availability.map(court => (
                <li key={court.id}>
                  {court.name}: {court.is_available ? 'Disponible' : 'No Disponible'}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default AvailabilityPage;
