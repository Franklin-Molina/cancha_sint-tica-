import React from 'react';
import { format, addDays } from 'date-fns';

function WeeklyAvailabilityCalendar({ weeklyAvailability, loadingWeeklyAvailability, weeklyAvailabilityError, onTimeSlotClick, daysOfWeek, hoursOfDay, monday }) {
  // monday is the start date of the week (a Date object)

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
      <h2>Disponibilidad Semanal</h2>
      {loadingWeeklyAvailability ? (
        <div>Cargando disponibilidad semanal...</div>
            ) : weeklyAvailabilityError ? (
                <div style={{ color: 'red' }}>{weeklyAvailabilityError}</div>
            ) : (weeklyAvailability && Object.keys(weeklyAvailability).length > 0) ? (
                <div className="availability-calendar" style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Hora</th>
        {daysOfWeek.map((day, index) => {
          const currentDay = addDays(monday, index);
          return (
            <th key={day} style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
              {day}
              <br />
              {/* Mostrar la fecha debajo del día */}
              {format(currentDay, 'dd/MM')}
            </th>
          );
        })}
      </tr>
    </thead>
    <tbody>
      {hoursOfDay.map((hourRange, hourIndex) => {
        const startHour24 = hourIndex + 6;

        return (
          <tr key={hourRange}>
            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{hourRange}</td>
            {daysOfWeek.map((day, dayIndex) => {
              const currentDay = addDays(monday, dayIndex);
              const formattedDate = format(currentDay, 'yyyy-MM-dd');
              const hourNumber = startHour24;

              const dailyAvailability = weeklyAvailability[formattedDate];
              const isAvailable = dailyAvailability && dailyAvailability[hourNumber];
              const cellColor = isAvailable ? 'lightgreen' : 'salmon';

              return (
                <td
                  key={`${day}-${hourRange}`}
                  style={{
                    border: '1px solid #ccc',
                    padding: '8px',
                    textAlign: 'center',
                    backgroundColor: cellColor,
                    cursor: isAvailable ? 'pointer' : 'not-allowed'
                  }}
                  onClick={isAvailable ? () => onTimeSlotClick(formattedDate, hourNumber) : null}
                >
                  {/* Puedes mostrar un texto como "Disponible" o "Ocupado" si quieres */}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
) : (
<div>No hay disponibilidad cargada para mostrar.</div>
)}
</div>
);
}

export default WeeklyAvailabilityCalendar;
