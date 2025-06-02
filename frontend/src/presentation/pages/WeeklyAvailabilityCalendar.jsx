import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Calendar, Clock, User, Plus, X, Check } from 'lucide-react';
import '../../styles/WeeklyAvailabilityCalendar.css';

function WeeklyAvailabilityCalendar({
  weeklyAvailability,
  loadingWeeklyAvailability,
  weeklyAvailabilityError,
  onTimeSlotClick,
  daysOfWeek,
  hoursOfDay,
  monday
}) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [viewMode, setViewMode] = useState('week');

  // Calcular estadísticas
  const calculateStats = () => {
    if (!weeklyAvailability) return { totalSlots: 0, availableSlots: 0, occupiedSlots: 0 };

    let totalSlots = 0;
    let availableSlots = 0;
    let occupiedSlots = 0;

    Object.values(weeklyAvailability).forEach(dayAvailability => {
      Object.values(dayAvailability).forEach(slot => {
        totalSlots++;
        if (slot === true) availableSlots++;
        if (slot === false) occupiedSlots++;
      });
    });

    return { totalSlots, availableSlots, occupiedSlots };
  };

  const stats = calculateStats();
  const availabilityPercentage = stats.totalSlots > 0 ? Math.round((stats.availableSlots / stats.totalSlots) * 100) : 0;

  const handleTimeSlotClick = (formattedDate, hourNumber, isAvailable) => {
    if (isAvailable && onTimeSlotClick) {
      onTimeSlotClick(formattedDate, hourNumber);
    }
  };

  const getSlotIcon = (isAvailable, isDefined) => {
    if (isAvailable) return <Check className="slot-icon" />;
    if (isDefined && !isAvailable) return <User className="slot-icon" />;
    return <Plus className="slot-icon slot-icon-hover" />;
  };

  if (loadingWeeklyAvailability) {
    return (
      <div className="weekly-availability-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        {/*   <p>Cargando disponibilidad semanal...</p> */}
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
      <div className="header-card">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <Calendar className="icon" />
            </div>
            <div className="header-text">
              <h1 className="header-title">Disponibilidad Semanal</h1>
              <p className="header-subtitle">Gestiona tu horario disponible</p>
            </div>
          </div>

          <div className="header-right">
            <button
              onClick={() => setViewMode(viewMode === 'week' ? 'day' : 'week')}
              className="view-toggle-btn"
            >
              {viewMode === 'week' ? 'Vista Día' : 'Vista Semana'}
            </button>

            <div className="legend">
              <div className="legend-item">
                <div className="legend-color available"></div>
                <span>Disponible</span>
              </div>
              <div className="legend-item">
                <div className="legend-color occupied"></div>
                <span>Ocupado</span>
              </div>
              <div className="legend-item">
                <div className="legend-color free"></div>
                <span>Libre</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                      {getSlotIcon(isAvailable, isDefined)}
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
