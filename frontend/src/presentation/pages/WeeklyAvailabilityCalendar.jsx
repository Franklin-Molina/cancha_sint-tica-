import React from 'react';
import { format, addDays } from 'date-fns';
import { Check, Icon, Plus, Calendar, Clock, User, X } from 'lucide-react'; // Importar todos los iconos necesarios
import { soccerBall } from '@lucide/lab'; // Importar el icono de soccerBall
import { useWeeklyAvailabilityCalendar } from '../hooks/useWeeklyAvailabilityCalendar.js'; // Importar el hook
import '../../styles/WeeklyAvailabilityCalendar.css';

function WeeklyAvailabilityCalendar({
  weeklyAvailability,
  loadingWeeklyAvailability,
  weeklyAvailabilityError,
  onTimeSlotClick,
  daysOfWeek,
  hoursOfDay,
  monday,
  selectedSlot // Asegúrate de que selectedSlot se pase como prop si se usa
}) {
  const { stats, availabilityPercentage, getSlotIconName } = useWeeklyAvailabilityCalendar(weeklyAvailability);

  const handleTimeSlotClick = (formattedDate, hourNumber, isAvailable) => {
    if (isAvailable && onTimeSlotClick) {
      onTimeSlotClick(formattedDate, hourNumber);
    }
  };

  // Función para renderizar el icono basado en el nombre devuelto por el hook
  const renderIconComponent = (iconName, className) => {
    switch (iconName) {
      case 'check':
        return <Check className={className} />;
      case 'soccerBall':
        return <Icon iconNode={soccerBall} className={className} />;
      case 'plus':
        return <Plus className={className} />;
      default:
        return null;
    }
  };

  if (loadingWeeklyAvailability) {
    return (
      <div className="weekly-availability-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (weeklyAvailabilityError) {
    return (
      <div className="weekly-availability-container">
        <div className="error-container">
          <X className="error-icon" />
          <p className="error-message">{weeklyAvailabilityError}</p>
        </div>
      </div>
    );
  }

  if (!weeklyAvailability || Object.keys(weeklyAvailability).length === 0) {
    return (
      <div className="weekly-availability-container">
        <div className="no-data-container">
          <Calendar className="no-data-icon" />
          <p>No hay disponibilidad cargada para mostrar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-availability-container">
      {/* Header */}
      {/* Main Calendar */}
      <div className="calendar-card">
        {/* Days Header */}
        <div className="calendar-header">
          <div className="time-header-cell">
            <Clock className="time-icon" />
          </div>
          {daysOfWeek.map((day, index) => {
            const currentDay = addDays(monday, index);
            return (
              <div key={day} className="day-header-cell">
                <div className="day-name">{day}</div>
                <div className="day-date">{format(currentDay, 'dd/MM')}</div>
              </div>
            );
          })}
        </div>

        {/* Time Slots Grid */}
        <div className="calendar-body">
          {hoursOfDay.map((hourRange, hourIndex) => {
            const startHour24 = hourIndex + 6;

            return (
              <div key={hourRange} className="time-row">
                <div className="time-cell">
                  {hourRange}
                </div>
                {daysOfWeek.map((day, dayIndex) => {
                  const currentDay = addDays(monday, dayIndex);
                  const formattedDate = format(currentDay, 'yyyy-MM-dd');
                  const hourNumber = startHour24;

                  const dailyAvailability = weeklyAvailability[formattedDate];
                  const isAvailable = dailyAvailability && dailyAvailability[hourNumber] === true;
                  const isOccupied = dailyAvailability && dailyAvailability[hourNumber] === false;
                  const isDefined = dailyAvailability && (dailyAvailability[hourNumber] === true || dailyAvailability[hourNumber] === false);

                  let cellClassName = 'slot-cell';
                  if (isAvailable) {
                    cellClassName += ' available';
                  } else if (isOccupied) {
                    cellClassName += ' occupied';
                  } else {
                    cellClassName += ' free';
                  }

                  const isSelected = selectedSlot?.date === formattedDate && selectedSlot?.hour === hourNumber;
                  if (isSelected) {
                    cellClassName += ' selected';
                  }

                  return (
                    <div
                      key={`${day}-${hourRange}`}
                      className={cellClassName}
                      onClick={() => handleTimeSlotClick(formattedDate, hourNumber, isAvailable)}
                      data-tooltip={`${day} ${hourRange}`}
                    >
                      {renderIconComponent(getSlotIconName(isAvailable, isDefined), "slot-icon")}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-text">
              <p className="stat-label">Slots Disponibles</p>
              <p className="stat-value">{stats.availableSlots}</p>
            </div>
            <div className="stat-icon available-stat">
              <Check className="icon" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-text">
              <p className="stat-label">Disponibilidad</p>
              <p className="stat-value">{availabilityPercentage}%</p>
            </div>
            <div className="stat-icon availability-stat">
              <Clock className="icon" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-text">
              <p className="stat-label">Slots Ocupados</p>
              <p className="stat-value">{stats.occupiedSlots}</p>
            </div>
            <div className="stat-icon occupied-stat">
              <User className="icon" />

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default WeeklyAvailabilityCalendar;
