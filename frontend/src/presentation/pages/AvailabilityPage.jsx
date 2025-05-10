import React, { useState } from 'react';
// Eliminar importación de axios

// Importar el caso de uso y la implementación del repositorio
import { CheckAvailabilityUseCase } from '../../application/use-cases/check-availability';
import { ApiCourtRepository } from '../../infrastructure/repositories/api-court-repository';

/**
 * Página para consultar la disponibilidad de las canchas.
 */
function AvailabilityPage() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Crear instancias del repositorio y caso de uso
  // En una aplicación real, esto se haría a través de inyección de dependencias
  const courtRepository = new ApiCourtRepository();
  const checkAvailabilityUseCase = new CheckAvailabilityUseCase(courtRepository);

  const handleCheckAvailability = async () => {
    setLoading(true);
    setError(null);
    setAvailability(null);

    // Validar que las fechas/horas estén seleccionadas
    if (!startTime || !endTime) {
        setError(new Error("Por favor, selecciona hora de inicio y hora de fin."));
        setLoading(false);
        return;
    }

    try {
      // Formatear fechas a ISO 8601 (asumiendo que startTime y endTime son datetime-local)
      const formattedStartTime = new Date(startTime).toISOString();
      const formattedEndTime = new Date(endTime).toISOString();

      // Llamar al caso de uso para verificar disponibilidad
      const availabilityResults = await checkAvailabilityUseCase.execute(formattedStartTime, formattedEndTime);
      setAvailability(availabilityResults);
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
